export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    // v6.6.4: voz/OCR/Fer fuera del flujo de campo hasta que estén listos.
    .on('script[src*="tesseract"]', { element(el) { el.remove(); } })
    .on('script[src*="fer-" i]', { element(el) { el.remove(); } })
    .on('script[src*="fer_" i]', { element(el) { el.remove(); } })
    .on("head", {
      element(el) {
        el.append('<link rel="stylesheet" href="/one-dropbox-sync.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-phase2-edit-center.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v660-field-foundation.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v664-editor-stable.css">', { html: true });
      },
    })
    .on("body", {
      element(el) {
        el.append('<script src="/one-v662-fer-off.js"></script>', { html: true });
        el.append('<script src="/one-v661-idle-loader.js"></script>', { html: true });
        // v6.6.19: feedback inmediato de cámara/GPS/ubicación y apertura rápida de Tramo.
        el.append('<script src="/one-v6619-startup-status.js"></script>', { html: true });
        el.append('<script src="/one-v660-political-activity.js"></script>', { html: true });
        // Reemplaza el parche v6.6.3: un solo controlador para editar y UI móvil.
        el.append('<script src="/one-v664-editor-stable.js"></script>', { html: true });
        // v6.6.15: Historial cercano se aplica al instante y confirma el guardado.
        el.append('<script src="/one-v6615-nearby-preferences.js"></script>', { html: true });
        // v6.6.16: sincronización móvil con un solo identificador humano opcional.
        el.append('<script src="/one-v6616-sync-identity.js"></script>', { html: true });
        // v6.6.18: guardado local primero + atajos Local/Tramo + prueba real de sincronización.
        el.append('<script src="/one-v6618-field-flow.js"></script>', { html: true });
        // v6.6.24: 0.5x usa lente ultra gran angular físico cuando el navegador lo expone.
        el.append('<script src="/one-v6624-ultrawide.js"></script>', { html: true });
      },
    })
    .transform(response);
}
