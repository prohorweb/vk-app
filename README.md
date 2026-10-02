# VK Mini App

Заготовка мини-приложения VK: React 18, TypeScript, Vite, VKUI 8, vk-bridge 3.

## Запуск

```bash
npm install
cp .env.example .env
npm run dev
```

Сборка и проверка:

```bash
npm run build
npm run preview
npm run lint
npm run format
```

## Окружение

Базовый адрес API задаётся в `.env`:

```bash
VITE_API_URL=http://localhost:8080
```

Ключей и секретов в проекте нет. Пока сервера нет, `src/api` возвращает вымышленные mock-данные. Позиции трека запрашиваются через TanStack Query с `refetchInterval` 2 минуты.

## Экраны

Нижнее меню: Старт, Карта, Участники, Результаты, Ещё.

В «Ещё»: Маршрут, Программа, Новости, Гостям, Профиль.

Карточка участника открывается из списка участников и из шторки на карте. На карте вместо карты стоит заглушка.
