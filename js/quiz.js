// ---- Welcome quiz ----
// Turns a few rough self-ratings into starting stages. Deliberately
// simple for now: one question per branch, and the answer only ever
// touches that branch's root nodes (the ones with no dependencies) —
// everything downstream still has to be earned. Once there's a much
// bigger node library, this is the place a real recommendation step
// would plug in.

const EXPERIENCE_LEVELS = [
  { id: "none", label: "Never really touched it", rootStage: "unlockable" },
  { id: "some", label: "Some experience", rootStage: "learning" },
  { id: "lots", label: "Pretty experienced", rootStage: "mastered" }
];

// Only branches actually represented on the starter tree are worth
// asking about — a branch that only exists in the library has no
// root nodes for an answer to touch, so the question would be inert.
function buildQuizQuestions() {
  return Object.keys(BRANCHES)
    .filter(branchId => NODES.some(n => n.branch === branchId))
    .map(branchId => ({
      branch: branchId,
      question: `How would you rate your experience with ${BRANCHES[branchId].label}?`
    }));
}

// answers: { [branchId]: levelId }
function createStateFromAnswers(profileName, answers) {
  const progress = {};
  NODES.forEach(node => {
    const isRoot = node.dependsOn.length === 0;
    const level = EXPERIENCE_LEVELS.find(l => l.id === answers[node.branch]);
    const stage = isRoot && level ? level.rootStage : node.stage;
    progress[node.id] = { stage, notes: "", proof: [], updatedAt: null };
  });
  return { profileName, progress, addedLibraryIds: [], nodePositions: {} };
}
