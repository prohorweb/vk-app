# directory: отдавать активный этап

**Приоритет:** P0
**Endpoint:** `GET /api/v1/directory/stages?season_id=…`
**Статус:** закрыто в backend develop (`7baa765`, `de1d6d8`, 26.10.2026): добавлен
`GET /api/v1/directory/stages/active`, seed проставляет этапу `status: active`.

## Сейчас

Все три этапа приходят со `status: planned`, активного нет.
При выборе «Все этапы» на карте фронт падает в fallback — показывает первый этап.

## Нужно

Один из вариантов:

- проставлять `status: active` у текущего этапа сезона; или
- добавить отдельный endpoint активного этапа.

Правило выбора активного этапа описать в контракте.

## Acceptance criteria

- [x] Карта по умолчанию открывает активный этап без fallback на первый.
- [x] `status: active` встречается ровно у одного этапа сезона либо описан endpoint.
- [x] `openapi.json` обновлён.

## Контекст

- Фронт: `activeStageId` в `src/panels/MapPanel.tsx`.
- Проверка 25.10.2026: сезон `id=1` (2027), у всех этапов `status: planned`.
