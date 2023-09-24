FROM pytorch/pytorch:2.0.1-cuda11.7-cudnn8-runtime

EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

ENV TZ="America/Phoenix"
# ARG CACHEBUST=1
# Install git (required for pip install)
RUN apt-get -y update
RUN apt-get -y install git

WORKDIR /ai-service
COPY . /ai-service

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" ai-service-user && chown -R ai-service-user /ai-service
USER ai-service-user

ENV PATH="${PATH}:/home/ai-service-user/.local/bin"
# Install pip requirements as non-root user
RUN python -m pip install -r requirements.txt && rm requirements.txt

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "2", "--timeout", "300", "app:app"]