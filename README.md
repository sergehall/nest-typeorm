# NestLab

An educational full-stack platform that combines a large modular NestJS API with a new Next.js
web application. The project remains a monorepo while giving each application a clear boundary and
an independent entry point.

## Project structure

```text
apps/
  api/                 NestJS, TypeORM, PostgreSQL, REST, WebSocket
    src/               backend modules and integrations
    test/              API end-to-end tests
  web/                 Next.js App Router and React Server Components
    src/app/           routes and layouts
    src/components/    shared UI components
    src/features/      frontend feature modules
```

Backend code no longer lives at the repository root or shares application boundaries with the
frontend. The root `package.json` only orchestrates Yarn workspaces and shared quality gates.

## Technology stack

- Node.js 24.18.0 and Yarn 4.14.1
- Next.js 16, React 19, strict TypeScript, and Tailwind CSS 4
- NestJS 11, TypeORM, PostgreSQL
- Swagger / OpenAPI, Socket.IO, Jest, and Supertest
- Stripe, PayPal, Telegram, email, and S3-compatible storage integrations

## Getting started

```bash
nvm use
yarn install
```

The backend loads local environment variables from `apps/api/.env` or `apps/api/.env.dev`. Existing
local environment files were moved with the application. Configure the frontend with:

```bash
cp apps/web/.env.example apps/web/.env.local
```

Run the applications in separate terminals:

```bash
yarn dev:api
yarn dev:web
```

`dev:web` opens the frontend in the default browser after Next.js is ready. Use
`yarn dev:web:no-open` to start the development server without opening a browser.

- Web: [http://localhost:3000](http://localhost:3000)
- API dashboard and health overview: [http://localhost:5005](http://localhost:5005)
- Health contract: [http://localhost:5005/health](http://localhost:5005/health)
- Swagger: [http://localhost:5005/api/docs](http://localhost:5005/api/docs)

Swagger also exposes machine-readable contracts at
`http://localhost:5005/api/docs/openapi.json` and
`http://localhost:5005/api/docs/openapi.yaml`. Documentation is enabled automatically outside
production. To expose it in production, set `SWAGGER_ENABLED=true`, `SWAGGER_USERNAME`, and
`SWAGGER_PASSWORD`; production documentation remains disabled unless all three values are present.

`API_URL` is a server-only Next.js variable and is never included in the browser bundle. It defaults
to `http://localhost:5005`. The API allows localhost browser requests in development. In production,
provide one or more comma-separated origins through `WEB_ORIGIN`.

Set `NEXT_PUBLIC_API_URL` when the web navigation should open a deployed backend dashboard instead
of the local `http://localhost:5005` default.

## Root commands

```bash
yarn dev:api          # NestJS in watch mode
yarn dev:web          # Next.js development server with automatic browser launch
yarn dev:web:no-open  # Next.js development server without opening a browser
yarn typecheck        # TypeScript checks for both workspaces
yarn lint             # ESLint checks for both workspaces
yarn lint:fix         # Fix ESLint issues in the API and web applications
yarn format           # Format the entire monorepo
yarn test             # API unit tests
yarn test:e2e         # API end-to-end tests against a dedicated PostgreSQL database
yarn language:check   # Reject Cyrillic text outside dependencies and generated files
yarn build            # Production builds for the API and web applications
yarn verify           # Language, types, linting, unit tests, and production builds
```

Application-specific commands can also be run through their workspace:

```bash
yarn workspace @nest-typeorm/api test:cov
yarn workspace @nest-typeorm/web build
```

## API capabilities

- Authentication, JWT access and refresh tokens, cookies, devices, roles, and CASL authorization.
- Users, blogs, posts, comments, reactions, subscriptions, and moderation.
- Pair quiz matchmaking, answers, scoring, statistics, and leaderboards.
- Real-time messaging through Socket.IO.
- Stripe, PayPal, Telegram, email, and S3 image uploads.
- Swagger documentation and an end-to-end environment protected from accidental database resets.

Application endpoints currently do not use a global `/api` prefix. Examples include `/auth/login`,
`/blogs`, and `/posts`. `/api/docs` is reserved for Swagger.

## End-to-end database safety

End-to-end tests require a dedicated PostgreSQL database:

```bash
E2E_DATABASE_URL=postgres://user:password@127.0.0.1:5432/nest_typeorm_e2e yarn test:e2e
```

The test bootstrap refuses to reset a database unless `NODE_ENV` equals `test`, the database name
contains a distinct `test` or `e2e` segment, and the host is a loopback address. Resetting a remote
test database additionally requires `E2E_ALLOW_REMOTE_DATABASE_RESET=true`.

## Learning context

The project began as an [IT-Incubator](https://it-incubator.io/en) backend course and gradually grew
into a platform for studying architecture, testing, and integrations. The frontend continues that
journey by making the API capabilities visible and establishing a foundation for real user flows.

## Author

Serge Hall · [sergioartg.com](https://sergioartg.com/) · [GitHub](https://github.com/SergeHall)

## License

[MIT](LICENSE)
