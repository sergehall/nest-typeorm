import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { setTimeout as delay } from 'node:timers/promises';

const require = createRequire(import.meta.url);
const nextCliPath = require.resolve('next/dist/bin/next');
const host = process.env.HOST ?? '127.0.0.1';
const port = process.env.PORT ?? '3000';
const browserHost = host === '0.0.0.0' ? 'localhost' : host;
const url = `http://${browserHost}:${port}`;
const shouldOpenBrowser =
  !process.argv.includes('--no-open') &&
  process.env.CI !== 'true' &&
  process.env.NEXT_OPEN_BROWSER !== 'false';

const devServer = spawn(
  process.execPath,
  [nextCliPath, 'dev', '--webpack', '--hostname', host, '--port', port],
  {
    env: process.env,
    stdio: 'inherit',
  },
);

let serverExited = false;

devServer.once('error', (error) => {
  console.error(`Failed to start the Next.js development server: ${error.message}`);
  process.exitCode = 1;
});

devServer.once('exit', (code, signal) => {
  serverExited = true;

  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exitCode = code ?? 1;
});

if (shouldOpenBrowser) {
  void openBrowserWhenReady();
}

async function openBrowserWhenReady() {
  const ready = await waitForServer();

  if (!ready) {
    if (!serverExited) {
      console.warn(`The browser was not opened because ${url} did not become ready.`);
    }
    return;
  }

  const command = getBrowserCommand(url);
  const browser = spawn(command.executable, command.args, {
    detached: true,
    stdio: 'ignore',
  });

  browser.once('error', (error) => {
    console.warn(`Could not open ${url} automatically: ${error.message}`);
  });
  browser.unref();
}

async function waitForServer() {
  for (let attempt = 0; attempt < 120 && !serverExited; attempt += 1) {
    try {
      await fetch(url, {
        method: 'HEAD',
        signal: AbortSignal.timeout(1_000),
      });
      return true;
    } catch {
      await delay(250);
    }
  }

  return false;
}

function getBrowserCommand(targetUrl) {
  switch (process.platform) {
    case 'darwin':
      return { executable: 'open', args: [targetUrl] };
    case 'win32':
      return {
        executable: 'cmd.exe',
        args: ['/d', '/s', '/c', 'start', '', targetUrl],
      };
    default:
      return { executable: 'xdg-open', args: [targetUrl] };
  }
}
