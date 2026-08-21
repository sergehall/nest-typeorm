import { cpSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const workspaceRoot = process.cwd();
const standaloneAppRoot = join(workspaceRoot, '.next', 'standalone', 'apps', 'web');

copyDirectoryIfPresent(join(workspaceRoot, 'public'), join(standaloneAppRoot, 'public'));
copyDirectoryIfPresent(
  join(workspaceRoot, '.next', 'static'),
  join(standaloneAppRoot, '.next', 'static'),
);

function copyDirectoryIfPresent(source, destination) {
  if (!existsSync(source)) {
    return;
  }

  mkdirSync(dirname(destination), { recursive: true });
  cpSync(source, destination, { recursive: true });
}
