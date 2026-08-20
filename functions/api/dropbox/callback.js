function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}

function cookieValue(request, name) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === name) return rest.join("=");
  }
  return "";
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const code = url.searchParams.get("code") || "";
  const state = url.searchParams.get("state") || "";
  const expectedState = cookieValue(context.request, "os_dropbox_oauth_state");
  const error = url.searchParams.get("error_description") || url.searchParams.get("error") || "";

  if (error) return new Response(`Dropbox rechazó la autorización: ${esc(error)}`, { status: 400 });
  if (!code || !state || !expectedState || state !== expectedState) return new Response("Autorización Dropbox inválida o vencida. Vuelve a iniciar la conexión.", { status: 400 });

  const key = String(context.env.DROPBOX_APP_KEY || "").trim();
  const secret = String(context.env.DROPBOX_APP_SECRET || "").trim();
  if (!key || !secret) return new Response("Faltan DROPBOX_APP_KEY o DROPBOX_APP_SECRET en Cloudflare.", { status: 503 });

  const redirectUri = `${url.origin}/api/dropbox/callback`;
  const body = new URLSearchParams({ code, grant_type: "authorization_code", client_id: key, client_secret: secret, redirect_uri: redirectUri });
  const response = await fetch("https://api.dropboxapi.com/oauth2/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.refresh_token) {
    const detail = payload.error_description || payload.error || `HTTP ${response.status}`;
    return new Response(`No se pudo obtener refresh token: ${esc(detail)}`, { status: 502 });
  }

  const token = esc(payload.refresh_token);
  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ONE SHOT · Dropbox conectado</title><style>body{font-family:system-ui;background:#07111f;color:#fff;margin:0;padding:28px}.card{max-width:720px;margin:auto;background:#0d1b2d;border:1px solid #28405d;border-radius:20px;padding:24px}code,textarea{width:100%;box-sizing:border-box;background:#030812;color:#d7e8ff;border:1px solid #34506f;border-radius:12px;padding:12px}.ok{color:#72f1a8}.warn{color:#ffd166}button{padding:11px 16px;border-radius:10px;border:0;font-weight:700}</style></head><body><div class="card"><h1 class="ok">✓ Dropbox autorizado</h1><p>La conexión OAuth funcionó. Copia el valor de abajo y guárdalo en Cloudflare como <b>Secret</b> con nombre <code>DROPBOX_REFRESH_TOKEN</code>.</p><textarea id="token" rows="5" readonly>${token}</textarea><p class="warn"><b>No pegues este token en GitHub ni en el chat.</b> Después de guardarlo en Cloudflare, cierra esta pestaña.</p><button onclick="navigator.clipboard.writeText(document.getElementById('token').value)">Copiar token</button><p>Luego vuelve a ONE SHOT y abre <b>☁ Sincronización</b> para comprobar la conexión.</p></div></body></html>`;

  return new Response(html, {
    headers: {
      "content-type": "text/html; charset=utf-8",
      "cache-control": "no-store",
      "set-cookie": "os_dropbox_oauth_state=; Path=/api/dropbox; Max-Age=0; HttpOnly; Secure; SameSite=Lax",
    },
  });
}
