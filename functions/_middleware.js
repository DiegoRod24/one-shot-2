export async function onRequest(context) {
  const response = await context.next();
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  return new HTMLRewriter()
    .on("head", {
      element(el) {
        el.append('<link rel="stylesheet" href="/one-dropbox-sync.css">', { html: true });
        el.append('<link rel="stylesheet" href="/one-phase2-edit-center.css">', { html: true });
      },
    })
    .on("body", {
      element(el) {
        el.append('<script src="/one-dropbox-sync.js"></script>', { html: true });
        el.append('<script src="/one-sync-worker-mode.js"></script>', { html: true });
        el.append('<script src="/one-phase2-edit-center.js"></script>', { html: true });
      },
    })
    .transform(response);
}
