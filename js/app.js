// ---- Entry point for the map page (index.html) ----

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
  const zoomInBtn = document.getElementById("zoom-in");
  const zoomOutBtn = document.getElementById("zoom-out");

  ACTIVE_NODES = buildActiveNodes(state);
  profileNameEl.textContent = state.profileName;

  initGraph(svgEl, { onNodeClick: nodeId => openPanel(nodeId, state.progress) });
  initPanel(panelEl, {
    onStageChange: handleStageChange,
    onNotesChange: handleNotesChange,
    onProofAdd: handleProofAdd,
    onProofRemove: handleProofRemove,
    onRemoveNode: handleRemoveNode,
    isCoreNode: nodeId => NODES.some(n => n.id === nodeId)
  });
  initToasts(toastContainerEl);
  refreshAll();

  function handleStageChange(nodeId, newStage) {
    const unlockedBefore = new Set(
      ACTIVE_NODES.filter(n => effectiveStage(n, state.progress) !== "locked").map(n => n.id)
    );

    state.progress[nodeId].stage = newStage;
    state.progress[nodeId].updatedAt = new Date().toISOString();
    saveState(state);
    refreshAll();
    openPanel(nodeId, state.progress);

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

  function handleNotesChange(nodeId, text) {
    state.progress[nodeId].notes = text;
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
    saveState(state);

    removeNodeFromGraph(nodeId);
    closePanel();
    refreshAll();
  }

  function refreshAll() {
    refreshNodeStates(state.progress);
    renderProgressSummary();
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

  profileNameEl.addEventListener("click", () => {
    const next = prompt("Rename your profile:", state.profileName);
    if (next && next.trim()) {
      state.profileName = next.trim();
      saveState(state);
      profileNameEl.textContent = state.profileName;
    }
  });

  zoomInBtn.addEventListener("click", () => zoomButton(0.85));
  zoomOutBtn.addEventListener("click", () => zoomButton(1.18));

  mapSearchInput.addEventListener("input", () => applySearchFilter(mapSearchInput.value));
}
