import { SWAGGER_SESSION_PATH } from '../swagger.config';

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

type LoginPageOptions = Readonly<{
  csrfToken: string;
  returnTo: string;
  error?: string;
}>;

export function renderSwaggerLoginPage(options: LoginPageOptions): string {
  const error = options.error
    ? `<div class="notice" role="alert">${escapeHtml(options.error)}</div>`
    : '';

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="robots" content="noindex, nofollow, noarchive" />
    <title>NestLab documentation access</title>
    <style>
      :root { color-scheme: light; --ink: #13213d; --muted: #59647a; --paper: #f5f1e8; --accent: #225bd9; --line: rgba(19,33,61,.16); }
      * { box-sizing: border-box; }
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; padding: 24px; color: var(--ink); background-color: var(--paper); background-image: linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px); background-size: 48px 48px; font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
      main { width: min(100%, 520px); padding: clamp(28px, 6vw, 52px); border: 1px solid var(--line); border-radius: 28px; background: rgba(255,255,255,.94); box-shadow: 0 24px 70px rgba(19,33,61,.14); }
      .eyebrow { margin: 0 0 14px; color: var(--muted); font: 800 .74rem/1.4 ui-monospace, monospace; letter-spacing: .14em; text-transform: uppercase; }
      h1 { margin: 0; font-size: clamp(2.25rem, 8vw, 3.6rem); line-height: .96; letter-spacing: -.065em; }
      .lead { margin: 20px 0 28px; color: var(--muted); font-size: 1rem; line-height: 1.65; }
      form { display: grid; gap: 16px; }
      label { display: grid; gap: 8px; font-weight: 800; font-size: .82rem; letter-spacing: .04em; }
      input { width: 100%; min-height: 52px; border: 1px solid var(--line); border-radius: 14px; padding: 0 15px; color: var(--ink); background: white; font: inherit; outline: none; }
      input:focus { border-color: var(--accent); box-shadow: 0 0 0 4px rgba(34,91,217,.12); }
      button { min-height: 54px; border: 0; border-radius: 999px; padding: 0 24px; color: white; background: var(--accent); font: 800 1rem/1 ui-sans-serif, system-ui, sans-serif; cursor: pointer; }
      button:hover { filter: brightness(.94); }
      .notice { margin-bottom: 18px; border-radius: 14px; padding: 13px 15px; color: #8d1d28; background: #fde8e8; font-weight: 700; line-height: 1.45; }
      .roles { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 24px; }
      .role { border-top: 1px solid var(--line); padding-top: 14px; color: var(--muted); font-size: .82rem; line-height: 1.5; }
      .role strong { display: block; color: var(--ink); }
      .back { display: inline-block; margin-top: 24px; color: var(--ink); font-weight: 800; text-decoration: none; }
      @media (max-width: 480px) { .roles { grid-template-columns: 1fr; } }
    </style>
  </head>
  <body>
    <main>
      <p class="eyebrow">Protected API contract</p>
      <h1>Documentation access.</h1>
      <p class="lead">Use the Viewer account for a read-only contract or the Admin account for the interactive Swagger workspace.</p>
      ${error}
      <form method="post" action="${SWAGGER_SESSION_PATH}" autocomplete="on">
        <input type="hidden" name="csrfToken" value="${escapeHtml(options.csrfToken)}" />
        <input type="hidden" name="returnTo" value="${escapeHtml(options.returnTo)}" />
        <label>
          Username
          <input name="username" type="text" maxlength="64" autocomplete="username" required autofocus />
        </label>
        <label>
          Password
          <input name="password" type="password" maxlength="256" autocomplete="current-password" required />
        </label>
        <button type="submit">Continue securely</button>
      </form>
      <div class="roles" aria-label="Access levels">
        <div class="role"><strong>Viewer</strong>Browse operations and download JSON or YAML.</div>
        <div class="role"><strong>Admin</strong>Use the interactive Try it out workspace.</div>
      </div>
      <a class="back" href="/">← Back to API dashboard</a>
    </main>
  </body>
</html>`;
}

export function renderSwaggerLogoutPage(csrfToken: string): string {
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><meta name="robots" content="noindex, nofollow" /><title>Sign out of NestLab documentation</title></head>
  <body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#f5f1e8;color:#13213d;font-family:system-ui,sans-serif">
    <main style="width:min(100% - 32px,520px);padding:40px;border:1px solid rgba(19,33,61,.16);border-radius:24px;background:white">
      <h1 style="margin-top:0">End documentation session?</h1>
      <p>The Viewer or Admin session cookie will be removed from this browser.</p>
      <form method="post" action="/api/docs/logout">
        <input type="hidden" name="csrfToken" value="${escapeHtml(csrfToken)}" />
        <button type="submit" style="min-height:48px;border:0;border-radius:999px;padding:0 24px;color:white;background:#225bd9;font-weight:800">Sign out</button>
      </form>
    </main>
  </body>
</html>`;
}
