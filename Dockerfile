# Build Stage
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Serve Stage
FROM node:22-alpine

WORKDIR /app

# Install a lightweight static server
RUN npm install -g serve

# Copy built files
COPY --from=builder /app/dist ./dist

# Cloud Run sets PORT automatically (always 8080)
ENV PORT=8080

# Serve must bind to 0.0.0.0 to be reachable by Cloud Run
CMD ["sh", "-c", "serve -s dist -l tcp://0.0.0.0:$PORT"]
