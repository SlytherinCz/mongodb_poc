FROM python:3.6-alpine

COPY . /app
WORKDIR /app

RUN pip install -r requirements.txt &&\
    apk add supervisor

COPY ./supervisord.conf ./etc/supervisor/supervisord.conf

CMD ["/usr/bin/supervisord"]
