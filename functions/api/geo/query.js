import { cors, json, preflight, requireSyncKey } from "../../_shared/dropbox.js";
import { filtersFromUrl, queryEvidence } from "../../_shared/geo-index.js";

export async function onRequestOptions(context){return preflight(context.request)}

export async function onRequestGet(context){
  const headers=cors(context.request),authError=requireSyncKey(context);if(authError)return authError;
  try{
    const url=new URL(context.request.url),filters=filtersFromUrl(url),items=await queryEvidence(context,filters);
    return json({ok:true,count:items.length,filters,items},200,headers);
  }catch(error){
    return json({ok:false,message:error.message||String(error)},500,headers);
  }
}
