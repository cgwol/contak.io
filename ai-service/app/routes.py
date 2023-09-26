import platform
from io import BytesIO

import numpy as np
import torch
from app import app
from flask import jsonify, request, send_file
from scipy.io import wavfile
from torch import cuda

# @app.after_request
# def apply_caching(response):
#     response.headers["Bypass-Tunnel-Reminder"] = True
#     return response


def success(data):
    return jsonify({"data": data, "error": None})


def error(statusCode, message):
    return jsonify({"data": None,
                    "error": {
                        "statusCode": statusCode,
                        "message": message}}), statusCode


def invalid_request(message):
    return error(400, message)


@app.route("/")
def index():
    message = f"""Hello from Flask running in Docker through NGINX and gunicorn"""
    if cuda.is_available():
        gpu_count = cuda.device_count()
        gpu_name = cuda.get_device_name(cuda.current_device())
        ending = f' with {gpu_count} "{gpu_name}" GPUs available!'
    return message + ending


@app.route("/status")
def status():
    app.logger.info("AI Service is healthy!")
    gpu_enabled = False
    gpu = None
    gpu_count = None
    if torch.cuda.is_available():
        gpu_enabled = True
        gpu = torch.cuda.get_device_name()
        gpu_count = torch.cuda.device_count()

    return success({
        "cpu": platform.processor() or platform.machine(),
        "gpu_enabled": gpu_enabled,
        "gpu": gpu,
        "gpu_count": gpu_count
    })


def numpy_to_wav(np_array, samplerate, download_name=None, max_age=60*5):
    """
        Converts a numpy array to a WAV audio file and wraps it in a Response\\
        max_age = number of seconds to cache the Response
    """
    try:
        file = BytesIO()
        wavfile.write(file, samplerate, np_array)
        return send_file(file, mimetype='audio/x-wav', download_name=download_name, max_age=max_age)
    except Exception as e:
        return error(500, repr(e))


@app.route("/audio")
def audio():
    """/audio?frequency=440&length=50"""
    app.logger.info("Generating /audio...")

    # Hz (Hertz) pitch of the audio (low = 50, medium = 440, high = 1000)
    frequency = request.args.get('frequency')
    try:
        frequency = float(frequency)
    except (ValueError, TypeError):
        return invalid_request("parameter frequency must be a number")

    length = request.args.get('length')  # Seconds of audio to generate
    try:
        length = float(length)
    except (ValueError, TypeError):
        return invalid_request("parameter length must be a number")

    # Hz (Hertz) The 'volume' of the audio
    amplitude = request.args.get('amplitude')
    if amplitude is not None and '':
        try:
            amplitude = float(amplitude)
        except (ValueError, TypeError):
            return invalid_request("parameter amplitude must be a number, if provided")
    else:
        amplitude = np.iinfo(np.int16).max

    samplerate = 44100  # How many audio data points per second

    # Generate time of samples between 0 and two seconds
    samples = np.arange(samplerate * length) / float(samplerate)
    # Recall that a sinusoidal wave of frequency f has formula w(t) = A*sin(2*pi*f*t)
    wave = amplitude * np.sin(2 * np.pi * frequency * samples)
    # Convert it to wav format (16 bits)
    wav_wave = np.array(wave, dtype=np.int16)
    return numpy_to_wav(wav_wave, samplerate)


@app.route("/musicgen")
def musicgen():
    """
        https://huggingface.co/docs/transformers/model_doc/musicgen
        small model takes around 2:00 to download model and generate audio on a GTX 1070
        Subsequent requests only take around 20 seconds
        Downloads only occur once (until docker container is destroyed)
    """
    device = "cuda:0"
    if not cuda.is_available():
        app.logger.warning(
            "No GPU is available on gpu-server, falling back to cpu...")
        device = "cpu"
    device = torch.device(device)
    MAX_DESCRIPTION = 128
    description = request.args.get('description')
    if not description:
        return invalid_request("missing parameter description")
    if len(description) > MAX_DESCRIPTION:
        return invalid_request(f"parameter description must have length less than {MAX_DESCRIPTION}")
    model_size = request.args.get('model-size', default="small")
    if not any(model_size == size for size in ('small', 'medium', 'large')):
        return invalid_request(f"invalid value for parameter model_size '{model_size}'")
    model_name = "facebook/musicgen-" + model_size
    app.logger.info("Starting batch job for /musicgen")
    try:
        from transformers import (AutoProcessor,
                                  MusicgenForConditionalGeneration)

        # small processor is around 4MB first time download
        processor = AutoProcessor.from_pretrained(model_name)
        # small model is about 2.36GB first time download
        model = MusicgenForConditionalGeneration.from_pretrained(
            model_name).to(device=device)

        # takes about 20 seconds on GTX 1070
        inputs = processor(
            # text=["80s pop track with bassy drums and synth",
            #     "90s rock song with loud guitars and heavy drums"],
            text=[description],
            padding=True,
            return_tensors="pt",
        ).to(device=device)
        # most time spent here
        # increase max_new_tokens to increase generated track length (256 tokens ~ 5 seconds)
        audio_values = model.generate(
            **inputs, do_sample=True, guidance_scale=3, max_new_tokens=256)

        return numpy_to_wav(audio_values[0, 0].cpu().numpy(), model.config.audio_encoder.sampling_rate)
    except Exception as e:
        return error(500, repr(e))
