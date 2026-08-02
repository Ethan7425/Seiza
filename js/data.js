// ---- Branch metadata ----
// Each branch gets a label (shown in UI) and a muted accent color
// (used as a small identity dot on each node + progress bars).

const BRANCHES = {
  coding: { label: "Coding & Web Dev", color: "#6f9bc9" },
  mentalism: { label: "Mentalism & Cold Reading", color: "#a877a8" },
  people: { label: "People Skills & Persuasion", color: "#c98a8a" },
  life: { label: "Life Skills", color: "#8fae7a" },
  random: { label: "Random Useful Knowledge", color: "#8a9bc2" },
  "nature-science": { label: "Nature & Science", color: "#6fab8f" },
  "signals-codes": { label: "Signals & Codes", color: "#7d9fa3" },
  "history-culture": { label: "History & Culture", color: "#ab8868" },
  "body-survival": { label: "Body & Survival", color: "#a39868" },
  "mechanical-curiosities": { label: "Mechanical & Practical Curiosities", color: "#8f96a3" },
  "games-systems": { label: "Games & Systems", color: "#c17f70" },
  "sensory-craft": { label: "Sensory & Craft", color: "#b79bc9" }
};

// NODES is the fixed 25-node starter tree (below) and never changes at
// runtime. ACTIVE_NODES is what's actually on your map right now — the
// starter tree plus whatever you've pulled in from the library. app.js
// builds it once at startup (NODES + your added library nodes) and
// pushes onto it whenever you add another. Everything that renders or
// reasons about "the graph" reads from ACTIVE_NODES, not NODES.
let ACTIVE_NODES = [];

// ---- Seed nodes ----
// `stage` here is the STARTING value only, used once to seed a new
// profile's progress in localStorage. After that, localStorage is the
// source of truth — see progress.js for how "locked"/"unlockable" are
// recomputed live from dependencies rather than trusted from storage.

const NODES = [
  // Coding & Web Dev
  { id: "html-basics", name: "HTML Basics", branch: "coding",
    description: "The structure of a webpage: tags, elements, and semantic markup.",
    dependsOn: [], stage: "mastered", x: 90, y: 110 },
  { id: "css-basics", name: "CSS Basics", branch: "coding",
    description: "Styling, selectors, the box model, and layout fundamentals.",
    dependsOn: ["html-basics"], stage: "solid", x: 220, y: 70 },
  { id: "js-basics", name: "JS Basics", branch: "coding",
    description: "Variables, functions, control flow, and the fundamentals of JavaScript.",
    dependsOn: ["html-basics"], stage: "learning", x: 220, y: 180 },
  { id: "dom-manipulation", name: "DOM Manipulation", branch: "coding",
    description: "Selecting and updating page elements dynamically with JavaScript.",
    dependsOn: ["js-basics"], stage: "locked", x: 370, y: 180 },
  { id: "git-github", name: "Git & GitHub", branch: "coding",
    description: "Version control basics: commits, branches, and pushing to a remote repo.",
    dependsOn: ["html-basics"], stage: "comfortable", x: 340, y: 70 },
  { id: "deploying", name: "Deploying", branch: "coding",
    description: "Getting a site live on the internet — static hosting, domains, and builds.",
    dependsOn: ["git-github", "css-basics"], stage: "locked", x: 480, y: 100 },
  { id: "tailwind", name: "Tailwind CSS", branch: "coding",
    description: "A utility-first CSS framework for styling without writing custom CSS.",
    dependsOn: ["css-basics"], stage: "locked", x: 370, y: 290 },
  { id: "react-next", name: "React / Next.js", branch: "coding",
    description: "Component-based UI development with React and the Next.js framework.",
    dependsOn: ["dom-manipulation", "tailwind"], stage: "locked", x: 520, y: 240 },

  // Mentalism & Cold Reading
  { id: "cold-reading-basics", name: "Cold Reading Basics", branch: "mentalism",
    description: "Making calibrated guesses about a person from subtle cues, without prior information.",
    dependsOn: [], stage: "comfortable", x: 819, y: 90 },
  { id: "body-language-reading", name: "Body Language Reading", branch: "mentalism",
    description: "Interpreting posture, micro-expressions, and nonverbal tells.",
    dependsOn: ["cold-reading-basics"], stage: "locked", x: 971, y: 60 },
  { id: "barnum-statements", name: "Barnum Statements", branch: "mentalism",
    description: "Vague, broadly-true statements that feel personally specific to the listener.",
    dependsOn: ["cold-reading-basics"], stage: "locked", x: 960, y: 170 },
  { id: "forcing-techniques", name: "Forcing Techniques", branch: "mentalism",
    description: "Subtly guiding someone toward a choice while it still feels entirely free.",
    dependsOn: ["barnum-statements"], stage: "locked", x: 1090, y: 140 },
  { id: "mentalism-routines", name: "Mentalism Routines", branch: "mentalism",
    description: "Combining reading, suggestion, and misdirection into a full performance piece.",
    dependsOn: ["body-language-reading", "forcing-techniques"], stage: "locked", x: 1070, y: 250 },

  // People Skills & Persuasion
  { id: "active-listening", name: "Active Listening", branch: "people",
    description: "Fully attending to what someone says, without planning your reply while they talk.",
    dependsOn: [], stage: "unlockable", x: 610, y: 380 },
  { id: "rapport-building", name: "Rapport Building", branch: "people",
    description: "Establishing trust and connection quickly in conversation.",
    dependsOn: ["active-listening"], stage: "locked", x: 734, y: 400 },
  { id: "persuasion-principles", name: "Persuasion Principles", branch: "people",
    description: "Core influence principles: reciprocity, social proof, authority, scarcity.",
    dependsOn: ["rapport-building"], stage: "locked", x: 876, y: 430 },
  { id: "public-speaking", name: "Public Speaking", branch: "people",
    description: "Structuring and delivering a talk with confidence in front of a group.",
    dependsOn: ["rapport-building"], stage: "locked", x: 690, y: 480 },

  // Life Skills
  { id: "budgeting-basics", name: "Budgeting Basics", branch: "life",
    description: "Tracking income and expenses, and planning spending with intention.",
    dependsOn: [], stage: "curious", x: 106, y: 470 },
  { id: "cooking-fundamentals", name: "Cooking Fundamentals", branch: "life",
    description: "Core knife skills, heat control, and a handful of reliable base recipes.",
    dependsOn: [], stage: "unlockable", x: 244, y: 510 },
  { id: "time-management", name: "Time Management", branch: "life",
    description: "Prioritizing tasks and structuring a day so the important things get done.",
    dependsOn: ["budgeting-basics"], stage: "locked", x: 170, y: 600 },
  { id: "first-aid-basics", name: "First Aid Basics", branch: "life",
    description: "Handling common injuries: cuts, burns, sprains, and knowing when to seek help.",
    dependsOn: [], stage: "mastered", x: 310, y: 590 },

  // Random Useful Knowledge
  { id: "touch-typing", name: "Touch Typing", branch: "random",
    description: "Typing accurately without looking at the keyboard.",
    dependsOn: [], stage: "solid", x: 840, y: 590 },
  { id: "knot-tying", name: "Knot Tying", branch: "random",
    description: "A handful of genuinely useful knots and when to use each.",
    dependsOn: [], stage: "unlockable", x: 970, y: 550 },
  { id: "memory-palace", name: "Memory Palace", branch: "random",
    description: "Using spatial visualization (the method of loci) to memorize long lists in order.",
    dependsOn: [], stage: "mastered", x: 990, y: 650 },
  { id: "speed-reading", name: "Speed Reading", branch: "random",
    description: "Reading faster while retaining comprehension, using techniques like chunking.",
    dependsOn: ["memory-palace"], stage: "learning", x: 1110, y: 610 }
];
