const DROPBOX_TOKEN_URL = "https://api.dropboxapi.com/oauth2/token";
const DROPBOX_API = "https://api.dropboxapi.com/2";
const DROPBOX_CONTENT = "https://content.dropboxapi.com/2";

export function json(data, status = 200, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

export function cors(request) {
  const origin = request.headers.get("origin") || "";
  const allowed =
    origin === "https://one-shot-2.pages.dev" ||
    origin === "https://one-shot.pages.dev" ||
    /^https:\/\/[a-z0-9-]+\.one-shot-2\.pages\.dev$/i.test(origin) ||
    /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
  return allowed
    ? {
        "access-control-allow-origin": origin,
        "access-control-allow-methods": "GET,POST,OPTIONS",
        "access-control-allow-headers": "authorization,content-type",
        "access-control-max-age": "86400",
        vary: "Origin",
      }
    : {};
}

export function preflight(request) {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: cors(request) });
}

export function requireSyncKey(context) {
  const expected = String(context.env.ONE_SHOT_SYNC_KEY || "").trim();
  if (!expected) return json({ ok: false, code: "SYNC_KEY_NOT_CONFIGURED", message: "Configura ONE_SHOT_SYNC_KEY en Cloudflare." }, 503, cors(context.request));
  const auth = context.request.headers.get("authorization") || "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7).trim() : "";
  if (!given || given !== expected) return json({ ok: false, code: "UNAUTHORIZED", message: "Clave de sincronización inválida." }, 401, cors(context.request));
  return null;
}

export function safeSegment(value, fallback = "evidencia") {
  const clean = String(value || "").trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return clean.slice(0, 120) || fallback;
}

export function evidenceRoot(metadata = {}) {
  const iso = String(metadata.capturedAt || metadata.createdAt || new Date().toISOString());
  const d = Number.isNaN(Date.parse(iso)) ? new Date() : new Date(iso);
  const year = String(d.getUTCFullYear());
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const code = safeSegment(metadata.photoCode || metadata.id || crypto.randomUUID(), "evidencia");
  return `/evidencias/${year}/${month}/${code}`;
}

export async function accessToken(env) {
  const refreshToken = String(env.DROPBOX_REFRESH_TOKEN || "").trim();
  const key = String(env.DROPBOX_APP_KEY || "").trim();
  const secret = String(env.DROPBOX_APP_SECRET || "").trim();
  if (!refreshToken || !key || !secret) throw new Error("Dropbox no está conectado: faltan APP_KEY, APP_SECRET o REFRESH_TOKEN.");
  const body = new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken, client_id: key, client_secret: secret });
  const response = await fetch(DROPBOX_TOKEN_URL, { method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" }, body });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.access_token) throw new Error(payload.error_description || payload.error || `Dropbox token HTTP ${response.status}`);
  return payload.access_token;
}

export async function apiCall(env, endpoint, body) {
  const token = await accessToken(env);
  const response = await fetch(`${DROPBOX_API}/${endpoint}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error_summary || payload?.error?.[".tag"] || `Dropbox API HTTP ${response.status}`);
  return payload;
}

export async function uploadFile(env, path, bytes, contentType = "application/octet-stream") {
  const token = await accessToken(env);
  const response = await fetch(`${DROPBOX_CONTENT}/files/upload`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/octet-stream",
      "dropbox-api-arg": JSON.stringify({ path, mode: "overwrite", autorename: false, mute: true, strict_conflict: false }),
    },
    body: bytes,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error_summary || payload?.error?.[".tag"] || (typeof payload?.error === "string" ? payload.error : "") || `Dropbox upload HTTP ${response.status}`);
  return payload;
}

export async function downloadFile(env, path) {
  const token = await accessToken(env);
  const response = await fetch(`${DROPBOX_CONTENT}/files/download`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "dropbox-api-arg": JSON.stringify({ path }) },
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Dropbox download HTTP ${response.status}${text ? ` · ${text.slice(0, 180)}` : ""}`);
  }
  return response;
}
