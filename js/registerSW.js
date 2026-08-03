// ---- Registers sw.js, wherever the current page happens to live ----
// No-ops silently if service workers aren't supported here (e.g. when
// running via file://, which can't use them at all) — this is a
// progressive enhancement, not something anything else depends on.

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    const swUrl = location.pathname.includes("/pages/") ? "../sw.js" : "sw.js";
    try {
      const registration = await navigator.serviceWorker.register(swUrl);
      // Ask right away instead of waiting on the browser's own (often
      // very lazy — especially for an installed PWA on iOS) update
      // check timing. Cheap no-op if there's nothing new.
      registration.update();
    } catch (e) {
      // no-op
    }
  });

  // sw.js already calls skipWaiting()/clients.claim(), so a new
  // version takes over almost immediately once found — but the page
  // that's already open is still running old JS in memory until it
  // reloads. Without this, an update can install successfully in the
  // background and still look like nothing happened until the next
  // manual refresh.
  let reloadedForUpdate = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (reloadedForUpdate) return;
    reloadedForUpdate = true;
    location.reload();
  });
}
