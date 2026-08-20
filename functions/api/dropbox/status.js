import { accessToken, cors, json, preflight } from "../../_shared/dropbox.js";

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
    const token = await accessToken(context.env);
    const response = await fetch("https://api.dropboxapi.com/2/files/list_folder", {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ path: "", recursive: false, include_deleted: false, limit: 1 }),
    });

    const raw = await response.text();
    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; } catch (_) { payload = { raw: raw.slice(0, 500) }; }

    if (!response.ok) {
      return json({
        ok: false,
        connected: false,
        hasAppKey,
        hasAppSecret,
        hasRefreshToken,
        hasSyncKey,
        stage: "files/list_folder",
        dropboxStatus: response.status,
        dropboxError: payload,
      }, 502, headers);
    }

    return json({
      ok: true,
      connected: true,
      hasAppKey,
      hasAppSecret,
      hasRefreshToken,
      hasSyncKey,
      folderReady: true,
    }, 200, headers);
  } catch (error) {
    return json({
      ok: false,
      connected: false,
      hasAppKey,
      hasAppSecret,
      hasRefreshToken,
      hasSyncKey,
      stage: "oauth/refresh_token",
      message: error.message || String(error),
    }, 502, headers);
  }
}
