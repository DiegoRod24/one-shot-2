export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on('link[href*="leaflet@1.9.4/dist/leaflet.css"]', { element(el) { el.remove(); } })
    .on('script[src*="exceljs@4.4.0"]', { element(el) { el.remove(); } })
    .on('script[src*="leaflet@1.9.4/dist/leaflet.js"]', { element(el) { el.remove(); } })
    .on('script[src*="tesseract"]', { element(el) { el.remove(); } })
    .on('script[src*="fer-"]', { element(el) { el.remove(); } })
    .on('script[src*="fer_"]', { element(el) { el.remove(); } })
    .on("body", {
      element(el) {
        el.append('<script src="/one-v6624-ultrawide.js"></script>', { html: true });
        el.append('<script src="/one-v6619-startup-status.js"></script>', { html: true });
        el.append('<script src="/one-v661-idle-loader.js"></script>', { html: true });
      },
    })
    .transform(response);
}
