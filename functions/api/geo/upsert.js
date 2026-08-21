import { cors, json, preflight, requireSyncKey } from "../../_shared/dropbox.js";
import { upsertEvidence } from "../../_shared/geo-index.js";

export async function onRequestOptions(context){return preflight(context.request)}

export async function onRequestPost(context){
  const headers=cors(context.request),authError=requireSyncKey(context);if(authError)return authError;
  try{
    const metadata=await context.request.json();
    const result=await upsertEvidence(context,metadata);
    return json({ok:true,...result},200,headers);
  }catch(error){
    return json({ok:false,message:error.message||String(error)},500,headers);
  }
}
