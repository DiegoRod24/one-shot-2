import { cors, json, requireSyncKey, uploadFile } from "../../_shared/dropbox.js";

const MAX_MEDIA_BYTES = 80 * 1024 * 1024;

function clean(value, fallback = "tramo") {
  return String(value || fallback).trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

function extFor(file) {
  const type = String(file?.type || "").toLowerCase();
  if (type.includes("mp4")) return "mp4";
  if (type.includes("quicktime")) return "mov";
  if (type.includes("webm")) return "webm";
  if (type.includes("mpeg")) return "mpeg";
  return "mp4";
}

export async function onRequest(context) {
  const headers = cors(context.request);
  const method = context.request.method.toUpperCase();
  if (method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (method !== "POST") return json({ ok: false, message: `Método no permitido: ${method}` }, 405, { ...headers, allow: "POST, OPTIONS" });

  const authError = requireSyncKey(context);
  if (authError) return authError;

  try {
    const form = await context.request.formData();
    const metadata = JSON.parse(String(form.get("metadata") || "{}"));
    const media = form.get("media");
    const corridorId = clean(metadata.corridorId || metadata.id, "tramo");
    if (!corridorId) return json({ ok: false, message: "Falta corridorId/id." }, 400, headers);

    const when = new Date(metadata.createdAt || metadata.startedAt || Date.now());
    const yyyy = String(when.getUTCFullYear());
    const mm = String(when.getUTCMonth() + 1).padStart(2, "0");
    const root = `/tramos/${yyyy}/${mm}/${corridorId}`;
    const syncedAt = new Date().toISOString();

    let mediaPath = "";
    let metadataPath = `${root}/metadata.json`;

    if (media instanceof File && media.size) {
      if (media.size > MAX_MEDIA_BYTES) return json({ ok: false, message: "El archivo supera el límite operativo de 80 MB." }, 413, headers);
      if (!String(media.type || "").startsWith("video/")) return json({ ok: false, message: "La muestra de tramo debe ser video." }, 415, headers);
      const mediaId = clean(metadata.id || `video-${Date.now()}`, "video");
      mediaPath = `${root}/muestras/${mediaId}.${extFor(media)}`;
      metadataPath = `${root}/muestras/${mediaId}.json`;
      await uploadFile(context.env, mediaPath, await media.arrayBuffer(), media.type || "application/octet-stream");
    }

    const serverMetadata = {
      ...metadata,
      entityType: metadata.entityType || (mediaPath ? "PROPAGANDA_CORRIDOR_MEDIA" : "PROPAGANDA_CORRIDOR"),
      cloud: { provider: "dropbox", root, mediaPath, metadataPath, syncedAt },
    };
    await uploadFile(context.env, metadataPath, new TextEncoder().encode(JSON.stringify(serverMetadata, null, 2)), "application/json");

    return json({ ok: true, root, mediaPath, metadataPath, syncedAt }, 200, headers);
  } catch (error) {
    return json({ ok: false, message: error.message || String(error) }, 500, headers);
  }
}
