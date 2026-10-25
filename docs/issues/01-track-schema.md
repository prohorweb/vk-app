# track: типизировать GeoJSON LineString и добавить 404

**Приоритет:** P0
**Endpoint:** `GET /api/v1/stages/{stage_id}/track`

## Сейчас

В OpenAPI ответ не типизирован: `200.schema = {}`.
Фактически отдаётся GeoJSON `LineString` с координатами `[lon, lat]`:

```json
{
  "type": "LineString",
  "coordinates": [
    [128.264116, 61.406488],
    [128.371714, 61.477404]
  ]
}
```

Фронт вынужден валидировать payload в рантайме (`parseStageTrackPayload` в `src/api/map.ts`).

## Нужно

- Описать ответ Pydantic-схемой GeoJSON `LineString` (RFC 7946, порядок `[lon, lat]`).
- Добавить `404`, если трека этапа нет.
- Экспортировать `openapi.json` через `scripts/export_openapi.py`.

## Acceptance criteria

- [ ] `npm run gen:api` даёт типизированные `coordinates: [number, number][]`.
- [ ] `404` присутствует в контракте для отсутствующего трека.
- [ ] Фронт убирает рантайм-валидацию `parseStageTrackPayload`.

## Контекст

- Фронт: `src/api/map.ts`, коммит `4c51c90`.
- Проверка: `curl http://localhost:8000/api/v1/stages/1/track` → `200`, `LineString`.
