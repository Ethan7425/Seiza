// ---- Library page: browse and add skills that aren't on your map yet ----
// Default view is a grid of branch cards (click one to preview what's
// inside); typing in the search box switches to a flat, cross-branch
// list of matching nodes instead, same as before search existed.

let libraryContainer;
let libraryResultsEl;
let onAddNode = () => {};
let onAddBranch = () => {};
let isNodeAdded = () => false;
let librarySearchTerm = "";
let selectedBranchId = null;

function initLibraryPage(container, handlers) {
  libraryContainer = container;
  onAddNode = handlers.onAdd;
  onAddBranch = handlers.onAddBranch;
  isNodeAdded = handlers.isAdded;
  librarySearchTerm = "";
  selectedBranchId = null;

  libraryContainer.innerHTML = `
    <h2>Skill Library</h2>
    <p class="library-intro">Skills you haven't added to your map yet, organized by branch. Tap a branch to see what's inside, or search across all of them.</p>
    <input type="text" id="library-search-input" class="library-search-input" placeholder="Search skills...">
    <div id="library-results" class="library-groups"></div>
  `;

  libraryResultsEl = libraryContainer.querySelector("#library-results");
  libraryContainer.querySelector("#library-search-input").addEventListener("input", e => {
    librarySearchTerm = e.target.value;
    renderLibraryResults();
  });

  renderLibraryResults();
}

function branchNodeItemsHtml(items) {
  return `
    <ul class="library-list">
      ${items.map(n => `
        <li class="library-item">
          <div>
            <p class="library-item-name">${n.name}</p>
            <p class="library-item-desc">${n.description}</p>
          </div>
          <button class="library-add-btn" data-id="${n.id}" ${isNodeAdded(n.id) ? "disabled" : ""}>
            ${isNodeAdded(n.id) ? "Added" : "Add"}
          </button>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderLibraryResults() {
  const term = librarySearchTerm.trim().toLowerCase();

  if (term) {
    renderSearchResults(term);
  } else if (selectedBranchId) {
    renderBranchPreview(selectedBranchId);
  } else {
    renderBranchGrid();
  }
}

// Same flat, grouped-by-branch results search has always given —
// searching intentionally cuts across branches rather than requiring
// you to already be looking at the right one.
function renderSearchResults(term) {
  const groups = Object.keys(BRANCHES).map(branchId => ({
    branchId,
    items: LIBRARY_NODES.filter(n => n.branch === branchId && (
      n.name.toLowerCase().includes(term) || n.description.toLowerCase().includes(term)
    ))
  })).filter(g => g.items.length > 0);

  libraryResultsEl.innerHTML = groups.length ? groups.map(g => `
    <div class="library-group">
      <h3 style="color:${BRANCHES[g.branchId].color}">
        <span class="branch-dot" style="background:${BRANCHES[g.branchId].color}"></span>
        ${BRANCHES[g.branchId].label}
      </h3>
      ${branchNodeItemsHtml(g.items)}
    </div>
  `).join("") : `<p class="library-empty">No skills match "${librarySearchTerm}".</p>`;

  wireAddButtons();
}

function renderBranchGrid() {
  const cards = Object.keys(BRANCHES)
    .map(branchId => ({ branchId, items: LIBRARY_NODES.filter(n => n.branch === branchId) }))
    .filter(g => g.items.length > 0);

  libraryResultsEl.innerHTML = `
    <div class="library-branch-grid">
      ${cards.map(g => {
        const branch = BRANCHES[g.branchId];
        const addedCount = g.items.filter(n => isNodeAdded(n.id)).length;
        return `
          <button type="button" class="library-branch-card" data-branch="${g.branchId}" style="--branch-color:${branch.color}">
            <span class="branch-dot" style="background:${branch.color}"></span>
            <span class="library-branch-card-label">${branch.label}</span>
            <span class="library-branch-card-count">${addedCount ? `${addedCount}/${g.items.length} added` : `${g.items.length} skill${g.items.length === 1 ? "" : "s"}`}</span>
          </button>
        `;
      }).join("")}
    </div>
  `;

  libraryResultsEl.querySelectorAll(".library-branch-card").forEach(card => {
    card.addEventListener("click", () => {
      selectedBranchId = card.dataset.branch;
      renderLibraryResults();
    });
  });
}

function renderBranchPreview(branchId) {
  const branch = BRANCHES[branchId];
  const items = LIBRARY_NODES.filter(n => n.branch === branchId);
  const remaining = items.filter(n => !isNodeAdded(n.id));

  libraryResultsEl.innerHTML = `
    <button type="button" class="library-branch-back">&larr; All branches</button>
    <div class="library-group">
      <div class="library-branch-preview-head">
        <h3 style="color:${branch.color}">
          <span class="branch-dot" style="background:${branch.color}"></span>
          ${branch.label}
        </h3>
        <button type="button" class="library-add-branch-btn" ${remaining.length ? "" : "disabled"}>
          ${remaining.length ? `Add all (${remaining.length})` : "All added"}
        </button>
      </div>
      ${items.some(n => n.dependsOn.some(id => items.some(i => i.id === id))) ? `
        <p class="library-branch-note">Some of these depend on each other — adding the whole branch at once avoids one getting stuck waiting on a sibling you never added.</p>
      ` : ""}
      ${branchNodeItemsHtml(items)}
    </div>
  `;

  libraryResultsEl.querySelector(".library-branch-back").addEventListener("click", () => {
    selectedBranchId = null;
    renderLibraryResults();
  });

  if (remaining.length) {
    libraryResultsEl.querySelector(".library-add-branch-btn").addEventListener("click", () => onAddBranch(branchId));
  }

  wireAddButtons();
}

function wireAddButtons() {
  libraryResultsEl.querySelectorAll(".library-add-btn").forEach(btn => {
    btn.addEventListener("click", () => onAddNode(btn.dataset.id));
  });
}

// Called after a node is added so button states ("Add" -> "Added")
// refresh without losing whatever the user typed in the search box or
// which branch they had open.
function refreshLibraryResults() {
  if (libraryResultsEl) renderLibraryResults();
}
