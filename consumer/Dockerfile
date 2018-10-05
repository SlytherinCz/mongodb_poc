FROM keymetrics/pm2:10-alpine

COPY . /app
WORKDIR /app/db-pusher

RUN npm install

WORKDIR /app/overseer

RUN npm install

WORKDIR /app
CMD [ "pm2-runtime", "start", "config.yml" ]