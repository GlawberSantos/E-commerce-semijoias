# Build stage
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ARG VITE_API_URL=https://app-gabrielly-backend-prod.azurewebsites.net/api
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM node:20-slim

WORKDIR /app

RUN npm install -g serve

COPY --from=builder /app/build ./build

EXPOSE 3000

CMD ["serve", "-s", "build", "-l", "3000"]
