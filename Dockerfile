FROM node:14-slim
WORKDIR /usr/src/app
COPY / ./
RUN npm install
RUN npm run dev
