import { json } from "../../_shared/dropbox.js";

export async function onRequestGet(context) {
  const key = String(context.env.DROPBOX_APP_KEY || "").trim();
  const secret = String(context.env.DROPBOX_APP_SECRET || "").trim();
  if (!key || !secret) return json({ ok: false, message: "Faltan DROPBOX_APP_KEY o DROPBOX_APP_SECRET en Cloudflare." }, 503);

  const state = crypto.randomUUID().replaceAll("-", "");
  const url = new URL(context.request.url);
  const redirectUri = `${url.origin}/api/dropbox/callback`;
  const auth = new URL("https://www.dropbox.com/oauth2/authorize");
  auth.searchParams.set("client_id", key);
  auth.searchParams.set("response_type", "code");
  auth.searchParams.set("token_access_type", "offline");
  auth.searchParams.set("redirect_uri", redirectUri);
  auth.searchParams.set("state", state);

  return new Response(null, {
    status: 302,
    headers: {
      location: auth.toString(),
      "cache-control": "no-store",
      "set-cookie": `os_dropbox_oauth_state=${state}; Path=/api/dropbox; Max-Age=600; HttpOnly; Secure; SameSite=Lax`,
    },
  });
}
