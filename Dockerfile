FROM node:20.10.0-alpine

WORKDIR /Kofy-Back

COPY package*.json ./

RUN npm install

COPY . .

RUN npx prisma generate

CMD ["node", "app.js"]

EXPOSE 3000