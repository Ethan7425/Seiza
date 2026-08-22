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
const LAYOUT_ROW_HEIGHT = 120;
const LAYOUT_COLUMN_GAP = 26;
const LAYOUT_MIN_COLUMN_WIDTH = 90;

// A plain character-count estimate rather than real canvas text
// measurement — deliberately, so this gives the exact same numbers
// whether it runs in the browser or in a plain Node script (the
// verification passes below run in the latter). It errs wide on
// purpose: slightly more space than a label strictly needs is
// harmless, under-estimating is what causes real overlap.
function estimateLabelWidth(text) {
  return text.length * 6.4;
}

function layoutBranchNodes(branchNodes, anchor) {
  const idSet = new Set(branchNodes.map(n => n.id));
  // Column width is sized to THIS branch's longest label, not a
  // one-size-fits-all guess — a branch full of short names (Chess
  // Fundamentals) packs tighter than one with long ones
  // (Constellations & Star Navigation), and either way two labels on
  // the same row can't collide.
  const columnWidth = Math.max(
    LAYOUT_MIN_COLUMN_WIDTH,
    ...branchNodes.map(n => estimateLabelWidth(n.name) + LAYOUT_COLUMN_GAP)
  );
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

  const rawPositions = {};
  Object.keys(slot).forEach(id => {
    rawPositions[id] = {
      x: Math.round(anchor.x + (slot[id] - totalWidth / 2) * columnWidth),
      y: Math.round(anchor.y + depth[id] * LAYOUT_ROW_HEIGHT)
    };
  });

  // Nodes on the same row never land on the same x (columnWidth already
  // guarantees that), but two nodes in different subtrees/rows
  // legitimately can — and when they do, a real constellation wouldn't
  // line stars up in a perfect vertical column like that anyway, and
  // their labels can end up stacked close enough to visually collide.
  // Deterministically nudge every tie apart (alternating left/right,
  // widening each retry) until no two nodes in this layout share an x
  // at all — same technique as estimateLabelWidth's own "err wide, not
  // narrow" rule: nothing here depends on measuring real text, so it
  // gives identical results in the browser and in a plain Node check.
  //
  // Every node at the same dependency depth also sits on the exact
  // same row (a flat multiple of LAYOUT_ROW_HEIGHT) — its own kind of
  // rigid grid line, just horizontal instead of vertical. A small
  // deterministic y offset breaks that up too, using a different hash
  // multiplier than the x-nudge so the two aren't correlated (which
  // would just trade a grid for a diagonal, still not natural-looking).
  // Kept well inside LAYOUT_ROW_HEIGHT's 120-unit spacing so rows never
  // actually blend into each other or reverse their top-to-bottom
  // dependency order.
  const usedX = new Set();
  const positions = {};
  Object.keys(rawPositions).forEach(id => {
    const raw = rawPositions[id];
    let hashX = 0;
    for (let i = 0; i < id.length; i++) hashX = (hashX * 31 + id.charCodeAt(i)) % 1000;
    let hashY = 0;
    for (let i = 0; i < id.length; i++) hashY = (hashY * 37 + id.charCodeAt(i)) % 1000;

    const step = 10 + (hashX % 15); // 10-24 units, well inside a same-row column's own clearance
    const yJitter = (hashY % 41) - 20; // -20..20, well inside a row's own 120-unit clearance

    let x = raw.x;
    let attempt = 0;
    let sign = hashX % 2 === 0 ? 1 : -1;
    while (usedX.has(x)) {
      attempt++;
      x = raw.x + sign * step * attempt;
      sign *= -1;
    }
    usedX.add(x);
    positions[id] = { x, y: raw.y + yJitter };
  });

  return positions;
}

// ---- Branch packing (semi-dynamic map layout) ----
// Where each branch's tree actually sits is computed here, not
// hand-placed — every branch gets a circular "hitbox" sized to how
// much room its own full tree needs (layoutBranchNodes again, just
// measured relative to a placeholder origin first), and those circles
// get packed together as tightly as they'll fit without overlapping,
// largest first. That's what replaces the old evenly-spaced grid with
// something that actually looks like clusters of different sizes
// instead of identical cells — and because it's computed fresh from
// BRANCHES/NODES/LIBRARY_NODES on every load rather than baked into a
// static table, adding a new branch or a pile of new nodes later just
// reflows into the packing automatically, no coordinates to hand-edit.
// Widened from 90/70 — the map felt crowded even with zero literal
// label/node overlaps (already verified), because branches simply sat
// close together. This is shared, computed-once map data (not a
// per-viewport CSS thing), so it spaces out the desktop map too, not
// just mobile — more breathing room between clusters is a reasonable
// trade there as well.
const BRANCH_PACK_PADDING = 130; // extra breathing room baked into each hitbox on top of its real shape
const BRANCH_PACK_GAP = 120; // minimum breathing room between two different branches' hitboxes

// Mirrors graph.js's renderNebulas/renderGhostBranch geometry exactly
// (ellipse padding, label offsets, label font/letter-spacing) so the
// hitbox measured here is the *actual* rendered shape, not a guess at
// it — kept as shared constants specifically so the two can never
// silently drift apart the way they did when the label font grew from
// 13px to 32px without packing ever finding out.
const NEBULA_ELLIPSE_PAD_X = 130;
const NEBULA_ELLIPSE_PAD_Y = 110;
const NEBULA_LABEL_Y_GAP = 26; // label sits this far above the ellipse's top edge
// These are now the label's constant ON-SCREEN size (graph.js
// counter-scales the actual rendered font-size against zoom to hold
// it there) — 32/26 briefly landed here and, with 21 branches all
// visible on the same screen at once, read as way too loud/crowded.
// Sized instead like a normal UI label: nebula titles a bit bigger
// and brighter since they're what's actually on your map, ghost
// titles quieter since most branches sit as ghosts most of the time.
const NEBULA_LABEL_FONT_PX = 15;
const NEBULA_LABEL_LETTER_SPACING_EM = 0.1;
const GHOST_LABEL_Y_GAP = 40; // label sits this far below the ghost ring's anchor point
const GHOST_LABEL_FONT_PX = 11;
const GHOST_LABEL_LETTER_SPACING_EM = 0.08;
// Zoom can rest up to 1.15x past VIEWBOX_DEFAULT (see MAX_ZOOM_W in
// graph.js) — since both labels counter-scale to stay a constant size
// on screen, that headroom makes their actual SVG-unit width up to
// 1.15x bigger too, so padding has to plan for that, not just their
// size at the default resting zoom.
const ZOOM_OUT_HEADROOM = 1.15;

// A wider per-char ratio than estimateLabelWidth's 6.4/12 (~0.53/px)
// baseline — these labels render with text-transform:uppercase, and
// capital letters run measurably wider than the mixed-case node names
// that ratio was tuned against, so reusing it as-is under-measured the
// real rendered width and let titles overlap despite "passing" a
// collision check against the wrong (too-narrow) number.
function estimateBranchLabelWidth(text, fontPx, letterSpacingEm) {
  const perChar = fontPx * 0.62 + fontPx * letterSpacingEm;
  return text.length * perChar * ZOOM_OUT_HEADROOM;
}

// A branch's hitbox isn't centered on its own anchor point — the tidy
// tree hangs down-and-out from its root row, so the anchor is really
// the top-center, not the middle. This finds the true center (and the
// radius needed to enclose the whole shape from it) so packing can
// treat every branch as a normal circle regardless of its actual
// lopsided shape.
//
// The radius has to cover three different things a branch can render
// as, not just its node cluster: the active nebula's ellipse+label
// (once every node in it is added) and the ghost ring+label (while
// nothing is). Each is checked as actual corner points, not a rough
// combined estimate — a label sitting off at the top edge of a tall
// ellipse can stick out further from center than the node cluster
// itself does, which a simple "cluster radius + label half-width"
// formula misses entirely.
function measureBranchHitbox(branchId) {
  const branchNodes = NODES.concat(LIBRARY_NODES).filter(n => n.branch === branchId);
  const positions = Object.values(layoutBranchNodes(branchNodes, { x: 0, y: 0 }));
  const xs = positions.map(p => p.x), ys = positions.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const centerOffset = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };

  // buildActiveNodes lays out only whichever subset of a branch is
  // actually on the map, not the full branch — and a subset can need
  // *more* horizontal room than the full branch does. Skip an active
  // node's only in-branch dependency (added one at a time rather than
  // via "Add whole branch") and it loses its parent slot, becoming its
  // own independent root instead of nesting under one — so the column
  // count a branch could ever need is bounded by its total node count,
  // not by however many columns the fully-populated tree happens to
  // use today. One extra column of headroom covers this cheaply without
  // needing to actually search every possible subset for the exact
  // worst case.
  const columnWidth = Math.max(
    LAYOUT_MIN_COLUMN_WIDTH,
    ...branchNodes.map(n => estimateLabelWidth(n.name) + LAYOUT_COLUMN_GAP)
  );

  const ellipseCx = centerOffset.x, ellipseCy = centerOffset.y;
  const rx = (maxX - minX) / 2 + NEBULA_ELLIPSE_PAD_X + columnWidth;
  const ry = (maxY - minY) / 2 + NEBULA_ELLIPSE_PAD_Y;
  const nebulaLabelY = ellipseCy - ry + NEBULA_LABEL_Y_GAP; // must match graph.js's render exactly, no floor-clamp
  const nebulaLabelHalfW = estimateBranchLabelWidth(BRANCHES[branchId].label, NEBULA_LABEL_FONT_PX, NEBULA_LABEL_LETTER_SPACING_EM) / 2;
  const nebulaLabelHalfH = NEBULA_LABEL_FONT_PX * 0.6;

  const ghostLabelY = GHOST_LABEL_Y_GAP; // anchor is local (0,0) here
  const ghostLabelHalfW = estimateBranchLabelWidth(BRANCHES[branchId].label, GHOST_LABEL_FONT_PX, GHOST_LABEL_LETTER_SPACING_EM) / 2;
  const ghostLabelHalfH = GHOST_LABEL_FONT_PX * 0.6;

  const points = [
    // Ellipse's own extremes, not the raw node bounding box — rx/ry
    // already include NEBULA_ELLIPSE_PAD_X/Y, and a bounding-box corner
    // actually sits *inside* the ellipse, not on its edge, so using the
    // unpadded node corners here silently underestimated the ellipse's
    // real reach by the full padding amount.
    { x: ellipseCx + rx, y: ellipseCy }, { x: ellipseCx - rx, y: ellipseCy },
    { x: ellipseCx, y: ellipseCy + ry }, { x: ellipseCx, y: ellipseCy - ry },
    { x: ellipseCx - nebulaLabelHalfW, y: nebulaLabelY - nebulaLabelHalfH },
    { x: ellipseCx + nebulaLabelHalfW, y: nebulaLabelY - nebulaLabelHalfH },
    { x: ellipseCx - nebulaLabelHalfW, y: nebulaLabelY + nebulaLabelHalfH },
    { x: ellipseCx + nebulaLabelHalfW, y: nebulaLabelY + nebulaLabelHalfH },
    { x: -ghostLabelHalfW, y: ghostLabelY - ghostLabelHalfH },
    { x: ghostLabelHalfW, y: ghostLabelY - ghostLabelHalfH },
    { x: -ghostLabelHalfW, y: ghostLabelY + ghostLabelHalfH },
    { x: ghostLabelHalfW, y: ghostLabelY + ghostLabelHalfH }
  ];
  const radius = Math.max(...points.map(p => Math.hypot(p.x - centerOffset.x, p.y - centerOffset.y))) + BRANCH_PACK_PADDING;

  return { radius, centerOffset };
}

// Greedy spiral packing: place the biggest circle first (at the
// origin), then for every circle after it, walk outward along a
// spiral from the origin and drop it at the first spot that doesn't
// collide with anything already placed. A simple, well-understood
// heuristic (the same basic idea word-cloud generators use) — not a
// perfectly optimal packing, but compact, deterministic, and always
// collision-free by construction.
function packBranchCircles() {
  const specs = Object.keys(BRANCHES).map(branchId => ({ branchId, ...measureBranchHitbox(branchId) }));
  specs.sort((a, b) => b.radius - a.radius || a.branchId.localeCompare(b.branchId));

  const placed = [];
  specs.forEach((spec, index) => {
    if (index === 0) {
      placed.push({ ...spec, cx: 0, cy: 0 });
      return;
    }
    const angleStep = 0.35;
    const radiusStep = 5;
    let angle = 0;
    let dist = 0;
    let cx = 0, cy = 0;
    let guard = 0;
    while (guard++ < 100000) {
      cx = dist * Math.cos(angle);
      cy = dist * Math.sin(angle);
      const collides = placed.some(p => Math.hypot(p.cx - cx, p.cy - cy) < p.radius + spec.radius + BRANCH_PACK_GAP);
      if (!collides) break;
      angle += angleStep;
      dist += radiusStep * (angleStep / (2 * Math.PI));
    }
    placed.push({ ...spec, cx, cy });
  });

  const anchors = {};
  placed.forEach(p => {
    anchors[p.branchId] = {
      x: Math.round(p.cx - p.centerOffset.x),
      y: Math.round(p.cy - p.centerOffset.y)
    };
  });
  return anchors;
}

const BRANCH_ANCHORS = packBranchCircles();

// The map's default viewBox, sized to whatever the packed layout
// actually needs (including negative coordinates — packing grows
// outward from the origin in every direction) rather than a fixed
// guess. Shared with graph.js, which owns zoom/pan.
function computeDefaultViewbox() {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  Object.keys(BRANCHES).forEach(branchId => {
    const branchNodes = NODES.concat(LIBRARY_NODES).filter(n => n.branch === branchId);
    Object.values(layoutBranchNodes(branchNodes, BRANCH_ANCHORS[branchId])).forEach(p => {
      minX = Math.min(minX, p.x); maxX = Math.max(maxX, p.x);
      minY = Math.min(minY, p.y); maxY = Math.max(maxY, p.y);
    });
  });
  const margin = 220;
  return {
    x: Math.floor(minX - margin),
    y: Math.floor(minY - margin),
    w: Math.ceil(maxX - minX + margin * 2),
    h: Math.ceil(maxY - minY + margin * 2)
  };
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
