FROM debian:oldstable-slim

EXPOSE 8080

WORKDIR /usr/src

RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DJANGO_SETTINGS_MODULE=project.settings

COPY ./tools/app.sh ./app.sh
COPY ./tools/requirements.txt ./requirements.txt

RUN chmod +x ./app.sh
RUN python3 -m pip install --upgrade pip && \
    pip install -r ./requirements.txt

COPY . .

ENTRYPOINT ["bash", "/usr/src/app.sh"]
