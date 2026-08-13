// ---- SVG rendering: background stars, connections, nodes, zoom/pan ----

const SVG_NS = "http://www.w3.org/2000/svg";
// Computed from the actual packed branch layout (see
// computeDefaultViewbox in library.js) rather than a fixed guess —
// grows and shrinks automatically as branches/nodes are added.
const VIEWBOX_DEFAULT = computeDefaultViewbox();

let viewBox = { ...VIEWBOX_DEFAULT };
let svg, nebulaLayer, starLayer, lineLayer, nodeLayer;
let onNodeClick = () => {};
const nodeGroups = {};

// Nebula/ghost titles counter-scale against zoom so they read as the
// same on-screen size whether you're fully zoomed out or partway in,
// instead of shrinking into illegibility (or ballooning) with the
// viewBox. Populated by renderNebulas/renderGhostBranch, applied by
// updateLabelScale — see MIN/MAX_ZOOM_W below for the reason it's
// tracked as a factor of svg.clientWidth rather than a fixed number.
const zoomScaledLabels = [];

function goToBranchInLibrary(branchId) {
  window.location.href = `pages/library.html?branch=${encodeURIComponent(branchId)}`;
}

// How big the core star gets as a node advances — growth is part of
// the "more lit up" feedback, not just opacity.
const STAGE_RADIUS = {
  locked: 6, unlockable: 7, curious: 7.5, learning: 8.5,
  comfortable: 9.5, solid: 10.5, mastered: 12
};

// Deterministic per-node delay so the idle "breathing" animation
// doesn't have every star pulsing in lockstep.
function hashDelay(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 1000;
  }
  return ((hash % 400) / 100).toFixed(2);
}

function createSvgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  return el;
}

function initGraph(svgEl, handlers) {
  svg = svgEl;
  onNodeClick = handlers.onNodeClick;

  // The viewBox is a square, but on a phone the map now fills a tall
  // narrow rectangle — "meet" (the desktop default) would letterbox
  // that with empty bars on either side, so it switches to "slice"
  // (crop-to-fill, like background-size:cover) below the same 760px
  // breakpoint everything else uses. Edges just get panned to rather
  // than shown all at once, which is fine for an explorable map.
  if (window.innerWidth <= 760) {
    svg.setAttribute("preserveAspectRatio", "xMidYMid slice");
  }

  nebulaLayer = createSvgEl("g", { class: "nebula-layer" });
  starLayer = createSvgEl("g", { class: "star-layer" });
  lineLayer = createSvgEl("g", { class: "line-layer" });
  nodeLayer = createSvgEl("g", { class: "node-layer" });
  svg.append(nebulaLayer, starLayer, lineLayer, nodeLayer);

  applyViewBox();
  renderNebulas();
  renderBackgroundStars();
  renderConnections();
  renderNodes();
  setupZoomPan();

  // applyViewBox() ran before the labels above existed (so it had
  // nothing to scale yet) and svg.clientWidth may not have been laid
  // out at that point either — settle both now that everything's in
  // the DOM, and keep them settled across orientation/window changes.
  updateLabelScale();
  window.addEventListener("resize", updateLabelScale);
}

// A soft tinted region behind each branch's cluster of stars, so the
// map reads as a handful of distinct "nebulas" (themes) rather than
// one undifferentiated field of dots. Sized to each branch's actual
// current bounding box, so it keeps making sense as nodes get added.
function renderNebulas() {
  const defs = createSvgEl("defs", {});
  svg.appendChild(defs);

  Object.keys(BRANCHES).forEach(branchId => {
    const nodes = ACTIVE_NODES.filter(n => n.branch === branchId);
    if (!nodes.length) {
      renderGhostBranch(branchId);
      return;
    }

    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs), maxX = Math.max(...xs);
    const minY = Math.min(...ys), maxY = Math.max(...ys);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    // Kept identical to NEBULA_ELLIPSE_PAD_X/Y and NEBULA_LABEL_Y_GAP in
    // library.js, which size branch packing around this exact shape —
    // changing these without changing those (and re-verifying) reopens
    // the label-overlap bug that padding was built to prevent.
    const rx = (maxX - minX) / 2 + NEBULA_ELLIPSE_PAD_X;
    const ry = (maxY - minY) / 2 + NEBULA_ELLIPSE_PAD_Y;
    const color = BRANCHES[branchId].color;

    const gradientId = `nebula-${branchId}`;
    const gradient = createSvgEl("radialGradient", { id: gradientId });
    const stopCenter = createSvgEl("stop", { offset: "0%" });
    stopCenter.style.stopColor = color;
    stopCenter.style.stopOpacity = "0.16";
    const stopEdge = createSvgEl("stop", { offset: "100%" });
    stopEdge.style.stopColor = color;
    stopEdge.style.stopOpacity = "0";
    gradient.append(stopCenter, stopEdge);
    defs.appendChild(gradient);

    const group = createSvgEl("g", { class: "nebula-group" });
    const titleEl = createSvgEl("title", {});
    titleEl.textContent = `${BRANCHES[branchId].label} — open in the library`;

    const blob = createSvgEl("ellipse", {
      cx, cy, rx, ry,
      class: "nebula",
      fill: `url(#${gradientId})`
    });

    // No floor-clamp here — each branch has its own local anchor now
    // (not a single shared coordinate system), so a flat minimum y was
    // a leftover from the old single-grid layout: for small/shallow
    // branches it silently pulled the title down from its correct spot
    // above the ellipse to right on top of the branch's own nodes.
    const label = createSvgEl("text", {
      x: cx, y: cy - ry + NEBULA_LABEL_Y_GAP,
      class: "nebula-label"
    });
    label.textContent = BRANCHES[branchId].label;
    label.style.fill = color;
    label.style.fontSize = `${NEBULA_LABEL_FONT_PX}px`;
    zoomScaledLabels.push({ el: label, basePx: NEBULA_LABEL_FONT_PX });

    group.append(titleEl, blob, label);
    group.addEventListener("click", () => goToBranchInLibrary(branchId));
    nebulaLayer.appendChild(group);
  });
}

// A faint, non-interactive hint that a branch exists but nothing's
// been added from it yet — so it's discoverable rather than simply
// absent from the map. Sits at that branch's library placement anchor.
function renderGhostBranch(branchId) {
  const anchor = BRANCH_ANCHORS[branchId] || { x: 600, y: 400 };
  const color = BRANCHES[branchId].color;

  const group = createSvgEl("g", { class: "ghost-branch" });

  const title = createSvgEl("title", {});
  title.textContent = `${BRANCHES[branchId].label} — nothing added yet. Tap to browse this branch in the library.`;

  const ring = createSvgEl("circle", { cx: anchor.x, cy: anchor.y, r: 26, class: "ghost-branch-ring" });
  ring.style.stroke = color;

  // Kept identical to GHOST_LABEL_Y_GAP in library.js — see the same
  // note on the active nebula label above.
  const label = createSvgEl("text", { x: anchor.x, y: anchor.y + GHOST_LABEL_Y_GAP, class: "ghost-branch-label" });
  label.textContent = BRANCHES[branchId].label;
  label.style.fill = color;
  label.style.fontSize = `${GHOST_LABEL_FONT_PX}px`;
  zoomScaledLabels.push({ el: label, basePx: GHOST_LABEL_FONT_PX });

  group.append(title, ring, label);
  group.addEventListener("click", () => goToBranchInLibrary(branchId));
  nebulaLayer.appendChild(group);
}

// Ratios of VIEWBOX_DEFAULT.w, not fixed pixel widths — so "zoomed in
// enough to show nodes" scales with however big the map actually is,
// rather than a number tuned for one specific canvas size that stops
// making sense once branches get added and the packed layout grows.
const LOD_NODES_RATIO = 0.4;
const LOD_LABELS_RATIO = 0.16;

// Zoomed all the way out: just the nebulas and their names, like
// glancing at a real star chart from a distance. Zoom in and the
// stars themselves fade in; get in close and their names do too —
// never all three at once, which is what kept text collisions
// possible no matter how carefully individual labels were spaced.
function updateZoomLOD() {
  svg.classList.toggle("lod-nodes", viewBox.w <= VIEWBOX_DEFAULT.w * LOD_NODES_RATIO);
  svg.classList.toggle("lod-labels", viewBox.w <= VIEWBOX_DEFAULT.w * LOD_LABELS_RATIO);
}

// SVG font-size lives in the same user-unit space as everything else,
// so it scales with the viewBox by default — zoom out and it visually
// shrinks, zoom in and it grows, same as any other shape. Recomputing
// each label's font-size in inverse proportion to the current zoom
// (in user-units per on-screen pixel) cancels that out, so nebula/
// ghost titles stay the same readable size on screen at any zoom
// level instead of shrinking away or ballooning as you zoom.
function updateLabelScale() {
  if (!svg.clientWidth) return;
  const unitsPerPixel = viewBox.w / svg.clientWidth;
  zoomScaledLabels.forEach(({ el, basePx }) => {
    el.style.fontSize = `${(basePx * unitsPerPixel).toFixed(2)}px`;
  });
}

function applyViewBox() {
  svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
  updateZoomLOD();
  updateLabelScale();
}

function resetView() {
  viewBox = { ...VIEWBOX_DEFAULT };
  applyViewBox();
}

// Faint, static, scattered dots for atmosphere. Purely decorative.
// Count is density-matched to VIEWBOX_DEFAULT's area (130 was tuned
// for the original 1200x750).
function renderBackgroundStars() {
  const count = Math.round(130 * ((VIEWBOX_DEFAULT.w * VIEWBOX_DEFAULT.h) / (1200 * 750)));
  for (let i = 0; i < count; i++) {
    const star = createSvgEl("circle", {
      // The packed layout can (and normally does) put the viewBox's
      // origin somewhere other than (0,0) — without adding x/y back
      // in, stars would only ever scatter across the top-left corner
      // of the actual visible canvas instead of the whole thing.
      cx: VIEWBOX_DEFAULT.x + Math.random() * VIEWBOX_DEFAULT.w,
      cy: VIEWBOX_DEFAULT.y + Math.random() * VIEWBOX_DEFAULT.h,
      r: (Math.random() * 1.1 + 0.3).toFixed(2),
      class: "bg-star"
    });
    star.style.opacity = (Math.random() * 0.3 + 0.08).toFixed(2);
    starLayer.appendChild(star);
  }
}

// A small deterministic offset per node pair, so the same two nodes
// always curve the same way — not perfectly straight, but not
// randomly different on every reload either.
function jitterFor(idA, idB) {
  const str = idA + idB;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) % 1000;
  }
  return (hash % 24) - 12;
}

function buildConnection(from, node) {
  const midX = (from.x + node.x) / 2;
  const midY = (from.y + node.y) / 2;
  const offset = jitterFor(from.id, node.id);

  const path = createSvgEl("path", {
    d: `M ${from.x} ${from.y} Q ${midX + offset} ${midY - offset} ${node.x} ${node.y}`,
    class: "connection",
    "data-to": node.id
  });
  path.style.strokeWidth = (1.1 + (Math.abs(offset) / 12) * 0.7).toFixed(2);
  return path;
}

function buildNodeGroup(node) {
  const branch = BRANCHES[node.branch];

  const group = createSvgEl("g", {
    class: "node",
    "data-id": node.id,
    "data-branch": node.branch,
    "data-stage": "locked",
    tabindex: "0",
    role: "button",
    "aria-label": node.name
  });

  const title = createSvgEl("title", { class: "node-title" });

  // A permanent dashed ring on root nodes (no dependencies) — the
  // entry points into each branch, visible at every stage including
  // locked, so it's obvious at a glance where each theme begins.
  const isRoot = node.dependsOn.length === 0;
  const startMarker = isRoot
    ? createSvgEl("circle", { cx: node.x, cy: node.y, r: 17, class: "node-start-marker" })
    : null;

  const burst = createSvgEl("circle", { cx: node.x, cy: node.y, r: 12, class: "node-burst" });
  const halo = createSvgEl("circle", { cx: node.x, cy: node.y, r: 24, class: "node-halo" });
  const ring = createSvgEl("circle", { cx: node.x, cy: node.y, r: 15, class: "node-ring" });
  const core = createSvgEl("circle", { cx: node.x, cy: node.y, r: 9, class: "node-core" });
  core.style.animationDelay = `${hashDelay(node.id)}s`;
  const dot = createSvgEl("circle", { cx: node.x + 12, cy: node.y - 12, r: 3, class: "node-branch-dot" });
  dot.style.fill = branch.color;

  const label = createSvgEl("text", { x: node.x, y: node.y + 22, class: "node-label" });
  label.textContent = node.name;

  group.append(title, ...(startMarker ? [startMarker] : []), burst, halo, ring, core, dot, label);
  group.addEventListener("click", () => onNodeClick(node.id));
  group.addEventListener("keydown", e => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onNodeClick(node.id);
    }
  });

  return group;
}

function renderConnections() {
  ACTIVE_NODES.forEach(node => {
    node.dependsOn.forEach(depId => {
      const from = ACTIVE_NODES.find(n => n.id === depId);
      if (!from) return;
      lineLayer.appendChild(buildConnection(from, node));
    });
  });
}

function renderNodes() {
  ACTIVE_NODES.forEach(node => {
    const group = buildNodeGroup(node);
    nodeLayer.appendChild(group);
    nodeGroups[node.id] = group;
  });
}

// Re-reads every node's effective stage and updates just the
// data-stage attribute on existing elements (rather than rebuilding
// the graph), so CSS transitions animate the change smoothly. Also
// hides each locked node's description from its hover tooltip, and
// marks connections leading into a locked node as "blocked".
function refreshNodeStates(progress) {
  ACTIVE_NODES.forEach(node => {
    const stage = effectiveStage(node, progress);
    const group = nodeGroups[node.id];
    group.setAttribute("data-stage", stage);
    group.querySelector(".node-core").setAttribute("r", STAGE_RADIUS[stage]);
    group.querySelector(".node-title").textContent = stage === "locked"
      ? node.name
      : `${node.name} — ${node.description}`;
  });

  lineLayer.querySelectorAll(".connection").forEach(path => {
    const target = ACTIVE_NODES.find(n => n.id === path.dataset.to);
    const blocked = target && effectiveStage(target, progress) === "locked";
    path.classList.toggle("blocked", blocked);
  });
}

// Removes a node (and any connection lines pointing into it) from the
// live graph and from ACTIVE_NODES itself. Only ever called for nodes
// with no remaining dependents — app.js is responsible for enforcing
// that before this runs.
function removeNodeFromGraph(nodeId) {
  const group = nodeGroups[nodeId];
  if (group) {
    group.remove();
    delete nodeGroups[nodeId];
  }

  lineLayer.querySelectorAll(`[data-to="${nodeId}"]`).forEach(path => path.remove());

  const index = ACTIVE_NODES.findIndex(n => n.id === nodeId);
  if (index !== -1) ACTIVE_NODES.splice(index, 1);
}

// A one-shot expanding ring, played when a node hits "mastered".
// Removing then re-adding the class forces the animation to restart
// even if it somehow got triggered twice in a row.
function celebrateNode(nodeId) {
  const group = nodeGroups[nodeId];
  if (!group) return;
  const burst = group.querySelector(".node-burst");
  burst.classList.remove("bursting");
  void burst.getBoundingClientRect();
  burst.classList.add("bursting");
}

// Dims everything except nodes whose name matches the search term,
// and gives matches a small glow so they're easy to spot at a glance.
// Returns whether anything matched, so the caller can show a "nothing
// found" hint for an empty result.
function applySearchFilter(term) {
  const q = term.trim().toLowerCase();
  let anyMatch = false;
  ACTIVE_NODES.forEach(node => {
    const group = nodeGroups[node.id];
    if (!q) {
      group.classList.remove("dimmed", "search-match");
    } else if (node.name.toLowerCase().includes(q)) {
      group.classList.add("search-match");
      group.classList.remove("dimmed");
      anyMatch = true;
    } else {
      group.classList.add("dimmed");
      group.classList.remove("search-match");
    }
  });
  return anyMatch;
}

function setupZoomPan() {
  let dragging = false;
  let last = { x: 0, y: 0 };
  let rect = null; // cached once per drag — see note below
  let panRAF = null;
  let pendingDx = 0;
  let pendingDy = 0;

  svg.addEventListener("wheel", e => {
    e.preventDefault();
    zoomAt(e.offsetX, e.offsetY, e.deltaY > 0 ? 1.1 : 0.9);
  }, { passive: false });

  svg.addEventListener("pointerdown", e => {
    // Same reason .node is excluded: setPointerCapture below retargets
    // the eventual pointerup (and the click derived from it) to the
    // svg root itself, which silently swallowed clicks on nebulas and
    // ghost branches before their own click listeners ever saw them.
    if (e.target.closest(".node") || e.target.closest(".nebula-group") || e.target.closest(".ghost-branch")) return;
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
    // Reading layout size once here, instead of on every pointermove,
    // avoids forcing a synchronous reflow on each of the dozens of
    // move events a single drag fires — that per-event reflow was
    // the actual source of the panning lag.
    rect = svg.getBoundingClientRect();
    svg.setPointerCapture(e.pointerId);
  });

  svg.addEventListener("pointermove", e => {
    if (!dragging) return;
    pendingDx += (e.clientX - last.x) * (viewBox.w / rect.width);
    pendingDy += (e.clientY - last.y) * (viewBox.h / rect.height);
    last = { x: e.clientX, y: e.clientY };

    // Coalesce every move since the last paint into one viewBox
    // update per frame, instead of writing to the DOM on every
    // single pointermove (which can fire faster than the screen
    // can actually repaint).
    if (panRAF === null) {
      panRAF = requestAnimationFrame(() => {
        viewBox.x -= pendingDx;
        viewBox.y -= pendingDy;
        pendingDx = 0;
        pendingDy = 0;
        applyViewBox();
        panRAF = null;
      });
    }
  });

  const endDrag = () => {
    dragging = false;
    rect = null;
  };

  svg.addEventListener("pointerup", endDrag);
  svg.addEventListener("pointerleave", endDrag);
  svg.addEventListener("dblclick", resetView);
}

// Min zoom is a fixed "close enough to read a few nodes" size,
// independent of how big the overall map is — max zoom is relative to
// VIEWBOX_DEFAULT instead of a fixed number, since that now varies
// with however many branches actually exist. Without this scaling,
// zooming "out" on a map bigger than the old hardcoded max would
// actually zoom IN, since the clamp would immediately shrink it back
// down below the default view.
const MIN_ZOOM_W = 320;
const MIN_ZOOM_H = 210;
const MAX_ZOOM_W = VIEWBOX_DEFAULT.w * 1.15;
const MAX_ZOOM_H = VIEWBOX_DEFAULT.h * 1.15;

function zoomAt(offsetX, offsetY, factor) {
  const scaleX = viewBox.w / svg.clientWidth;
  const scaleY = viewBox.h / svg.clientHeight;
  const svgX = viewBox.x + offsetX * scaleX;
  const svgY = viewBox.y + offsetY * scaleY;

  const newW = Math.min(Math.max(viewBox.w * factor, MIN_ZOOM_W), MAX_ZOOM_W);
  const newH = Math.min(Math.max(viewBox.h * factor, MIN_ZOOM_H), MAX_ZOOM_H);

  viewBox.x = svgX - (svgX - viewBox.x) * (newW / viewBox.w);
  viewBox.y = svgY - (svgY - viewBox.y) * (newH / viewBox.h);
  viewBox.w = newW;
  viewBox.h = newH;
  applyViewBox();
}

function zoomButton(factor) {
  zoomAt(svg.clientWidth / 2, svg.clientHeight / 2, factor);
}
