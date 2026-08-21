export function geoDb(context) {
  return context?.env?.GEO_DB || null;
}

function n(v){const x=Number(v);return Number.isFinite(x)?x:null}
function s(v){return v == null ? "" : String(v)}
function getGps(m={}){const g=m.gps||{};return {lat:n(g.latitude ?? m.latitude),lng:n(g.longitude ?? m.longitude),accuracy:n(g.accuracy ?? m.accuracy)}}
function provider(m={}){return s(m.panelProvider||m.provider||m.company||m.empresa)}

export async function upsertEvidence(context, metadata={}) {
  const db=geoDb(context);if(!db)return {indexed:false,reason:"GEO_DB_NOT_BOUND"};
  const id=s(metadata.id||metadata.photoCode);if(!id)return {indexed:false,reason:"MISSING_ID"};
  const g=getGps(metadata),cloud=metadata.cloud||{},now=new Date().toISOString();
  const sql=`INSERT INTO evidences (
    id,photo_code,source_app,source_version,captured_at,updated_at,latitude,longitude,accuracy,gps_status,
    department,province,district,ubigeo,address,evidence_type,finding_subtype,party,candidate,candidate_type,
    panel_provider,reviewer,team_member_id,team_assignment_id,team_sector,status,review_status,dropbox_root,
    original_path,stamped_path,corrected_path,current_image_path,original_media_unavailable,legacy_recovery_status,raw_json,indexed_at
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(id) DO UPDATE SET
    photo_code=excluded.photo_code,source_app=excluded.source_app,source_version=excluded.source_version,
    captured_at=excluded.captured_at,updated_at=excluded.updated_at,latitude=excluded.latitude,longitude=excluded.longitude,
    accuracy=excluded.accuracy,gps_status=excluded.gps_status,department=excluded.department,province=excluded.province,
    district=excluded.district,ubigeo=excluded.ubigeo,address=excluded.address,evidence_type=excluded.evidence_type,
    finding_subtype=excluded.finding_subtype,party=excluded.party,candidate=excluded.candidate,candidate_type=excluded.candidate_type,
    panel_provider=excluded.panel_provider,reviewer=excluded.reviewer,team_member_id=excluded.team_member_id,
    team_assignment_id=excluded.team_assignment_id,team_sector=excluded.team_sector,status=excluded.status,
    review_status=excluded.review_status,dropbox_root=excluded.dropbox_root,original_path=excluded.original_path,
    stamped_path=excluded.stamped_path,corrected_path=excluded.corrected_path,current_image_path=excluded.current_image_path,
    original_media_unavailable=excluded.original_media_unavailable,legacy_recovery_status=excluded.legacy_recovery_status,
    raw_json=excluded.raw_json,indexed_at=excluded.indexed_at`;
  const values=[id,s(metadata.photoCode),s(metadata.sourceApp),s(metadata.sourceVersion),s(metadata.createdAt||metadata.capturedAt),s(metadata.updatedAt),g.lat,g.lng,g.accuracy,s(metadata.gpsStatus),s(metadata.department),s(metadata.province),s(metadata.district),s(metadata.ubigeo),s(metadata.address),s(metadata.type),s(metadata.findingSubtype),s(metadata.party),s(metadata.candidate),s(metadata.candidateType),provider(metadata),s(metadata.reviewer),s(metadata.teamMemberId),s(metadata.teamAssignmentId),s(metadata.teamSector),s(metadata.status),s(metadata.reviewStatus),s(cloud.root),s(cloud.originalPath),s(cloud.stampedPath),s(cloud.correctedPath),s(cloud.currentImagePath||metadata.currentImagePath),metadata.originalMediaUnavailable?1:0,s(metadata.legacyRecovery?.status),JSON.stringify(metadata),now];
  await db.prepare(sql).bind(...values).run();
  if(metadata.party){await db.prepare(`INSERT OR IGNORE INTO evidence_parties (evidence_id,party,candidate,observed_at) VALUES (?,?,?,?)`).bind(id,s(metadata.party),s(metadata.candidate),s(metadata.createdAt||metadata.capturedAt)).run()}
  return {indexed:true,id};
}

export function filtersFromUrl(url) {
  const p=url.searchParams,out={};
  for(const k of ['department','province','district','ubigeo','type','party','provider','gpsStatus','sourceApp','reviewer']){const v=p.get(k);if(v)out[k]=v}
  const minLat=n(p.get('minLat')),maxLat=n(p.get('maxLat')),minLng=n(p.get('minLng')),maxLng=n(p.get('maxLng'));
  if([minLat,maxLat,minLng,maxLng].every(v=>v!==null))Object.assign(out,{minLat,maxLat,minLng,maxLng});
  out.limit=Math.min(1000,Math.max(1,Number(p.get('limit')||250)));out.offset=Math.max(0,Number(p.get('offset')||0));return out;
}

export async function queryEvidence(context, f={}) {
  const db=geoDb(context);if(!db)throw new Error('GEO_DB no está vinculado en Cloudflare');
  const where=[],bind=[];const add=(sql,v)=>{where.push(sql);bind.push(v)};
  if(f.department)add('department = ?',f.department);if(f.province)add('province = ?',f.province);if(f.district)add('district = ?',f.district);if(f.ubigeo)add('ubigeo = ?',f.ubigeo);if(f.type)add('evidence_type = ?',f.type);if(f.party)add('party = ?',f.party);if(f.provider)add('panel_provider = ?',f.provider);if(f.gpsStatus)add('gps_status = ?',f.gpsStatus);if(f.sourceApp)add('source_app = ?',f.sourceApp);if(f.reviewer)add('reviewer = ?',f.reviewer);
  if(f.minLat!=null){where.push('latitude BETWEEN ? AND ? AND longitude BETWEEN ? AND ?');bind.push(f.minLat,f.maxLat,f.minLng,f.maxLng)}
  const sql=`SELECT id,photo_code,captured_at,latitude,longitude,accuracy,gps_status,department,province,district,ubigeo,address,evidence_type,finding_subtype,party,candidate,panel_provider,reviewer,team_member_id,status,review_status,dropbox_root,original_path,stamped_path,corrected_path,current_image_path,source_app FROM evidences ${where.length?'WHERE '+where.join(' AND '):''} ORDER BY captured_at DESC LIMIT ? OFFSET ?`;
  bind.push(f.limit||250,f.offset||0);const rows=await db.prepare(sql).bind(...bind).all();return rows.results||[];
}
