# Задание бэкенду: зрительские локации, seed и track

Дата: 2026-10-30. Репо: `kamchatka_race_back`, ветка `develop` (`3c94c16`).  
Фронт: `Hackaton`, API `http://127.0.0.1:8000`.

Код сида и `docker-compose` по локациям и route JSON **уже починен** (коммиты Stepan от 29.10). Не переделывать старые п. 1–3 про координаты-заглушки, отсутствие volumes и WARNING-fallback — они закрыты в коде. Ниже — что реально осталось после сверки с живым API.

---

## 1. [блокер] Миграция `elevation` не применена → track 500

**Симптом:** `GET /api/v1/stages/1/track` → 500.  
**Лог:** `column stage_route_points.elevation does not exist`.  
**Факт:** модель и миграция есть (`app/db/models/stage_route_point.py`, `alembic/versions/b18c24a901ef_route_point_elevation.py`), в живой БД колонки нет. Из‑за этого `#/map` и `#/more/route` не получают трассу с живого API.

**Сделать:**

```bash
docker compose run --rm api alembic upgrade head
```

Проверить, что revision `b18c24a901ef` (или head) применена.

**Приёмка:** `GET /api/v1/stages/{id}/track` → 200 и массив точек; на фронте `#/map` и `#/more/route` рисуют трассу с живого API (не из мока).

---

## 2. [блокер] Пересидить БД под актуальный seed

**Симптом:** в живом API 6 локаций, есть «Шатёр». В `scripts/seed_mock.py` уже 5 зон (без «Старт гонки» и «Шатёр»), координаты вокруг б/к им. Фатьянова.

Текущий сид (эталон):

```
Главная сцена 53.0960 / 158.6370  stages
Фотозона      53.0954 / 158.6362  areas
Этнозона      53.0959 / 158.6356  areas
Фудкорт       53.0968 / 158.6364  food
Детская зона  53.0949 / 158.6378  kids
```

**Сделать:**

```bash
docker compose run --rm api python -m scripts.seed_mock --reset
# при необходимости: redis FLUSHDB
```

**Приёмка:**

- в логе `StageRoutePoint: 400` (не 120); трасса этапа 1 — ~88 точек;
- `GET /api/v1/content/viewer-locations` → **5** записей: Главная сцена, Фотозона, Этнозона, Фудкорт, Детская зона;
- координаты вокруг `53.09x / 158.63x`;
- `?category=stages` → только «Главная сцена»;
- `?category=areas` → Фотозона + Этнозона;
- `?category=food` / `kids` → по одной;
- `?category=other` → пусто;
- на `#/more/program/spectator` 5 плашек у Петропавловска, без «Шатёр».

---

## 3. [проверка] Compose и жёсткий fail без route JSON

В коде уже есть:

- volumes `./data:/app/data` и `./scripts:/app/scripts` у `api`;
- отсутствие `data/route-kamchatka.json` → `RuntimeError`, а не WARNING + «прямые линии».

После п. 1–2 один раз прогнать seed в контейнере и убедиться, что не уходит в фоллбэк «прямые линии» и позиции участников идут по трассе.

**Приёмка:** `docker compose run --rm api python -m scripts.seed_mock --reset` → `StageRoutePoint: 400`, этап 1 — ~88 точек.

---

## 4. [опционально] Поле `glyph` у ViewerLocation

Фронт сейчас угадывает иконку по **названию** локации (`GLYPH_BY_NAME` в `src/map/placemarkPins.ts`) — хрупко: переименование ломает иконку. `kind`/`category` не различают, например, Шатёр и Главную сцену (обе `stages`) или Фотозону и Этнозону (обе `areas`).

**Сделать:** поле `glyph` в модели + `ViewerLocationPublicResponse` + значения в сиде:

| Локация       | glyph   |
| ------------- | ------- |
| Главная сцена | `mic`   |
| Фотозона      | `image` |
| Этнозона       | `globe` |
| Фудкорт       | `food`  |
| Детская зона  | `smile` |

Enum или строка: `mic | food | house | image | globe | smile`.  
После — обновить OpenAPI (`scripts/export_openapi.py`). Фронт подхватит через `npm run gen:api` и уберёт угадывание по имени.

---

## Что уже сделано в коде backend (не дублировать)

- Координаты `VIEWER_LOCATIONS` вокруг Фатьянова (не диагональ 53.000…).
- Из сида убраны «Старт гонки» (`other`) и «Шатёр».
- В `docker-compose.yaml` смонтированы `data/` и `scripts/`.
- Нет `data/route-kamchatka.json` → `RuntimeError`.

## Что уже сделано на фронте (чтобы не дублировать)

- Фильтр-«таблетки» по `category` (не по `kind`).
- Контракт (`docs/openapi.json`, `src/api/schema.d.ts`) под `category` и favorites.
- Иконки плашек — VKUI; временно по имени локации.
- «Старт гонки» (`other`) скрыт на фронте как страховка.
- Координаты в БД для демо правились SQL-ом; после `--reset` источником истины снова сид.

---

## Не делать

- Не править фронтовый репо `Hackaton`.
- Не возвращать «Старт гонки» / «Шатёр» в сид без согласования с дизайном.
- Не восстанавливать тихий fallback «прямые линии» при отсутствии route JSON.

**Приоритет:** 1 → 2 → 3; 4 по возможности.  
После 1–2 фронт перепроверить на `#/map`, `#/more/route`, `#/more/program/spectator`.
