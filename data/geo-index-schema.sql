PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS evidences (
  id TEXT PRIMARY KEY,
  photo_code TEXT,
  source_app TEXT,
  source_version TEXT,
  captured_at TEXT,
  updated_at TEXT,
  latitude REAL,
  longitude REAL,
  accuracy REAL,
  gps_status TEXT,
  department TEXT,
  province TEXT,
  district TEXT,
  ubigeo TEXT,
  address TEXT,
  evidence_type TEXT,
  finding_subtype TEXT,
  party TEXT,
  candidate TEXT,
  candidate_type TEXT,
  panel_provider TEXT,
  reviewer TEXT,
  team_member_id TEXT,
  team_assignment_id TEXT,
  team_sector TEXT,
  status TEXT,
  review_status TEXT,
  dropbox_root TEXT,
  original_path TEXT,
  stamped_path TEXT,
  corrected_path TEXT,
  current_image_path TEXT,
  original_media_unavailable INTEGER DEFAULT 0,
  legacy_recovery_status TEXT,
  raw_json TEXT,
  indexed_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_evidences_geo ON evidences(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_evidences_ubigeo ON evidences(ubigeo);
CREATE INDEX IF NOT EXISTS idx_evidences_department ON evidences(department);
CREATE INDEX IF NOT EXISTS idx_evidences_province ON evidences(province);
CREATE INDEX IF NOT EXISTS idx_evidences_district ON evidences(district);
CREATE INDEX IF NOT EXISTS idx_evidences_type ON evidences(evidence_type);
CREATE INDEX IF NOT EXISTS idx_evidences_party ON evidences(party);
CREATE INDEX IF NOT EXISTS idx_evidences_provider ON evidences(panel_provider);
CREATE INDEX IF NOT EXISTS idx_evidences_captured ON evidences(captured_at);

CREATE TABLE IF NOT EXISTS physical_supports (
  id TEXT PRIMARY KEY,
  support_type TEXT NOT NULL,
  latitude REAL,
  longitude REAL,
  department TEXT,
  province TEXT,
  district TEXT,
  ubigeo TEXT,
  address TEXT,
  provider TEXT,
  first_seen_at TEXT,
  last_seen_at TEXT,
  evidence_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'ACTIVE',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_supports_geo ON physical_supports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_supports_provider ON physical_supports(provider);
CREATE INDEX IF NOT EXISTS idx_supports_type ON physical_supports(support_type);

CREATE TABLE IF NOT EXISTS support_evidences (
  support_id TEXT NOT NULL,
  evidence_id TEXT NOT NULL,
  relation TEXT DEFAULT 'OBSERVED_AT',
  linked_at TEXT NOT NULL,
  PRIMARY KEY (support_id, evidence_id),
  FOREIGN KEY (support_id) REFERENCES physical_supports(id) ON DELETE CASCADE,
  FOREIGN KEY (evidence_id) REFERENCES evidences(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS evidence_parties (
  evidence_id TEXT NOT NULL,
  party TEXT NOT NULL,
  candidate TEXT DEFAULT '',
  observed_at TEXT,
  PRIMARY KEY (evidence_id, party, candidate),
  FOREIGN KEY (evidence_id) REFERENCES evidences(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS planning_areas (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  geometry_geojson TEXT NOT NULL,
  department TEXT,
  province TEXT,
  district TEXT,
  assigned_team TEXT,
  status TEXT DEFAULT 'PLANNED',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS propaganda_corridors (
  id TEXT PRIMARY KEY,
  mode TEXT,
  geometry_geojson TEXT NOT NULL,
  party TEXT,
  finding_subtype TEXT,
  approximate_count INTEGER,
  sample_evidence_id TEXT,
  team_member_id TEXT,
  started_at TEXT,
  ended_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
