// ---- Side panel: node detail view + stage stepper + notes/evidence ----

let panelContainer;
let panelContentEl;
let panelBackdropEl;
let onStageChange = () => {};
let onProofAdd = () => {};
let onProofRemove = () => {};
let onRemoveNode = () => {};
let onQuantityChange = () => {};

function initPanel(el, handlers) {
  panelContainer = el;
  // The handle (js/edgeSwipeBack-style drag-to-dismiss — see the mobile
  // media query) needs a static sibling that never gets clobbered by a
  // render, so panel content renders into this inner container instead
  // of directly onto panelContainer. Every panelContainer.querySelector
  // call below still resolves fine — it searches all descendants, not
  // just direct children.
  panelContentEl = document.getElementById("panel-content") || panelContainer;
  panelBackdropEl = document.getElementById("panel-backdrop");
  onStageChange = handlers.onStageChange;
  onProofAdd = handlers.onProofAdd;
  onProofRemove = handlers.onProofRemove;
  onRemoveNode = handlers.onRemoveNode;
  onQuantityChange = handlers.onQuantityChange;

  if (panelBackdropEl) {
    panelBackdropEl.addEventListener("click", closePanel);
  }

  setupPanelDrag();
}

// Drag-to-dismiss on the mobile bottom-sheet's grab handle — a real
// native bottom-sheet convention that was otherwise entirely missing
// (the panel could only be closed via the × button or a backdrop tap).
// Attached only to .panel-handle, not the whole panel, so it never
// competes with scrolling the panel's own notes/evidence content.
function setupPanelDrag() {
  if (window.innerWidth > 760) return;
  const handle = document.querySelector(".panel-handle");
  if (!handle) return;

  const THRESHOLD = 80;
  let dragging = false;
  let startY = 0;
  let dy = 0;

  handle.addEventListener("pointerdown", e => {
    dragging = true;
    startY = e.clientY;
    dy = 0;
    panelContainer.classList.add("dragging");
  });

  handle.addEventListener("pointermove", e => {
    if (!dragging) return;
    dy = Math.max(0, e.clientY - startY);
    panelContainer.style.transform = `translateY(${dy}px)`;
  });

  const endDrag = () => {
    if (!dragging) return;
    dragging = false;
    panelContainer.classList.remove("dragging");
    panelContainer.style.transform = "";
    if (dy >= THRESHOLD) closePanel();
  };

  handle.addEventListener("pointerup", endDrag);
  handle.addEventListener("pointercancel", endDrag);
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// A dependency can point at a library node that hasn't actually been
// added to the map yet (that's allowed — see library.js), so it won't
// be in ACTIVE_NODES. Falling back to the full catalog here is what
// keeps the panel from crashing on those instead of just not opening.
function findAnyNode(id) {
  return ACTIVE_NODES.find(n => n.id === id)
    || NODES.find(n => n.id === id)
    || LIBRARY_NODES.find(n => n.id === id);
}

function stageDotsHtml(stage) {
  const currentIdx = VISIBLE_STAGES.indexOf(stage);
  return VISIBLE_STAGES.map((s, i) => `
    <span class="stage-dot ${currentIdx >= 0 && i <= currentIdx ? "filled" : ""}"></span>
  `).join("");
}

// Locked nodes deliberately show almost nothing — just enough to know
// what it's called and what's blocking it, not what it's about.
// Description, depends-on/unlocks, notes, and evidence all stay
// hidden until it's actually reachable.
function renderLockedPanel(node, progress) {
  const missing = node.dependsOn
    .map(id => findAnyNode(id))
    .filter(d => d && effectiveStage(d, progress) !== "mastered");

  return `
    <button class="panel-close" aria-label="Close panel">&times;</button>
    <h2 class="panel-title panel-title-locked">${node.name}</h2>
    <p class="panel-locked-note">
      Locked — requires ${missing.map(d => `<strong>${d.name}</strong>`).join(", ")} to be mastered first.
    </p>
  `;
}

function renderUnlockedPanel(node, entry, stage, progress) {
  const deps = node.dependsOn.map(id => findAnyNode(id)).filter(Boolean);
  const unlocks = ACTIVE_NODES.filter(n => n.dependsOn.includes(node.id));

  return `
    <button class="panel-close" aria-label="Close panel">&times;</button>
    <div class="panel-branch" style="color:${BRANCHES[node.branch].color}">${BRANCHES[node.branch].label}</div>
    <h2 class="panel-title">${node.name}</h2>
    <p class="panel-desc">${node.description}</p>

    <div class="panel-stage">
      <div>
        <span class="stage-label" data-stage="${stage}">${STAGE_LABELS[stage]}</span>
        ${node.quantityLabel ? `
          <input
            type="text"
            class="stage-quantity"
            placeholder="e.g. 50 ${node.quantityLabel}"
            value="${entry.quantity || ""}"
          >
        ` : ""}
        <div class="stage-dots">${stageDotsHtml(stage)}</div>
      </div>
      <div class="stage-controls">
        <button class="stage-btn" data-dir="down" ${canRegress(stage) ? "" : "disabled"} aria-label="Regress stage">&larr;</button>
        <button class="stage-btn" data-dir="up" ${canAdvance(stage) ? "" : "disabled"} aria-label="Advance stage">&rarr;</button>
      </div>
    </div>

    ${entry.updatedAt ? `<p class="panel-updated">Last updated ${formatDate(entry.updatedAt)}</p>` : ""}

    ${deps.length ? `
      <div class="panel-section">
        <h3>Depends on</h3>
        <ul class="panel-list">
          ${deps.map(d => `
            <li class="${effectiveStage(d, progress) === "mastered" ? "is-mastered" : ""}">${d.name}</li>
          `).join("")}
        </ul>
      </div>
    ` : ""}

    ${unlocks.length ? `
      <div class="panel-section">
        <h3>Unlocks</h3>
        <ul class="panel-list">
          ${unlocks.map(u => `<li>${u.name}</li>`).join("")}
        </ul>
      </div>
    ` : ""}

    <div class="panel-section">
      <h3>Notes</h3>
      <a href="obsidian://" class="btn-link panel-notes-link">Open in Obsidian</a>
    </div>

    <div class="panel-section">
      <h3>Evidence of progress</h3>
      <ul class="proof-list">
        ${entry.proof.map((p, i) => `
          <li class="proof-item">
            <div>
              <p class="proof-text">${p.text}</p>
              <p class="proof-date">${formatDate(p.date)}</p>
            </div>
            <button class="proof-remove" data-index="${i}" aria-label="Remove entry">&times;</button>
          </li>
        `).join("") || `<li class="proof-empty">Nothing logged yet.</li>`}
      </ul>
      <div class="proof-add">
        <input type="text" class="proof-input" placeholder="e.g. Built a small project with this">
        <button type="button" class="proof-add-btn">Add</button>
      </div>
    </div>

    <div class="panel-section panel-section-remove">
      ${unlocks.length ? `
        <p class="panel-remove-blocked">
          Can't remove — required by ${unlocks.map(u => `<strong>${u.name}</strong>`).join(", ")}.
        </p>
      ` : `
        <button type="button" class="panel-remove-btn btn-danger">Remove from map</button>
      `}
    </div>
  `;
}

function openPanel(nodeId, progress) {
  const node = ACTIVE_NODES.find(n => n.id === nodeId);
  const entry = progress[nodeId] || { stage: "locked", notes: "", proof: [], updatedAt: null, quantity: "" };
  const stage = effectiveStage(node, progress);
  const isLocked = stage === "locked";

  panelContentEl.innerHTML = isLocked
    ? renderLockedPanel(node, progress)
    : renderUnlockedPanel(node, entry, stage, progress);

  panelContainer.querySelector(".panel-close").addEventListener("click", closePanel);

  panelContainer.querySelectorAll(".stage-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const newStage = btn.dataset.dir === "up" ? advanceStage(stage) : regressStage(stage);
      onStageChange(node.id, newStage);
    });
  });

  const quantityEl = panelContainer.querySelector(".stage-quantity");
  if (quantityEl) {
    quantityEl.addEventListener("input", () => onQuantityChange(node.id, quantityEl.value));
  }

  const proofInput = panelContainer.querySelector(".proof-input");
  const addProof = () => {
    const value = proofInput.value.trim();
    if (!value) return;
    onProofAdd(node.id, value);
  };
  const addBtn = panelContainer.querySelector(".proof-add-btn");
  if (addBtn) {
    addBtn.addEventListener("click", addProof);
    proofInput.addEventListener("keydown", e => {
      if (e.key === "Enter") {
        e.preventDefault();
        addProof();
      }
    });
  }

  panelContainer.querySelectorAll(".proof-remove").forEach(btn => {
    btn.addEventListener("click", () => onProofRemove(node.id, Number(btn.dataset.index)));
  });

  const removeBtn = panelContainer.querySelector(".panel-remove-btn");
  if (removeBtn) {
    removeBtn.addEventListener("click", () => onRemoveNode(node.id));
  }

  panelContainer.classList.add("open");
  panelContainer.dataset.openNode = nodeId;
  if (panelBackdropEl) panelBackdropEl.classList.add("visible");
}

function closePanel() {
  panelContainer.classList.remove("open");
  delete panelContainer.dataset.openNode;
  if (panelBackdropEl) panelBackdropEl.classList.remove("visible");
}
