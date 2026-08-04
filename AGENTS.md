# AGENTS.md

## Проект
Тестовое задание: отдельная страница поиска и бронирования поездов
(Next.js + TypeScript). Полный бриф — см. docs/brief.md (добавь файл с
исходным текстом задания, если ещё не добавлен).

## Стек
- Next.js (App Router), TypeScript
- CSS-подход: Tailwind CSS v4 (через `@tailwindcss/postcss`, без
  `tailwind.config` — токены живут в `app/globals.css`)
- Версии запинены точно (не диапазонами): TypeScript 6.0.3 и ESLint 9.x —
  верхние границы, которые переваривает `eslint-config-next@16`. TS 7 и
  ESLint 10 ломают линт, см. README.
- Бэкенда нет — весь бизнес-контекст обслуживает публичный тестовый API.

## Команды
- Установка: `npm install`
- Дев-сервер: `npm run dev`
- Проверка типов: `npm run typecheck` (tsc --noEmit)
- Линт: `npm run lint`
- Контракты по живому API: `npm run smoke` (все обёртки + 404/400/409, в конце
  делает `/reset`)
- Сброс мест тестового API: `npm run api:reset`

## API (не модифицировать, не форкать, не поднимать локально)
Base URL: `https://train-booking-assignment.onrender.com`

| Method | Endpoint | Назначение | Ответ |
|---|---|---|---|
| GET | /trains?from=&to=&date=&sortBy=&sortOrder=&page=&limit= | список поездов | { data, total, page, limit } |
| GET | /trains/:id | один поезд | 200 / 404 |
| POST | /bookings { trainId, seats? } | бронирование | 201 / 400 / 409 |
| GET | /stations | справочник городов | — |
| POST | /reset | сброс мест (для тестов) | — |

## Контракт (зафиксирован в первой сессии — не менять без явного обсуждения)
- Источник истины для параметров поиска — URL query-string: `from`, `to`,
  `date`, `maxPrice`, `sortBy`, `sortOrder`. Любое изменение поиска обновляет
  URL. Парсинг и сериализация — только через `lib/search-params.ts`;
  дефолты (`sortBy=price`, `sortOrder=asc`) в URL не пишутся.
- `from`/`to` в URL хранятся как slug из `/stations` (`berlin`, `munich`) —
  `/trains` матчит город без учёта регистра, slug даёт канонический вид ссылки.
- Вся работа с API — только через `lib/api.ts`. Никаких прямых `fetch()`
  в компонентах.
- Типы `Train` / `Station` / `Booking` — в `lib/types.ts`, только по факту
  реальных полей API, не выдумывать лишнее.
- Форма ошибки: `ApiError.kind` = `'network' | 'not_found' | 'conflict' |
  'validation' | 'unknown'`. 404/409/400 — это не throw, а типизированный
  результат.
- `maxPrice` (бюджет) НЕ поддерживается `/trains` нативно — фильтруется на
  клиенте после фетча текущей страницы. Осознанное допущение, не работает
  корректно вместе с пагинацией за пределами первой страницы — см. README.
- `/stations` отдаёт объект-мапу `{ slug: { code, name, country } }`, а не
  массив. `getStations()` нормализует её в `Station[]` со slug внутри.
- API подсыпает случайные 500 (~1 запрос из 15). GET-запросы ретраятся
  (2 повтора, backoff 400/1000 мс), `POST /bookings` — НЕТ: он не
  идемпотентен, повтор может списать места дважды.
- Кэш: список поездов и `/stations` — `cache: 'force-cache'` + `revalidate`
  (в Next 16 кэш opt-in, без `force-cache` `revalidate` не работает), деталь
  поезда и брони — `no-store`, чтобы `seatsLeft` не врал.
- Каждый запрос ограничен таймаутом через `AbortSignal`, а это отключает
  per-render мемоизацию `fetch` в Next. Не вызывать один и тот же эндпоинт
  дважды в одном рендере — уйдёт два реальных запроса.

## Структура
- `app/search/**` — страница поиска и список результатов (Server Component,
  читает `searchParams`)
- `app/train/[id]/**` — детали поезда + бронирование
- `lib/api.ts` (единственное место с `fetch`), `lib/types.ts`,
  `lib/config.ts` (base URL, таймаут, retry, политика кэша),
  `lib/search-params.ts` (URL-контракт + клиентский фильтр по бюджету),
  `lib/hooks/**` (включая `useSavedTrains`)
- `scripts/smoke.ts` — прогон контрактов по живому API

## Вне скоупа MVP (сознательно, не забыть про время)
- Аккаунты и синхронизация между устройствами — брифом отложено на
  следующий квартал, бэкенда для этого нет.
- Пагинация дальше первой страницы.
- Фильтры, кроме бюджета; сортировка, кроме цены.
- Анимации, pixel-perfect дизайн.
- Полноценный набор тестов — по минимуму, если останется время.

## Правила и переиспользуемые паттерны
- `.cursor/rules/project.mdc` — короткие ambient-правила, применяются всегда.
- `.cursor/skills/` — паттерны, которые агент подгружает по необходимости:
  `typed-api-endpoint`, `loading-error-skeleton`.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
