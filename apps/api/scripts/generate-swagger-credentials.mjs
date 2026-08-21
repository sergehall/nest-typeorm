import { randomBytes } from 'node:crypto';
import * as argon2 from 'argon2';

const viewerPassword = randomBytes(24).toString('base64url');
const adminPassword = randomBytes(24).toString('base64url');
const sessionSecret = randomBytes(48).toString('base64url');
const passwordHashOptions = {
  type: argon2.argon2id,
  memoryCost: 19_456,
  timeCost: 2,
  parallelism: 1,
};

const [viewerPasswordHash, adminPasswordHash] = await Promise.all([
  argon2.hash(viewerPassword, passwordHashOptions),
  argon2.hash(adminPassword, passwordHashOptions),
]);

console.log(`Viewer username: viewer
Viewer password: ${viewerPassword}
Admin username: admin
Admin password: ${adminPassword}

Store the plaintext passwords in a password manager. Only the hashes and session secret belong in runtime configuration.

SWAGGER_ENABLED=true
SWAGGER_VIEWER_USERNAME=viewer
SWAGGER_VIEWER_PASSWORD_HASH='${viewerPasswordHash}'
SWAGGER_ADMIN_USERNAME=admin
SWAGGER_ADMIN_PASSWORD_HASH='${adminPasswordHash}'
SWAGGER_SESSION_SECRET='${sessionSecret}'
SWAGGER_SESSION_TTL_SECONDS=1200`);
