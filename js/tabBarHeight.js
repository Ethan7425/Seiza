// ---- Keeps --tab-bar-height in sync with the tab bar's real,
// rendered height ----
// A hardcoded guess (e.g. "64px") can silently drift from the actual
// height on a real device: a longer home-indicator safe-area inset,
// larger accessibility text settings, or a label wrapping to two
// lines are all things desktop responsive-mode testing never
// simulates. Everything that needs to sit exactly above the tab bar
// (the page's own bottom padding, the side panel) reads this CSS
// variable instead of a magic number, so it can never fall out of
// sync with what's actually on screen.
(function () {
  const tabBar = document.querySelector(".tab-bar");
  if (!tabBar) return;

  function updateHeight() {
    document.documentElement.style.setProperty("--tab-bar-height", `${tabBar.offsetHeight}px`);
  }

  updateHeight();
  window.addEventListener("resize", updateHeight);
  if (window.ResizeObserver) {
    new ResizeObserver(updateHeight).observe(tabBar);
  }
})();
