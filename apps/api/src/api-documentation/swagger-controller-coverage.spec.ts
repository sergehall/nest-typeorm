import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { API_OPERATION_COUNT } from './swagger.config';

function findControllerFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = join(directory, entry.name);

    if (entry.isDirectory()) {
      return findControllerFiles(path);
    }

    return entry.name.endsWith('controller.ts') ? [path] : [];
  });
}

describe('Swagger controller coverage', () => {
  it('keeps every HTTP controller under the shared documentation contract', () => {
    const sourceRoot = resolve(__dirname, '..');
    const controllerFiles = findControllerFiles(sourceRoot);
    let operationCount = 0;

    expect(controllerFiles).toHaveLength(17);

    for (const controllerFile of controllerFiles) {
      const source = readFileSync(controllerFile, 'utf8');
      const routeDecorators = source.match(/@(Get|Post|Put|Patch|Delete)\s*\(/g) ?? [];

      operationCount += routeDecorators.length;
      expect(source).toContain('@ApiTags(');
      expect(source).toContain('@ApiControllerDocumentation()');
    }

    expect(operationCount).toBe(API_OPERATION_COUNT);
  });
});
