# Dev-образ фронтенда: без сборки, Vite dev-сервер с hot reload.
FROM node:20-alpine

WORKDIR /app

ENV NODE_ENV=development \
    NPM_CONFIG_UPDATE_NOTIFIER=false

# Сначала манифесты — слой с зависимостями кэшируется между пересборками.
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

# Код копируется и в образ (для запуска без монтирования), и поверх него — bind mount из compose.
COPY . .

EXPOSE 5173

# --host 0.0.0.0 обязателен: иначе Vite слушает только loopback контейнера.
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]
