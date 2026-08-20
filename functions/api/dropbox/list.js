import { apiCall, cors, downloadFile, json, preflight, requireSyncKey } from "../../_shared/dropbox.js";

export async function onRequestOptions(context) {
  return preflight(context.request);
}

export async function onRequestGet(context) {
  const headers = cors(context.request);
  const authError = requireSyncKey(context);
  if (authError) return authError;

  const url = new URL(context.request.url);
  const now = new Date();
  const year = String(url.searchParams.get("year") || now.getUTCFullYear()).replace(/\D/g, "").slice(0, 4);
  const month = String(url.searchParams.get("month") || now.getUTCMonth() + 1).replace(/\D/g, "").padStart(2, "0").slice(-2);
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") || 40)));
  const path = `/evidencias/${year}/${month}`;

  try {
    let page;
    try {
      page = await apiCall(context.env, "files/list_folder", { path, recursive: true, include_deleted: false, limit: 1000 });
    } catch (error) {
      if (/not_found|path\/not_found/i.test(error.message || "")) return json({ ok: true, path, items: [], total: 0 }, 200, headers);
      throw error;
    }

    let entries = [...(page.entries || [])];
    while (page.has_more && entries.length < 4000) {
      page = await apiCall(context.env, "files/list_folder/continue", { cursor: page.cursor });
      entries.push(...(page.entries || []));
    }

    const metaPaths = entries
      .filter(item => item?.[".tag"] === "file" && /\/metadata\.json$/i.test(item.path_lower || item.path_display || ""))
      .map(item => item.path_display || item.path_lower)
      .sort()
      .reverse()
      .slice(0, limit);

    const items = [];
    for (const metadataPath of metaPaths) {
      try {
        const response = await downloadFile(context.env, metadataPath);
        const item = await response.json();
        items.push(item);
      } catch (_) {}
    }

    return json({ ok: true, path, items, total: metaPaths.length }, 200, headers);
  } catch (error) {
    return json({ ok: false, message: error.message || String(error) }, 500, headers);
  }
}
