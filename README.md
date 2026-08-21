# NestLab

NestLab is an educational full-stack monorepo built around a large modular NestJS API and a
server-first Next.js web application. It began as backend coursework and evolved into a practical
platform for studying application architecture, PostgreSQL, authentication, realtime features,
payments, API documentation, testing, and production hardening.

The project runs locally and does not require a public web domain. The screenshots below show the
production-style interface available from the local development environment.

<p>
  <a href="https://sergehall.github.io/nest-typeorm/#tour">
    <img
      alt="Open the NestLab screenshot slideshow"
      src="https://img.shields.io/badge/Open%20slideshow-NestLab%20screens-ff6838?style=for-the-badge&logo=github&logoColor=white"
    />
  </a>
</p>

## Product tour

<details>
  <summary><strong>View screenshots gallery (5 pages)</strong></summary>
  <br />

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/screenshots/web-home.webp">
        <img src="docs/screenshots/web-home.webp" width="360" alt="NestLab home page" />
      </a>
      <br /><sub><strong>Home</strong> — monorepo overview and application boundaries</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/screenshots/web-capabilities.webp">
        <img
          src="docs/screenshots/web-capabilities.webp"
          width="360"
          alt="NestLab capabilities page"
        />
      </a>
      <br /><sub><strong>Capabilities</strong> — identity, publishing, learning, and integrations</sub>
    </td>
  </tr>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="docs/screenshots/web-api-status.webp">
        <img src="docs/screenshots/web-api-status.webp" width="360" alt="NestLab API status page" />
      </a>
      <br /><sub><strong>API status</strong> — NestJS and PostgreSQL health</sub>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="docs/screenshots/web-contact.webp">
        <img src="docs/screenshots/web-contact.webp" width="360" alt="NestLab contact page" />
      </a>
      <br /><sub><strong>Contact</strong> — project, profile, and collaboration links</sub>
    </td>
  </tr>
  <tr>
    <td colspan="2" align="center" valign="top">
      <a href="docs/screenshots/api-dashboard.webp">
        <img
          src="docs/screenshots/api-dashboard.webp"
          width="720"
          alt="NestLab backend API dashboard"
        />
      </a>
      <br /><sub><strong>Backend API dashboard</strong> — health, OpenAPI contracts, and routes</sub>
    </td>
  </tr>
</table>

</details>

## Architecture

NestLab remains a monorepo, but the frontend and backend have independent application boundaries,
runtime configuration, builds, and entry points.

```text
Browser
  |
  v
apps/web                         apps/api
Next.js 16 + React 19   HTTP     NestJS 11 + TypeORM
App Router + RSC       ------->  REST + Socket.IO + OpenAPI
  :3000                            :5005
                                      |
                                      v
                                  PostgreSQL
```

| Application | Responsibility                                                                              | Development URL         |
| ----------- | ------------------------------------------------------------------------------------------- | ----------------------- |
| `apps/web`  | Next.js interface, navigation, contact information, and server-side API status              | `http://localhost:3000` |
| `apps/api`  | NestJS modules, REST endpoints, realtime transport, integrations, health, and documentation | `http://localhost:5005` |

The root `package.json` coordinates Yarn workspaces and shared quality gates. Backend source files
do not live at the repository root and are not mixed with frontend modules.

## Technology stack

### Web application

- Next.js 16.3 with App Router and React Server Components
- React 19.2 and strict TypeScript 6
- Tailwind CSS 4 and a responsive project-specific design system
- Server-only health requests that keep the backend address out of the client bundle

### API

- NestJS 11, TypeORM 0.3, PostgreSQL, REST, and Socket.IO
- Passport, JWT access and refresh tokens, CASL authorization, and device sessions
- Swagger / OpenAPI 3 with separate read-only Viewer and interactive Admin access
- Stripe, PayPal, Telegram, email, and S3-compatible storage integrations
- Jest, Supertest, guarded end-to-end database resets, and OpenAPI coverage checks

### Tooling

- Node.js 24.18.0 and Yarn 4.14.1
- ESLint, Prettier, strict TypeScript, workspace builds, and an English-only source check

## Platform capabilities

- **Identity and access:** registration, login, password recovery, JWT rotation, roles, CASL
  permissions, and device management.
- **Publishing and communication:** blogs, posts, comments, reactions, subscriptions, moderation,
  uploads, and realtime conversations.
- **Pair quiz:** matchmaking, game pairs, answers, scoring, statistics, and leaderboards.
- **Commerce and integrations:** Stripe and PayPal payments, Telegram automation, email delivery,
  and S3-compatible media storage.
- **Operations:** application liveness, PostgreSQL readiness, response timing, API dashboard, and
  generated OpenAPI JSON/YAML contracts.

Application routes currently do not use a global `/api` prefix. Examples include `/auth/login`,
`/blogs`, and `/posts`; `/api/docs` is reserved for API documentation.

## Security boundaries

- Production-only educational mutation routes are disabled by guards.
- Request validation, parameterized TypeORM operations, throttling, trusted proxy handling, and
  bounded PostgreSQL connection settings protect the public API boundary.
- Swagger fails closed unless its complete access configuration is present.
- Viewer documentation cannot use `Try it out`; Admin documentation remains subject to the real
  authentication and authorization guards of every endpoint.
- Swagger passwords are stored as Argon2id hashes. Documentation sessions use signed, short-lived,
  `HttpOnly`, `Secure`, `SameSite=Strict` cookies in production.
- Production database access is designed for a least-privilege runtime role separate from the
  migration owner.

See [Backend production hardening](docs/security/backend-production-hardening.md) for deployment and
database-role guidance.

## Getting started

### Prerequisites

- Node.js `24.18.0`
- Corepack with Yarn `4.14.1`
- PostgreSQL for the API runtime

Install workspace dependencies from the repository root:

```bash
nvm use
yarn install
```

Create local configuration files without committing their secret values:

```bash
cp apps/api/.env.example apps/api/.env.dev
cp apps/web/.env.example apps/web/.env.local
```

At minimum, configure the API database connection in `apps/api/.env.dev`. The web application uses
`API_URL=http://localhost:5005` for server-side calls by default. Set `NEXT_PUBLIC_API_URL` only when
browser navigation should open a different backend dashboard.

### Start the platform

Run the applications in separate terminals:

```bash
yarn dev:api
yarn dev:web
```

`yarn dev:web` opens the frontend automatically after Next.js is ready. Use
`yarn dev:web:no-open` when automatic browser launch is not wanted.

| Surface             | URL                                                                          |
| ------------------- | ---------------------------------------------------------------------------- |
| Web application     | [http://localhost:3000](http://localhost:3000)                               |
| API dashboard       | [http://localhost:5005](http://localhost:5005)                               |
| Health overview     | [http://localhost:5005/health](http://localhost:5005/health)                 |
| Documentation login | [http://localhost:5005/api/docs/login](http://localhost:5005/api/docs/login) |
| Viewer Swagger UI   | [http://localhost:5005/api/docs](http://localhost:5005/api/docs)             |
| Admin Swagger UI    | [http://localhost:5005/api/docs/admin](http://localhost:5005/api/docs/admin) |

## Swagger access

Generate independent Viewer and Admin credentials from the repository root:

```bash
yarn swagger:credentials
```

Save the generated plaintext passwords in a password manager. Runtime configuration receives only
the Argon2id hashes and the random session-signing secret:

```dotenv
SWAGGER_ENABLED=true
SWAGGER_VIEWER_USERNAME=viewer
SWAGGER_VIEWER_PASSWORD_HASH='$argon2id$...'
SWAGGER_ADMIN_USERNAME=admin
SWAGGER_ADMIN_PASSWORD_HASH='$argon2id$...'
SWAGGER_SESSION_SECRET='base64url-random-secret'
SWAGGER_SESSION_TTL_SECONDS=1200
```

Authenticated Viewer sessions can also open the machine-readable contracts:

- `http://localhost:5005/api/docs/openapi.json`
- `http://localhost:5005/api/docs/openapi.yaml`

## Root commands

```bash
yarn dev:api          # Start NestJS in watch mode
yarn dev:web          # Start Next.js and open it in the default browser
yarn dev:web:no-open  # Start Next.js without opening a browser
yarn typecheck        # Check both TypeScript workspaces
yarn lint             # Run ESLint for API and web
yarn lint:fix         # Fix ESLint issues in both applications
yarn format           # Format the entire monorepo
yarn test             # Run API unit and integration tests
yarn test:e2e         # Run API end-to-end tests against a dedicated database
yarn test:cov         # Generate API test coverage
yarn language:check   # Reject Cyrillic source text
yarn build            # Build API and web for production
yarn verify           # Run language, type, lint, test, and build gates
```

Application-specific commands remain available through their workspace names:

```bash
yarn workspace @nest-typeorm/api test:cov
yarn workspace @nest-typeorm/web build
```

## End-to-end database safety

End-to-end tests require a dedicated PostgreSQL database:

```bash
E2E_DATABASE_URL=postgres://user:password@127.0.0.1:5432/nest_typeorm_e2e yarn test:e2e
```

The test bootstrap refuses to reset a database unless `NODE_ENV=test`, the database name contains a
distinct `test` or `e2e` segment, and the host is a loopback address. Resetting a remote test database
additionally requires `E2E_ALLOW_REMOTE_DATABASE_RESET=true`.

## Repository structure

```text
apps/
  api/
    scripts/             API maintenance and credential tooling
    src/                 NestJS modules, infrastructure, and integrations
    test/                End-to-end suites and database safety helpers
  web/
    src/app/             Next.js routes, layouts, and server boundaries
    src/components/      Shared interface components
    src/features/        Frontend feature modules and data access
docs/
  screenshots/           Optimized README product tour assets
  security/              Production hardening guidance
scripts/                 Repository-wide maintenance checks
```

## Learning context

The backend began as an [IT-Incubator](https://it-incubator.io/en) course project. It now serves as a
long-running engineering laboratory for modular backend design, secure API delivery, database
safety, automated testing, and full-stack integration. The frontend makes those capabilities
visible while leaving room for future user-facing workflows.

## Author

Serge Hall · [sergioartg.com](https://sergioartg.com/) · [GitHub](https://github.com/SergeHall)

## License

[MIT](LICENSE)
