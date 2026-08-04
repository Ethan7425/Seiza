// Bumped by hand on every push — shown at the bottom of Settings so
// it's easy to tell from a phone whether the PWA has picked up the
// latest deploy, without having to go check git. Keep CACHE_NAME in
// sw.js in sync too, so a version bump also busts the SW cache.
//
// Semantic-ish versioning: patch (x.y.Z) for small fixes/tweaks,
// minor (x.Y.0) for real feature additions, major (X.0.0) reserved
// for genuinely big overhauls.
const APP_VERSION = "1.0.2";

// One short line per change, newest entry first — shown in Settings
// so it's easy to see what actually changed without digging through
// git. Starts fresh from the switch to semver rather than backfilling
// every earlier "vN" build.
const CHANGELOG = [
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
