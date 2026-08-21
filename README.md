# NestLab

Учебная full-stack платформа: большой модульный API на NestJS и новый web-интерфейс на Next.js.
Проект остаётся монолитным репозиторием, но приложения теперь имеют явные границы и независимые
точки запуска.

## Структура

```text
apps/
  api/                 NestJS, TypeORM, PostgreSQL, REST, WebSocket
    src/               backend-модули и интеграции
    test/              e2e-тесты API
  web/                 Next.js App Router и React Server Components
    src/app/           маршруты и layouts
    src/components/    общие UI-компоненты
    src/features/      feature-модули frontend
```

Backend-код больше не лежит в корне и не смешивается с frontend. Корневой `package.json` только
оркестрирует Yarn workspaces и общие quality gates.

## Стек

- Node.js 24.18.0 и Yarn 4.14.1
- Next.js 16, React 19, TypeScript strict, Tailwind CSS 4
- NestJS 11, TypeORM, PostgreSQL
- Swagger / OpenAPI, Socket.IO, Jest и Supertest
- Интеграции с Stripe, PayPal, Telegram, email и S3-совместимым хранилищем

## Быстрый старт

```bash
nvm use
yarn install
```

Backend читает локальные переменные из `apps/api/.env` или `apps/api/.env.dev`. Существующие
локальные файлы перенесены туда вместе с приложением. Для frontend:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Запустите приложения в двух терминалах:

```bash
yarn dev:api
yarn dev:web
```

- Web: [http://localhost:3000](http://localhost:3000)
- API: [http://localhost:5005](http://localhost:5005)
- Swagger: [http://localhost:5005/api/docs](http://localhost:5005/api/docs)

`API_URL` — server-only переменная Next.js. Она не попадает в браузерный bundle и по умолчанию
равна `http://localhost:5005`. Для browser-запросов API разрешает localhost в development; в
production укажите один или несколько origin через `WEB_ORIGIN` (через запятую).

## Основные команды

```bash
yarn dev:api          # NestJS в watch-режиме
yarn dev:web          # Next.js development server
yarn typecheck        # TypeScript в обоих workspaces
yarn lint             # ESLint в обоих workspaces
yarn lint:fix         # исправить ESLint-проблемы в API и web
yarn format           # форматировать всю монорепу
yarn test             # unit-тесты API
yarn test:e2e         # e2e API с отдельной PostgreSQL
yarn build            # production build API и web
yarn verify           # types + lint + unit tests + build
```

Команды отдельного приложения также можно запускать через workspace, например:

```bash
yarn workspace @nest-typeorm/api test:cov
yarn workspace @nest-typeorm/web build
```

## Что умеет API

- Авторизация, JWT access/refresh tokens, cookies, устройства, роли и CASL.
- Пользователи, блоги, публикации, комментарии, реакции, подписки и модерация.
- Парная викторина: matchmaking, ответы, очки, статистика и рейтинг.
- Realtime-сообщения через Socket.IO.
- Stripe, PayPal, Telegram, email и S3-загрузка изображений.
- Swagger-документация и защищённый от случайной очистки e2e-контур.

Обычные endpoint-ы пока не используют глобальный `/api` prefix: например `/auth/login`, `/blogs`
и `/posts`. `/api/docs` зарезервирован для Swagger.

## E2E и безопасность базы

Для e2e нужна отдельная PostgreSQL:

```bash
E2E_DATABASE_URL=postgres://user:password@127.0.0.1:5432/nest_typeorm_e2e yarn test:e2e
```

Тестовый bootstrap откажется очищать базу, если `NODE_ENV` не равен `test`, имя базы не содержит
`test` или `e2e`, либо хост не loopback. Удалённая тестовая база дополнительно требует
`E2E_ALLOW_REMOTE_DATABASE_RESET=true`.

## Контекст обучения

Проект начался как backend-курс [IT-Incubator](https://it-incubator.io/en) и постепенно вырос в
площадку для изучения архитектуры, тестирования и интеграций. Новый frontend продолжает эту
историю: показывает возможности API и создаёт основу для реальных пользовательских сценариев.

## Автор

Serge Hall · [sergioartg.com](https://sergioartg.com/) · [GitHub](https://github.com/SergeHall)

## Лицензия

[MIT](LICENSE)
