// ---- SVG rendering: background stars, connections, nodes, zoom/pan ----

const SVG_NS = "http://www.w3.org/2000/svg";
const VIEWBOX_DEFAULT = { x: 0, y: 0, w: 1200, h: 1200 };

let viewBox = { ...VIEWBOX_DEFAULT };
let svg, nebulaLayer, starLayer, lineLayer, nodeLayer;
let onNodeClick = () => {};
const nodeGroups = {};

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
    const rx = (maxX - minX) / 2 + 130;
    const ry = (maxY - minY) / 2 + 110;
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

    const blob = createSvgEl("ellipse", {
      cx, cy, rx, ry,
      class: "nebula",
      fill: `url(#${gradientId})`
    });
    nebulaLayer.appendChild(blob);

    const label = createSvgEl("text", {
      x: cx, y: Math.max(cy - ry + 26, 22),
      class: "nebula-label"
    });
    label.textContent = BRANCHES[branchId].label;
    label.style.fill = color;
    nebulaLayer.appendChild(label);
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
  title.textContent = `${BRANCHES[branchId].label} — nothing added yet. Browse the library to add your first node.`;

  const ring = createSvgEl("circle", { cx: anchor.x, cy: anchor.y, r: 26, class: "ghost-branch-ring" });
  ring.style.stroke = color;

  const label = createSvgEl("text", { x: anchor.x, y: anchor.y + 44, class: "ghost-branch-label" });
  label.textContent = BRANCHES[branchId].label;
  label.style.fill = color;

  group.append(title, ring, label);
  nebulaLayer.appendChild(group);
}

function applyViewBox() {
  svg.setAttribute("viewBox", `${viewBox.x} ${viewBox.y} ${viewBox.w} ${viewBox.h}`);
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
      cx: Math.random() * VIEWBOX_DEFAULT.w,
      cy: Math.random() * VIEWBOX_DEFAULT.h,
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
function applySearchFilter(term) {
  const q = term.trim().toLowerCase();
  ACTIVE_NODES.forEach(node => {
    const group = nodeGroups[node.id];
    if (!q) {
      group.classList.remove("dimmed", "search-match");
    } else if (node.name.toLowerCase().includes(q)) {
      group.classList.add("search-match");
      group.classList.remove("dimmed");
    } else {
      group.classList.add("dimmed");
      group.classList.remove("search-match");
    }
  });
}

function setupZoomPan() {
  let dragging = false;
  let last = { x: 0, y: 0 };

  svg.addEventListener("wheel", e => {
    e.preventDefault();
    zoomAt(e.offsetX, e.offsetY, e.deltaY > 0 ? 1.1 : 0.9);
  }, { passive: false });

  svg.addEventListener("pointerdown", e => {
    if (e.target.closest(".node")) return;
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
    svg.setPointerCapture(e.pointerId);
  });

  svg.addEventListener("pointermove", e => {
    if (!dragging) return;
    const scale = viewBox.w / svg.clientWidth;
    viewBox.x -= (e.clientX - last.x) * scale;
    viewBox.y -= (e.clientY - last.y) * scale;
    applyViewBox();
    last = { x: e.clientX, y: e.clientY };
  });

  svg.addEventListener("pointerup", () => { dragging = false; });
  svg.addEventListener("pointerleave", () => { dragging = false; });
  svg.addEventListener("dblclick", resetView);
}

function zoomAt(offsetX, offsetY, factor) {
  const scaleX = viewBox.w / svg.clientWidth;
  const scaleY = viewBox.h / svg.clientHeight;
  const svgX = viewBox.x + offsetX * scaleX;
  const svgY = viewBox.y + offsetY * scaleY;

  const newW = Math.min(Math.max(viewBox.w * factor, 300), 2200);
  const newH = Math.min(Math.max(viewBox.h * factor, 190), 1400);

  viewBox.x = svgX - (svgX - viewBox.x) * (newW / viewBox.w);
  viewBox.y = svgY - (svgY - viewBox.y) * (newH / viewBox.h);
  viewBox.w = newW;
  viewBox.h = newH;
  applyViewBox();
}

function zoomButton(factor) {
  zoomAt(svg.clientWidth / 2, svg.clientHeight / 2, factor);
}
