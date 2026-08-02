// ---- Stage logic ----
// This file has no DOM code and no localStorage code — it's pure
// functions over node data + a progress map. Keeping it separate makes
// the "rules" of the skill tree (what unlocks what) easy to find and
// test in isolation from rendering or storage concerns.

const STAGE_ORDER = ["locked", "unlockable", "curious", "learning", "comfortable", "solid", "mastered"];
const PROGRESS_STAGES = STAGE_ORDER.slice(1); // the range a user can manually step through
const VISIBLE_STAGES = PROGRESS_STAGES.slice(1); // curious..mastered — the 5 steps shown as dots in the panel

const STAGE_LABELS = {
  locked: "Locked",
  unlockable: "Unlockable",
  curious: "Curious",
  learning: "Learning",
  comfortable: "Comfortable",
  solid: "Solid",
  mastered: "Mastered"
};

// Each node's progress entry is { stage, notes, proof, updatedAt }.
// The *stored* stage only matters once a node has actually been
// started (curious or beyond). Until then, whether it's "locked" or
// "unlockable" is recomputed live from its dependencies — so a node
// unlocks automatically the moment its prerequisites are mastered,
// rather than needing to be manually flipped.
function effectiveStage(node, progress) {
  const stored = progress[node.id] && progress[node.id].stage;
  if (stored && stored !== "locked" && stored !== "unlockable") {
    return stored;
  }
  const depsMet = node.dependsOn.every(depId => {
    const dep = progress[depId];
    return dep && dep.stage === "mastered";
  });
  return depsMet ? "unlockable" : "locked";
}

function canAdvance(stage) {
  const i = PROGRESS_STAGES.indexOf(stage);
  return i !== -1 && i < PROGRESS_STAGES.length - 1;
}

function canRegress(stage) {
  return PROGRESS_STAGES.indexOf(stage) > 0;
}

function advanceStage(stage) {
  const i = PROGRESS_STAGES.indexOf(stage);
  return PROGRESS_STAGES[Math.min(i + 1, PROGRESS_STAGES.length - 1)];
}

function regressStage(stage) {
  const i = PROGRESS_STAGES.indexOf(stage);
  return PROGRESS_STAGES[Math.max(i - 1, 0)];
}

function computeOverallProgress(progress) {
  const mastered = ACTIVE_NODES.filter(n => effectiveStage(n, progress) === "mastered").length;
  return Math.round((mastered / ACTIVE_NODES.length) * 100);
}

// Only branches with at least one node actually on the map get a bar
// — a branch that's only in the library so far would otherwise show
// a permanent, meaningless 0% row.
function computeBranchProgress(progress) {
  return Object.keys(BRANCHES)
    .filter(branchId => ACTIVE_NODES.some(n => n.branch === branchId))
    .map(branchId => {
      const branchNodes = ACTIVE_NODES.filter(n => n.branch === branchId);
      const mastered = branchNodes.filter(n => effectiveStage(n, progress) === "mastered").length;
      return {
        branch: branchId,
        label: BRANCHES[branchId].label,
        color: BRANCHES[branchId].color,
        percent: Math.round((mastered / branchNodes.length) * 100)
      };
    });
}
