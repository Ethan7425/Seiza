// ---- Skill library ----
// Extra skills that aren't on your map by default. Browse them on the
// Library page and add the ones you want to track — same opt-in model
// the starter tree in data.js now uses too (see buildActiveNodes
// below), so there's no real distinction anymore between "starter"
// and "library" except which array a node's definition lives in.
//
// A library entry has no x/y of its own — see layoutBranchNodes below
// for how a real position gets computed once it's added. `dependsOn`
// usually references another id in the same branch, but it's fine to
// depend on something in a different branch (or something not added
// yet at all) — until it's added and mastered, effectiveStage just
// treats it as "not mastered" (so the dependent node stays locked) and
// the connection line simply doesn't render yet. No crash, just a
// chain that only lights up once every link in it exists.

const LIBRARY_NODES = [
  { id: "typescript", name: "TypeScript", branch: "backend-apis",
    description: "Adding static types on top of JavaScript to catch bugs before they run.",
    dependsOn: ["js-basics"] },
  { id: "api-design", name: "API Design", branch: "backend-apis",
    description: "Designing endpoints and data shapes that are predictable to build against.",
    dependsOn: ["dom-manipulation"] },
  { id: "sql-basics", name: "SQL Basics", branch: "backend-apis",
    description: "Querying and shaping relational data with SELECT, JOIN, and friends.",
    dependsOn: ["js-basics"] },
  { id: "nodejs-express", name: "Node.js & Express", branch: "backend-apis",
    description: "Building server-side applications and APIs with Node.js and the Express framework.",
    dependsOn: ["sql-basics"] },
  { id: "supabase-auth-concepts", name: "Supabase & Auth Concepts", branch: "backend-apis",
    description: "Using Supabase for a backend database plus handling user authentication and sessions.",
    dependsOn: ["nodejs-express"] },

  { id: "hot-cold-reading", name: "Hot Reading", branch: "advanced-reading",
    description: "Working from information gathered beforehand rather than cold, in-the-moment reads.",
    dependsOn: ["cold-reading-basics"] },
  { id: "nlp-language-patterns", name: "NLP Language Patterns", branch: "advanced-reading",
    description: "Presuppositions and phrasing patterns drawn from neuro-linguistic programming.",
    dependsOn: ["cold-reading-basics"] },
  { id: "reading-microexpressions", name: "Reading Microexpressions", branch: "advanced-reading",
    description: "Spotting the brief, involuntary facial expressions that reveal a person's true emotion.",
    dependsOn: ["cold-reading-basics"] },
  { id: "memory-techniques", name: "Memory Palaces / Memory Techniques", branch: "magic-memory",
    description: "Applying memory methods like the memory palace to feats of recall used in mentalism routines.",
    dependsOn: [] },
  { id: "basic-sleight-of-hand", name: "Basic Sleight of Hand", branch: "magic-memory",
    description: "Fundamental hand moves for concealing and controlling small objects like cards and coins.",
    dependsOn: [] },

  { id: "negotiation-tactics", name: "Negotiation Tactics", branch: "negotiation-social",
    description: "Concrete moves for a negotiation: anchoring, framing, knowing your walk-away point.",
    dependsOn: ["active-listening"] },
  { id: "conflict-resolution", name: "Conflict Resolution", branch: "negotiation-social",
    description: "De-escalating disagreements and finding a resolution both sides can live with.",
    dependsOn: ["active-listening"] },
  { id: "reading-a-room", name: "Reading a Room", branch: "negotiation-social",
    description: "Picking up on a group's collective mood and social dynamics as you walk in.",
    dependsOn: ["active-listening"] },
  { id: "negotiation-basics", name: "Negotiation Basics", branch: "negotiation-social",
    description: "Foundational tactics for reaching agreements: anchoring, framing, and knowing your walk-away point.",
    dependsOn: ["persuasion-principles"] },

  { id: "sleep-fundamentals", name: "Sleep Fundamentals", branch: "rest-time",
    description: "The basics of sleep hygiene and circadian rhythm that actually move the needle.",
    dependsOn: [] },
  { id: "basic-car-maintenance", name: "Basic Car Maintenance", branch: "home-money",
    description: "Checking fluids, changing a tire, and knowing when something needs a mechanic.",
    dependsOn: [] },
  { id: "personal-finance-basics", name: "Personal Finance Basics", branch: "home-money",
    description: "Managing income, saving, debt, and basic investing beyond just day-to-day budgeting.",
    dependsOn: [] },
  { id: "time-management-systems", name: "Time Management Systems", branch: "rest-time",
    description: "Structured methods like time-blocking and GTD for organizing a week's worth of work.",
    dependsOn: [] },
  { id: "basic-home-repairs", name: "Basic Home Repairs", branch: "home-money",
    description: "Handling common household fixes — patching drywall, fixing a leaky faucet, unclogging a drain.",
    dependsOn: [] },

  { id: "morse-code", name: "Morse Code", branch: "signals-communication",
    description: "Reading and sending the basic alphabet in dots and dashes.",
    dependsOn: [] },
  { id: "card-counting-basics", name: "Card Counting Basics", branch: "games-probability",
    description: "The Hi-Lo counting system for blackjack, as a mental-math exercise as much as anything.",
    dependsOn: ["memory-palace"] },

  // Astronomy & the Sky
  { id: "constellations-star-navigation", name: "Constellations & Star Navigation", branch: "astronomy-sky",
    description: "Recognizing major constellations and using the night sky to find direction.",
    dependsOn: [] },
  { id: "basic-astronomy", name: "Basic Astronomy", branch: "astronomy-sky",
    description: "The basics of the solar system, stars, and how astronomers study the universe.",
    dependsOn: ["constellations-star-navigation"] },
  { id: "tide-moon-cycles", name: "Tide & Moon Cycles", branch: "astronomy-sky",
    description: "How the moon's gravity drives ocean tides, and the rhythm of its monthly phases.",
    dependsOn: [] },

  // Earth & Life Science
  { id: "cloud-types-weather-reading", name: "Cloud Types & Weather Reading", branch: "earth-life-science",
    description: "Identifying cloud formations and using them to predict short-term weather changes.",
    dependsOn: [] },
  { id: "edible-wild-plants", name: "Edible Wild Plants", branch: "earth-life-science",
    description: "Identifying common wild plants that are safe to forage and eat.",
    dependsOn: [] },
  { id: "how-vaccines-work", name: "How Vaccines Work", branch: "earth-life-science",
    description: "How vaccines train the immune system to recognize and fight off a pathogen.",
    dependsOn: [] },
  { id: "geology-rock-types", name: "Geology & Rock Types", branch: "earth-life-science",
    description: "Telling apart igneous, sedimentary, and metamorphic rocks and how each one forms.",
    dependsOn: [] },

  // Signals & Communication
  { id: "nato-phonetic-alphabet", name: "NATO Phonetic Alphabet", branch: "signals-communication",
    description: "The Alpha-Bravo-Charlie alphabet used to spell out letters clearly over radio or phone.",
    dependsOn: [] },
  { id: "semaphore-flags", name: "Semaphore Flags", branch: "signals-communication",
    description: "Signaling letters and messages over distance using handheld flag positions.",
    dependsOn: [] },
  { id: "basic-cryptography-ciphers", name: "Basic Cryptography & Ciphers", branch: "signals-communication",
    description: "Classic ciphers like Caesar and Vigenère, and the basic ideas behind encoding secret messages.",
    dependsOn: [] },
  { id: "sign-language-basics", name: "ASL Alphabet / Sign Language Basics", branch: "signals-communication",
    description: "The ASL fingerspelling alphabet and a handful of common signs.",
    dependsOn: [] },

  // History & Culture
  { id: "how-currency-money-works", name: "How Currency & Money Actually Works", branch: "history-culture",
    description: "What actually backs money today and how currency, inflation, and banking systems work.",
    dependsOn: [] },
  { id: "history-of-timekeeping-calendars", name: "History of Timekeeping & Calendars", branch: "history-culture",
    description: "How humans have measured days, months, and years across different calendar systems.",
    dependsOn: [] },
  { id: "etymology-word-origins", name: "Etymology & Word Origins", branch: "history-culture",
    description: "Tracing where common words and phrases actually come from.",
    dependsOn: [] },
  { id: "flags-and-their-meanings", name: "Flags & Their Meanings", branch: "history-culture",
    description: "What the colors, symbols, and layouts of national flags represent.",
    dependsOn: [] },
  { id: "mythology-greek-norse-japanese", name: "Mythology (Greek/Norse/Japanese)", branch: "history-culture",
    description: "Core gods, myths, and stories from Greek, Norse, and Japanese mythology.",
    dependsOn: [] },

  // Wilderness Survival
  { id: "basic-wilderness-survival", name: "Basic Wilderness Survival", branch: "wilderness-survival",
    description: "Core priorities when stranded outdoors: shelter, water, warmth, and signaling for help.",
    dependsOn: [] },
  { id: "reading-compass-map", name: "Reading a Compass & Map", branch: "wilderness-survival",
    description: "Orienting a map, taking a bearing, and navigating cross-country with a compass.",
    dependsOn: [] },
  { id: "sailing-climbing-knots", name: "Sailing/Climbing Knots", branch: "wilderness-survival",
    description: "Specialized knots used in sailing and climbing where reliability really matters.",
    dependsOn: ["knot-tying"] },
  { id: "fire-starting-methods", name: "Fire-Starting Methods", branch: "wilderness-survival",
    description: "Multiple ways to start a fire without matches, from friction to flint and steel.",
    dependsOn: ["basic-wilderness-survival"] },

  // Sleep & Nutrition Science
  { id: "how-sleep-works", name: "How Sleep Actually Works", branch: "sleep-nutrition-science",
    description: "The stages of sleep and circadian rhythm, and why both matter for how rested you feel.",
    dependsOn: [] },
  { id: "basic-nutrition-science", name: "Basic Nutrition Science", branch: "sleep-nutrition-science",
    description: "How macronutrients, calories, and micronutrients actually affect the body.",
    dependsOn: [] },

  // Mechanical & Practical Curiosities
  { id: "how-engines-work", name: "How Engines Work", branch: "mechanical-curiosities",
    description: "The basic combustion cycle that lets an engine turn fuel into motion.",
    dependsOn: [] },
  { id: "how-locks-work", name: "How Locks Work", branch: "mechanical-curiosities",
    description: "How pin-tumbler locks work internally, and the basics of picking them.",
    dependsOn: [] },
  { id: "how-planes-fly", name: "How Planes Fly", branch: "mechanical-curiosities",
    description: "The aerodynamics — lift, thrust, drag, and weight — that keep an aircraft in the air.",
    dependsOn: [] },
  { id: "how-internet-works", name: "How the Internet Physically Works", branch: "mechanical-curiosities",
    description: "The physical path a request takes: cables, routers, and DNS turning a URL into a website.",
    dependsOn: [] },
  { id: "how-encryption-works", name: "How Encryption Works", branch: "mechanical-curiosities",
    description: "How modern encryption scrambles data so only someone with the right key can read it.",
    dependsOn: ["basic-cryptography-ciphers"] },

  // Games & Probability
  { id: "chess-fundamentals", name: "Chess Fundamentals", branch: "games-probability",
    description: "Core chess principles: opening theory, tactics, and basic endgame technique.",
    dependsOn: [] },
  { id: "poker-odds-probability", name: "Poker Odds & Probability", branch: "games-probability",
    description: "Calculating pot odds and hand probabilities to make better decisions at the table.",
    dependsOn: [] },
  { id: "speedcubing-rubiks-method", name: "Speedcubing (Rubik's Cube Method)", branch: "games-probability",
    description: "A beginner speedcubing method (like CFOP) for solving a Rubik's Cube quickly.",
    dependsOn: [] },

  // Sensory & Craft
  { id: "whittling-woodworking-basics", name: "Basic Whittling & Woodworking", branch: "sensory-craft",
    description: "Basic knife-carving and simple woodworking joints and techniques.",
    dependsOn: [] },
  { id: "basic-calligraphy", name: "Basic Calligraphy", branch: "sensory-craft",
    description: "Forming letters with a broad or pointed pen to create decorative lettering.",
    dependsOn: [] },
  { id: "coffee-brewing-methods", name: "Coffee Brewing Methods", branch: "sensory-craft",
    description: "Comparing brewing methods — pour-over, French press, espresso — and what changes the flavor.",
    dependsOn: [] },
  { id: "perfume-scent-families", name: "Perfume & Scent Families", branch: "sensory-craft",
    description: "The major scent families (floral, woody, citrus, etc.) used to categorize fragrances.",
    dependsOn: [] },
  { id: "color-theory", name: "Color Theory", branch: "sensory-craft",
    description: "How hue, saturation, and contrast combine to make color choices that work together.",
    dependsOn: [] },

  // Fitness & Movement
  { id: "pushups", name: "Pushups", branch: "fitness-movement",
    description: "Building upper-body and core strength with good push-up form.",
    dependsOn: [], quantityLabel: "reps" },
  { id: "running", name: "Running", branch: "fitness-movement",
    description: "Building aerobic base and endurance through regular running.",
    dependsOn: [], quantityLabel: "km" },
  { id: "pull-ups", name: "Pull-ups", branch: "fitness-movement",
    description: "Building back and grip strength through strict pull-ups.",
    dependsOn: [], quantityLabel: "reps" },
  { id: "plank-hold", name: "Plank Hold", branch: "fitness-movement",
    description: "Core stability and endurance, held in a straight-body plank position.",
    dependsOn: [], quantityLabel: "seconds" },
  { id: "squats", name: "Squats", branch: "fitness-movement",
    description: "Building lower-body strength with good squat depth and form.",
    dependsOn: [], quantityLabel: "reps" },
  { id: "flexibility-mobility", name: "Flexibility & Mobility", branch: "fitness-movement",
    description: "Stretching and mobility work to keep joints healthy and ranges of motion open.",
    dependsOn: [] },
  { id: "strength-training-principles", name: "Strength Training Principles", branch: "fitness-movement",
    description: "Core ideas behind getting stronger: progressive overload, recovery, and programming.",
    dependsOn: ["pushups", "squats"] },
  { id: "handstand-practice", name: "Handstand Practice", branch: "fitness-movement",
    description: "Building the balance and shoulder strength to hold a freestanding handstand.",
    dependsOn: ["plank-hold"], quantityLabel: "seconds" }
];

// Top-left corner each branch's tree grows down-and-out from. Every
// branch — including the 5 that used to be a fixed, hand-placed
// starter tree — is laid out algorithmically now (see
// layoutBranchNodes below), so this is just a big, evenly-spaced grid
// with enough room per cell that even a 4-deep dependency chain can't
// bleed into its neighbor. See VIEWBOX_DEFAULT in graph.js, which is
// sized to match.
const BRANCH_ANCHORS = {
  coding: { x: 350, y: 350 },
  mentalism: { x: 1350, y: 350 },
  people: { x: 2350, y: 350 },
  life: { x: 3350, y: 350 },
  random: { x: 4350, y: 350 },

  "backend-apis": { x: 350, y: 950 },
  "advanced-reading": { x: 1350, y: 950 },
  "magic-memory": { x: 2350, y: 950 },
  "negotiation-social": { x: 3350, y: 950 },

  "home-money": { x: 350, y: 1550 },
  "rest-time": { x: 1350, y: 1550 },
  "astronomy-sky": { x: 2350, y: 1550 },
  "earth-life-science": { x: 3350, y: 1550 },

  "signals-communication": { x: 350, y: 2150 },
  "wilderness-survival": { x: 1350, y: 2150 },
  "sleep-nutrition-science": { x: 2350, y: 2150 },
  "games-probability": { x: 3350, y: 2150 },

  "history-culture": { x: 350, y: 2750 },
  "mechanical-curiosities": { x: 1350, y: 2750 },
  "sensory-craft": { x: 2350, y: 2750 },
  "fitness-movement": { x: 3350, y: 2750 }
};

// ---- Tidy tree layout ----
// A real parent-centered tree layout (the classic "tidy tree" shape),
// not a rigid grid: each node sits centered directly above its own
// children, so the branch actually reads as a tree — a single chain
// of dependencies draws as a straight line, a node with several
// dependents visibly fans out under it. Independent root nodes (no
// in-branch dependency) sit side by side at the top, each with its
// own subtree given exactly as much width as it needs — no more, no
// less — so nothing overlaps regardless of shape.
//
// A node that depends on more than one thing already on the map still
// only picks one "primary" parent (its first in-branch dependency) to
// hang from for placement purposes — the connection lines drawn in
// graph.js still connect it to every real dependency, this only
// affects where it sits.
const LAYOUT_COLUMN_WIDTH = 130;
const LAYOUT_ROW_HEIGHT = 120;

function layoutBranchNodes(branchNodes, anchor) {
  const idSet = new Set(branchNodes.map(n => n.id));
  const childrenOf = {};
  const roots = [];

  branchNodes.forEach(node => {
    const primaryParent = node.dependsOn.find(id => idSet.has(id));
    if (primaryParent) {
      (childrenOf[primaryParent] = childrenOf[primaryParent] || []).push(node.id);
    } else {
      roots.push(node.id);
    }
  });

  // How many leaf-width "slots" a node's whole subtree needs —
  // exactly 1 for a leaf, or the sum of its children's slot counts
  // for anything with dependents.
  const widthCache = {};
  function subtreeWidth(id) {
    if (id in widthCache) return widthCache[id];
    widthCache[id] = 1; // breaks any accidental dependency cycle
    const kids = childrenOf[id] || [];
    widthCache[id] = kids.length ? kids.reduce((sum, k) => sum + subtreeWidth(k), 0) : 1;
    return widthCache[id];
  }
  roots.forEach(subtreeWidth);

  const slot = {}; // each node's horizontal center, in slot units
  const depth = {};
  function place(id, nodeDepth, leftSlot) {
    depth[id] = nodeDepth;
    const kids = childrenOf[id] || [];
    slot[id] = leftSlot + subtreeWidth(id) / 2;
    let cursor = leftSlot;
    kids.forEach(kidId => {
      place(kidId, nodeDepth + 1, cursor);
      cursor += subtreeWidth(kidId);
    });
  }

  let cursor = 0;
  roots.forEach(id => {
    place(id, 0, cursor);
    cursor += subtreeWidth(id);
  });
  const totalWidth = cursor;

  const positions = {};
  Object.keys(slot).forEach(id => {
    positions[id] = {
      x: Math.round(anchor.x - ((totalWidth - 1) * LAYOUT_COLUMN_WIDTH) / 2 + slot[id] * LAYOUT_COLUMN_WIDTH),
      y: Math.round(anchor.y + depth[id] * LAYOUT_ROW_HEIGHT)
    };
  });

  return positions;
}

// Everything currently on your map — starter nodes and library nodes
// you've explicitly added, nothing pre-populated. A brand-new profile
// starts with both id lists empty, so the map is just the bare
// nebulas until you add something from the Library.
//
// Positions are recomputed with layoutBranchNodes every single time
// this runs, grouped fresh by branch — never read from storage. That
// means there's no such thing as a stale saved position left over
// from an older layout pass (e.g. from before this algorithm
// existed): the map self-heals to a clean layout on every load,
// purely as a function of which nodes are currently active, not the
// order or history of how they got added.
function buildActiveNodes(state) {
  const addedIds = new Set(state.addedCoreNodeIds.concat(state.addedLibraryIds));
  const active = NODES.concat(LIBRARY_NODES).filter(n => addedIds.has(n.id));

  const byBranch = {};
  active.forEach(n => { (byBranch[n.branch] = byBranch[n.branch] || []).push(n); });

  const result = [];
  Object.keys(byBranch).forEach(branchId => {
    const anchor = BRANCH_ANCHORS[branchId] || { x: 600, y: 400 };
    const positions = layoutBranchNodes(byBranch[branchId], anchor);
    byBranch[branchId].forEach(n => {
      const pos = positions[n.id];
      result.push({ ...n, x: pos.x, y: pos.y });
    });
  });

  return result;
}
