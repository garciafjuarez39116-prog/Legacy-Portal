const QB_CLIENT_ID = "ABDEw5ptCf7zHmMwBeaF7c0ba5kVJ3ZtTw68nIfpHqKMMW7URT";
const QB_CLIENT_SECRET = "ugPwnMp7nd8YmIYppdWXmGxhsAAXfzxz1k0DXjHK";
const SUPABASE_URL = "https://wwtltludfnhamqdkpraw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dGx0bHVkZm5oYW1xZGtwcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjAwNDgsImV4cCI6MjA5MzkzNjA0OH0.TZNAR-s37RkGxkKO2q5219u9HUL612GyLWMp8-dPpRI";

async function refreshToken(conn) {
  const credentials = Buffer.from(`${QB_CLIENT_ID}:${QB_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `grant_type=refresh_token&refresh_token=${conn.refresh_token}`,
  });
  const tokens = await res.json();

  await fetch(`${SUPABASE_URL}/rest/v1/qb_connections?client_id=eq.${conn.client_id}`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    }),
  });

  return tokens.access_token;
}

export default async function handler(req, res) {
  const { client_id } = req.query;
  if (!client_id) return res.status(400).json({ error: "Missing client_id" });

  // Get QB connection from Supabase
  const connRes = await fetch(`${SUPABASE_URL}/rest/v1/qb_connections?client_id=eq.${client_id}`, {
    headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` },
  });
  const conns = await connRes.json();
  if (!conns || conns.length === 0) return res.status(404).json({ error: "No QB connection found" });

  let conn = conns[0];
  let accessToken = conn.access_token;

  // Refresh token if expired
  if (new Date(conn.token_expires_at) < new Date()) {
    accessToken = await refreshToken(conn);
  }

  const realmId = conn.realm_id;
  const baseUrl = `https://quickbooks.api.intuit.com/v3/company/${realmId}`;
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    Accept: "application/json",
  };

  // Get current month period
  const now = new Date();
  const startDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split("T")[0];
  const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    // Fetch P&L report
    const plRes = await fetch(
      `${baseUrl}/reports/ProfitAndLoss?start_date=${startDate}&end_date=${endDate}&accounting_method=Accrual`,
      { headers }
    );
    const plData = await plRes.json();

    // Parse P&L
    let income = 0, cogs = 0, overhead = 0;
    const rows = plData?.Rows?.Row || [];

    for (const section of rows) {
      const header = section?.Header?.ColData?.[0]?.value || "";
      const total = parseFloat(section?.Summary?.ColData?.[1]?.value || "0");

      if (header.toLowerCase().includes("income") || header.toLowerCase().includes("revenue")) {
        income = total;
      } else if (header.toLowerCase().includes("cost of goods") || header.toLowerCase().includes("cogs")) {
        cogs = total;
      } else if (header.toLowerCase().includes("expense") || header.toLowerCase().includes("overhead")) {
        overhead += total;
      }
    }

    // Fetch A/R report
    const arRes = await fetch(
      `${baseUrl}/reports/AgedReceivables?report_date=${endDate}`,
      { headers }
    );
    const arData = await arRes.json();

    // Parse A/R entries
    const arEntries = [];
    const arRows = arData?.Rows?.Row || [];
    for (const row of arRows) {
      const cols = row?.ColData || [];
      if (cols.length >= 4 && cols[0]?.value && cols[0]?.value !== "Customer") {
        arEntries.push({
          client_name: cols[0]?.value,
          amount: parseFloat(cols[cols.length - 1]?.value || "0"),
          status: "Pending",
          invoice: `QB-${Date.now()}`,
        });
      }
    }

    // Save financials to Supabase
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/financials?client_id=eq.${client_id}&period=eq.${period}`,
      { headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` } }
    );
    const existing = await existingRes.json();

    if (existing && existing.length > 0) {
      await fetch(`${SUPABASE_URL}/rest/v1/financials?client_id=eq.${client_id}&period=eq.${period}`, {
        method: "PATCH",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ income, cogs, overhead }),
      });
    } else {
      await fetch(`${SUPABASE_URL}/rest/v1/financials`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ client_id, income, cogs, overhead, period }),
      });
    }

    res.status(200).json({ success: true, income, cogs, overhead, period, ar_count: arEntries.length });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch QB data", details: err.message });
  }
}
