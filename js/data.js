// ---- Branch metadata ----
// Each branch gets a label (shown in UI) and a muted accent color
// (used as a small identity dot on each node + progress bars).

const BRANCHES = {
  coding: { label: "Coding & Web Dev", color: "#6f9bc9" },
  mentalism: { label: "Mentalism & Cold Reading", color: "#a877a8" },
  people: { label: "People Skills & Persuasion", color: "#c98a8a" },
  life: { label: "Life Skills", color: "#8fae7a" },
  random: { label: "Random Useful Knowledge", color: "#8a9bc2" },
  "history-culture": { label: "History & Culture", color: "#ab8868" },
  "mechanical-curiosities": { label: "How Things Work", color: "#8f96a3" },
  "sensory-craft": { label: "Sensory & Craft", color: "#b79bc9" },
  "fitness-movement": { label: "Fitness & Movement", color: "#c96f6f" },

  // Split out of the old grab-bag branches (nature-science,
  // signals-codes, body-survival, games-systems — each used to bundle
  // several unrelated topics under one vague label) into smaller,
  // tightly-themed branches. This is purely a library-content
  // reorganization — no starter node ever referenced those four, so
  // nothing on the always-on-map tree changes.
  "backend-apis": { label: "Backend & APIs", color: "#7a93b0" },
  "advanced-reading": { label: "Advanced Reading Techniques", color: "#9a7aa8" },
  "magic-memory": { label: "Magic & Memory Feats", color: "#b98fae" },
  "negotiation-social": { label: "Negotiation & Social Dynamics", color: "#c79a8a" },
  "home-money": { label: "Home & Money", color: "#93a878" },
  "rest-time": { label: "Rest & Time", color: "#7ea89a" },
  "astronomy-sky": { label: "Astronomy & the Sky", color: "#5f7ea3" },
  "earth-life-science": { label: "Earth & Life Science", color: "#7a9e6f" },
  "signals-communication": { label: "Signals & Communication", color: "#7d9fa3" },
  "wilderness-survival": { label: "Wilderness Survival", color: "#a3916a" },
  "sleep-nutrition-science": { label: "Sleep & Nutrition Science", color: "#8aa39e" },
  "games-probability": { label: "Games & Probability", color: "#c17f70" }
};

// NODES is the fixed catalog of "starter" node definitions (below)
// and never changes at runtime — same role LIBRARY_NODES plays for
// the rest of the catalog, just a different array. Neither is
// pre-populated on your map anymore: a brand-new profile starts
// completely empty, and ACTIVE_NODES (what's actually on your map
// right now) only ever contains nodes you've explicitly added via the
// Library, whichever catalog they came from. See buildActiveNodes in
// library.js. Everything that renders or reasons about "the graph"
// reads from ACTIVE_NODES, not NODES directly.
let ACTIVE_NODES = [];

// ---- Starter node catalog ----
// These get a small head start in the Library (they used to be
// pre-added automatically), but otherwise work exactly like any
// LIBRARY_NODES entry — locked until added, and until every
// dependency is mastered. See progress.js for how "locked" vs
// "unlockable" is recomputed live from dependencies.

const NODES = [
  // Coding & Web Dev
  { id: "html-basics", name: "HTML Basics", branch: "coding",
    description: "The structure of a webpage: tags, elements, and semantic markup.",
    dependsOn: [], x: 90, y: 110 },
  { id: "css-basics", name: "CSS Basics", branch: "coding",
    description: "Styling, selectors, the box model, and layout fundamentals.",
    dependsOn: ["html-basics"], x: 220, y: 70 },
  { id: "js-basics", name: "JS Basics", branch: "coding",
    description: "Variables, functions, control flow, and the fundamentals of JavaScript.",
    dependsOn: ["html-basics"], x: 220, y: 180 },
  { id: "dom-manipulation", name: "DOM Manipulation", branch: "coding",
    description: "Selecting and updating page elements dynamically with JavaScript.",
    dependsOn: ["js-basics"], x: 370, y: 180 },
  { id: "git-github", name: "Git & GitHub", branch: "coding",
    description: "Version control basics: commits, branches, and pushing to a remote repo.",
    dependsOn: ["html-basics"], x: 340, y: 70 },
  { id: "deploying", name: "Deploying", branch: "coding",
    description: "Getting a site live on the internet — static hosting, domains, and builds.",
    dependsOn: ["git-github", "css-basics"], x: 480, y: 100 },
  { id: "tailwind", name: "Tailwind CSS", branch: "coding",
    description: "A utility-first CSS framework for styling without writing custom CSS.",
    dependsOn: ["css-basics"], x: 370, y: 290 },
  { id: "react-next", name: "React / Next.js", branch: "coding",
    description: "Component-based UI development with React and the Next.js framework.",
    dependsOn: ["dom-manipulation", "tailwind"], x: 520, y: 240 },

  // Mentalism & Cold Reading
  { id: "cold-reading-basics", name: "Cold Reading Basics", branch: "mentalism",
    description: "Making calibrated guesses about a person from subtle cues, without prior information.",
    dependsOn: [], x: 819, y: 90 },
  { id: "body-language-reading", name: "Body Language Reading", branch: "mentalism",
    description: "Interpreting posture, micro-expressions, and nonverbal tells.",
    dependsOn: ["cold-reading-basics"], x: 971, y: 60 },
  { id: "barnum-statements", name: "Barnum Statements", branch: "mentalism",
    description: "Vague, broadly-true statements that feel personally specific to the listener.",
    dependsOn: ["cold-reading-basics"], x: 960, y: 170 },
  { id: "forcing-techniques", name: "Forcing Techniques", branch: "mentalism",
    description: "Subtly guiding someone toward a choice while it still feels entirely free.",
    dependsOn: ["barnum-statements"], x: 1090, y: 140 },
  { id: "mentalism-routines", name: "Mentalism Routines", branch: "mentalism",
    description: "Combining reading, suggestion, and misdirection into a full performance piece.",
    dependsOn: ["body-language-reading", "forcing-techniques"], x: 1070, y: 250 },

  // People Skills & Persuasion
  { id: "active-listening", name: "Active Listening", branch: "people",
    description: "Fully attending to what someone says, without planning your reply while they talk.",
    dependsOn: [], x: 610, y: 380 },
  { id: "rapport-building", name: "Rapport Building", branch: "people",
    description: "Establishing trust and connection quickly in conversation.",
    dependsOn: ["active-listening"], x: 734, y: 400 },
  { id: "persuasion-principles", name: "Persuasion Principles", branch: "people",
    description: "Core influence principles: reciprocity, social proof, authority, scarcity.",
    dependsOn: ["rapport-building"], x: 876, y: 430 },
  { id: "public-speaking", name: "Public Speaking", branch: "people",
    description: "Structuring and delivering a talk with confidence in front of a group.",
    dependsOn: ["rapport-building"], x: 690, y: 480 },

  // Life Skills
  { id: "budgeting-basics", name: "Budgeting Basics", branch: "life",
    description: "Tracking income and expenses, and planning spending with intention.",
    dependsOn: [], x: 106, y: 470 },
  { id: "cooking-fundamentals", name: "Cooking Fundamentals", branch: "life",
    description: "Core knife skills, heat control, and a handful of reliable base recipes.",
    dependsOn: [], x: 244, y: 510 },
  { id: "time-management", name: "Time Management", branch: "life",
    description: "Prioritizing tasks and structuring a day so the important things get done.",
    dependsOn: ["budgeting-basics"], x: 170, y: 600 },
  { id: "first-aid-basics", name: "First Aid Basics", branch: "life",
    description: "Handling common injuries: cuts, burns, sprains, and knowing when to seek help.",
    dependsOn: [], x: 310, y: 590 },

  // Random Useful Knowledge
  { id: "touch-typing", name: "Touch Typing", branch: "random",
    description: "Typing accurately without looking at the keyboard.",
    dependsOn: [], x: 840, y: 590 },
  { id: "knot-tying", name: "Knot Tying", branch: "random",
    description: "A handful of genuinely useful knots and when to use each.",
    dependsOn: [], x: 970, y: 550 },
  { id: "memory-palace", name: "Memory Palace", branch: "random",
    description: "Using spatial visualization (the method of loci) to memorize long lists in order.",
    dependsOn: [], x: 990, y: 650 },
  { id: "speed-reading", name: "Speed Reading", branch: "random",
    description: "Reading faster while retaining comprehension, using techniques like chunking.",
    dependsOn: ["memory-palace"], x: 1110, y: 610 }
];
