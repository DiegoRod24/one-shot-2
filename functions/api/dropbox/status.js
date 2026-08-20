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
    const response = await fetch("https://api.dropboxapi.com/2/users/get_current_account", {
      method: "POST",
      headers: { authorization: `Bearer ${token}` },
    });
    const account = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(account?.error_summary || `Dropbox HTTP ${response.status}`);
    return json({
      ok: true,
      connected: true,
      hasAppKey,
      hasAppSecret,
      hasRefreshToken,
      hasSyncKey,
      account: {
        accountId: account.account_id || "",
        displayName: account.name?.display_name || "Dropbox",
        email: account.email || "",
      },
    }, 200, headers);
  } catch (error) {
    return json({ ok: false, connected: false, hasAppKey, hasAppSecret, hasRefreshToken, hasSyncKey, message: error.message || String(error) }, 502, headers);
  }
}
