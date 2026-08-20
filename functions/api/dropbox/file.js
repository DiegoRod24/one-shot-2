import { cors, downloadFile, json, preflight, requireSyncKey } from "../../_shared/dropbox.js";

export async function onRequestOptions(context) {
  return preflight(context.request);
}

export async function onRequestGet(context) {
  const headers = cors(context.request);
  const authError = requireSyncKey(context);
  if (authError) return authError;

  const url = new URL(context.request.url);
  const path = String(url.searchParams.get("path") || "");
  if (!/^\/evidencias\//i.test(path) || path.includes("..")) return json({ ok: false, message: "Ruta no permitida." }, 400, headers);

  try {
    const response = await downloadFile(context.env, path);
    const out = new Headers(headers);
    out.set("cache-control", "private, max-age=300");
    out.set("content-type", response.headers.get("content-type") || (path.endsWith(".json") ? "application/json" : "image/jpeg"));
    const meta = response.headers.get("dropbox-api-result");
    if (meta) out.set("x-dropbox-metadata", meta);
    return new Response(response.body, { status: 200, headers: out });
  } catch (error) {
    return json({ ok: false, message: error.message || String(error) }, 404, headers);
  }
}
