# Этап 1: Сборка React/Vite приложения
FROM node:20-alpine AS builder
WORKDIR /app

# Копируем файлы package.json из папки frontend
COPY frontend/package*.json ./
RUN npm install

# Копируем весь исходный код фронтенда и собираем его
COPY frontend/ ./
RUN npm run build

# Этап 2: Раздача статики через легковесный сервер Nginx
FROM nginx:alpine
# Копируем собранные файлы из первого этапа
COPY --from=builder /app/dist /usr/share/nginx/html

# Настраиваем Nginx для работы с React Router (SPA)
RUN echo "server { listen 8080; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

# Открываем порт, который ожидает Koyeb
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
