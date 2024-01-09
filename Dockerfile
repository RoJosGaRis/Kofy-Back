FROM node:20.10.0-alpine

WORKDIR /Kofy-Back

RUN npm install

COPY . .

CMD ["npm", "run", "start"]

EXPOSE 3000