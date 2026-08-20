import { apiCall, cors, json, preflight } from "../../_shared/dropbox.js";

export async function onRequestOptions(context) {
  return preflight(context.request);
}

export async function onRequestGet(context) {
  const headers = cors(context.request);
  const hasAppKey = Boolean(String(context.env.DROPBOX_APP_KEY || "").trim());
  const hasAppSecret = Boolean(String(context.env.DROPBOX_APP_SECRET || "").trim());
  const hasRefreshToken = Boolean(String(context.env.DROPBOX_REFRESH_TOKEN || "").trim());
  const hasSyncKey = Boolean(String(context.env.ONE_SHOT_SYNC_KEY || "").trim());
  if (!hasAppKey || !hasAppSecret || !hasRefreshToken) {
    return json({ ok: true, connected: false, hasAppKey, hasAppSecret, hasRefreshToken, hasSyncKey }, 200, headers);
  }
  try {
    await apiCall(context.env, "files/list_folder", { path: "", recursive: false, include_deleted: false, limit: 1 });
    return json({ ok: true, connected: true, hasAppKey, hasAppSecret, hasRefreshToken, hasSyncKey, account: { displayName: "Dropbox listo" } }, 200, headers);
  } catch (error) {
    return json({ ok: false, connected: false, hasAppKey, hasAppSecret, hasRefreshToken, hasSyncKey, message: error.message || String(error) }, 502, headers);
  }
}
