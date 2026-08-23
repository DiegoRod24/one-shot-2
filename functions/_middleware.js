export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    // OCR y Fer quedan temporalmente OFF: no cargar Tesseract ni scripts visuales/voz del asistente.
    .on('script[src*="tesseract"]', { element(el) { el.remove(); } })
    .on('script[src*="fer-" i]', { element(el) { el.remove(); } })
    .on('script[src*="fer_" i]', { element(el) { el.remove(); } })
    .on("head", {
      element(el) {
        el.append('<link rel="stylesheet" href="/one-dropbox-sync.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-phase2-edit-center.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v660-field-foundation.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-v663-field-cleanup.css">', { html: true });
      },
    })
    .on("body", {
      element(el) {
        el.append('<script src="/one-v662-fer-off.js"></script>', { html: true });
        el.append('<script src="/one-v661-idle-loader.js"></script>', { html: true });
        el.append('<script src="/one-v660-political-activity.js"></script>', { html: true });
        el.append('<script src="/one-v663-field-cleanup.js"></script>', { html: true });
      },
    })
    .transform(response);
}
