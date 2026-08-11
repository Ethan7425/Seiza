// ---- Daily reminder sender ----
// Run hourly by .github/workflows/daily-nudge.yml (so it can catch
// 10am local time regardless of which timezone a profile is in). For
// every profile with a live push subscription whose local hour is
// currently 10am and who hasn't been nudged today, pick their
// most-neglected in-progress node and send one push about it.
// Profiles with nothing in progress are skipped entirely that day —
// no manufactured "come back!" guilt message. The target hour is
// fixed for everyone (no per-user time picker — just an on/off
// toggle in Settings), which is what keeps this simple.
//
// Not part of the served site — only ever run by CI, with the VAPID
// private key coming from a GitHub Actions secret, never committed.

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import webpush from "web-push";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const SUPABASE_URL = "https://fsrygplsloxkxmetkvkl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcnlncGxzbG94a3htZXRrdmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTM4NTgsImV4cCI6MjEwMTIyOTg1OH0.rM_7mAULa2Fta229tbLPgzoWXUgzJRfVuF8M7jhf2kY";

const VAPID_PUBLIC_KEY = "BAEW-v85iDg1mJ19dZ8P_a_4-emk9_dmo-VWsSimDOjxDycABzyf7n5xLiY_HKIm8M2tqCA67xecY4dtbvKXGCE";
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
const VAPID_SUBJECT = "mailto:ethanbernard25@gmail.com";

if (!VAPID_PRIVATE_KEY) {
  throw new Error("VAPID_PRIVATE_KEY env var is required (set as a GitHub Actions secret).");
}

webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

// The node catalog + stage labels are plain browser globals in the
// real app (classic <script> tags sharing one scope) — loading them
// into a throwaway vm context here is the simplest way to reuse that
// same data file from a Node script without duplicating it.
function loadCatalog() {
  const ctx = {};
  vm.createContext(ctx);
  for (const file of ["js/data.js", "js/library.js", "js/progress.js"]) {
    vm.runInContext(fs.readFileSync(path.join(repoRoot, file), "utf8"), ctx);
  }
  // Top-level const/let bindings from a vm-run script aren't exposed
  // as properties on the context object — pulling them out via one
  // more runInContext call (rather than ctx.NODES directly) is what
  // actually works.
  const { NODES, LIBRARY_NODES, STAGE_LABELS } = vm.runInContext(
    "({ NODES, LIBRARY_NODES, STAGE_LABELS })", ctx
  );
  return { allNodes: [...NODES, ...LIBRARY_NODES], STAGE_LABELS };
}

const IN_PROGRESS_STAGES = ["curious", "learning", "comfortable", "solid"];

function dbHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra
  };
}

async function fetchAllProfiles() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=name,data`, { headers: dbHeaders() });
  if (!res.ok) throw new Error(`Couldn't list profiles (${res.status})`);
  return res.json();
}

async function saveProfileData(name, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: dbHeaders({ "Content-Type": "application/json", Prefer: "resolution=merge-duplicates" }),
    body: JSON.stringify({ name, data, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(`Couldn't save profile "${name}" (${res.status})`);
}

// All in UTC arithmetic throughout — the runner's own local timezone
// (GitHub Actions defaults to UTC anyway) must never leak in here.
function localTimeFor(offsetMinutes, nowMs) {
  const localMs = nowMs - offsetMinutes * 60000;
  const d = new Date(localMs);
  const hour = d.getUTCHours();
  const dateKey = d.toISOString().slice(0, 10);
  return { hour, dateKey };
}

// Fixed for every profile — no per-user time picker, just on/off.
const TARGET_HOUR = 10;

function pickNeglectedNode(data, allNodes) {
  let best = null;
  Object.entries(data.progress).forEach(([nodeId, entry]) => {
    if (!IN_PROGRESS_STAGES.includes(entry.stage)) return;
    const node = allNodes.find(n => n.id === nodeId);
    if (!node) return;
    const updatedAt = entry.updatedAt ? new Date(entry.updatedAt).getTime() : 0;
    if (!best || updatedAt < best.updatedAt) {
      best = { node, stage: entry.stage, updatedAt };
    }
  });
  return best;
}

async function main() {
  const { allNodes, STAGE_LABELS } = loadCatalog();
  const profiles = await fetchAllProfiles();
  const nowMs = Date.now();

  for (const { name, data } of profiles) {
    if (!data || !data.pushSubscription || typeof data.reminderTimezoneOffsetMinutes !== "number") continue;

    const { hour, dateKey } = localTimeFor(data.reminderTimezoneOffsetMinutes, nowMs);
    if (hour !== TARGET_HOUR) continue;
    if (data.lastNudgeSentDate === dateKey) continue;

    const picked = pickNeglectedNode(data, allNodes);

    if (!picked) {
      // Deliberately doesn't mark lastNudgeSentDate — if something
      // starts being tracked later and this window gets checked again
      // (a manual test run, or a rare double-fire), it's not stuck
      // "already handled today" over nothing having actually been sent.
      console.log(`${name} has nothing in progress today — skipping.`);
      continue;
    }

    const message = `${picked.node.name} is still at ${STAGE_LABELS[picked.stage]} — let's grow it stronger.`;
    try {
      await webpush.sendNotification(data.pushSubscription, JSON.stringify({
        title: "Seiza",
        body: message,
        url: "./index.html"
      }));
      console.log(`Sent to ${name}: ${message}`);
      data.lastNudgeSentDate = dateKey;
      await saveProfileData(name, data);
    } catch (e) {
      if (e.statusCode === 404 || e.statusCode === 410) {
        console.log(`Subscription for ${name} is gone — clearing it.`);
        data.pushSubscription = null;
        await saveProfileData(name, data);
      } else {
        // Transient failure — leave lastNudgeSentDate alone so the
        // next hourly run (or a retry) can try again.
        console.error(`Failed to send to ${name}:`, e.message);
      }
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
