# map: поддержать «все этапы» и определить канонические endpoints

**Приоритет:** P1
**Endpoint:** `GET /api/v1/map/participants`

## Сейчас

- `stage_id` обязателен: без него `422`, поэтому режим «Все этапы» на карте агрегировать нельзя.
- В публичном контракте дублируются endpoints:
  - `/api/v1/map/participants` и `/api/v1/stages/{stage_id}/positions`;
  - `/api/v1/map/checkpoints` и `/api/v1/stages/{stage_id}/checkpoints`;
  - `/api/v1/stages/{stage_id}/leaders` фронтом не используется.

## Нужно

1. Решить, как работает «Все этапы»:
   - сделать `stage_id` optional: без него отдавать маркеры всех этапов, добавив `stage_id`
     в каждый item; или
   - зафиксировать в OpenAPI, что «все этапы» = активный этап.
2. Выбрать канонический набор endpoints (`map/*` или `stages/{id}/*`), второй пометить
   `deprecated` или убрать из публичного контракта.

## Acceptance criteria

- [ ] Поведение «все этапы» одинаково описано в контракте и реализовано.
- [ ] В OpenAPI один канонический набор без дублей либо с явным `deprecated`.
- [ ] Фронт не держит неявный fallback при выборе «Все этапы».

## Контекст

- Фронт: `fetchStageMapPositions`, `fetchStageCheckpoints` в `src/api/map.ts`.
- Проверка 25.10.2026: `map/participants` без `stage_id` → `422`.
