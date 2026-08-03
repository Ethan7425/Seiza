// ---- Skill library ----
// Extra skills that are NOT on your map by default. Browse them on the
// Library page and add the ones you want to track. This list is meant
// to grow a lot over time — that's the whole point of keeping it
// separate from the core 25-node starter tree in data.js.
//
// A library entry has no x/y (see placeNode below) and no starting
// stage — it always starts fresh once added. `dependsOn` usually
// references an id already on the map (from NODES), but it's fine for
// one library entry to depend on another library entry too — until
// both are added, effectiveStage just treats the missing dependency as
// "not mastered" (so the dependent node stays locked) and the
// connection line simply doesn't render yet. No crash, just a chain
// that only lights up once you've added every link in it.

const LIBRARY_NODES = [
  { id: "typescript", name: "TypeScript", branch: "coding",
    description: "Adding static types on top of JavaScript to catch bugs before they run.",
    dependsOn: ["js-basics"] },
  { id: "api-design", name: "API Design", branch: "coding",
    description: "Designing endpoints and data shapes that are predictable to build against.",
    dependsOn: ["dom-manipulation"] },
  { id: "sql-basics", name: "SQL Basics", branch: "coding",
    description: "Querying and shaping relational data with SELECT, JOIN, and friends.",
    dependsOn: ["js-basics"] },
  { id: "nodejs-express", name: "Node.js & Express", branch: "coding",
    description: "Building server-side applications and APIs with Node.js and the Express framework.",
    dependsOn: ["sql-basics"] },
  { id: "supabase-auth-concepts", name: "Supabase & Auth Concepts", branch: "coding",
    description: "Using Supabase for a backend database plus handling user authentication and sessions.",
    dependsOn: ["nodejs-express"] },

  { id: "hot-cold-reading", name: "Hot Reading", branch: "mentalism",
    description: "Working from information gathered beforehand rather than cold, in-the-moment reads.",
    dependsOn: ["cold-reading-basics"] },
  { id: "nlp-language-patterns", name: "NLP Language Patterns", branch: "mentalism",
    description: "Presuppositions and phrasing patterns drawn from neuro-linguistic programming.",
    dependsOn: ["cold-reading-basics"] },
  { id: "reading-microexpressions", name: "Reading Microexpressions", branch: "mentalism",
    description: "Spotting the brief, involuntary facial expressions that reveal a person's true emotion.",
    dependsOn: ["cold-reading-basics"] },
  { id: "memory-techniques", name: "Memory Palaces / Memory Techniques", branch: "mentalism",
    description: "Applying memory methods like the memory palace to feats of recall used in mentalism routines.",
    dependsOn: [] },
  { id: "basic-sleight-of-hand", name: "Basic Sleight of Hand", branch: "mentalism",
    description: "Fundamental hand moves for concealing and controlling small objects like cards and coins.",
    dependsOn: [] },

  { id: "negotiation-tactics", name: "Negotiation Tactics", branch: "people",
    description: "Concrete moves for a negotiation: anchoring, framing, knowing your walk-away point.",
    dependsOn: ["active-listening"] },
  { id: "conflict-resolution", name: "Conflict Resolution", branch: "people",
    description: "De-escalating disagreements and finding a resolution both sides can live with.",
    dependsOn: ["active-listening"] },
  { id: "reading-a-room", name: "Reading a Room", branch: "people",
    description: "Picking up on a group's collective mood and social dynamics as you walk in.",
    dependsOn: ["active-listening"] },
  { id: "negotiation-basics", name: "Negotiation Basics", branch: "people",
    description: "Foundational tactics for reaching agreements: anchoring, framing, and knowing your walk-away point.",
    dependsOn: ["persuasion-principles"] },

  { id: "sleep-fundamentals", name: "Sleep Fundamentals", branch: "life",
    description: "The basics of sleep hygiene and circadian rhythm that actually move the needle.",
    dependsOn: [] },
  { id: "basic-car-maintenance", name: "Basic Car Maintenance", branch: "life",
    description: "Checking fluids, changing a tire, and knowing when something needs a mechanic.",
    dependsOn: [] },
  { id: "personal-finance-basics", name: "Personal Finance Basics", branch: "life",
    description: "Managing income, saving, debt, and basic investing beyond just day-to-day budgeting.",
    dependsOn: [] },
  { id: "time-management-systems", name: "Time Management Systems", branch: "life",
    description: "Structured methods like time-blocking and GTD for organizing a week's worth of work.",
    dependsOn: [] },
  { id: "basic-home-repairs", name: "Basic Home Repairs", branch: "life",
    description: "Handling common household fixes — patching drywall, fixing a leaky faucet, unclogging a drain.",
    dependsOn: [] },

  { id: "morse-code", name: "Morse Code", branch: "random",
    description: "Reading and sending the basic alphabet in dots and dashes.",
    dependsOn: [] },
  { id: "card-counting-basics", name: "Card Counting Basics", branch: "random",
    description: "The Hi-Lo counting system for blackjack, as a mental-math exercise as much as anything.",
    dependsOn: ["memory-palace"] },

  // Nature & Science
  { id: "cloud-types-weather-reading", name: "Cloud Types & Weather Reading", branch: "nature-science",
    description: "Identifying cloud formations and using them to predict short-term weather changes.",
    dependsOn: [] },
  { id: "constellations-star-navigation", name: "Constellations & Star Navigation", branch: "nature-science",
    description: "Recognizing major constellations and using the night sky to find direction.",
    dependsOn: [] },
  { id: "edible-wild-plants", name: "Edible Wild Plants", branch: "nature-science",
    description: "Identifying common wild plants that are safe to forage and eat.",
    dependsOn: [] },
  { id: "basic-astronomy", name: "Basic Astronomy", branch: "nature-science",
    description: "The basics of the solar system, stars, and how astronomers study the universe.",
    dependsOn: ["constellations-star-navigation"] },
  { id: "how-vaccines-work", name: "How Vaccines Work", branch: "nature-science",
    description: "How vaccines train the immune system to recognize and fight off a pathogen.",
    dependsOn: [] },
  { id: "geology-rock-types", name: "Geology & Rock Types", branch: "nature-science",
    description: "Telling apart igneous, sedimentary, and metamorphic rocks and how each one forms.",
    dependsOn: [] },
  { id: "tide-moon-cycles", name: "Tide & Moon Cycles", branch: "nature-science",
    description: "How the moon's gravity drives ocean tides, and the rhythm of its monthly phases.",
    dependsOn: [] },

  // Signals & Codes
  { id: "nato-phonetic-alphabet", name: "NATO Phonetic Alphabet", branch: "signals-codes",
    description: "The Alpha-Bravo-Charlie alphabet used to spell out letters clearly over radio or phone.",
    dependsOn: [] },
  { id: "semaphore-flags", name: "Semaphore Flags", branch: "signals-codes",
    description: "Signaling letters and messages over distance using handheld flag positions.",
    dependsOn: [] },
  { id: "basic-cryptography-ciphers", name: "Basic Cryptography & Ciphers", branch: "signals-codes",
    description: "Classic ciphers like Caesar and Vigenère, and the basic ideas behind encoding secret messages.",
    dependsOn: [] },
  { id: "sign-language-basics", name: "ASL Alphabet / Sign Language Basics", branch: "signals-codes",
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

  // Body & Survival
  { id: "basic-wilderness-survival", name: "Basic Wilderness Survival", branch: "body-survival",
    description: "Core priorities when stranded outdoors: shelter, water, warmth, and signaling for help.",
    dependsOn: [] },
  { id: "reading-compass-map", name: "Reading a Compass & Map", branch: "body-survival",
    description: "Orienting a map, taking a bearing, and navigating cross-country with a compass.",
    dependsOn: [] },
  { id: "sailing-climbing-knots", name: "Sailing/Climbing Knots", branch: "body-survival",
    description: "Specialized knots used in sailing and climbing where reliability really matters.",
    dependsOn: ["knot-tying"] },
  { id: "how-sleep-works", name: "How Sleep Actually Works", branch: "body-survival",
    description: "The stages of sleep and circadian rhythm, and why both matter for how rested you feel.",
    dependsOn: [] },
  { id: "basic-nutrition-science", name: "Basic Nutrition Science", branch: "body-survival",
    description: "How macronutrients, calories, and micronutrients actually affect the body.",
    dependsOn: [] },
  { id: "fire-starting-methods", name: "Fire-Starting Methods", branch: "body-survival",
    description: "Multiple ways to start a fire without matches, from friction to flint and steel.",
    dependsOn: ["basic-wilderness-survival"] },

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

  // Games & Systems
  { id: "chess-fundamentals", name: "Chess Fundamentals", branch: "games-systems",
    description: "Core chess principles: opening theory, tactics, and basic endgame technique.",
    dependsOn: [] },
  { id: "poker-odds-probability", name: "Poker Odds & Probability", branch: "games-systems",
    description: "Calculating pot odds and hand probabilities to make better decisions at the table.",
    dependsOn: [] },
  { id: "speedcubing-rubiks-method", name: "Speedcubing (Rubik's Cube Method)", branch: "games-systems",
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

// Rough centers of each branch's existing cluster, used as a fallback
// when a node has no dependencies and no siblings yet placed on the
// map. The 7 newest branches have no on-map presence yet, so they get
// dedicated anchor points in the canvas space added below the
// original layout (see VIEWBOX_DEFAULT in graph.js) rather than
// falling back to the single generic {600,400} point.
const BRANCH_ANCHORS = {
  coding: { x: 300, y: 150 },
  mentalism: { x: 980, y: 150 },
  people: { x: 750, y: 430 },
  life: { x: 220, y: 550 },
  random: { x: 970, y: 600 },
  "nature-science": { x: 150, y: 830 },
  "signals-codes": { x: 450, y: 830 },
  "history-culture": { x: 750, y: 830 },
  "body-survival": { x: 1050, y: 830 },
  "mechanical-curiosities": { x: 250, y: 1050 },
  "games-systems": { x: 550, y: 1050 },
  "sensory-craft": { x: 850, y: 1050 },
  "fitness-movement": { x: 1100, y: 1050 }
};

// Deterministic (not random) offset so a given node always lands in
// the same spot relative to its base point.
function hashJitter(id, range) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % 10000;
  }
  const angle = (hash % 360) * (Math.PI / 180);
  const dist = range * 0.5 + ((hash % 100) / 100) * range * 0.5;
  return { dx: Math.cos(angle) * dist, dy: Math.sin(angle) * dist };
}

// Where a newly-added node should land: near the average position of
// its dependencies, or near its branch's existing nodes, or a fallback
// anchor if it'd be the first node in that branch.
function placeNode(node, activeNodes) {
  let base;

  if (node.dependsOn.length) {
    const deps = node.dependsOn.map(id => activeNodes.find(n => n.id === id)).filter(Boolean);
    if (deps.length) {
      base = {
        x: deps.reduce((sum, d) => sum + d.x, 0) / deps.length,
        y: deps.reduce((sum, d) => sum + d.y, 0) / deps.length
      };
    }
  }

  if (!base) {
    const sameBranch = activeNodes.filter(n => n.branch === node.branch);
    base = sameBranch.length
      ? {
          x: sameBranch.reduce((sum, n) => sum + n.x, 0) / sameBranch.length,
          y: sameBranch.reduce((sum, n) => sum + n.y, 0) / sameBranch.length
        }
      : (BRANCH_ANCHORS[node.branch] || { x: 600, y: 400 });
  }

  const { dx, dy } = hashJitter(node.id, 90);
  return { x: Math.round(base.x + dx), y: Math.round(base.y + dy) };
}

// Turns a saved state's addedLibraryIds + nodePositions back into full
// node objects. Shared by the map page (to render them) and the
// library page (to place the next one relative to them) so neither
// has to duplicate this lookup.
function getAddedLibraryNodes(state) {
  return state.addedLibraryIds
    .map(id => LIBRARY_NODES.find(n => n.id === id))
    .filter(Boolean)
    .map(template => {
      const pos = state.nodePositions[template.id] || placeNode(template, NODES);
      return { ...template, x: pos.x, y: pos.y };
    });
}

// The starter tree plus whatever's been added from the library —
// "everything currently on your map."
function buildActiveNodes(state) {
  return NODES.concat(getAddedLibraryNodes(state));
}
