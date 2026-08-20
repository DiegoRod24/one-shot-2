"use strict";

(() => {
  const CONFIG_KEY = "oneshotCloudSyncConfig_v1";
  const MEDIA_KEYS = new Set(["image","stampedImage","rescuedImage","evidenceImage","watermarkedImage","markedImage","imageMarked","imageOriginal","originalImage","original","photo","photoData","dataUrl","imageData","base64Image","snapshot","captureImage"]);
  const Cloud = {
    running: false,
    config: { apiBase: location.origin, syncKey: "" },
    loadConfig() {
      try { this.config = { ...this.config, ...(JSON.parse(localStorage.getItem(CONFIG_KEY) || "{}") || {}) }; } catch (_) {}
      if (location.origin.includes("one-shot-2.pages.dev")) this.config.apiBase = location.origin;
      return this.config;
    },
    saveConfig(next = {}) {
      this.config = { ...this.config, ...next };
      localStorage.setItem(CONFIG_KEY, JSON.stringify(this.config));
      return this.config;
    },
    api(path, options = {}) {
      const base = String(this.config.apiBase || location.origin).replace(/\/$/, "");
      const headers = new Headers(options.headers || {});
      if (this.config.syncKey) headers.set("authorization", `Bearer ${this.config.syncKey}`);
      return fetch(`${base}${path}`, { ...options, headers, cache: "no-store" });
    },
    async json(path, options = {}) {
      const response = await this.api(path, options);
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.ok === false) throw new Error(data.message || `HTTP ${response.status}`);
      return data;
    },
    gpsStatus(record, atCapture = null) {
      if (!record?.gps || !Number.isFinite(Number(record.gps.latitude)) || !Number.isFinite(Number(record.gps.longitude))) return "SIN_GPS";
      if (record.gpsStatus === "GPS_CORREGIDO") return "GPS_CORREGIDO";
      if (record.gpsStatus === "GPS_RECUPERADO") return "GPS_RECUPERADO";
      const captureMs = Date.parse(record.createdAt || "");
      const gpsMs = Number(record.gpsCapturedAt || record.gps?.timestamp || 0);
      if (atCapture === false) return "GPS_RECUPERADO";
      if (Number.isFinite(captureMs) && gpsMs && Math.abs(gpsMs - captureMs) > 30000) return "GPS_RECUPERADO";
      return "GPS_CAPTURA";
    },
    metadata(record) {
      const out = {};
      for (const [key, value] of Object.entries(record || {})) {
        if (MEDIA_KEYS.has(key) || typeof value === "function") continue;
        out[key] = value;
      }
      out.sourceApp = out.sourceApp || "one-shot-2";
      out.sourceVersion = typeof VERSION !== "undefined" ? VERSION : "one-shot-2";
      out.gpsStatus = this.gpsStatus(record);
      out.cloudSyncStatus = "SYNCED";
      return out;
    },
    dataUrlFile(dataUrl, name) {
      const raw = String(dataUrl || "");
      const match = raw.match(/^data:([^;,]+)?(;base64)?,(.*)$/s);
      if (!match) return null;
      const type = match[1] || "image/jpeg";
      const bytes = match[2] ? atob(match[3]) : decodeURIComponent(match[3]);
      const array = new Uint8Array(bytes.length);
      for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i);
      return new File([array], name, { type });
    },
    async syncRecord(record, force = false) {
      if (!record?.id || !record.image) return false;
      if (!this.config.syncKey) return false;
      if (!navigator.onLine) {
        record.cloudSyncStatus = "PENDING";
        record.cloudSyncError = "Sin conexión";
        await Store.save(record).catch(() => {});
        return false;
      }
      if (!force && record.cloudSyncStatus === "SYNCED" && record.cloudSyncedLocalAt && Date.parse(record.updatedAt || record.createdAt || 0) <= Date.parse(record.cloudSyncedLocalAt || 0)) return true;
      record.cloudSyncStatus = "SYNCING";
      record.cloudSyncError = "";
      await Store.save(record).catch(() => {});
      try {
        const original = this.dataUrlFile(record.image, "original.jpg");
        if (!original) throw new Error("No se pudo leer la imagen original");
        const stampedData = record.rescuedImage || record.stampedImage || record.image;
        const stamped = this.dataUrlFile(stampedData, "evidencia.jpg");
        const form = new FormData();
        form.set("metadata", JSON.stringify(this.metadata(record)));
        form.set("original", original);
        if (stamped) form.set("stamped", stamped);
        const payload = await this.json("/api/dropbox/upload", { method: "POST", body: form });
        record.cloudSyncStatus = "SYNCED";
        record.cloudSyncedLocalAt = new Date().toISOString();
        record.cloudSyncError = "";
        record.cloud = { provider: "dropbox", root: payload.root, originalPath: payload.originalPath, stampedPath: payload.stampedPath, metadataPath: payload.metadataPath, syncedAt: payload.syncedAt };
        await Store.save(record);
        this.paintChip();
        return true;
      } catch (error) {
        record.cloudSyncStatus = "ERROR";
        record.cloudSyncError = error.message || String(error);
        await Store.save(record).catch(() => {});
        this.paintChip();
        throw error;
      }
    },
    async syncAll(force = false) {
      if (this.running) return;
      if (!this.config.syncKey) return this.open("Primero guarda la clave de sincronización.");
      this.running = true;
      const rows = [...(State.records || [])].filter(r => r?.image);
      const progress = document.getElementById("cloudSyncProgress");
      let ok = 0, fail = 0;
      try {
        for (let i = 0; i < rows.length; i++) {
          if (progress) progress.textContent = `Sincronizando ${i + 1}/${rows.length} · OK ${ok} · Error ${fail}`;
          try { if (await this.syncRecord(rows[i], force)) ok++; } catch (_) { fail++; }
        }
      } finally {
        this.running = false;
        if (progress) progress.textContent = `Listo · ${ok} sincronizadas · ${fail} con error`;
        this.paintChip();
        this.renderStats();
      }
    },
    async status() {
      return this.json("/api/dropbox/status");
    },
    async listRemote() {
      if (!this.config.syncKey) throw new Error("Guarda la clave de sincronización");
      const data = await this.json("/api/dropbox/list?limit=60");
      const box = document.getElementById("cloudRemoteList");
      if (!box) return data;
      if (!data.items?.length) { box.innerHTML = '<div class="cloudEmpty">Todavía no hay evidencias en Dropbox para este mes.</div>'; return data; }
      box.innerHTML = data.items.map(item => {
        const gps = item.gpsStatus || this.gpsStatus(item);
        const local = (State.records || []).some(r => r.id === item.id);
        return `<article class="cloudRemoteItem"><div><b>${this.esc(item.photoCode || item.id || "Evidencia")}</b><small>${this.esc(item.fecha || item.createdAt || "")} · ${this.esc(item.party || "Sin partido")}</small><span class="cloudGps ${gps === "GPS_CAPTURA" ? "ok" : gps === "SIN_GPS" ? "bad" : "warn"}">${this.esc(gps.replaceAll("_", " "))}</span></div><button data-cloud-import="${this.esc(item.id || "")}" ${local ? "disabled" : ""}>${local ? "Ya local" : "Importar"}</button></article>`;
      }).join("");
      box.querySelectorAll("[data-cloud-import]").forEach(btn => btn.addEventListener("click", () => {
        const item = data.items.find(x => x.id === btn.dataset.cloudImport);
        if (item) this.importRemote(item, btn);
      }));
      return data;
    },
    async blobDataUrl(path) {
      const response = await this.api(`/api/dropbox/file?path=${encodeURIComponent(path)}`);
      if (!response.ok) { const d = await response.json().catch(() => ({})); throw new Error(d.message || `HTTP ${response.status}`); }
      const blob = await response.blob();
      return await new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(blob); });
    },
    async importRemote(item, button) {
      if (!item?.cloud?.originalPath) return;
      const old = button?.textContent;
      if (button) { button.disabled = true; button.textContent = "Importando…"; }
      try {
        const image = await this.blobDataUrl(item.cloud.originalPath);
        const stampedImage = item.cloud.stampedPath ? await this.blobDataUrl(item.cloud.stampedPath) : image;
        const rec = { ...item, image, stampedImage, sourceApp: item.sourceApp || "evidencia-calle-pro", cloudSyncStatus: "SYNCED", cloudSyncedLocalAt: new Date().toISOString(), importedFromCloudAt: new Date().toISOString() };
        await Store.save(rec);
        if (typeof Gallery !== "undefined") Gallery.render?.();
        if (button) button.textContent = "Importada ✓";
        this.renderStats();
      } catch (error) {
        if (button) { button.disabled = false; button.textContent = old || "Importar"; }
        alert(`No se pudo importar: ${error.message || error}`);
      }
    },
    esc(value) { return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch])); },
    stats() {
      const rows = State.records || [];
      return rows.reduce((a, r) => {
        a.total++;
        const gps = this.gpsStatus(r);
        if (gps === "GPS_CAPTURA") a.gpsOk++; else if (gps === "SIN_GPS") a.gpsMissing++; else a.gpsRecovered++;
        const s = r.cloudSyncStatus || "PENDING";
        if (s === "SYNCED") a.synced++; else if (s === "ERROR") a.error++; else a.pending++;
        return a;
      }, { total: 0, gpsOk: 0, gpsRecovered: 0, gpsMissing: 0, synced: 0, pending: 0, error: 0 });
    },
    renderStats() {
      const s = this.stats();
      const el = document.getElementById("cloudSyncStats");
      if (el) el.innerHTML = `<span>📸 <b>${s.total}</b> local</span><span>☁ <b>${s.synced}</b> sincronizadas</span><span>🟡 <b>${s.pending}</b> pendientes</span><span>🔴 <b>${s.error}</b> error</span><span>📍 <b>${s.gpsOk}</b> GPS captura</span><span>🟠 <b>${s.gpsRecovered}</b> GPS recuperado</span><span>⚠ <b>${s.gpsMissing}</b> sin GPS</span>`;
      this.paintChip();
    },
    paintChip() {
      const chip = document.getElementById("cloudSyncChip");
      if (!chip || typeof State === "undefined") return;
      const s = this.stats();
      chip.textContent = s.error ? `☁ ${s.error} error` : s.pending ? `☁ ${s.pending} pend.` : `☁ ${s.synced}`;
      chip.dataset.state = s.error ? "error" : s.pending ? "pending" : "ok";
    },
    open(message = "") {
      let modal = document.getElementById("cloudSyncModal");
      if (!modal) modal = this.buildModal();
      modal.classList.add("open");
      const key = document.getElementById("cloudSyncKey");
      const api = document.getElementById("cloudApiBase");
      if (key) key.value = this.config.syncKey || "";
      if (api) api.value = this.config.apiBase || location.origin;
      const progress = document.getElementById("cloudSyncProgress");
      if (progress && message) progress.textContent = message;
      this.renderStats();
      this.status().then(data => {
        const status = document.getElementById("cloudDropboxStatus");
        if (status) status.textContent = data.connected ? `✓ Dropbox conectado · ${data.account?.displayName || "Cuenta lista"}${data.hasSyncKey ? " · clave servidor ✓" : " · falta ONE_SHOT_SYNC_KEY"}` : `Dropbox pendiente · ${data.hasRefreshToken ? "token presente" : "falta refresh token"}`;
      }).catch(error => { const status = document.getElementById("cloudDropboxStatus"); if (status) status.textContent = `⚠ ${error.message}`; });
    },
    close() { document.getElementById("cloudSyncModal")?.classList.remove("open"); },
    buildModal() {
      const modal = document.createElement("div");
      modal.id = "cloudSyncModal";
      modal.className = "cloudSyncModal";
      modal.innerHTML = `<div class="cloudSyncCard"><header><div><b>☁ ONE SHOT · Sincronización</b><small>Dropbox como respaldo compartido · original siempre conservada</small></div><button id="cloudSyncClose">×</button></header><div id="cloudDropboxStatus" class="cloudStatus">Comprobando Dropbox…</div><div id="cloudSyncStats" class="cloudStats"></div><label>Servidor de sincronización<input id="cloudApiBase" autocomplete="off"></label><label>Clave de sincronización<input id="cloudSyncKey" type="password" autocomplete="off" placeholder="ONE_SHOT_SYNC_KEY"></label><div class="cloudActions"><button id="cloudSaveConfig">Guardar configuración</button><button id="cloudConnectDropbox">Autorizar Dropbox</button><button id="cloudTest">Probar conexión</button><button id="cloudSyncAll" class="primary">☁ Sincronizar existentes</button><button id="cloudLoadRemote">Ver evidencias de Dropbox</button></div><div id="cloudSyncProgress" class="cloudProgress">Listo.</div><div id="cloudRemoteList" class="cloudRemoteList"></div><p class="cloudNote">Una foto sin GPS se conserva, pero queda marcada como evidencia incompleta. GPS recuperado o corregido se registra como tal; nunca se presenta como GPS original de captura.</p></div>`;
      document.body.appendChild(modal);
      modal.querySelector("#cloudSyncClose").onclick = () => this.close();
      modal.addEventListener("click", e => { if (e.target === modal) this.close(); });
      modal.querySelector("#cloudSaveConfig").onclick = () => {
        this.saveConfig({ apiBase: modal.querySelector("#cloudApiBase").value.trim() || location.origin, syncKey: modal.querySelector("#cloudSyncKey").value.trim() });
        modal.querySelector("#cloudSyncProgress").textContent = "Configuración guardada en este dispositivo.";
        this.paintChip();
      };
      modal.querySelector("#cloudConnectDropbox").onclick = () => window.open(`${String(this.config.apiBase || location.origin).replace(/\/$/, "")}/api/dropbox/connect`, "_blank", "noopener");
      modal.querySelector("#cloudTest").onclick = () => this.open("Comprobando conexión…");
      modal.querySelector("#cloudSyncAll").onclick = () => this.syncAll(true);
      modal.querySelector("#cloudLoadRemote").onclick = () => this.listRemote().catch(error => { modal.querySelector("#cloudSyncProgress").textContent = `Error: ${error.message}`; });
      return modal;
    },
    installUi() {
      if (document.getElementById("cloudSyncChip")) return;
      const chip = document.createElement("button");
      chip.id = "cloudSyncChip";
      chip.className = "chipButton cloudSyncChip";
      chip.title = "Sincronización Dropbox";
      chip.textContent = "☁";
      chip.onclick = () => this.open();
      (document.querySelector(".topChips") || document.querySelector("header") || document.body).appendChild(chip);
      this.paintChip();
    },
    patchEvidence() {
      if (typeof Evidence === "undefined" || Evidence.__cloudPatched) return;
      Evidence.__cloudPatched = true;
      const make = Evidence.make?.bind(Evidence);
      if (make) Evidence.make = (...args) => { const rec = make(...args); rec.gpsStatus = this.gpsStatus(rec, Boolean(args[1])); rec.cloudSyncStatus = "PENDING"; rec.sourceApp = rec.sourceApp || "one-shot-2"; return rec; };
      const finalize = Evidence.finalize?.bind(Evidence);
      if (finalize) Evidence.finalize = async rec => {
        const hadGps = Boolean(rec?.gps);
        const result = await finalize(rec);
        if (rec) {
          rec.gpsStatus = hadGps ? "GPS_CAPTURA" : (rec.gps ? "GPS_RECUPERADO" : "SIN_GPS");
          rec.cloudSyncStatus = rec.cloudSyncStatus === "SYNCED" ? "SYNCED" : "PENDING";
          await Store.save(rec).catch(() => {});
          if (this.config.syncKey) setTimeout(() => this.syncRecord(rec).catch(() => {}), 350);
        }
        this.renderStats();
        return result;
      };
      if (typeof Editor !== "undefined" && Editor.updateGps && !Editor.__cloudGpsPatched) {
        Editor.__cloudGpsPatched = true;
        const updateGps = Editor.updateGps.bind(Editor);
        Editor.updateGps = async (...args) => {
          const rec = Editor.current;
          const result = await updateGps(...args);
          if (rec?.gps) { rec.gpsStatus = "GPS_CORREGIDO"; rec.cloudSyncStatus = "PENDING"; await Store.save(rec).catch(() => {}); if (this.config.syncKey) this.syncRecord(rec, true).catch(() => {}); }
          this.renderStats();
          return result;
        };
      }
    },
    init() {
      this.loadConfig();
      this.patchEvidence();
      this.installUi();
      this.renderStats();
      window.addEventListener("online", () => { const pending = (State.records || []).filter(r => r.cloudSyncStatus !== "SYNCED"); if (pending.length && this.config.syncKey) this.syncAll(false); });
      setTimeout(() => this.patchEvidence(), 1500);
    },
  };

  window.OneShotCloud = Cloud;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => Cloud.init(), { once: true }); else Cloud.init();
})();
