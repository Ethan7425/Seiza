// ---- Registers sw.js, wherever the current page happens to live ----
// No-ops silently if service workers aren't supported here (e.g. when
// running via file://, which can't use them at all) — this is a
// progressive enhancement, not something anything else depends on.

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    const swUrl = location.pathname.includes("/pages/") ? "../sw.js" : "sw.js";
    navigator.serviceWorker.register(swUrl).catch(() => {});
  });
}
