# Backend production hardening

The public repository is designed to remain convenient for local study while the deployed API
uses stricter runtime boundaries.

Set `NODE_ENV=production` explicitly in the deployment. Security-sensitive code treats missing or
unknown values as hardened production, so an environment typo cannot expose educational routes.

## HTTP boundary

- `TestingController`, `GET /products/test-products`, and
  `GET /pair-game-quiz/pairs/create-questions` return `404` in production.
- Swagger is fail-closed and remains unavailable until `SWAGGER_ENABLED=true` and the complete
  Viewer/Admin access configuration is present. `/api/docs` is the read-only Viewer surface;
  `/api/docs/admin` is the interactive Admin surface. OpenAPI JSON and YAML require at least a
  Viewer session.
- Documentation passwords are stored only as Argon2id hashes. The signed session uses a short-lived
  `HttpOnly`, `Secure`, `SameSite=Strict` cookie in production. Login attempts are locally limited,
  and the hosting edge should provide an additional distributed rate limit.
- Application throttling is enforced globally. Production deployments must run behind exactly
  one trusted reverse proxy because Express is configured with `trust proxy = 1`.
- Keep an edge rate limit on the hosting provider as a second layer. The built-in NestJS storage
  is process-local and is not a distributed denial-of-service control.

## Swagger access configuration

Generate a fresh credential set with `yarn swagger:credentials`, save the two plaintext passwords
in a password manager, and configure only the generated hashes and session secret at runtime:

```dotenv
SWAGGER_ENABLED=true
SWAGGER_VIEWER_USERNAME=viewer
SWAGGER_VIEWER_PASSWORD_HASH='$argon2id$...'
SWAGGER_ADMIN_USERNAME=admin
SWAGGER_ADMIN_PASSWORD_HASH='$argon2id$...'
SWAGGER_SESSION_SECRET='base64url-random-secret'
SWAGGER_SESSION_TTL_SECONDS=1200
```

Viewer can browse the contract and download OpenAPI JSON/YAML, but Swagger UI cannot submit HTTP
requests. Admin can use `Try it out`; this does not bypass the authentication and authorization
guards of the documented endpoints. Rotate both password hashes and the session secret together to
invalidate every existing documentation session.

## PostgreSQL role separation

Do not use a database owner or migration account in `DATABASE_URL`. Create two accounts:

1. `nestlab_migrator` owns the NestLab objects and runs migrations.
2. `nestlab_runtime` has only `CONNECT`, schema `USAGE`, sequence `USAGE`, and table
   `SELECT`, `INSERT`, `UPDATE`, and `DELETE` permissions required by the application.

Set `DATABASE_URL` to the runtime account. Supply `MIGRATION_DATABASE_URL` only to the migration
command; the production migration data source refuses to start without this separate credential.

The runtime role must not have `SUPERUSER`, `CREATEDB`, `CREATEROLE`, `REPLICATION`, `BYPASSRLS`,
schema `CREATE`, table `TRUNCATE`, or ownership of any database object. Keep each project in a
separate database when several applications share one PostgreSQL cluster.

Run the following as the database owner after replacing the role and database names:

```sql
REVOKE CREATE ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON DATABASE nestlab FROM PUBLIC;

GRANT CONNECT ON DATABASE nestlab TO nestlab_runtime;
GRANT USAGE ON SCHEMA public TO nestlab_runtime;

DO $grant_tables$
DECLARE target record;
BEGIN
  FOR target IN
    SELECT schemaname, tablename
    FROM pg_tables
    WHERE schemaname = 'public' AND tablename LIKE 'nt-%'
  LOOP
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE %I.%I TO nestlab_runtime',
      target.schemaname,
      target.tablename
    );
  END LOOP;
END
$grant_tables$;

DO $grant_sequences$
DECLARE target record;
BEGIN
  FOR target IN
    SELECT sequence_schema, sequence_name
    FROM information_schema.sequences
    WHERE sequence_schema = 'public' AND sequence_name LIKE 'nt-%'
  LOOP
    EXECUTE format(
      'GRANT USAGE, SELECT ON SEQUENCE %I.%I TO nestlab_runtime',
      target.sequence_schema,
      target.sequence_name
    );
  END LOOP;
END
$grant_sequences$;

ALTER DEFAULT PRIVILEGES FOR ROLE nestlab_migrator IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nestlab_runtime;
ALTER DEFAULT PRIVILEGES FOR ROLE nestlab_migrator IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO nestlab_runtime;

ALTER ROLE nestlab_runtime NOSUPERUSER NOCREATEDB NOCREATEROLE NOREPLICATION NOBYPASSRLS;
ALTER ROLE nestlab_runtime SET statement_timeout = '5s';
ALTER ROLE nestlab_runtime SET lock_timeout = '2s';
ALTER ROLE nestlab_runtime SET idle_in_transaction_session_timeout = '10s';
```

The migration role must be dedicated to NestLab so its default privileges cannot affect objects
owned by other applications. A separate database remains the preferred boundary.

## TLS and connection limits

Production verifies the PostgreSQL certificate by default. Supply `DATABASE_CA_CERT` when the
provider certificate is not rooted in the system trust store. Setting
`DATABASE_SSL_REJECT_UNAUTHORIZED=false` is an explicit emergency compatibility override and
should not be kept in production.

The API limits its pool to ten connections and applies connection, statement, query, lock, and
idle-transaction timeouts. Size the pool together with every other application sharing the same
PostgreSQL cluster.

## Provider webhooks

- Stripe events are accepted only after `stripe-signature` verification.
- PayPal events are accepted only after PayPal's `verify-webhook-signature` API returns `SUCCESS`.
- Telegram uses a deterministic secret derived from the bot token and sends it during
  `setWebhook`; incoming requests must provide the matching Telegram secret header.

Rotate provider secrets and database credentials after deploying this hardening if the previous
deployment was publicly reachable with the educational mutation routes enabled.
