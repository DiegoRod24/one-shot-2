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
        el.append('<link rel="stylesheet" href="/one-dropbox-sync.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-phase2-edit-center.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v660-field-foundation.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v664-editor-stable.css">', { html: true });
      },
    })
    .on("body", {
      element(el) {
        // v6.6.26: un único controlador para arranque de cámara + trasera + 0.5x/1x.
        // Se carga primero para que nada administrativo retrase la cámara.
        el.append('<script src="/one-v6624-ultrawide.js"></script>', { html: true });
        el.append('<script src="/one-v6619-startup-status.js"></script>', { html: true });
        el.append('<script src="/one-v661-idle-loader.js"></script>', { html: true });
        el.append('<script src="/one-v660-political-activity.js"></script>', { html: true });
        el.append('<script src="/one-v664-editor-stable.js"></script>', { html: true });
        el.append('<script src="/one-v6615-nearby-preferences.js"></script>', { html: true });
        el.append('<script src="/one-v6616-sync-identity.js"></script>', { html: true });
        el.append('<script src="/one-v6618-field-flow.js"></script>', { html: true });
      },
    })
    .transform(response);
}
