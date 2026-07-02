import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 3000;
const stateKey = "commission_state";
const localStatePath = path.join(__dirname, "data", "state.json");
let pool = null;

const defaultState = {
  period: { month: "JUNHO", daysDone: 15, daysTotal: 26 },
  sellers: [
    { id: "henrique", name: "HENRIQUE", branch: "CURITIBANOS", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} },
    { id: "makelly", name: "MAKELLY", branch: "CURITIBANOS", area: "Nao Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} },
    { id: "vendedor-cabo", name: "VENDEDOR CABO", branch: "FRAIBURGO", area: "Cabo", adjustments: { quality: 0, insurance: 0, carousel: 0 }, password: "1234", values: {} },
  ],
  rules: null,
  deflators: null,
  settings: { adminPassword: process.env.ADMIN_PASSWORD || "admin123" },
};

async function initDb() {
  if (process.env.DATABASE_URL) {
    const pg = await import("pg");
    pool = new pg.default.Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.PGSSL === "false" ? false : { rejectUnauthorized: false },
    });
  }
  if (!pool) return;
  await pool.query(`
    create table if not exists app_state (
      key text primary key,
      value jsonb not null,
      updated_at timestamptz not null default now()
    )
  `);
}

async function readState() {
  if (pool) {
    const result = await pool.query("select value from app_state where key = $1", [stateKey]);
    if (result.rows[0]?.value) return result.rows[0].value;
    await writeState(defaultState);
    return defaultState;
  }
  try {
    return JSON.parse(await fs.readFile(localStatePath, "utf8"));
  } catch {
    await fs.mkdir(path.dirname(localStatePath), { recursive: true });
    await fs.writeFile(localStatePath, JSON.stringify(defaultState, null, 2));
    return defaultState;
  }
}

async function writeState(state) {
  if (pool) {
    await pool.query(
      `insert into app_state (key, value, updated_at)
       values ($1, $2::jsonb, now())
       on conflict (key) do update set value = excluded.value, updated_at = now()`,
      [stateKey, JSON.stringify(state)],
    );
    return;
  }
  await fs.mkdir(path.dirname(localStatePath), { recursive: true });
  await fs.writeFile(localStatePath, JSON.stringify(state, null, 2));
}

function sendJson(response, status, data) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8" });
  response.end(JSON.stringify(data));
}

async function readBody(request) {
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 3_000_000) throw new Error("Payload muito grande.");
  }
  return body ? JSON.parse(body) : null;
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  }[ext] || "application/octet-stream";
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requested = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const publicRoot = path.join(__dirname, "public");
  let filePath = path.normalize(path.join(publicRoot, requested));
  if (!filePath.startsWith(publicRoot)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }
  try {
    const bytes = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": contentType(filePath) });
    response.end(bytes);
  } catch {
    filePath = path.join(publicRoot, "index.html");
    const bytes = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
    response.end(bytes);
  }
}

await initDb();
http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host}`);
    if (request.method === "GET" && url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, database: pool ? "postgres" : "local-file" });
      return;
    }
    if (request.method === "GET" && url.pathname === "/api/state") {
      sendJson(response, 200, await readState());
      return;
    }
    if (request.method === "PUT" && url.pathname === "/api/state") {
      const state = await readBody(request);
      if (!state || !Array.isArray(state.sellers)) {
        sendJson(response, 400, { error: "Estado invalido." });
        return;
      }
      await writeState(state);
      sendJson(response, 200, { ok: true });
      return;
    }
    await serveStatic(request, response);
  } catch (error) {
    console.error(error);
    sendJson(response, 500, { error: "Erro interno do servidor." });
  }
}).listen(port, () => {
  console.log(`Comissao app rodando em http://localhost:${port}`);
});
