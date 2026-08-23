export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    // OCR está temporalmente OFF en v6.6: no descargar Tesseract (~carga pesada) al abrir cámara.
    .on('script[src*="tesseract"]', {
      element(el) { el.remove(); },
    })
    .on("head", {
      element(el) {
        el.append('<link rel="stylesheet" href="/one-dropbox-sync.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-phase2-edit-center.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v660-field-foundation.css">', { html: true });
      },
    })
    .on("body", {
      element(el) {
        // Performance: primero cámara. Sync/Phase2/reportes/territorio cargan en idle o por intención.
        el.append('<script src="/one-v661-idle-loader.js"></script>', { html: true });
        el.append('<script src="/one-v660-political-activity.js"></script>', { html: true });
      },
    })
    .transform(response);
}
