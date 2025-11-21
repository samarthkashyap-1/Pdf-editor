FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

ENV PORT=5173
CMD ["serve", "-s", "dist", "-l", "5173"]
