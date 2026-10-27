# track: типизировать GeoJSON LineString и добавить 404

**Приоритет:** P0
**Endpoint:** `GET /api/v1/stages/{stage_id}/track`
**Статус:** закрыто в backend develop (`e7c45d1`, 26.10.2026): ответ типизирован
`StageTrackResponse`, `404` описан и возвращается при отсутствии маршрута.

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

- [x] `npm run gen:api` даёт типизированные `coordinates: number[][]`.
- [x] `404` присутствует в контракте для отсутствующего трека.
- [x] Фронт убрал парсинг `unknown`: используется `StageTrackResponse`, осталась только проверка длины пар.

## Контекст

- Фронт: `src/api/map.ts`, коммит `4c51c90`.
- Проверка: `curl http://localhost:8000/api/v1/stages/1/track` → `200`, `LineString`.
