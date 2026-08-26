export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    // Voz/OCR/Fer siguen fuera del flujo de campo.
    .on('script[src*="tesseract"]', { element(el) { el.remove(); } })
    .on('script[src*="fer-" i]', { element(el) { el.remove(); } })
    .on('script[src*="fer_" i]', { element(el) { el.remove(); } })
    .on("head", {
      element(el) {
        // CSS se mantiene cacheado; los motores JS administrativos ya no arrancan con la cámara.
        el.append('<link rel="stylesheet" href="/one-dropbox-sync.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-phase2-edit-center.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v660-field-foundation.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v664-editor-stable.css">', { html: true });
      },
    })
    .on("body", {
      element(el) {
        // v6.6.28: arranque mínimo. Solo cámara + indicador breve + cargador bajo demanda.
        el.append('<script src="/one-v6624-ultrawide.js"></script>', { html: true });
        el.append('<script src="/one-v6619-startup-status.js"></script>', { html: true });
        el.append('<script src="/one-v661-idle-loader.js"></script>', { html: true });
        // Editor, historial, actividad, nube, mapas, municipio y reportes se cargan después
        // de que la cámara esté viva o cuando el usuario toca la función correspondiente.
      },
    })
    .transform(response);
}
