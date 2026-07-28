# Этап 1: Сборка React/Vite приложения
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

# Этап 2: Сборка Go Backend
FROM golang:1.22-alpine AS backend-builder
WORKDIR /app/backend

COPY backend/go.mod ./
COPY backend/main.go ./
RUN CGO_ENABLED=0 GOOS=linux go build -o server main.go

# Этап 3: Итоговый боевой контейнер с бэкендом и статикой
FROM alpine:latest
WORKDIR /app
RUN apk add --no-cache ca-certificates tzdata

COPY --from=backend-builder /app/backend/server ./server
COPY --from=frontend-builder /app/frontend/dist ./dist

EXPOSE 8080
ENV PORT=8080

CMD ["./server"]
