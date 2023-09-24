import Navbar from "Components/navbar";
import { useRef, useState } from "react";
import { useLoaderData, useRevalidator } from "react-router-dom";
import { apiClient } from "~/apiClient";
import { addTrack } from "~/queries/tracks";


export const loader = async () => {
    try {
        const response = await apiClient.status();
        const mimeType = response.headers.get("Content-Type");
        if (mimeType.startsWith('application/json')) {
            return await response.json();
        }
        if (mimeType.startsWith("text/html")) {
            const html = `data:${mimeType},${encodeURIComponent(await response.text())}`
            return { data: null, error: { htmlSrc: response.url, html } };
        }
    } catch (error) {
        if (error instanceof Error) {
            error = error.message;
        }
        return { data: null, error };
    }
}

const generateTrack = async (description) => {
    const response = await apiClient.musicgen(description);
    const mimeType = response.headers.get("Content-Type");
    if (mimeType.startsWith("audio/")) {
        const audio = await response.blob();
        return { blob: audio, url: URL.createObjectURL(audio) };
    }
    if (mimeType.startsWith("application/json")) {
        // errors will be in json format so they can include messages
        const { data, error } = await response.json();
        if (error) {
            throw error;
        }
        return data;
    }
    throw { statusCode: response.status, message: response.statusText }
}


export const Component = () => {
    const status = useLoaderData();
    const revalidator = useRevalidator();
    const [isLoading, setIsLoading] = useState(false);
    const audioRef = useRef(null);
    const onGenerateTrack = (e) => {
        e.preventDefault();
        setIsLoading(true);
        const form = new FormData(e.target);
        generateTrack(form.get('trackDescription'))
            .then(audio => {
                audioRef.current = audio;
            })
            .finally(() => {
                setIsLoading(false);
            });
    }
    const onCheckAPIStatus = (e) => {
        apiClient.constructor.asyncGetBaseUrl().then(url => {
            apiClient.baseUrl = url;
            revalidator.revalidate();
        });
    }
    const onSaveNewTrack = (e) => {
        const form = new FormData(e.target);
        const trackName = form.get('trackName');
        addTrack(trackName, audioRef.current.blob)
            .then(() => console.log('added new track!'));
    }

    const isAPIOnline = status.error == null;
    return (<>
        <Navbar />
        <section className="flex-center">
            <div>

                <h1>Music Generator</h1>
                {
                    isAPIOnline ? (<>
                        <form onSubmit={onGenerateTrack}>
                            <div>
                                <p>Please provide a brief description of what your new track should sound like.</p>
                                <textarea name="trackDescription" placeholder="track description..." maxLength={128} required autoFocus cols={50}></textarea>
                            </div>
                            <button type="submit" disabled={isLoading}>Generate Track</button>
                        </form>
                        {isLoading && <>
                            <h3>Generating Track...</h3>
                            <p>Utilizing {status.data.gpu_count} {status.data.gpu}</p>
                        </>}
                        {audioRef.current && (<div>
                            <div className="flex-center flex-column">
                                <h3>Generated Track</h3>
                                <audio src={audioRef.current.url} controls></audio>
                            </div>
                            <form onSubmit={onSaveNewTrack} className="flex-column" style={{ alignItems: 'center' }}>
                                <div className="flex-column gap-xs" style={{ margin: '1em' }}>
                                    <div className="flex gap-s" >
                                        <p>Track Name</p>
                                        <input type="text" placeholder="track name..." name="trackName" required />
                                    </div>
                                    <div>
                                        <button type="submit" style={{ marginLeft: 'auto' }}>Save To My Tracks</button>
                                    </div>
                                </div>
                            </form>
                        </div>)}
                    </>) : (<>
                        <h2>Service is Offline</h2>
                        {status.error?.htmlSrc != null ? (<div>
                            <iframe src={status.error.html} className="bg-neutral-100"></iframe>
                        </div>
                        ) : (
                            <p>{JSON.stringify(status.error)}</p>
                        )}
                        <button type="button" onClick={onCheckAPIStatus}>Refresh</button>
                    </>)
                }
            </div>
        </section>
    </>)
}

