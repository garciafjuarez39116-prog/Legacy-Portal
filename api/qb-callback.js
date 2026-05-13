const QB_CLIENT_ID = "ABDEw5ptCf7zHmMwBeaF7c0ba5kVJ3ZtTw68nIfpHqKMMW7URT";
const QB_CLIENT_SECRET = "ugPwnMp7nd8YmIYppdWXmGxhsAAXfzxz1k0DXjHK";
const REDIRECT_URI = "https://legacy-portal-six.vercel.app/api/qb-callback";
const SUPABASE_URL = "https://wwtltludfnhamqdkpraw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dGx0bHVkZm5oYW1xZGtwcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjAwNDgsImV4cCI6MjA5MzkzNjA0OH0.TZNAR-s37RkGxkKO2q5219u9HUL612GyLWMp8-dPpRI";

export default async function handler(req, res) {
  const { code, state, realmId } = req.query;

  if (!code || !state) return res.status(400).json({ error: "Missing params" });

  let clientId;
  try {
    clientId = JSON.parse(Buffer.from(state, "base64").toString()).client_id;
  } catch {
    return res.status(400).json({ error: "Invalid state" });
  }

  // Exchange code for tokens
  const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64");
  const tokenRes = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: `grant_type=authorization_code&code=${code}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
  });

  const tokens = await tokenRes.json();
  if (!tokens.access_token) return res.status(400).json({ error: "Token exchange failed", details: tokens });

  // Save tokens to Supabase
  await fetch(`${SUPABASE_URL}/rest/v1/qb_connections`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify({
      client_id: clientId,
      realm_id: realmId,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }),
  });

  // Redirect back to portal
  res.redirect(`https://legacy-portal-six.vercel.app?qb_connected=true&client=${clientId}`);
}
