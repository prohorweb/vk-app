# Handoff: Dev Menu — сценарии демо-данных

Дата: 2026-11-03. Ветка: `dev`, HEAD: `cbe77e6`.  
Источник ТЗ: `/Users/prohor/Downloads/Telegram Desktop/frontend-demo.md`.  
Бэкенд готов; фронт только вызывает API. Backend-репо не трогать без явной задачи.

---

## Цель

Скрытое Dev Menu для защиты: в один клик переключать демо-состояния БД и запускать kinetic-движение участника на карте.

---

## Контракт (бэк готов)

База: `POST /api/v1/dev/scenarios/...`  
Только при `ENV=dev` на бэке; иначе `403`.  
Каждый сценарий **полностью очищает БД** и заливает новые данные (~1 с).

| Действие | Endpoint | Эффект |
|---|---|---|
| До старта | `POST …/scenarios/upcoming` | Пустая карта, заявки |
| Гонка идёт | `POST …/scenarios/live` | Треки, едет Волков, результаты этапа 1 |
| Финиш | `POST …/scenarios/finished` | Официальные результаты, баннер следующей гонки |
| Kinetic demo | `POST …/scenarios/move/{device_id}` | Фоновый движение; в `live` у Волкова №7 → `device_id = 7` |

В `docs/openapi.json` / `schema.d.ts` этих путей **пока нет** — сначала синхронизировать контракт с бэка (`export_openapi` → `docs/openapi.json` → `npm run gen:api`). Пока схемы нет — тонкий `fetch`/`api.POST` с явными типами ответа, без правок `schema.d.ts` руками.

---

## План реализации

### 1. API-слой
- Файл: `src/api/devScenarios.ts` (или рядом в `src/api/`).
- Функции: `applyDevScenario('upcoming' | 'live' | 'finished')`, `startKineticDemo(deviceId: number)`.
- Ошибки: `403` → понятный toast/snackbar («Dev API недоступен: не ENV=dev»).
- Мутации через TanStack Query (`useMutation`), после success — **широкий** `queryClient.invalidateQueries()` (или сброс ключевых префиксов: `map`, `participants`, `stages`, `standings`, `protocols`, `favorites`, …), чтобы UI подтянул новую БД.

### 2. UI: скрытое Dev Menu
- Показывать **только** в dev-сборке фронта: `import.meta.env.DEV` (и/или отдельный `VITE_DEV_MENU=true`). В prod-бандле пунктов не должно быть.
- Точка входа (выбрать одну, простую):
  - **A (рекомендуется):** в поповере карты `RouteMapMenu` / меню «Ещё» — блок «Демо» внизу, виден только в DEV; или
  - **B:** long-press по заголовку «Карта» / логотипу на старте → открыть `ActionSheet` / `Alert` со сценариями.
- Пункты меню (русский UI):
  - «До старта» → `upcoming`
  - «Гонка идёт» → `live`
  - «Финиш» → `finished`
  - «Движение Волкова» → `move/7` (активен/имеет смысл после `live`; при ошибке показать текст бэка)
- Пока идёт POST: disabled + спиннер; после успеха — Snackbar «Сценарий: …».

### 3. Карта и polling
- После `live` + `move/7` позиции обновляются polling’ом `useStageMapPositionsQuery` (сейчас ~120 с) — **для демо слишком редко**. В рамках задачи: либо временно уменьшить `refetchInterval` в DEV / при активном kinetic, либо после `move` форсить интервал ~3–5 с на время сессии. Зафиксировать в коде комментарием «demo kinetic».
- Сравнение маркеров по `participantId` / `id`, не по bib `number`.

### 4. Не делать
- Не сидить БД на фронте, не чистить localStorage ради сценария (кроме осознанного сброса query cache).
- Не пушить без разрешения; один коммит на задачу: `feat(dev): demo scenarios menu`.
- Не запускать Playwright/build/полный lint без просьбы.
- Категории локаций / glyph — вне скоупа.

### 5. Проверка руками (автор)
1. Бэк `ENV=dev`, фронт `npm run dev`.
2. Dev Menu видно; в prod-сборке — нет.
3. `upcoming` → карта без едущих, UI «до старта».
4. `live` → участники/треки; `move/7` → маркер Волкова ползёт (при ускоренном polling).
5. `finished` → официальные результаты / баннер.
6. Бэк не-dev → 403 и понятное сообщение.

---

## Файлы, куда смотреть

| Файл | Зачем |
|---|---|
| `src/api/client.ts` | base URL, ошибки |
| `src/api/queries.ts` | invalidate / `MAP_MARKERS_REFETCH_MS` |
| `src/panels/MapPanel.tsx` | карта, polling позиций |
| `src/components/route/RouteMapMenu.tsx` | кандидат точки входа |
| `src/panels/` More / Profile | альтернативная точка входа |
| `docs/openapi.json` | после синка с бэка |

---

## Критерий готовности

На защите можно за 2–3 клика показать три состояния гонки и живое движение каюра на карте без ручных правок БД.
