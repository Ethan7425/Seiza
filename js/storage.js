// ---- Persistence ----
// Supabase is the source of truth (see db.js). localStorage now only
// holds two small things: which profile you last signed in as on this
// device (PROFILE_KEY), and a local cache of that profile's data so
// the page still loads something useful if the network is briefly
// unavailable.
//
// Login is just a name lookup — whatever name you first typed becomes
// your permanent key in the `profiles` table, even if you later
// rename your displayed profileName. That split means renaming never
// has to touch the database row's primary key.

const PROFILE_KEY_STORAGE = "seiza-profile-key";
const CACHE_STORAGE_KEY = "seiza-state-cache";

function getProfileKey() {
  return localStorage.getItem(PROFILE_KEY_STORAGE);
}

function setProfileKey(name) {
  localStorage.setItem(PROFILE_KEY_STORAGE, name);
}

function clearProfileKey() {
  localStorage.removeItem(PROFILE_KEY_STORAGE);
}

// Upgrades older saved/imported data to the current shape:
// - progress entries used to just be a stage string ("mastered")
// - addedLibraryIds/nodePositions didn't exist before the library page
// - quantity (a free-text subtitle like "200 kanji known") didn't
//   exist before the profile/quantity update
// - pushSubscription/etc didn't exist before daily nudges. The target
//   hour used to be user-configurable (reminderHour/reminderMinute)
//   but is now a fixed 10am-local constant in send-nudges.mjs, so
//   those two fields are no longer part of the shape — old profiles
//   that still have them just carry harmless unused data.
// - addedCoreNodeIds didn't exist before the starter tree switched
//   from "always on your map" to the same opt-in model library nodes
//   already used. Every profile before this point effectively had all
//   25 starter nodes active unconditionally (unless individually
//   removed, tracked by the now-retired removedCoreNodeIds) — this
//   preserves that as an explicit list so nobody's existing map
//   changes. Brand-new profiles start with this empty instead (see
//   createBlankState) — an empty map with just the branch nebulas
//   visible until you add something.
function migrateState(state) {
  Object.keys(state.progress).forEach(id => {
    const entry = state.progress[id];
    if (typeof entry === "string") {
      state.progress[id] = { stage: entry, notes: "", proof: [], updatedAt: null, quantity: "" };
    } else if (typeof entry.quantity !== "string") {
      entry.quantity = "";
    }
  });
  if (!Array.isArray(state.addedLibraryIds)) {
    state.addedLibraryIds = [];
  }
  if (!Array.isArray(state.addedCoreNodeIds)) {
    const previouslyRemoved = new Set(state.removedCoreNodeIds || []);
    state.addedCoreNodeIds = NODES.map(n => n.id).filter(id => !previouslyRemoved.has(id));
  }
  if (!state.nodePositions || typeof state.nodePositions !== "object") {
    state.nodePositions = {};
  }
  if (typeof state.pushSubscription === "undefined") {
    state.pushSubscription = null;
  }
  if (typeof state.reminderTimezoneOffsetMinutes !== "number") {
    state.reminderTimezoneOffsetMinutes = null;
  }
  if (typeof state.lastNudgeSentDate === "undefined") {
    state.lastNudgeSentDate = null;
  }
  return state;
}

// A brand-new profile's starting state: nothing added yet, nothing
// pre-filled — just the bare nebulas until you add something from the
// Library. See progress.js for how "locked" vs "unlockable" gets
// recomputed live from dependencies once a node actually is added.
function createBlankState(profileName) {
  return {
    profileName, progress: {}, addedLibraryIds: [], addedCoreNodeIds: [], nodePositions: {},
    pushSubscription: null, reminderTimezoneOffsetMinutes: null, lastNudgeSentDate: null
  };
}

function readLocalCache() {
  const raw = localStorage.getItem(CACHE_STORAGE_KEY);
  if (!raw) return null;
  try {
    return migrateState(JSON.parse(raw));
  } catch (e) {
    return null;
  }
}

function writeLocalCache(state) {
  localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(state));
}

// Loads the signed-in profile's data from Supabase. Falls back to the
// local cache if the network request fails outright (not just "not
// found" — an actual missing profile clears the login and returns
// null, same as never having signed in).
async function loadState() {
  const key = getProfileKey();
  if (!key) return null;

  let data;
  try {
    data = await dbLoadProfile(key);
  } catch (e) {
    console.error("Seiza: couldn't reach the database, using the last cached copy.", e);
    return readLocalCache();
  }

  if (!data) {
    clearProfileKey();
    return null;
  }

  const state = migrateState(data);
  writeLocalCache(state);
  return state;
}

// Writes to the local cache immediately, and to Supabase after a short
// debounce — so a burst of rapid changes (e.g. stepping through stages)
// doesn't fire a network request on every single one, just once
// shortly after they stop.
let saveTimer = null;
let pendingState = null;

// Tracked so a failed sync only announces itself once (not on every
// debounced attempt while still offline) and so coming back online
// only announces recovery if there was actually something to recover
// from. showToast is feature-detected — only index.html loads
// toast.js, so this stays a silent no-op on every other page rather
// than a hard dependency.
let lastSyncFailed = false;

function saveState(state) {
  pendingState = state;
  writeLocalCache(state);

  clearTimeout(saveTimer);
  saveTimer = setTimeout(attemptSync, 600);
}

async function attemptSync() {
  const key = getProfileKey();
  if (!key || !pendingState) return;
  try {
    await dbSaveProfile(key, pendingState);
    if (lastSyncFailed) {
      lastSyncFailed = false;
      if (typeof showToast === "function") showToast("Synced", "default");
    }
  } catch (e) {
    console.error("Seiza: couldn't sync to the database (your changes are still saved locally).", e);
    if (!lastSyncFailed && typeof showToast === "function") {
      showToast("Offline — saved locally, will sync once you're back online", "default");
    }
    lastSyncFailed = true;
  }
}

// The debounce timer only fires while the tab stays open and idle for
// 600ms — reconnecting doesn't wait for that on its own. This is what
// actually makes "will sync once you're back online" true rather than
// just something that happens to work out next time something changes.
window.addEventListener("online", () => {
  if (!lastSyncFailed) return;
  clearTimeout(saveTimer);
  attemptSync();
});

// Immediate (non-debounced) save, for flows that redirect right after
// — a create-new-profile, an import, or anything else that can't wait
// out the debounce before the page navigates away.
async function saveStateNow(name, state) {
  writeLocalCache(state);
  await dbSaveProfile(name, state);
}

async function clearState() {
  const key = getProfileKey();
  if (key) {
    await dbDeleteProfile(key);
  }
  localStorage.removeItem(CACHE_STORAGE_KEY);
  clearProfileKey();
}

function signOut() {
  localStorage.removeItem(CACHE_STORAGE_KEY);
  clearProfileKey();
}

function exportState(state) {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `seiza-progress-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function importStateFromFile(file, onSuccess, onError) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!parsed.profileName || typeof parsed.progress !== "object") {
        throw new Error("That file doesn't look like a Seiza export.");
      }
      onSuccess(migrateState(parsed));
    } catch (e) {
      onError(e);
    }
  };
  reader.onerror = () => onError(reader.error);
  reader.readAsText(file);
}
