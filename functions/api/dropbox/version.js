import { cors, evidenceRoot, json, preflight, requireSyncKey, uploadFile } from "../../_shared/dropbox.js";

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
    const metadata = JSON.parse(String(form.get("metadata") || "{}"));
    const corrected = form.get("corrected");
    if (!metadata.id && !metadata.photoCode) return json({ ok:false, message:"Falta id/photoCode." },400,headers);
    if (!(corrected instanceof File) || !corrected.size) return json({ ok:false, message:"Falta imagen corregida." },400,headers);
    if (corrected.size > MAX_IMAGE_BYTES) return json({ ok:false, message:"La imagen corregida supera 20 MB." },413,headers);

    const root = metadata?.cloud?.root || evidenceRoot(metadata);
    const stamp = String(metadata.correctedAt || new Date().toISOString()).replace(/[:.]/g,"-");
    const ext = corrected.type.includes("png") ? "png" : corrected.type.includes("webp") ? "webp" : "jpg";
    const correctedPath = `${root}/correcciones/${stamp}.${ext}`;
    await uploadFile(context.env, correctedPath, await corrected.arrayBuffer(), corrected.type || "image/jpeg");

    const versions = Array.isArray(metadata.mediaVersions) ? metadata.mediaVersions : [];
    const version = {
      kind:"CORRECTED",
      path:correctedPath,
      createdAt:metadata.correctedAt || new Date().toISOString(),
      action:metadata.correctedAction || "EDICION_ONE_SHOT_2",
      editor:metadata.reviewer || "",
    };
    const next = versions.filter(v=>v?.path!==correctedPath).concat(version);
    const metadataPath = metadata?.cloud?.metadataPath || `${root}/metadata.json`;
    const serverMetadata = {
      ...metadata,
      mediaVersions:next,
      currentImagePath:correctedPath,
      correctedPath,
      cloud:{...(metadata.cloud||{}),provider:"dropbox",root,metadataPath,correctedPath,currentImagePath:correctedPath,syncedAt:new Date().toISOString()},
    };
    await uploadFile(context.env, metadataPath, new TextEncoder().encode(JSON.stringify(serverMetadata,null,2)), "application/json");
    return json({ok:true,root,correctedPath,metadataPath,mediaVersions:next,syncedAt:serverMetadata.cloud.syncedAt},200,headers);
  } catch (error) {
    return json({ok:false,message:error.message||String(error)},500,headers);
  }
}
