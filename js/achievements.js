// ---- Achievements ----
// Every achievement is a pure function over state + the current map —
// nothing new gets stored, "unlocked" is just recomputed each time.
// That keeps this safe to extend (add to the list any time, no
// migration needed) and safe to call often (cheap to evaluate).

function startedNodes(state, nodes) {
  return nodes.filter(n => {
    const stage = effectiveStage(n, state.progress);
    return stage !== "locked" && stage !== "unlockable";
  });
}

function masteredNodes(state, nodes) {
  return nodes.filter(n => effectiveStage(n, state.progress) === "mastered");
}

const ACHIEVEMENTS = [
  {
    id: "first-light",
    name: "First Light",
    description: "Master your first node.",
    check: (state, nodes) => masteredNodes(state, nodes).length >= 1
  },
  {
    id: "getting-started",
    name: "Getting Started",
    description: "Reach curious or beyond on 5 nodes.",
    check: (state, nodes) => startedNodes(state, nodes).length >= 5
  },
  {
    id: "century",
    name: "Century",
    description: "Master 10 nodes.",
    check: (state, nodes) => masteredNodes(state, nodes).length >= 10
  },
  {
    id: "constellation-complete",
    name: "Constellation Complete",
    description: "Master every node currently on your map.",
    check: (state, nodes) => nodes.length > 0 && masteredNodes(state, nodes).length === nodes.length
  },
  {
    id: "branch-explorer",
    name: "Branch Explorer",
    description: "Start learning something in 3 different branches.",
    check: (state, nodes) => new Set(startedNodes(state, nodes).map(n => n.branch)).size >= 3
  },
  {
    id: "renaissance",
    name: "Renaissance",
    description: "Start learning something in every branch on your map.",
    check: (state, nodes) => {
      const allBranches = new Set(nodes.map(n => n.branch));
      const startedBranches = new Set(startedNodes(state, nodes).map(n => n.branch));
      return allBranches.size > 0 && [...allBranches].every(b => startedBranches.has(b));
    }
  },
  {
    id: "deep-diver",
    name: "Deep Diver",
    description: "Master 4 or more nodes within a single branch.",
    check: (state, nodes) => {
      const counts = {};
      masteredNodes(state, nodes).forEach(n => { counts[n.branch] = (counts[n.branch] || 0) + 1; });
      return Object.values(counts).some(c => c >= 4);
    }
  },
  {
    id: "collector",
    name: "Collector",
    description: "Add 5 nodes from the library to your map.",
    check: state => state.addedLibraryIds.length >= 5
  },
  {
    id: "cartographer",
    name: "Cartographer",
    description: "Add 10 nodes from the library to your map.",
    check: state => state.addedLibraryIds.length >= 10
  },
  {
    id: "note-taker",
    name: "Note Taker",
    description: "Write notes on 5 different nodes.",
    check: state => Object.values(state.progress).filter(e => e.notes && e.notes.trim()).length >= 5
  },
  {
    id: "evidence-based",
    name: "Evidence-Based",
    description: "Log 10 pieces of evidence, across any nodes.",
    check: state => Object.values(state.progress).reduce((sum, e) => sum + (e.proof ? e.proof.length : 0), 0) >= 10
  },
  {
    id: "quantifier",
    name: "Quantifier",
    description: `Track a quantity — like "200 kanji known" — on 3 different nodes.`,
    check: state => Object.values(state.progress).filter(e => e.quantity && e.quantity.trim()).length >= 3
  }
];

function getUnlockedAchievements(state, nodes) {
  return ACHIEVEMENTS.filter(a => a.check(state, nodes));
}
