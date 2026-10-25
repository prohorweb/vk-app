# Issues для бекенда: публичный API карты и результатов

Расхождения контракта и данных, найденные при переводе карты и результатов на живой API
(фронтенд-коммит `4c51c90`, проверка 25.10.2026).

Репозиторий бекенда: `St3pAn1ndzy/kamchatka_race_back`.
Контракт первичен: после правок обновить `openapi.json` через `scripts/export_openapi.py`,
фронт регенерирует `src/api/schema.d.ts` командой `npm run gen:api`.

## Список

- [ ] [00-umbrella.md](00-umbrella.md) — общий чек-лист (P0)
- [ ] [01-track-schema.md](01-track-schema.md) — track: схема GeoJSON и 404 (P0)
- [ ] [02-results-stage-404.md](02-results-stage-404.md) — results/stage: 404 или draft (P0)
- [ ] [03-active-stage.md](03-active-stage.md) — directory: активный этап (P0)
- [ ] [04-map-all-stages-endpoints.md](04-map-all-stages-endpoints.md) — map: «все этапы» и канонические endpoints (P1)
- [ ] [05-demo-seed.md](05-demo-seed.md) — demo seed: актуальные данные трекера (P1)
- [ ] [06-docs-limits-cors.md](06-docs-limits-cors.md) — docs: лимиты, freshness, CORS (P2)

## Как создать issues

`gh` локально не установлен; команды выполняются из-под аккаунта с доступом к backend-репозиторию.
Labels создавать не обязательно — приоритет указан в заголовке issue.

```bash
gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "Публичный API карты: расхождения контракта" \
  --body-file docs/issues/00-umbrella.md

gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "track: типизировать GeoJSON LineString и добавить 404" \
  --body-file docs/issues/01-track-schema.md

gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "results: привести 404 неопубликованного этапа к контракту" \
  --body-file docs/issues/02-results-stage-404.md

gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "directory: отдавать активный этап" \
  --body-file docs/issues/03-active-stage.md

gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "map: поддержать «все этапы» и определить канонические endpoints" \
  --body-file docs/issues/04-map-all-stages-endpoints.md

gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "demo seed: актуализировать данные трекера" \
  --body-file docs/issues/05-demo-seed.md

gh issue create -R St3pAn1ndzy/kamchatka_race_back \
  --title "docs: описать лимиты, пороги freshness и CORS" \
  --body-file docs/issues/06-docs-limits-cors.md
```
