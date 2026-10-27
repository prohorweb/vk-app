# Публичный API карты: расхождения контракта

**Приоритет:** P0
**Источник:** фронтенд-коммит `prohorweb/vk-app@4c51c90`, проверка живого API 25.10.2026.

Фронт карты и результатов переведён на публичный API. Ниже — расхождения контракта,
которые блокируют или усложняют работу. Каждый пункт вынесен в отдельную issue.

## Чек-лист

Статус на 26.10.2026: все пункты влиты в backend develop (`2d04231`).

- [x] P0 — `GET /api/v1/stages/{stage_id}/track`: типизировать GeoJSON `LineString`, добавить `404` ([01-track-schema.md](01-track-schema.md))
- [x] P0 — `GET /api/v1/results/stage/{stage_id}`: описать `404` или отдавать `200 + publication: draft` ([02-results-stage-404.md](02-results-stage-404.md))
- [x] P0 — `GET /api/v1/directory/stages`: проставлять `status: active` ([03-active-stage.md](03-active-stage.md))
- [x] P1 — `GET /api/v1/map/participants`: режим «все этапы» и канонические endpoints ([04-map-all-stages-endpoints.md](04-map-all-stages-endpoints.md))
- [x] P1 — demo seed: `recorded_at` относительно `now`, разные `km_from_start` ([05-demo-seed.md](05-demo-seed.md))
- [x] P2 — docs: лимиты пагинации, пороги freshness, CORS ([06-docs-limits-cors.md](06-docs-limits-cors.md))

## Используемые фронтом endpoints

- `GET /api/v1/directory/seasons/active`
- `GET /api/v1/directory/stages?season_id=…`
- `GET /api/v1/map/participants?stage_id=…&limit=500`
- `GET /api/v1/map/checkpoints?stage_id=…`
- `GET /api/v1/stages/{stage_id}/track`
- `GET /api/v1/results/standings`
- `GET /api/v1/results/stage/{stage_id}`

После правок пришлите обновлённый `openapi.json` — фронт регенерирует `schema.d.ts`.
