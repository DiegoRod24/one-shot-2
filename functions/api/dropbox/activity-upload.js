import { cors, json, requireSyncKey, uploadFile } from "../../_shared/dropbox.js";

const MAX_MEDIA_BYTES = 80 * 1024 * 1024;

function clean(value, fallback = "actividad") {
  return String(value || fallback).trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || fallback;
}

function extFor(file) {
  const type = String(file?.type || "").toLowerCase();
  if (type.includes("mp4")) return "mp4";
  if (type.includes("quicktime")) return "mov";
  if (type.includes("webm")) return "webm";
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("heic") || type.includes("heif")) return "heic";
  return type.startsWith("video/") ? "mp4" : "jpg";
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
    if (!metadata.id && !metadata.activityCode) return json({ ok: false, message: "Falta id/activityCode." }, 400, headers);
    if (!(media instanceof File) || !media.size) return json({ ok: false, message: "Falta foto o video de la actividad." }, 400, headers);
    if (media.size > MAX_MEDIA_BYTES) return json({ ok: false, message: "El archivo supera el límite operativo de 80 MB." }, 413, headers);
    if (!String(media.type || "").startsWith("image/") && !String(media.type || "").startsWith("video/")) {
      return json({ ok: false, message: "Solo se admite foto o video." }, 415, headers);
    }

    const when = new Date(metadata.createdAt || Date.now());
    const yyyy = String(when.getUTCFullYear());
    const mm = String(when.getUTCMonth() + 1).padStart(2, "0");
    const key = clean(metadata.activityCode || metadata.id);
    const root = `/actividades/${yyyy}/${mm}/${key}`;
    const mediaPath = `${root}/actividad.${extFor(media)}`;
    const metadataPath = `${root}/metadata.json`;

    await uploadFile(context.env, mediaPath, await media.arrayBuffer(), media.type || "application/octet-stream");
    const syncedAt = new Date().toISOString();
    const serverMetadata = {
      ...metadata,
      entity: "political_activity",
      cloud: { provider: "dropbox", root, mediaPath, metadataPath, syncedAt },
    };
    await uploadFile(context.env, metadataPath, new TextEncoder().encode(JSON.stringify(serverMetadata, null, 2)), "application/json");

    return json({ ok: true, root, mediaPath, metadataPath, syncedAt }, 200, headers);
  } catch (error) {
    return json({ ok: false, message: error.message || String(error) }, 500, headers);
  }
}
