import { readdirSync, readFileSync } from 'node:fs';
import { relative, resolve } from 'node:path';

const repositoryRoot = process.cwd();
const ignoredDirectories = new Set([
  '.git',
  '.idea',
  '.next',
  '.yarn',
  'coverage',
  'dist',
  'node_modules',
  'out',
]);
const cyrillicPattern = /\p{Script=Cyrillic}/u;
const violations = [];

scanDirectory(repositoryRoot);

if (violations.length > 0) {
  console.error('Cyrillic text is not allowed in project files:');
  for (const violation of violations) {
    console.error(`- ${violation}`);
  }
  process.exit(1);
}

console.log('Language check passed: no Cyrillic text found.');

function scanDirectory(directory) {
  const entries = readdirSync(directory, { withFileTypes: true }).sort((left, right) =>
    left.name.localeCompare(right.name),
  );

  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
      continue;
    }

    const absolutePath = resolve(directory, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(absolutePath);
      continue;
    }

    if (!entry.isFile() || isLocalEnvironmentFile(entry.name)) {
      continue;
    }

    inspectFile(absolutePath);
  }
}

function inspectFile(absolutePath) {
  const content = readFileSync(absolutePath);

  if (content.includes(0)) {
    return;
  }

  const lines = content.toString('utf8').split(/\r?\n/u);

  for (const [index, line] of lines.entries()) {
    if (cyrillicPattern.test(line)) {
      violations.push(`${relative(repositoryRoot, absolutePath)}:${index + 1}`);
    }
  }
}

function isLocalEnvironmentFile(fileName) {
  return fileName !== '.env.example' && (fileName === '.env' || fileName.startsWith('.env.'));
}
