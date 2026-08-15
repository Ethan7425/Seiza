// ---- Entry point for the map page (index.html) ----

// iOS Safari has never implemented the Vibration API, even installed
// as a PWA — feature-detected so it's just silently a no-op there.
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

(async () => {
  const state = await loadState();
  if (!state) {
    location.href = "pages/welcome.html";
    return;
  }
  runMapPage(state);
})();

function runMapPage(state) {
  const profileNameEl = document.getElementById("profile-name");
  const overallProgressEl = document.getElementById("overall-progress");
  const branchProgressEl = document.getElementById("branch-progress");
  const svgEl = document.getElementById("star-map");
  const panelEl = document.getElementById("side-panel");
  const toastContainerEl = document.getElementById("toast-container");
  const mapSearchInput = document.getElementById("map-search-input");
  const learningToggleBtn = document.getElementById("learning-toggle");
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");

  ACTIVE_NODES = buildActiveNodes(state);
  profileNameEl.textContent = state.profileName;

  // Seeded with whatever's already unlocked at load — only achievements
  // earned *after* this point should get a toast, not everything you
  // already qualified for before this feature existed.
  let unlockedAchievementIds = new Set(getUnlockedAchievements(state, ACTIVE_NODES).map(a => a.id));

  initGraph(svgEl, { onNodeClick: nodeId => openPanel(nodeId, state.progress) });
  initPanel(panelEl, {
    onStageChange: handleStageChange,
    onProofAdd: handleProofAdd,
    onProofRemove: handleProofRemove,
    onRemoveNode: handleRemoveNode,
    onQuantityChange: handleQuantityChange
  });
  initToasts(toastContainerEl);
  refreshAll();

  function handleStageChange(nodeId, newStage) {
    const unlockedBefore = new Set(
      ACTIVE_NODES.filter(n => effectiveStage(n, state.progress) !== "locked").map(n => n.id)
    );
    const oldStage = state.progress[nodeId].stage;

    state.progress[nodeId].stage = newStage;
    state.progress[nodeId].updatedAt = new Date().toISOString();
    saveState(state);
    refreshAll();
    openPanel(nodeId, state.progress);

    // A short buzz on every step up (not just mastery) — the small
    // "yes, that counted" feedback matters more day-to-day than the
    // one-time celebration. Regress doesn't buzz, only forward moves.
    if (PROGRESS_STAGES.indexOf(newStage) > PROGRESS_STAGES.indexOf(oldStage)) {
      vibrate(newStage === "mastered" ? [20, 40, 20] : 15);
    }

    if (newStage === "mastered") {
      const node = ACTIVE_NODES.find(n => n.id === nodeId);
      showToast(`✦ ${node.name} mastered`, "mastered");
      celebrateNode(nodeId);
    }

    ACTIVE_NODES.forEach(n => {
      if (!unlockedBefore.has(n.id) && effectiveStage(n, state.progress) !== "locked") {
        showToast(`${n.name} unlocked`, "unlocked");
      }
    });
  }

  function handleQuantityChange(nodeId, text) {
    state.progress[nodeId].quantity = text;
    saveState(state);
  }

  function handleProofAdd(nodeId, text) {
    state.progress[nodeId].proof.push({ text, date: new Date().toISOString() });
    saveState(state);
    openPanel(nodeId, state.progress);
  }

  function handleProofRemove(nodeId, index) {
    state.progress[nodeId].proof.splice(index, 1);
    saveState(state);
    openPanel(nodeId, state.progress);
  }

  function handleRemoveNode(nodeId) {
    const node = ACTIVE_NODES.find(n => n.id === nodeId);
    if (!node) return;

    const dependents = ACTIVE_NODES.filter(n => n.dependsOn.includes(nodeId));
    if (dependents.length) return;

    const confirmed = confirm(
      `Remove "${node.name}" from your map? This deletes its progress, notes, and evidence log. This can't be undone.`
    );
    if (!confirmed) return;

    delete state.progress[nodeId];
    delete state.nodePositions[nodeId];
    state.addedLibraryIds = state.addedLibraryIds.filter(id => id !== nodeId);
    state.addedCoreNodeIds = state.addedCoreNodeIds.filter(id => id !== nodeId);
    saveState(state);

    removeNodeFromGraph(nodeId);
    closePanel();
    refreshAll();
  }

  function refreshAll() {
    refreshNodeStates(state.progress);
    renderProgressSummary();
    checkAchievements();
  }

  function checkAchievements() {
    getUnlockedAchievements(state, ACTIVE_NODES).forEach(a => {
      if (!unlockedAchievementIds.has(a.id)) {
        unlockedAchievementIds.add(a.id);
        showToast(`★ Achievement: ${a.name}`, "mastered");
      }
    });
  }

  function renderProgressSummary() {
    overallProgressEl.textContent = `${computeOverallProgress(state.progress)}% mastered`;

    branchProgressEl.innerHTML = computeBranchProgress(state.progress).map(b => `
      <div class="branch-bar">
        <div class="branch-bar-label">
          <span class="branch-dot" style="background:${b.color}"></span>
          ${b.label}
          <span class="branch-bar-pct">${b.percent}%</span>
        </div>
        <div class="branch-bar-track">
          <div class="branch-bar-fill" style="width:${b.percent}%; background:${b.color}; color:${b.color}"></div>
        </div>
      </div>
    `).join("");
  }

  zoomInBtn.addEventListener("click", () => zoomButton(0.85));
  zoomOutBtn.addEventListener("click", () => zoomButton(1.18));

  const searchEmptyEl = document.getElementById("map-search-empty");
  const searchEmptyTermEl = document.getElementById("map-search-empty-term");

  mapSearchInput.addEventListener("input", () => {
    const term = mapSearchInput.value.trim();
    const found = applySearchFilter(term);
    if (term && !found) {
      searchEmptyTermEl.textContent = term;
      searchEmptyEl.hidden = false;
    } else {
      searchEmptyEl.hidden = true;
    }
  });

  learningToggleBtn.addEventListener("click", () => {
    const on = learningToggleBtn.getAttribute("aria-pressed") !== "true";
    learningToggleBtn.setAttribute("aria-pressed", String(on));
    setLearningMode(on);
  });
}
