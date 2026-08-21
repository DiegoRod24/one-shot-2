"use strict";

(() => {
  const IDENTITY_KEY = "oneshotFieldIdentity_v1";

  function parse(raw, fallback = {}) { try { return JSON.parse(raw || "") || fallback; } catch (_) { return fallback; } }
  function identity() {
    const current = parse(localStorage.getItem(IDENTITY_KEY));
    if (!current.deviceId) {
      current.deviceId = crypto?.randomUUID?.() || `device-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      localStorage.setItem(IDENTITY_KEY, JSON.stringify(current));
    }
    return { teamId: "", reviewer: "", ...current };
  }
  function saveIdentity(next = {}) {
    const current = identity();
    const value = { ...current, ...next, deviceId: current.deviceId };
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(value));
    return value;
  }

  function install() {
    const Cloud = window.OneShotCloud;
    if (!Cloud || Cloud.__workerModeInstalled) return false;
    Cloud.__workerModeInstalled = true;

    const baseMetadata = Cloud.metadata?.bind(Cloud);
    if (baseMetadata) Cloud.metadata = function(record) {
      const out = baseMetadata(record);
      const id = identity();
      out.fieldIdentity = { teamId: id.teamId || "", reviewer: id.reviewer || "", deviceId: id.deviceId };
      out.teamId = out.teamId || id.teamId || "";
      out.reviewer = out.reviewer || id.reviewer || "";
      out.deviceId = out.deviceId || id.deviceId;
      return out;
    };

    const baseBuild = Cloud.buildModal?.bind(Cloud);
    if (baseBuild) Cloud.buildModal = function() {
      const modal = baseBuild();
      queueMicrotask(() => configureModal.call(this, modal));
      return modal;
    };

    const baseOpen = Cloud.open?.bind(Cloud);
    if (baseOpen) Cloud.open = function(...args) {
      const result = baseOpen(...args);
      setTimeout(() => configureModal.call(this, document.getElementById("cloudSyncModal")), 0);
      return result;
    };

    function configureModal(modal) {
      if (!modal) return;
      const connect = modal.querySelector("#cloudConnectDropbox");
      if (connect) connect.remove();

      const apiInput = modal.querySelector("#cloudApiBase");
      if (apiInput) {
        apiInput.value = location.origin;
        apiInput.readOnly = true;
        apiInput.closest("label")?.setAttribute("hidden", "");
        this.saveConfig({ apiBase: location.origin });
      }

      let info = modal.querySelector("#cloudWorkerInfo");
      if (!info) {
        info = document.createElement("div");
        info.id = "cloudWorkerInfo";
        info.className = "cloudStatus";
        info.textContent = "🔒 Dropbox es administrado centralmente por ONE SHOT. Este dispositivo no necesita iniciar sesión en Dropbox.";
        modal.querySelector("#cloudSyncStats")?.insertAdjacentElement("afterend", info);
      }

      let identityBox = modal.querySelector("#cloudFieldIdentity");
      if (!identityBox) {
        const id = identity();
        identityBox = document.createElement("div");
        identityBox.id = "cloudFieldIdentity";
        identityBox.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:12px 0;";
        identityBox.innerHTML = `
          <label style="display:grid;gap:5px">Equipo / Brigada<input id="cloudTeamId" placeholder="Ej. CAJ-03" value="${escapeHtml(id.teamId || "")}"></label>
          <label style="display:grid;gap:5px">Verificador / Alias<input id="cloudReviewer" placeholder="Ej. Maria" value="${escapeHtml(id.reviewer || "")}"></label>`;
        const keyLabel = modal.querySelector("#cloudSyncKey")?.closest("label");
        keyLabel?.insertAdjacentElement("beforebegin", identityBox);
        const persist = () => saveIdentity({
          teamId: identityBox.querySelector("#cloudTeamId").value.trim(),
          reviewer: identityBox.querySelector("#cloudReviewer").value.trim(),
        });
        identityBox.querySelectorAll("input").forEach(el => el.addEventListener("change", persist));
      }

      const save = modal.querySelector("#cloudSaveConfig");
      if (save) {
        save.textContent = "Guardar dispositivo";
        if (!save.__workerBound) {
          save.__workerBound = true;
          save.addEventListener("click", () => {
            saveIdentity({
              teamId: modal.querySelector("#cloudTeamId")?.value.trim() || "",
              reviewer: modal.querySelector("#cloudReviewer")?.value.trim() || "",
            });
          });
        }
      }

      const sync = modal.querySelector("#cloudSyncAll");
      if (sync) {
        sync.textContent = "☁ Sincronizar pendientes";
        sync.onclick = () => this.syncAll(false);
      }

      const remote = modal.querySelector("#cloudLoadRemote");
      if (remote) {
        remote.style.display = "none";
        remote.title = "Las evidencias de todo el equipo se consultarán desde ONE SHOT Operaciones.";
      }

      const note = modal.querySelector(".cloudNote");
      if (note) note.textContent = "Las fotos originales permanecen en el dispositivo y se respaldan en el servicio central. Sin GPS se conserva la evidencia, pero queda marcada como incompleta.";
    }

    function escapeHtml(value) {
      return String(value ?? "").replace(/[&<>"']/g, ch => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
    }

    return true;
  }

  let tries = 0;
  const timer = setInterval(() => {
    tries++;
    if (install() || tries > 80) clearInterval(timer);
  }, 200);
})();
