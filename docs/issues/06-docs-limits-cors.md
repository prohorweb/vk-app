# docs: описать лимиты, пороги freshness и CORS

**Приоритет:** P2

## Сейчас

- Максимальный `limit` у `/api/v1/map/participants` не описан в OpenAPI:
  эмпирически `1000` — `200`, `5000` — `422`.
- Пороги `freshness_status` (`fresh` / `delayed` / `stale`) нигде не зафиксированы.
- Не описано, что `no_data` приходит с `position: null`.
- CORS проверен только для localhost.

## Нужно

- Добавить `maximum`/`description` для `limit` и `offset`.
- Описать семантику `freshness_status` и пороги в `description` схемы.
- Зафиксировать, что участники без данных приходят с `position: null` (`no_data`).
- Проверить `allow_origins` и preflight для production-домена VK Mini App
  (включая iframe-контекст `vk.com` / `vk.ru`).

## Acceptance criteria

- [ ] Лимиты видны в контракте, а не только по `422`.
- [ ] Фронт и бекенд трактуют статусы freshness одинаково.
- [ ] Запросы проходят с production-домена мини-приложения, `OPTIONS` возвращает корректные заголовки.

## Контекст

- Фронт: `freshnessToStatus` в `src/api/map.ts`.
- Проверка 25.10.2026: `limit=1000` → `200`, `limit=5000` → `422`.
