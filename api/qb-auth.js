const QB_CLIENT_ID = "ABDEw5ptCf7zHmMwBeaF7c0ba5kVJ3ZtTw68nIfpHqKMMW7URT";
const REDIRECT_URI = "https://legacy-portal-six.vercel.app/api/qb-callback";
const SCOPE = "com.intuit.quickbooks.accounting";

export default function handler(req, res) {
  const { client_id } = req.query;
  if (!client_id) return res.status(400).json({ error: "Missing client_id" });

  const state = Buffer.from(JSON.stringify({ client_id })).toString("base64");

  const authUrl = `https://appcenter.intuit.com/connect/oauth2?` +
    `client_id=${QB_CLIENT_ID}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `response_type=code&` +
    `scope=${encodeURIComponent(SCOPE)}&` +
    `state=${state}`;

  res.redirect(authUrl);
}
