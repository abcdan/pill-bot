FROM node:15-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

ENTRYPOINT [ "node", "bot.js" ]