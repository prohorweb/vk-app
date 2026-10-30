# Handoff: карта и зрительские локации

Документ для переноса работы в Cursor. Описывает, что сделано в сессии, какие решения приняты и что осталось. Историю коммитов смотреть в `git log`, детали — в коде по ссылкам ниже.

Дата: 2026-10-30. Ветка: `dev`, последний коммит — `c1c77e4`.

---

## 1. Задача сессии

Довести два экрана до макетов:

- `#/map` — главная карта гонки, макеты `docs/figma/Карта/`;
- `#/more/program/spectator` — карта зрительских локаций, макеты `docs/figma/Карта зрительских локаций/`.

Плюс попутно: фильтры по `category`, реальные координаты локаций, иконки плашек, поведение камеры и шторок.

---

## 2. Правила проекта (важно для продолжения)

- Тексты интерфейса — только русский; слово «Берингия» не использовать, только «Авача».
- Официальное время — только судейские отметки; время трекера официальным не называть.
- Не писать «остановился» про участников; положение подписывать временем.
- Строгий TypeScript, без `any`; только функциональные компоненты и хуки.
- Сначала VKUI-компоненты и токены; свои стили — через CSS-переменные `--avacha-*`.
- Типы API — только из `src/api/schema.d.ts`, руками не редактировать (генерация `npm run gen:api` из `docs/openapi.json`).
- Иконки — стандартные VKUI (`@vkontakte/icons`, Icon24), кастомные глифы из Figma не используем.
- Перед коммитом достаточно `tsc --noEmit`, `eslint` и `prettier` по затронутым файлам. Полный `build`/`lint` — только по просьбе.
- Скриншоты делает автор. Push — только с явного разрешения.
- Backend (`backend/`) — отдельный репозиторий, правим только по явной задаче.

---

## 3. Что сделано

### 3.1 Главная карта `#/map`

- Камера по выбранному этапу: `fitTo='content'` для «Все этапы» (весь маршрут), `fitTo='markers'` для отдельного этапа (участок и маркеры). Реализация — `src/panels/MapPanel.tsx`, `src/map/YandexMapView.tsx` (`fitToData`).
- Карта поднимается над нижней шторкой: `fitBottomInset={0.25}` → `zoomMargin: [top, right, bottom, left]`, нижний отступ = 25% высоты карты (`src/map/yandexTypes.ts`, `src/map/YandexMapView.tsx`).
- Кнопки карты приведены к макету: тулбар 72×36 (`right/top 16`), зум 36×77, меню 36×36, радиус 8, тень `0 0 2px rgba(0,0,0,.1), 0 2px 2px rgba(0,0,0,.2)`; иконки центрируются через `padding: 6px` + flex; столбец держится справа через `margin-left: auto` (`src/components/route/RouteMapControls.tsx`, `src/index.css`, токены в `src/theme.css`).
- Убраны кнопки «i» (инфо) и геолокации с главной карты.
- Меню «⋮» — поповер над кнопкой без затемнения фона (`RouteMapMenu`, `variant: 'popover'`), только пункты «Поделиться» и «Сообщить об ошибке».
- Убран баннер «Положение», перекрывавший кнопки карты.
- На главной карте — сводная шторка: дисциплины, топ-3, уведомление об устаревших данных (`src/components/map/MapSummarySheet.tsx`, `NoticeCard.tsx`).

### 3.2 Зрительские локации `#/more/program/spectator`

- Фильтры-«таблетки» работают по `category`, `kind` в UI больше не участвует:
  - `kids` → `kids`, `food` → `food`, `stage` → `stages`, `places` → `areas + other`, «Все» → сброс.
  - Маппинг и предикат — `src/api/viewerLocations.ts` (`FILTER_CATEGORIES`, `matchesSpectatorFilter`).
- Локации с `category === 'other'` («Старт гонки») скрываются на фронте.
- При выборе фильтра карточка локации **закрывается** (и не открывается сама), карта зумится к видимым локациям.
- Карта учитывает нижнюю шторку «Ожидаемое прибытие»: `fitBottomInset={0.35}` — все плашки видны над шторкой.
- Плашки: белая капля с цветным кружком и белым глифом VKUI. Размер 40×45, offset `[-20, -42]`, SVG собирается в `src/map/placemarkPins.ts` (`placemarkPinHref(glyph)` → data URI для Yandex Maps).
- Иконки по локации (приоритет) с фоллбэком по категории:

| Локация       | Глиф    | Иконка VKUI            | Цвет      |
| ------------- | ------- | ---------------------- | --------- |
| Фудкорт       | `food`  | `knife_outline_24`     | `#34C759` |
| Шатёр         | `house` | `home_outline_24`      | `#00C0E8` |
| Фотозона      | `image` | `picture_outline_24`   | `#F59824` |
| Этнозона      | `globe` | `globe_outline_24`     | `#0FA3A3` |
| Главная сцена | `mic`   | `music_mic_outline_24` | `#1973B0` |
| Детская зона  | `smile` | `smile_outline_24`     | `#CB30E0` |

- Маппинг по имени — `GLYPH_BY_NAME` в `src/map/placemarkPins.ts`; фоллбэк по категории — `PLACEMARK_GLYPH_BY_CATEGORY`.
- `MapPlacemark` теперь содержит `glyph: PlacemarkGlyph`, а не `category` (`src/map/mapTypes.ts`) — иконку выбирает панель, движок карты её только рисует.
- `useSpectatorLocationsQuery` с `refetchOnMount: 'always'` (`src/api/queries.ts`) — чтобы persisted-кэш не держал старые координаты.

### 3.3 Контракт и данные

- `docs/openapi.json` перегенерирован из живого API (52 пути), `src/api/schema.d.ts` регенерирован (`a67d821`).
- В БД `viewer_locations` координаты поправлены SQL-ом вокруг б/к им. Фатьянова (сид не менялся), Redis `FLUSHDB`, persisted-кэш очищен.
- В БД осталось 6 локаций; «Старт гонки» удалён SQL-ом, но сид бэкенда его всё ещё создаёт — фронт отфильтрует по `other`.

---

## 4. Ключевые решения и почему

1. **`fitTo: 'content' | 'markers'` вместо магических флагов.** Абстракция `MapView` должна позволять заменить движок карты; `fitTo` описывает намерение, а не конкретный API Yandex.
2. **`fitBottomInset` вместо фиксированного `zoomMargin`.** Шторки разной высоты, процент от вьюпорта переносим между экранами.
3. **Глиф в `MapPlacemark`, а не `category`.** Категория не различает Шатёр и Главную сцену (обе `stages`), а также Фотозону и Этнозону (обе `areas`). Выбор иконки — задача панели.
4. **Иконки по имени локации, фоллбэк по категории.** Временная мера, пока бэкенд не отдаёт поле `glyph` (см. `docs/backend-task.md`, п. 4).
5. **Скрытие `other` на фронте.** «Старт гонки» — не зона фестиваля; правильное место — сид бэкенда.
6. **Карточка не открывается при выборе фильтра.** Так просил автор: фильтр — это навигация, а не выбор объекта.

---

## 5. Файлы, которые стоит открыть первыми

| Файл                                                 | Что внутри                                                                          |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------- |
| `src/panels/MapPanel.tsx`                            | главная карта: `fitTo`, `fitBottomInset`, поповеры, меню                            |
| `src/panels/SpectatorMapPanel.tsx`                   | фильтры, скрытие `other`, `handleFilterChange`, placemarks                          |
| `src/map/placemarkPins.ts`                           | глифы VKUI, цвета, SVG-капля, `placemarkGlyphFor`                                   |
| `src/map/mapTypes.ts`                                | `MapPlacemark`, `fitTo`, `fitBottomInset`, контракт `MapView`                       |
| `src/map/YandexMapView.tsx`                          | `fitToData`, `zoomMargin`, установка иконок плашек                                  |
| `src/map/yandexTypes.ts`                             | типы SDK, `zoomMargin`                                                              |
| `src/api/viewerLocations.ts`                         | `matchesSpectatorFilter`, `spectatorCategoryLabels`, `fetchSpectatorLocations`      |
| `src/components/spectator/SpectatorLocationCard.tsx` | карточка локации                                                                    |
| `src/components/route/RouteMapControls.tsx`          | тулбар карты, `menuPlacement`                                                       |
| `src/components/route/RouteMapMenu.tsx`              | меню `sheet` / `popover`                                                            |
| `src/index.css`                                      | `.route-map-controls__*`, `.route-action-menu--popover`, `.spectator-map-screen__*` |
| `src/theme.css`                                      | `--avacha-map-control-*`, `--avacha-map-zoom-height`, `--avacha-map-menu-bottom`    |
| `docs/backend-task.md`                               | задание бэкенду по локациям и сиду                                                  |

---

## 6. Коммиты сессии

```
c1c77e4 docs(backend): task for viewer locations and seed
0a977f7 feat(spectator): globe icon for ethno zone
b79cd4c feat(spectator): per-location VKUI icons, fit above sheet
012dd06 fix(spectator): close card on filter, enlarge pin icons
92f5b0d feat(spectator): VKUI pin icons and open location on filter
cfe7dc8 fix(spectator): refetch viewer locations on mount
126f9e5 feat(spectator): color pins by category, drop kind
a67d821 feat(spectator): filter viewer locations by category
898d777 feat(map): lift route above bottom sheet when fitting
e574d70 fix(map): fit full route for all stages
29656d1 feat(map): fit camera to participant section
f60f92d feat(map): dropdown menu above button without dimming
ba285ba fix(map): keep only share and report in map menu
aaab604 fix(map): keep map controls at right edge after info removal
b29b895 fix(map): center control icons and remove info button
804de53 fix(map): remove geolocation button from main map
88a178d fix(map): align map controls with Figma spec
3197623 feat(map): 36px controls and bottom-placed overflow menu
```

Раньше в этой же ветке: `6dab186` (весь маршрут на главной), `419cf3b` (маршрут на экране этапа), `08ba870`/`32002fc` (сводная шторка), `1e4d606` (фильтры в поповере), `0ba1f07`/`26cdb1c` (шесть этапов и подсветка выбранного).

Все коммиты до `0a977f7` включительно запушены в `origin/dev`. `c1c77e4` (`docs/backend-task.md`) — локальный, не запушен.

---

## 7. Текущее состояние

- Ветка `dev`, `origin/dev` синхронизирован до `0a977f7`, впереди — 1 коммит (`c1c77e4`).
- Рабочее дерево содержит **пользовательские** изменения, которые не коммитились: удалённые PNG в `docs/figma/`, новые папки макетов (`Карта/`, `Карта зрительских локаций/`, `Маршрут/`, `результаты/`, `участник/`), `opencode.json`. Не откатывать и не коммитить без спроса.
- `backend/` чистый.
- В БД 6 `viewer_locations`: Главная сцена, Шатёр, Фотозона, Этнозона, Фудкорт, Детская зона.
- Проверено визуально: 6 плашек с разными иконками и цветами, все над шторкой; на `#/map` — маршрут над шторкой, маркеры 1–15 по трассе, бейдж «Идёт гонка».

---

## 8. Что осталось / открытые вопросы

1. **Бэкенд-задачи** — `docs/backend-task.md`:
   - координаты локаций в `scripts/seed_mock.py` (сейчас диагональ в горах `53.000–53.005 / 158.000–158.005`);
   - `docker-compose.yaml` не монтирует `data/` → сид уходит в фоллбэк «прямые линии» (`StageRoutePoint: 120` вместо `400`);
   - состав локаций vs макет (лишние «Старт гонки», «Шатёр»);
   - опционально: поле `glyph` у локации, чтобы фронт не угадывал иконку по имени.
2. **Фильтр «Площадки» (`areas + other`)** — после скрытия `other` фактически показывает только `areas`; проверить пустые состояния.
3. **Сид бэкенда вернёт «Старт гонки»** при `--reset` — фронт отфильтрует, но правильнее убрать из сида.
4. **Иконка «Этнозоны»** — сейчас глобус; альтернатива `masks_outline_24` (фольклор), если дизайн попросит.
5. **Yandex Maps**: ключ `VITE_VK_MAPS_KEY` пуст (`Invalid API key`), тайлы периодически не грузятся — это среда, не код; маршрут и маркеры рисуются на canvas.

---

## 9. Как запустить и проверить

```bash
npm install
npm run dev -- --port 5174 --strictPort   # http://localhost:5174
npm run gen:api                            # после обновления docs/openapi.json
npx tsc --noEmit -p tsconfig.app.json
npx eslint <files>
npx prettier --check <files>
```

Маршруты для проверки: `#/map`, `#/more/program/spectator`, `#/more/program/route`.

Бэкенд (если нужен живой API): поднять `backend/` через docker compose, применить миграции (`alembic upgrade head`), выполнить `python -m scripts.seed_mock`. Учесть п. 8.1 — без монтирования `data/` трасса будет прямой.

---

## 10. Известные особенности среды

- Hash-роутер иногда возвращает на `#/map` при навигации через `evaluate` — для проверок открывать отдельную вкладку.
- При правках, меняющих экспорты, HMR кратко падает (`does not provide an export named ...`) — состояние временное.
- В браузерных проверках плашки ищутся как элементы с `background-image` содержащим `svg`; цвет кружка читается из `<circle fill="#...">` в data URI.
