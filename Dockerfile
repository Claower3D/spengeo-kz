# Stage 1: Build React/Vite Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci --no-audit --no-fund || npm install --no-audit --no-fund --legacy-peer-deps

COPY frontend/ ./
ENV NODE_OPTIONS="--max-old-space-size=1024"
RUN npm run build

# Stage 2: Build Go Backend
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod ./
COPY backend/main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o server main.go

# Stage 3: Production Runner
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata

COPY --from=backend-builder /app/backend/server ./server
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 8080
ENV PORT=8080

CMD ["./server"]
