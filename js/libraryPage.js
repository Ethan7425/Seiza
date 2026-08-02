// ---- Library page: browse and add skills that aren't on your map yet ----

let libraryContainer;
let libraryResultsEl;
let onAddNode = () => {};
let isNodeAdded = () => false;
let librarySearchTerm = "";

function initLibraryPage(container, handlers) {
  libraryContainer = container;
  onAddNode = handlers.onAdd;
  isNodeAdded = handlers.isAdded;
  librarySearchTerm = "";

  libraryContainer.innerHTML = `
    <h2>Skill Library</h2>
    <p class="library-intro">Skills you haven't added to your map yet. Pull in the ones you want to start tracking — more get added to this list over time.</p>
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

function renderLibraryResults() {
  const term = librarySearchTerm.trim().toLowerCase();

  const groups = Object.keys(BRANCHES).map(branchId => ({
    branchId,
    items: LIBRARY_NODES.filter(n => n.branch === branchId && (
      !term || n.name.toLowerCase().includes(term) || n.description.toLowerCase().includes(term)
    ))
  })).filter(g => g.items.length > 0);

  libraryResultsEl.innerHTML = groups.length ? groups.map(g => `
    <div class="library-group">
      <h3 style="color:${BRANCHES[g.branchId].color}">${BRANCHES[g.branchId].label}</h3>
      <ul class="library-list">
        ${g.items.map(n => `
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
    </div>
  `).join("") : `<p class="library-empty">No skills match "${librarySearchTerm}".</p>`;

  libraryResultsEl.querySelectorAll(".library-add-btn").forEach(btn => {
    btn.addEventListener("click", () => onAddNode(btn.dataset.id));
  });
}

// Called after a node is added so button states ("Add" -> "Added")
// refresh without losing whatever the user typed in the search box.
function refreshLibraryResults() {
  if (libraryResultsEl) renderLibraryResults();
}
