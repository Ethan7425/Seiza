// ---- Edge-swipe-back (standalone PWA only) ----
// A Home Screen-launched PWA has no browser chrome at all, so there's
// no back button and no system back-gesture — the only way back today
// is tapping the small .back-link text at the top of the page. This
// mirrors iOS's own edge-swipe-back for that one case.
//
// Deliberately inert everywhere else: opened as a normal Safari tab,
// iOS already owns left-edge-swipe-back natively, and a second gesture
// competing for the same edge would just fight it. window.navigator
// .standalone is the iOS-specific signal; display-mode is the
// cross-browser equivalent, checked as a fallback.
(function () {
  if (window.innerWidth > 760) return;

  const isStandalone = window.navigator.standalone === true
    || window.matchMedia("(display-mode: standalone)").matches;
  if (!isStandalone) return;

  const backLink = document.querySelector(".back-link");
  const wrapper = document.querySelector(".centered-page, .admin-wrap");
  if (!backLink || !wrapper) return;

  const EDGE_ZONE = 24;
  const THRESHOLD = 80;
  const MAX_DRAG = 140;

  let tracking = false; // a gesture started in the edge zone, not yet classified
  let deciding = false; // classified as tracking, but not yet committed to horizontal
  let startX = 0;
  let startY = 0;
  let dx = 0;
  let buzzed = false;

  wrapper.addEventListener("pointerdown", e => {
    if (e.clientX > EDGE_ZONE) return;
    tracking = true;
    deciding = true;
    startX = e.clientX;
    startY = e.clientY;
    dx = 0;
    buzzed = false;
  });

  wrapper.addEventListener("pointermove", e => {
    if (!tracking) return;
    const curDx = e.clientX - startX;
    const curDy = e.clientY - startY;

    if (deciding) {
      if (Math.abs(curDx) < 10 && Math.abs(curDy) < 10) return;
      // Mostly vertical — this is a scroll, not a back-swipe. Bail out
      // without ever touching the transform, so the page's own
      // overflow-y:auto scrolling behaves exactly as it always has.
      if (Math.abs(curDy) > Math.abs(curDx) * 1.5) {
        tracking = false;
        return;
      }
      deciding = false;
      wrapper.classList.add("dragging");
    }

    e.preventDefault();
    dx = Math.min(Math.max(0, curDx), MAX_DRAG);
    wrapper.style.transform = `translateX(${dx}px)`;

    if (dx >= THRESHOLD && !buzzed) {
      buzzed = true;
      if (navigator.vibrate) navigator.vibrate(10);
    }
  });

  const endDrag = () => {
    if (!tracking) return;
    tracking = false;
    if (deciding) return; // never committed to a horizontal drag — nothing to undo

    wrapper.classList.remove("dragging");
    if (dx >= THRESHOLD) {
      window.location.href = backLink.href;
      return;
    }
    wrapper.style.transform = "";
  };

  wrapper.addEventListener("pointerup", endDrag);
  wrapper.addEventListener("pointercancel", endDrag);
})();
