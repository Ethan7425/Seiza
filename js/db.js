// ---- Supabase (raw REST, no SDK needed) ----
// One table: profiles(name text primary key, data jsonb, updated_at).
// The anon key is meant to be public/embedded in client code — that's
// how Supabase's model works. RLS is intentionally left off on this
// table, so there's no auth step here at all, just a name lookup.

const SUPABASE_URL = "https://fsrygplsloxkxmetkvkl.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZzcnlncGxzbG94a3htZXRrdmtsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU2NTM4NTgsImV4cCI6MjEwMTIyOTg1OH0.rM_7mAULa2Fta229tbLPgzoWXUgzJRfVuF8M7jhf2kY";

function dbHeaders(extra = {}) {
  return {
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    ...extra
  };
}

// Returns the profile's data blob, or null if no profile has that name.
async function dbLoadProfile(name) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?name=eq.${encodeURIComponent(name)}&select=data`,
    { headers: dbHeaders() }
  );
  if (!res.ok) throw new Error(`Couldn't reach the database (${res.status})`);
  const rows = await res.json();
  return rows.length ? rows[0].data : null;
}

// Upsert — creates the row if `name` is new, overwrites `data` if not.
async function dbSaveProfile(name, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: dbHeaders({
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates"
    }),
    body: JSON.stringify({ name, data, updated_at: new Date().toISOString() })
  });
  if (!res.ok) throw new Error(`Couldn't save to the database (${res.status})`);
}

async function dbDeleteProfile(name) {
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/profiles?name=eq.${encodeURIComponent(name)}`,
    { method: "DELETE", headers: dbHeaders() }
  );
  if (!res.ok) throw new Error(`Couldn't delete from the database (${res.status})`);
}
