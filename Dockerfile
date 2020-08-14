FROM node:10.16.0

RUN mkdir -p /app
WORKDIR /app

COPY package.json /app
COPY docker-compose.yml /app
RUN npm install

COPY . /app

EXPOSE 8000

CMD ["npm","start"]