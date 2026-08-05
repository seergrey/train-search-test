# Train Search — Test Assignment

## Getting started
```
npm install
npm run dev
```
Открыть http://localhost:3000 — редиректит на `/search`.

Base URL API берётся из `NEXT_PUBLIC_API_BASE_URL` (см. `.env.example`),
по умолчанию — публичный тестовый API задания, так что `.env` не обязателен.

Дополнительно: `npm run typecheck`, `npm run lint`,
`npm run smoke` (прогон всех обёрток `lib/api.ts` по живому API, включая
404/400/409; в конце сбрасывает места через `/reset`), `npm run test`
(юнит-тесты Vitest для `lib/api.ts` и `lib/search-params.ts`, моки через
`msw`), `npm run e2e` (Playwright, см. ниже).

## What was implemented
_(держи актуальным по ходу работы, не только в конце)_

- [x] Слой данных: типы по факту API, `lib/api.ts` с `Result<T>`/`ApiError`,
      URL-контракт поиска в `lib/search-params.ts`, smoke-прогон контрактов
- [x] Search page (from/to/date/budget в URL, SSR-результаты, сортировка по цене)
- [x] Детали поезда + бронирование (обработка 404/409/400)
- [x] Saved trains (localStorage, закреплены наверху списка)
- [x] Loading/error/empty состояния во всех вьюхах с данными
- [x] Мобильная адаптация
- [x] Тесты: юнит-тесты Vitest (`lib/api.test.ts`, `lib/search-params.test.ts`,
      моки через `msw`) и e2e-тест Playwright
      (`e2e/booking-conflict.spec.ts`) по живому API

## What was not implemented and why
_(осознанные решения по приоритизации, не "не успел")_

- Аккаунты / синхронизация между устройствами — бриф явно откладывает это
  на следующий квартал, бэкенда для этого нет.
- Пагинация дальше первой страницы — реально срезано. `toTrainsQuery`
  прокидывает `page`/`limit` в `/trains`, но UI не вызывает их с чем-то
  кроме дефолта: нет ни кнопки "ещё", ни infinite scroll, ни номеров
  страниц. Отчасти вынужденно: `maxPrice` фильтруется на клиенте только
  по уже полученной странице (см. Assumptions), так что честная пагинация
  потребовала бы либо тащить фильтр на сервер, либо не совпадающий с API
  курсор — решил не размазывать оставшееся время на это.
- Фильтры кроме бюджета, сортировка кроме цены — основной флоу из брифа
  требует только это; `/trains` и не поддерживает других `sortBy`.
- Автодополнение / debounce при вводе городов — форма отправляется только
  по сабмиту (кнопка "Search trains"), без live-поиска по мере набора текста.
- Полное покрытие тестами — юнит-тесты покрывают маппинг `ApiError.kind` в
  `lib/api.ts` и парсинг/валидацию URL в `lib/search-params.ts`, e2e-тест
  покрывает флоу с конфликтом при бронировании; `useSavedTrains` и остальные
  компоненты тестами не покрыты.
- Анимации / pixel-perfect дизайн — явно вне ожиданий задания.

## Assumptions
- `maxPrice` не документирован как query-параметр `/trains` — фильтруется
  на клиенте после фетча текущей страницы; не работает корректно вместе с
  пагинацией за пределами первой страницы. Осознанный trade-off.
- URL поиска несёт шесть параметров: `from`, `to`, `date`, `maxPrice`,
  `sortBy`, `sortOrder`. Направление сортировки вынесено отдельным
  параметром, а не склеено в значение `sortBy` (`price_desc`), чтобы 1:1
  совпадать с контрактом `/trains` и не заводить свой формат кодирования.
  Дефолты (`price`/`asc`) в URL не пишутся, ссылки остаются короткими.
- `from`/`to` в URL — slug из `/stations` (`berlin`), а не отображаемое имя:
  `/trains` матчит город без учёта регистра, slug даёт канонический
  вид расшаренной ссылки.
- `/stations` отдаёт объект-мапу `{ slug: { code, name, country } }`, а не
  массив, — `getStations()` нормализует её в `Station[]`, добавляя slug.
  Все 11 городов Германии.
- API периодически отвечает 500 без причины (замерено: ~1 запрос из 15
  идентичных) при латентности 1.5–2 с. Поэтому GET-запросы ретраятся дважды
  с backoff 400/1000 мс, а `POST /bookings` не ретраится вообще: он не
  идемпотентен, и повтор после 500 мог бы списать места дважды.
- Кэширование разное по типу данных: список поездов `revalidate: 30`
  (страница индексируется и должна открываться быстро), деталь поезда —
  `no-store`, иначе `seatsLeft` перед бронированием может врать.
- Невалидные `date`/город API не считает ошибкой — отдаёт `200` с пустым
  `data`. Для UI это состояние «ничего не найдено», а не ошибка.
- Ответ `POST /bookings` содержит актуальный `seatsLeft`, так что после
  брони UI обновляется без дополнительного запроса.
- TypeScript запинен на 6.0.3, ESLint на 9.x: с TS 7 и ESLint 10
  `eslint-config-next@16` падает (typescript-eslint не поддерживает TS 7,
  а `eslint-plugin-react` — flat-API ESLint 10). Не диапазоны, а точные
  версии — чтобы у ревьюера собралось ровно то же.
- Saved trains — per-device (localStorage), без синхронизации, согласуется
  с тем, что аккаунты запланированы на следующий квартал.
- Booking: тело API допускает опциональный `seats` — в UI есть выбор
  количества мест (dropdown от 1 до `min(seatsLeft, 9)`), т.к. по брифу
  пользователи бронируют места.
- 409 при бронировании — ожидаемый бизнес-исход, а не системная ошибка.
- `/reset` — служебный эндпоинт для тестирования, не часть
  пользовательского флоу (см. ниже).
- Бронирование ограничено 9 местами за раз (`MAX_SEATS_PER_BOOKING`
  в `booking-form.tsx`): API не документирует верхнюю границу `seats`,
  а бесконечный дропдаун на основе `seatsLeft` (сотни мест) бесполезен
  для реального пассажира — 9 это разумный потолок, а не значение из API.
- Страница поезда рисует свой 404 (`TrainNotFound` в `app/train/[id]/page.tsx`)
  вместо вызова `notFound()` из `next/navigation`: `notFound()` рендерит
  `not-found.tsx` без доступа к `searchParams` текущего запроса, а нужно
  сохранить `backHref` (ссылку "назад к результатам" с тем же from/to/date),
  который уже посчитан в компоненте страницы.
- В `Results` (`app/search/page.tsx`) два разных empty-состояния, а не одно
  общее "ничего не найдено": пустой ответ API (`fetchedTrains.length === 0`)
  и пустой результат после клиентского фильтра по `maxPrice`
  (`visibleTrains.length === 0`) — во втором случае у пользователя есть
  выход (ссылка "Clear budget filter"), в первом это неприменимо, поэтому
  тексты и набор действий разные.
- Кэш в Next 16 opt-in: без `cache: 'force-cache'` поле `next.revalidate`
  ничего не делает, поэтому `lib/api.ts` всегда явно выставляет `cache`
  (`'force-cache'` + `revalidate: revalidateSeconds` либо `'no-store'`),
  а не полагается на дефолт фреймворка.
- Все новые файлы — kebab-case (`train-card.tsx`, `train-list.tsx`,
  `use-saved-trains.ts`, `search-params.ts`, `retry-button.tsx`,
  `booking-form.tsx`), без PascalCase/camelCase в именах файлов, даже
  когда экспортируемый компонент/хук называется иначе.

## Testing the booking-conflict flow
`e2e/booking-conflict.spec.ts` (`npm run e2e`) гоняется по живому dev-серверу
и реальному API, без моков: находит поезд с наименьшим числом мест через
`/trains`, открывает его страницу, сам выкупает все оставшиеся места напрямую
через `createBooking`, чтобы получить состояние sold-out, затем сабмитит
форму бронирования и проверяет, что появляется сообщение "no seats left on
this train" и рабочая ссылка "Back to results", восстанавливающая исходные
from/to/date в URL. В `afterAll` сбрасывает места через `/reset`.

Чтобы воспроизвести тот же сценарий вручную:
```
curl -X POST https://train-booking-assignment.onrender.com/reset
```
Откатывает доступность мест, чтобы повторно проверить сценарий "мест не осталось" (409).

## AI Agent Logs
См. `/ai-logs` — один экспорт на чат-сессию:
- `01_cursor_chat_next_js_project_skeleton_plan.json` — план и скелет Next.js-проекта
- `02-1_cursor_chat_ui_updates_and_error_handling.json` — правки UI и обработка ошибок
- `02-2_cursor_chat_ui_form_implementation_plan.json` — план реализации формы поиска
- `03_cursor_chat_saved_trains_feature_implementat.json` — реализация Saved trains
- `04_cursor_chat_readme_md_update_details.json` — обновление README.md
- `05-1_cursor_chat_testing_setup_for_lib_files.json` — настройка тестов для lib
- `05-2_cursor_chat_accessibility_improvements_in_ap.json` — доступность (a11y) в app
- `06_cursor_chat_playwright_e2e_test_setup.json` — настройка e2e-теста на Playwright
- `07_cursor_chat_seat_count_discrepancy.json` — расхождение в количестве мест
- `08_cursor_chat_readme_md_update_request.json` — запрос на обновление README.md
- (добавляй по мере новых сессий)
