FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

RUN npm install -g serve

# Cloud Run will override this anyway, but safe to keep
ENV PORT=8080

CMD ["sh", "-c", "serve -s dist -l $PORT"]
