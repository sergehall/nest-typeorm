# IT-Incubator Training API

Educational backend API built with NestJS while studying backend development with the
wonderful [IT-KAMASUTRA / IT-Incubator](https://it-incubator.io/en) team.

This repository is not a default NestJS starter anymore. It is a learning project where I
practiced building a real modular API: authentication, users, blogs, posts, comments,
quiz games, payments, file uploads, Telegram integration, WebSocket messaging,
database persistence, validation, guards, testing, and deployment basics.

## Project Purpose

The goal of this project was to move from framework tutorials to a backend that looks
closer to production code:

- REST API design with NestJS controllers, DTOs, pipes, filters, guards, and modules.
- PostgreSQL persistence with TypeORM entities and repositories.
- Authentication with JWT access/refresh tokens, cookies, device sessions, and token blacklist.
- Role and permission experiments with CASL and Super Admin flows.
- Blog platform features: users, blogs, blogger ownership, posts, comments, likes, bans, subscriptions, and image metadata.
- Quiz game domain with pair games, answers, scoring, statistics, and admin-managed questions.
- Integrations with email, Telegram, AWS S3-compatible storage, Stripe, and PayPal.
- Swagger documentation and e2e/unit testing practice.

## Tech Stack

- **Runtime:** Node.js 24.15.0
- **Package manager:** Yarn 4.14.1
- **Framework:** NestJS 11
- **Language:** TypeScript
- **Database:** PostgreSQL with TypeORM
- **Additional storage experiments:** MongoDB connection module
- **Auth:** Passport, JWT, cookies, bcrypt
- **Validation:** class-validator, class-transformer, Joi config validation
- **Docs:** Swagger / OpenAPI
- **Realtime:** Socket.IO / WebSocket gateway
- **Files:** AWS SDK S3-compatible storage, Sharp image metadata/processing
- **Payments:** Stripe and PayPal modules
- **Testing:** Jest, Supertest, ts-jest

## Main API Areas

### Public and User Features

- `auth` - registration, login, logout, refresh token, email confirmation, password recovery, current user profile.
- `users` - user search, create, update, delete.
- `blogs` - public blog search, blog details, blog subscriptions, posts in blog.
- `posts` - post search, post details, comments, likes/dislikes.
- `comments` - comment details, update, delete, like/dislike.
- `security/devices` - active session/device management.

### Blogger Features

- `blogger/blogs` - current blogger's blogs, posts, comments, banned users, subscriptions.
- Blog and post image uploads for wallpaper, main images, and post images.
- Blogger-level user banning inside a blog.

### Super Admin Features

- `sa/users` - user administration and bans.
- `sa/blogs` - blog administration, binding blogs to users, ban/unban flows.
- `sa/quiz/questions` - quiz question CRUD and publication status.

### Quiz Game

- `pair-game-quiz` - connect players, create pairs, submit answers, finish games, get current game, game history, user statistics, and top users.

### Integrations

- `integrations/telegram` - Telegram webhook and bot activation link.
- `stripe` - Stripe checkout, success/cancel callbacks, webhook processing.
- `pay-pal` - PayPal checkout, success/cancel callbacks, webhook processing.
- `conversation` - message and conversation endpoints with WebSocket support.
- `products` - test products/orders/payment domain experiments.
- `testing/all-data` - cleanup endpoint for test scenarios.

## API Documentation

Swagger is available after the app starts:

```text
http://localhost:5005/api/docs
```

The app currently does not use a global `/api` prefix, so regular endpoints are mounted
directly from their controller paths, for example `/auth/login`, `/blogs`, `/posts`,
and `/pair-game-quiz/pairs/connection`.

## Requirements

- Node.js 24.15.0
- Yarn 4.14.1, configured through `.yarn/releases/yarn-4.14.1.cjs`
- PostgreSQL database URL
- Environment variables for the integrations you want to run

Use the repository Node version:

```bash
nvm use
```

Check the expected runtime:

```bash
yarn runtime:check
```

## Installation

```bash
yarn install
```

## Environment Configuration

The configuration loader uses:

- `.env` by default
- `.env.dev` when `NODE_ENV=development`
- `.env.test` when `NODE_ENV=testing`

Important environment variable groups:

- App: `NODE_ENV`, `PORT`
- PostgreSQL: `DATABASE_URL`, `PG_DOMAIN_HEROKU`, `TYPEORM_SYNCHRONIZE`
- Mongo experiments: `MONGO_URI_LOCAL`, `ATLAS_URI`, `TEST_DATABASE`, `DEV_DATABASE`, `PROD_NEST_DATABASE`
- Auth/JWT: `ACCESS_SECRET_KEY`, `REFRESH_SECRET_KEY`, `EXP_ACC_TIME`, `EXP_REF_TIME`
- Super Admin: `BASIC_AUTH`, `SA_LOGIN`, `SA_EMAIL`, `SA_KEY`, `SA_PASSWORD_HASH`
- Mail: `NODEMAILER_EMAIL`, `NODEMAILER_APP_PASSWORD`, `MAIL_HOST`, `EMAIL_PORT`
- AWS/S3: `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`, `AWS_ENDPOINT`, `S3_REGION`, `S3_BUCKET`, `S3_PUBLIC_BUCKET`
- Telegram: `TOKEN_TELEGRAM_IT_INCUBATOR`, `TELEGRAM_BOT_USERNAME`, `TELEGRAM_BOT_CHAT_ID`
- Stripe: `STRIPE_TEST_API_KEY`, `STRIPE_LIVE_API_KEY`, `STRIPE_API_VERSION`, `STRIPE_WEBHOOK_SECRET`
- PayPal: `PAYPAL_WEBHOOK_ID`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`
- Security: `THROTTLE_TTL`, `THROTTLE_LIMIT`, `SALT_FACTOR`
- reCAPTCHA: `RECAPTCHA_SITE_KEY`, `RECAPTCHA_SECRET_KEY`

Do not commit real secrets. Use local `.env*` files for development and platform-level
environment variables for deployment.

## Running The App

```bash
# development
yarn start:dev

# regular start
yarn start

# production build
yarn build
yarn start:prod
```

By default, the application uses port `5005` unless `PORT` is provided.

## Database And Migrations

Generate a migration:

```bash
yarn generate-migrations
```

Apply migrations after building the project:

```bash
yarn build
yarn apply-migrations
```

Revert the last migration:

```bash
yarn revert-last-migrations
```

For local experiments, TypeORM synchronization can be enabled with:

```bash
TYPEORM_SYNCHRONIZE=true
```

Use it carefully and avoid enabling synchronization for production databases.

## Tests

```bash
# unit tests
yarn test

# e2e tests
yarn test:e2e

# coverage
yarn test:cov

# lint
yarn lint

# format check
yarn format:check
```

## Project Structure

```text
src/
  ability/              CASL abilities, roles, guards
  adapters/             External service adapters
  api-documentation/    Swagger decorators and documentation helpers
  common/               Filters, pipes, validators, helpers, mail, scheduling
  config/               Typed configuration and Joi validation
  db/                   TypeORM/PostgreSQL and Mongo connection setup
  features/             Main business modules
  middlewares/          HTTP logging middleware
  payment/              Payment orchestration, Stripe, PayPal
  socket/               WebSocket gateway and events
```

## Learning Context

This API was built as part of my learning journey with
[IT-KAMASUTRA / IT-Incubator](https://it-incubator.io/en). It reflects my first serious
steps with backend engineering: Node.js, NestJS, PostgreSQL, TypeORM, MongoDB,
Swagger, WebSocket, authentication, authorization, payments, integrations, testing,
deployment basics, and architectural patterns such as modular design and use cases.

Special thanks to the IT-KAMASUTRA team for the education, structure, and practical
tasks that helped this project grow from simple exercises into a full training backend.

## Author

Serge Hall

- Website: [https://sergioartg.com](https://sergioartg.com/)

## License

This project is licensed under the [MIT License](LICENSE).
