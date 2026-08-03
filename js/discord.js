// ---- Discord webhook (suggestion box) ----
// A plain incoming webhook — no bot, no OAuth, just a POST to a secret
// URL. Create one in Discord: Server Settings -> Integrations ->
// Webhooks -> New Webhook -> pick a channel -> Copy Webhook URL ->
// paste it below. Note this URL ends up readable in the page's source
// like the Supabase key does — anyone with it could post to the
// channel, not just this form. Fine for a small personal server, but
// worth knowing.
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1533853593881546944/xJO8xaBvqvrsJ9GJufQgaNPM5xiqaWyyqfpPjahxYEXvJc3iQI_oYjtNXKrG0YHvm5Kx";

async function sendSuggestion(fromName, type, text) {
  const res = await fetch(DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{
        title: `New suggestion — ${type}`,
        description: text,
        color: 14196828,
        footer: { text: `From ${fromName}` },
        timestamp: new Date().toISOString()
      }]
    })
  });
  if (!res.ok) throw new Error(`Discord rejected it (${res.status})`);
}
