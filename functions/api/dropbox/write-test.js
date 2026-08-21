import { accessToken, cors, json, preflight, requireSyncKey } from "../../_shared/dropbox.js";

const DROPBOX_CONTENT = "https://content.dropboxapi.com/2/files/upload";
const TEST_PATH = "/diagnostico/one-shot-write-test.txt";

export async function onRequestOptions(context) {
  return preflight(context.request);
}

export async function onRequestPost(context) {
  const headers = cors(context.request);
  const authError = requireSyncKey(context);
  if (authError) return authError;

  const result = {
    ok: false,
    syncKeyAccepted: true,
    oauth: false,
    write: false,
    testPath: TEST_PATH,
    stage: "start",
  };

  try {
    result.stage = "oauth";
    const token = await accessToken(context.env);
    result.oauth = true;

    result.stage = "files/upload";
    const body = new TextEncoder().encode(`ONE SHOT write diagnostic ${new Date().toISOString()}\n`);
    const response = await fetch(DROPBOX_CONTENT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/octet-stream",
        "dropbox-api-arg": JSON.stringify({
          path: TEST_PATH,
          mode: "overwrite",
          autorename: false,
          mute: true,
          strict_conflict: false,
        }),
      },
      body,
    });

    const raw = await response.text();
    let payload = {};
    try { payload = raw ? JSON.parse(raw) : {}; }
    catch (_) { payload = { raw: raw.slice(0, 800) }; }

    if (!response.ok) {
      return json({
        ...result,
        dropboxStatus: response.status,
        dropboxError: payload,
        message: payload?.error_summary || payload?.error?.[".tag"] || `Dropbox upload HTTP ${response.status}`,
      }, 502, headers);
    }

    result.ok = true;
    result.write = true;
    result.stage = "done";
    result.serverModified = payload?.server_modified || null;
    result.rev = payload?.rev || null;
    return json(result, 200, headers);
  } catch (error) {
    return json({ ...result, message: error.message || String(error) }, 502, headers);
  }
}
