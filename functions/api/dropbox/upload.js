import { cors, evidenceRoot, json, preflight, requireSyncKey, uploadFile } from "../../_shared/dropbox.js";
import { upsertEvidence } from "../../_shared/geo-index.js";

const MAX_IMAGE_BYTES = 20 * 1024 * 1024;

export async function onRequestOptions(context) {
  return preflight(context.request);
}

export async function onRequestPost(context) {
  const headers = cors(context.request);
  const authError = requireSyncKey(context);
  if (authError) return authError;

  try {
    const form = await context.request.formData();
    const metadataRaw = String(form.get("metadata") || "{}");
    const metadata = JSON.parse(metadataRaw);
    const original = form.get("original");
    const stamped = form.get("stamped");

    if (!metadata.id && !metadata.photoCode) return json({ ok: false, message: "Falta id/photoCode." }, 400, headers);
    if (!(original instanceof File) || !original.size) return json({ ok: false, message: "Falta imagen original." }, 400, headers);
    if (original.size > MAX_IMAGE_BYTES || (stamped instanceof File && stamped.size > MAX_IMAGE_BYTES)) {
      return json({ ok: false, message: "La imagen supera el límite operativo de 20 MB." }, 413, headers);
    }

    const root = evidenceRoot(metadata);
    const originalExt = original.type.includes("png") ? "png" : original.type.includes("webp") ? "webp" : "jpg";
    const stampedExt = stamped instanceof File && stamped.type.includes("png") ? "png" : stamped instanceof File && stamped.type.includes("webp") ? "webp" : "jpg";
    const originalPath = `${root}/original.${originalExt}`;
    const stampedPath = stamped instanceof File && stamped.size ? `${root}/evidencia.${stampedExt}` : "";
    const metadataPath = `${root}/metadata.json`;

    await uploadFile(context.env, originalPath, await original.arrayBuffer(), original.type || "image/jpeg");
    if (stampedPath) await uploadFile(context.env, stampedPath, await stamped.arrayBuffer(), stamped.type || "image/jpeg");

    const serverMetadata = {
      ...metadata,
      cloud: {
        provider: "dropbox",
        root,
        originalPath,
        stampedPath,
        metadataPath,
        syncedAt: new Date().toISOString(),
      },
    };
    await uploadFile(context.env, metadataPath, new TextEncoder().encode(JSON.stringify(serverMetadata, null, 2)), "application/json");
    const geo = await upsertEvidence(context, serverMetadata).catch(error => ({ indexed:false, reason:error.message || String(error) }));

    return json({ ok: true, root, originalPath, stampedPath, metadataPath, syncedAt: serverMetadata.cloud.syncedAt, geo }, 200, headers);
  } catch (error) {
    return json({ ok: false, message: error.message || String(error) }, 500, headers);
  }
}
