// Bumped by hand on every push — shown at the bottom of Settings so
// it's easy to tell from a phone whether the PWA has picked up the
// latest deploy, without having to go check git. Keep CACHE_NAME in
// sw.js in sync too, so a version bump also busts the SW cache.
//
// Semantic-ish versioning: patch (x.y.Z) for small fixes/tweaks,
// minor (x.Y.0) for real feature additions, major (X.0.0) reserved
// for genuinely big overhauls.
const APP_VERSION = "1.5.0";

// One short line per change, newest entry first — shown in Settings
// so it's easy to see what actually changed without digging through
// git. Starts fresh from the switch to semver rather than backfilling
// every earlier "vN" build.
const CHANGELOG = [
  {
    version: "1.5.0",
    date: "2026-08-22",
    notes: [
      "Node titles are now readable at a consistent size any time they're visible, not just at max zoom",
      "Mobile pinch-zoom can now get meaningfully closer in, instead of stopping early",
      "Ghost branches (nothing added yet) stay unnamed until you zoom in a bit on mobile, so the map opens on just the branches you've actually built",
      "More breathing room between nebula clusters across the whole map",
      "Nodes in the same branch no longer line up in perfect rows/columns — spaced more naturally and it fixes some remaining label overlaps",
      "Confirm/alert popups (removing a node, deleting your profile, etc.) are now styled to match the app instead of a plain browser popup",
      "You'll now get a heads-up if a change couldn't sync (saved locally either way), and a confirmation once it catches back up"
    ]
  },
  {
    version: "1.4.0",
    date: "2026-08-22",
    notes: [
      "Mobile overhaul: page-to-page navigation now crossfades instead of a hard blank-flash reload",
      "Buttons, cards, and nodes now respond visually the instant you touch them",
      "Loading skeletons instead of blank screens while your data loads",
      "Fixed: toasts (mastery/unlock/achievement) were rendering hidden underneath the tab bar",
      "Content now clears the status bar/notch properly once added to your Home Screen",
      "Swipe from the left edge to go back, on Home Screen launches",
      "The side panel now has a drag handle — swipe it down to dismiss",
      "A few small icon buttons were sized below a comfortable tap target — fixed"
    ]
  },
  {
    version: "1.3.0",
    date: "2026-08-13",
    notes: [
      "The map now starts empty — nothing's pre-added anymore, so what you see is only what you've chosen to track (browse the Library to add nodes, or whole branches at once)",
      "Every node can now be removed from the map from its own panel, not just ones added from the Library",
      "Library can now also remove whole branches at once, for easier cleanup",
      "Skill tree layout rebuilt from scratch: nodes are spaced out in a proper branching tree instead of a jittered stack, and branches are packed so they never overlap, however many get added over time",
      "Zoomed all the way out now shows just the nebulas and their names; zoom in to reveal nodes, then labels — no more cramped overlapping text",
      "Bigger nebula names when fully zoomed out, easier to read at a glance"
    ]
  },
  {
    version: "1.2.0",
    date: "2026-08-11",
    notes: [
      "Fixed: a locked node whose dependency was only in the library (not yet added to the map) silently failed to open when tapped",
      "Library reorganized: the 4 vague grab-bag branches split into 16 focused ones (e.g. Astronomy & the Sky, Backend & APIs)",
      "Library page now shows branches as clickable cards you preview, instead of one long flat list of every skill"
    ]
  },
  {
    version: "1.1.0",
    date: "2026-08-11",
    notes: [
      "Node notes replaced with a one-tap \"Open in Obsidian\" link — write notes there instead of in-app",
      "Daily reminders simplified: just on/off now, always around 10am your time (no more time picker)",
      "Reminder checks back to hourly, matching the simpler fixed-time design"
    ]
  },
  {
    version: "1.0.6",
    date: "2026-08-10",
    notes: [
      "Test button in Settings for opening the Obsidian app via its URL scheme"
    ]
  },
  {
    version: "1.0.5",
    date: "2026-08-04",
    notes: [
      "Doubled the tab bar's edge buffer for more comfortable clearance from the gesture zone"
    ]
  },
  {
    version: "1.0.4",
    date: "2026-08-04",
    notes: [
      "Added real buffer space below the tab bar — it was sitting so close to the screen edge that taps were getting hijacked by the phone's own edge-swipe gesture"
    ]
  },
  {
    version: "1.0.3",
    date: "2026-08-04",
    notes: [
      "Gave the tab bar an explicit minimum height as a safety net, in case it was rendering collapsed on some devices"
    ]
  },
  {
    version: "1.0.2",
    date: "2026-08-04",
    notes: [
      "Tab bar is now part of the actual page layout instead of a floating overlay with a guessed height — fixes content still getting cut off under it on real phones"
    ]
  },
  {
    version: "1.0.1",
    date: "2026-08-04",
    notes: [
      "Fixed content sitting slightly under the bottom tab bar on real phones (was measuring its height with a hardcoded guess instead of the real rendered size)"
    ]
  },
  {
    version: "1.0.0",
    date: "2026-08-03",
    notes: [
      "Switched to semantic versioning + this changelog",
      "Reminders now check to the minute, not just the hour",
      "Reminder checks avoid GitHub's congested top-of-hour cron slots",
      "Service worker auto-reloads on update instead of silently going stale"
    ]
  }
];
