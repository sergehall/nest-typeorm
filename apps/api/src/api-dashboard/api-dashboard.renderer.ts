import { HealthResponseDto } from '../health/dto/health-response.dto';
import { API_OPERATION_COUNT, API_VERSION } from '../api-documentation/swagger.config';

type ApiDashboardOptions = {
  readonly health: HealthResponseDto;
  readonly webUrl: string;
};

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

export function renderApiDashboard({ health, webUrl }: ApiDashboardOptions): string {
  const isHealthy = health.status === 'healthy';
  const databaseIsUp = health.checks.database.status === 'up';
  const overallLabel = isHealthy ? 'All systems operational' : 'Service degraded';
  const databaseLatency =
    health.checks.database.responseTimeMs === null
      ? 'Unavailable'
      : `${health.checks.database.responseTimeMs} ms`;

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="description" content="NestLab API documentation, health, and runtime overview." />
    <title>NestLab API · Backend control surface</title>
    <style>
      :root {
        --ink: #14213d;
        --muted: #5e687a;
        --paper: #f5f2ea;
        --panel: rgba(255, 255, 255, 0.82);
        --line: rgba(20, 33, 61, 0.14);
        --blue: #1f5fe0;
        --orange: #ff6b35;
        --green: #5f7f13;
        --green-soft: #e9f2cf;
        --amber: #9a5a00;
        --amber-soft: #fff0c8;
        --shadow: 0 24px 70px rgba(20, 33, 61, 0.12);
      }

      * { box-sizing: border-box; }

      html { background: var(--paper); }

      body {
        margin: 0;
        min-height: 100vh;
        color: var(--ink);
        background-color: var(--paper);
        background-image:
          linear-gradient(rgba(20, 33, 61, 0.055) 1px, transparent 1px),
          linear-gradient(90deg, rgba(20, 33, 61, 0.055) 1px, transparent 1px);
        background-size: 32px 32px;
        font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      }

      a { color: inherit; }

      .shell {
        width: min(1160px, calc(100% - 40px));
        margin: 0 auto;
      }

      .topbar {
        border-bottom: 1px solid var(--line);
        background: rgba(245, 242, 234, 0.9);
        backdrop-filter: blur(16px);
      }

      .topbar__inner {
        min-height: 76px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 24px;
      }

      .brand, .topbar__links { display: flex; align-items: center; }
      .brand { gap: 12px; font-weight: 800; font-size: 1.08rem; text-decoration: none; }
      .brand__mark { font-family: ui-monospace, monospace; letter-spacing: -0.15em; }
      .brand__mark span { color: var(--orange); }
      .topbar__links { gap: 24px; }
      .topbar__links a { color: var(--muted); font-weight: 700; text-decoration: none; }
      .topbar__links a:hover { color: var(--blue); }

      main { padding: 56px 0 72px; }

      .eyebrow {
        margin: 0;
        color: var(--muted);
        font: 700 0.75rem/1.2 ui-monospace, SFMono-Regular, Menlo, monospace;
        letter-spacing: 0.17em;
        text-transform: uppercase;
      }

      .hero {
        display: grid;
        grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
        align-items: end;
        gap: 56px;
      }

      h1 {
        max-width: 780px;
        margin: 18px 0 20px;
        font-size: clamp(3rem, 7vw, 6.25rem);
        line-height: 0.92;
        letter-spacing: -0.07em;
      }

      .hero__lead {
        max-width: 700px;
        margin: 0;
        color: var(--muted);
        font-size: clamp(1.05rem, 2vw, 1.3rem);
        line-height: 1.65;
      }

      .status-panel {
        padding: 26px;
        border: 1px solid var(--line);
        border-radius: 24px;
        background: var(--panel);
        box-shadow: var(--shadow);
      }

      .status-panel__top, .health-row, .metric__value {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }

      .status-badge {
        display: inline-flex;
        align-items: center;
        gap: 9px;
        padding: 8px 12px;
        border-radius: 999px;
        color: ${isHealthy ? 'var(--green)' : 'var(--amber)'};
        background: ${isHealthy ? 'var(--green-soft)' : 'var(--amber-soft)'};
        font: 800 0.72rem/1 ui-monospace, monospace;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .status-badge::before {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: currentColor;
        content: "";
        box-shadow: 0 0 0 5px color-mix(in srgb, currentColor 16%, transparent);
      }

      .status-panel h2 { margin: 24px 0 8px; font-size: 1.75rem; letter-spacing: -0.04em; }
      .status-panel > p { margin: 0 0 24px; color: var(--muted); line-height: 1.55; }
      .health-list { border-top: 1px solid var(--line); }
      .health-row { padding: 15px 0; border-bottom: 1px solid var(--line); }
      .health-row strong { font-size: 0.94rem; }
      .health-row span { color: var(--muted); font: 700 0.78rem/1.2 ui-monospace, monospace; }
      .health-row__state { color: ${databaseIsUp ? 'var(--green)' : 'var(--amber)'} !important; }

      .metrics {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
        margin: 48px 0 64px;
      }

      .metric {
        min-height: 145px;
        padding: 22px;
        border: 1px solid var(--line);
        border-radius: 20px;
        background: rgba(255, 255, 255, 0.58);
      }

      .metric__value { align-items: baseline; margin-top: 28px; }
      .metric strong { font-size: 2rem; letter-spacing: -0.05em; }
      .metric span { color: var(--muted); font: 700 0.75rem/1 ui-monospace, monospace; }

      .section-heading {
        display: flex;
        align-items: end;
        justify-content: space-between;
        gap: 32px;
        margin-bottom: 24px;
      }

      .section-heading h2 { margin: 10px 0 0; font-size: clamp(2rem, 4vw, 3.25rem); letter-spacing: -0.055em; }
      .section-heading p:last-child { max-width: 520px; margin: 0; color: var(--muted); line-height: 1.6; }

      .doc-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 16px;
      }

      .doc-card {
        min-height: 230px;
        display: flex;
        flex-direction: column;
        padding: 26px;
        overflow: hidden;
        border: 1px solid var(--line);
        border-radius: 22px;
        background: var(--panel);
        text-decoration: none;
        transition: transform 160ms ease, box-shadow 160ms ease;
      }

      .doc-card:hover { transform: translateY(-4px); box-shadow: var(--shadow); }
      .doc-card--primary { color: white; border-color: transparent; background: var(--ink); }
      .doc-card__type { font: 800 0.72rem/1 ui-monospace, monospace; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.68; }
      .doc-card h3 { margin: auto 0 10px; font-size: 1.75rem; letter-spacing: -0.045em; }
      .doc-card p { margin: 0; color: inherit; line-height: 1.5; opacity: 0.72; }
      .doc-card__arrow { align-self: end; font-size: 1.4rem; }

      .routes {
        margin-top: 64px;
        padding: 32px;
        border-radius: 24px;
        color: white;
        background: var(--ink);
        box-shadow: var(--shadow);
      }

      .routes__header { display: flex; justify-content: space-between; gap: 24px; margin-bottom: 24px; }
      .routes h2 { margin: 8px 0 0; font-size: 2rem; letter-spacing: -0.045em; }
      .routes__grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1px; background: rgba(255,255,255,0.14); }
      .route { display: grid; grid-template-columns: 58px 1fr; gap: 16px; padding: 18px; background: var(--ink); }
      .route__method { color: #bff25c; font: 800 0.75rem/1.5 ui-monospace, monospace; }
      .route code { color: white; font: 600 0.9rem/1.5 ui-monospace, monospace; }

      footer { padding: 26px 0 38px; border-top: 1px solid var(--line); color: var(--muted); }
      footer .shell { display: flex; justify-content: space-between; gap: 24px; }
      footer p { margin: 0; font: 700 0.74rem/1.5 ui-monospace, monospace; letter-spacing: 0.08em; text-transform: uppercase; }

      @media (max-width: 820px) {
        .hero { grid-template-columns: 1fr; align-items: start; }
        .metrics, .doc-grid { grid-template-columns: 1fr; }
        .metric { min-height: 120px; }
        .section-heading { align-items: start; flex-direction: column; }
        .routes__grid { grid-template-columns: 1fr; }
      }

      @media (max-width: 560px) {
        .shell { width: min(100% - 24px, 1160px); }
        .topbar__inner { min-height: 64px; }
        .topbar__links a:first-child { display: none; }
        main { padding-top: 36px; }
        h1 { font-size: clamp(2.75rem, 17vw, 4.5rem); }
        .status-panel, .routes { padding: 22px; }
        footer .shell { flex-direction: column; }
      }
    </style>
  </head>
  <body>
    <header class="topbar">
      <div class="shell topbar__inner">
        <a class="brand" href="/" aria-label="NestLab API home">
          <span class="brand__mark">{<span>●</span>}</span>
          <span>NestLab API</span>
        </a>
        <nav class="topbar__links" aria-label="API navigation">
          <a href="/api/docs/login">Documentation</a>
          <a href="${escapeHtml(webUrl)}">Web application ↗</a>
        </nav>
      </div>
    </header>

    <main>
      <div class="shell">
        <section class="hero">
          <div>
            <p class="eyebrow">NestJS · TypeORM · PostgreSQL</p>
            <h1>Backend control surface.</h1>
            <p class="hero__lead">
              Runtime health, interactive OpenAPI documentation, machine-readable contracts, and
              a concise map of the NestLab modular monolith.
            </p>
          </div>

          <aside class="status-panel" aria-labelledby="system-status-title">
            <div class="status-panel__top">
              <p class="eyebrow">Live health</p>
              <span class="status-badge">${escapeHtml(health.status)}</span>
            </div>
            <h2 id="system-status-title">${overallLabel}</h2>
            <p>Checked ${escapeHtml(health.timestamp)}. Refresh the page to run the checks again.</p>
            <div class="health-list">
              <div class="health-row">
                <strong>NestJS application</strong>
                <span class="health-row__state">${escapeHtml(health.checks.api.status)}</span>
              </div>
              <div class="health-row">
                <strong>PostgreSQL database</strong>
                <span class="health-row__state">${escapeHtml(health.checks.database.status)}</span>
              </div>
              <div class="health-row">
                <strong>Database response</strong>
                <span>${databaseLatency}</span>
              </div>
            </div>
          </aside>
        </section>

        <section class="metrics" aria-label="API metrics">
          <article class="metric">
            <p class="eyebrow">HTTP contract</p>
            <div class="metric__value"><strong>${API_OPERATION_COUNT}</strong><span>operations</span></div>
          </article>
          <article class="metric">
            <p class="eyebrow">Release</p>
            <div class="metric__value"><strong>v${API_VERSION}</strong><span>OpenAPI</span></div>
          </article>
          <article class="metric">
            <p class="eyebrow">Process uptime</p>
            <div class="metric__value"><strong>${health.uptimeSeconds}s</strong><span>current run</span></div>
          </article>
        </section>

        <section aria-labelledby="documentation-title">
          <div class="section-heading">
            <div>
              <p class="eyebrow">API documentation</p>
              <h2 id="documentation-title">Choose your contract.</h2>
            </div>
            <p>
              Explore endpoints interactively or use the generated JSON and YAML documents with
              client generators, API testing tools, and frontend integrations.
            </p>
          </div>

          <div class="doc-grid">
            <a class="doc-card doc-card--primary" href="/api/docs/login">
              <span class="doc-card__arrow">↗</span>
              <span class="doc-card__type">Protected access</span>
              <h3>Swagger UI</h3>
              <p>Viewer opens the read-only contract. Admin enters the interactive workspace.</p>
            </a>
            <a class="doc-card" href="/api/docs/openapi.json">
              <span class="doc-card__arrow">↗</span>
              <span class="doc-card__type">Machine-readable</span>
              <h3>OpenAPI JSON</h3>
              <p>Use with code generators, Postman, Insomnia, and contract tests.</p>
            </a>
            <a class="doc-card" href="/api/docs/openapi.yaml">
              <span class="doc-card__arrow">↗</span>
              <span class="doc-card__type">Portable contract</span>
              <h3>OpenAPI YAML</h3>
              <p>Review or version the complete API definition in a readable format.</p>
            </a>
          </div>
        </section>

        <section class="routes" aria-labelledby="route-map-title">
          <div class="routes__header">
            <div>
              <p class="eyebrow">Quick route map</p>
              <h2 id="route-map-title">Start with the main boundaries.</h2>
            </div>
          </div>
          <div class="routes__grid">
            <div class="route"><span class="route__method">GET</span><code>/health</code></div>
            <div class="route"><span class="route__method">POST</span><code>/auth/login</code></div>
            <div class="route"><span class="route__method">GET</span><code>/blogs</code></div>
            <div class="route"><span class="route__method">GET</span><code>/posts</code></div>
            <div class="route"><span class="route__method">GET</span><code>/pair-game-quiz/users/top</code></div>
            <div class="route"><span class="route__method">GET</span><code>/sa/users</code></div>
          </div>
        </section>
      </div>
    </main>

    <footer>
      <div class="shell">
        <p>NestLab modular monolith</p>
        <p>OpenAPI · PostgreSQL · ${escapeHtml(health.environment)}</p>
      </div>
    </footer>
  </body>
</html>`;
}
