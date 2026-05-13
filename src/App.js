import React, { useState, useEffect, useRef } from "react";

const SUPABASE_URL = "https://wwtltludfnhamqdkpraw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3dGx0bHVkZm5oYW1xZGtwcmF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzNjAwNDgsImV4cCI6MjA5MzkzNjA0OH0.TZNAR-s37RkGxkKO2q5219u9HUL612GyLWMp8-dPpRI";
const ANTHROPIC_KEY = ""; // Add your key here when ready

const db = {
  get: async (table, query = "") => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}${query}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json" }
    });
    return res.json();
  },
  post: async (table, body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  patch: async (table, id, body) => {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  delete: async (table, id) => {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

const ADMIN_EMAIL = "admin@legacytax.com";
const ADMIN_PASSWORD = "Legacy2024!";

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n || 0);
const pct = (a, b) => b ? ((a / b) * 100).toFixed(1) + "%" : "0.0%";

const GOLD = "#C9A84C";
const DARK = "#0F1117";
const CARD_BG = "#181C27";
const SIDEBAR_BG = "#0B0E18";
const TEXT = "#E8EAF0";
const MUTED = "#6B7280";
const QB_GREEN = "#2CA01C";

const PACKAGES = {
  1: { name: "Package 1", features: ["Monthly P&L Report", "Basic Bookkeeping", "Tax Filing Support"] },
  2: { name: "Package 2", features: ["Monthly P&L Report", "Full Bookkeeping", "Tax Filing Support", "A/R Tracking"] },
  3: { name: "Package 3", features: ["Monthly P&L Report", "Full Bookkeeping", "Tax Filing Support", "A/R Tracking", "Financial Projections", "Pricing Analysis", "Budget Planning"] },
};

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return isMobile;
}

export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [isAdmin, setIsAdmin] = useState(false);
  if (!user) return <Login onLogin={(u, admin) => { setUser(u); setIsAdmin(admin); setPage("dashboard"); }} />;
  if (isAdmin) return <AdminPortal onLogout={() => { setUser(null); setIsAdmin(false); }} />;
  return <Portal user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} />;
}

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setLoading(true); setError("");
    if (email.toLowerCase() === ADMIN_EMAIL && pass === ADMIN_PASSWORD) {
      onLogin({ email, company: "Legacy Tax & Strategy" }, true);
      setLoading(false); return;
    }
    try {
      const data = await db.get("clients", `?email=eq.${email.toLowerCase()}&active=eq.true`);
      if (data && data.length > 0 && data[0].password === pass) {
        onLogin(data[0], false);
      } else { setError("Invalid credentials. Please try again."); }
    } catch { setError("Connection error. Please try again."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #0B0E18 0%, #131828 60%, #0F1520 100%)", fontFamily: "Georgia, serif", padding: 16 }}>
      <div style={{ background: CARD_BG, borderRadius: 4, padding: "40px 32px", width: "100%", maxWidth: 400, border: "1px solid #2A2F42", boxShadow: "0 24px 64px rgba(0,0,0,0.6)" }}>
        <div style={{ textAlign: "center", marginBottom: 4 }}>
          <span style={{ display: "block", fontSize: 26, letterSpacing: 8, color: GOLD, fontWeight: 700 }}>LEGACY</span>
          <span style={{ display: "block", fontSize: 10, letterSpacing: 4, color: MUTED, marginTop: 4 }}>TAX & STRATEGY</span>
        </div>
        <div style={{ height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}55, transparent)`, margin: "20px 0" }} />
        <p style={{ textAlign: "center", color: MUTED, fontSize: 12, letterSpacing: 2, marginBottom: 28 }}>CLIENT PORTAL</p>
        {[{ label: "Email", type: "email", val: email, set: setEmail, ph: "your@email.com" },
          { label: "Password", type: "password", val: pass, set: setPass, ph: "••••••••" }].map(f => (
          <div key={f.label} style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 11, letterSpacing: 1.5, color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>{f.label}</label>
            <input style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "12px 14px", color: TEXT, fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
              type={f.type} placeholder={f.ph} value={f.val} onChange={e => f.set(e.target.value)} onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
        ))}
        {error && <p style={{ color: "#E55", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}
        <button style={{ width: "100%", background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: 14, fontSize: 13, letterSpacing: 2, fontWeight: 700, cursor: "pointer", marginTop: 8, textTransform: "uppercase", fontFamily: "Georgia, serif", opacity: loading ? 0.7 : 1 }}
          onClick={handle} disabled={loading}>{loading ? "Signing in…" : "Sign In"}</button>
        <p style={{ textAlign: "center", color: "#3A3F52", fontSize: 11, marginTop: 20, letterSpacing: 1 }}>Access provided by Legacy Tax & Strategy</p>
      </div>
    </div>
  );
}

function AdminPortal({ onLogout }) {
  const [clients, setClients] = useState([]);
  const [page, setPage] = useState("clients");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [qbStatus, setQbStatus] = useState({});
  const isMobile = useIsMobile();
  const emptyForm = { email: "", password: "", company: "", logo: "", package: 1, color: "#C9A84C", active: true };
  const [form, setForm] = useState(emptyForm);
  const [saved, setSaved] = useState("");

  const loadClients = async () => {
    setLoading(true);
    const data = await db.get("clients", "?order=created_at.desc");
    setClients(data || []);
    const conns = await db.get("qb_connections", "");
    const statusMap = {};
    (conns || []).forEach(c => { statusMap[c.client_id] = true; });
    setQbStatus(statusMap);
    setLoading(false);
  };

  useEffect(() => { loadClients(); }, []);

  const saveClient = async () => {
    if (!form.email || !form.password || !form.company || !form.logo) return;
    if (editClient) { await db.patch("clients", editClient.id, form); setSaved("Client updated."); }
    else { await db.post("clients", form); setSaved("Client added."); }
    setShowForm(false); setEditClient(null); setForm(emptyForm);
    loadClients(); setTimeout(() => setSaved(""), 2500);
  };

  const toggleActive = async (c) => { await db.patch("clients", c.id, { active: !c.active }); loadClients(); };

  const openEdit = (c) => {
    setEditClient(c);
    setForm({ email: c.email, password: c.password, company: c.company, logo: c.logo, package: c.package, color: c.color, active: c.active });
    setShowForm(true);
  };

  const connectQB = (c) => { window.open(`/api/qb-auth?client_id=${c.id}`, "_blank"); };

  const syncQB = async (c) => {
    setSaved(`Syncing QB for ${c.company}…`);
    try {
      const res = await fetch(`/api/qb-data?client_id=${c.id}`);
      const data = await res.json();
      if (data.success) setSaved(`✓ QB synced for ${c.company}`);
      else setSaved(`QB error: ${data.error}`);
    } catch { setSaved("QB sync failed"); }
    setTimeout(() => setSaved(""), 3000);
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: DARK, fontFamily: "Georgia, serif", color: TEXT }}>
      {!isMobile && (
        <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: "1px solid #1E2235", display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1E2235" }}>
            <span style={{ display: "block", fontSize: 18, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>LEGACY</span>
            <span style={{ display: "block", fontSize: 8, letterSpacing: 3, color: MUTED, marginTop: 3 }}>ADMIN PANEL</span>
          </div>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #1E2235" }}>
            <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>Signed in as</p>
            <p style={{ fontSize: 12, fontWeight: 700, margin: "4px 0 0", color: GOLD }}>Administrator</p>
          </div>
          <nav style={{ flex: 1, padding: "16px 0" }}>
            {[{ id: "clients", label: "Clients", icon: "◉" }, { id: "financials", label: "Financials", icon: "◈" }].map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 24px", background: page === n.id ? "#C9A84C11" : "none", border: "none", borderRight: page === n.id ? `2px solid ${GOLD}` : "2px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                <span>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#3A3F52", fontSize: 12, cursor: "pointer", padding: "16px 24px", textAlign: "left" }}>← Sign Out</button>
        </aside>
      )}
      {isMobile && (
        <div style={{ background: SIDEBAR_BG, borderBottom: "1px solid #1E2235", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div><span style={{ fontSize: 16, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>LEGACY</span><span style={{ fontSize: 9, letterSpacing: 2, color: MUTED, marginLeft: 6 }}>ADMIN</span></div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: MUTED, fontSize: 12, cursor: "pointer" }}>← Out</button>
        </div>
      )}
      <main style={{ flex: 1, padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
        {page === "clients" && (
          <>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
              <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: 0 }}>Clients</h1>
              <button onClick={() => { setShowForm(!showForm); setEditClient(null); setForm(emptyForm); }} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                {showForm ? "Cancel" : "+ New Client"}
              </button>
            </div>
            {saved && <div style={{ background: "#1A9E6C22", border: "1px solid #1A9E6C55", color: "#1A9E6C", padding: "10px 16px", borderRadius: 2, fontSize: 13, marginBottom: 16 }}>✓ {saved}</div>}
            {showForm && (
              <div style={{ background: CARD_BG, border: `1px solid ${GOLD}44`, borderRadius: 2, padding: 24, marginBottom: 20 }}>
                <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: GOLD }}>{editClient ? "Edit Client" : "New Client"}</h3>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
                  {[{ key: "email", label: "Email", type: "email", ph: "client@company.com" }, { key: "password", label: "Password", type: "text", ph: "client123" }, { key: "company", label: "Company Name", type: "text", ph: "Company LLC" }, { key: "logo", label: "Logo Initials (2-3 letters)", type: "text", ph: "ABC" }, { key: "color", label: "Brand Color", type: "color", ph: "" }].map(f => (
                    <div key={f.key}>
                      <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>{f.label}</label>
                      <input style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: f.type === "color" ? "4px 8px" : "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box", height: f.type === "color" ? 42 : "auto" }}
                        type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                    </div>
                  ))}
                  <div>
                    <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>Package</label>
                    <select style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                      value={form.package} onChange={e => setForm({ ...form, package: Number(e.target.value) })}>
                      <option value={1}>Package 1</option><option value={2}>Package 2</option><option value={3}>Package 3</option>
                    </select>
                  </div>
                </div>
                <button onClick={saveClient} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>
                  {editClient ? "Save Changes" : "Create Client"}
                </button>
              </div>
            )}
            {loading ? <p style={{ color: MUTED, padding: 20 }}>Loading…</p> : (
              <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2 }}>
                {clients.length === 0 ? <p style={{ color: MUTED, padding: 20, fontSize: 13 }}>No clients yet.</p> :
                  clients.map(c => (
                    <div key={c.id} style={{ padding: "16px 20px", borderBottom: "1px solid #1E2235" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                        <div style={{ width: 38, height: 38, borderRadius: 2, background: c.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{c.logo}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 14, fontWeight: 700, margin: "0 0 2px" }}>{c.company}</p>
                          <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>{c.email} · Package {c.package}</p>
                        </div>
                        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ padding: "3px 8px", borderRadius: 2, fontSize: 10, fontWeight: 600, background: c.active ? "#1A9E6C22" : "#C0392B22", color: c.active ? "#1A9E6C" : "#C0392B" }}>{c.active ? "Active" : "Inactive"}</span>
                          <button onClick={() => openEdit(c)} style={{ background: "#1E2235", border: "none", color: TEXT, fontSize: 11, cursor: "pointer", padding: "5px 10px", borderRadius: 2 }}>Edit</button>
                          <button onClick={() => toggleActive(c)} style={{ background: "#1E2235", border: "none", color: c.active ? "#C0392B" : "#1A9E6C", fontSize: 11, cursor: "pointer", padding: "5px 10px", borderRadius: 2 }}>{c.active ? "Disable" : "Enable"}</button>
                        </div>
                      </div>
                      <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #1E2235", display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 10, color: MUTED, letterSpacing: 1 }}>QUICKBOOKS:</span>
                        {qbStatus[c.id] ? (
                          <>
                            <span style={{ padding: "3px 8px", borderRadius: 2, fontSize: 10, fontWeight: 600, background: "#2CA01C22", color: QB_GREEN }}>✓ Connected</span>
                            <button onClick={() => syncQB(c)} style={{ background: "#1E2235", border: "none", color: QB_GREEN, fontSize: 11, cursor: "pointer", padding: "5px 10px", borderRadius: 2 }}>↻ Sync Now</button>
                          </>
                        ) : (
                          <button onClick={() => connectQB(c)} style={{ background: QB_GREEN, color: "#fff", border: "none", borderRadius: 2, padding: "5px 12px", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>Connect QB</button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </>
        )}
        {page === "financials" && <AdminFinancials clients={clients} isMobile={isMobile} />}
      </main>
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: SIDEBAR_BG, borderTop: "1px solid #1E2235", display: "flex", zIndex: 100 }}>
          {[{ id: "clients", label: "Clients", icon: "◉" }, { id: "financials", label: "Financials", icon: "◈" }].map(n => (
            <button key={n.id} onClick={() => setPage(n.id)} style={{ flex: 1, padding: "12px 4px", background: "none", border: "none", borderTop: page === n.id ? `2px solid ${GOLD}` : "2px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminFinancials({ clients, isMobile }) {
  const [selectedId, setSelectedId] = useState("");
  const [financials, setFinancials] = useState(null);
  const [form, setForm] = useState({ income: "", cogs: "", overhead: "", period: new Date().toISOString().slice(0, 7) });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadFinancials = async (clientId) => {
    setLoading(true);
    const data = await db.get("financials", `?client_id=eq.${clientId}&order=created_at.desc&limit=1`);
    if (data && data.length > 0) { setFinancials(data[0]); setForm({ income: data[0].income, cogs: data[0].cogs, overhead: data[0].overhead, period: data[0].period }); }
    else { setFinancials(null); setForm({ income: "", cogs: "", overhead: "", period: new Date().toISOString().slice(0, 7) }); }
    setLoading(false);
  };

  const saveFinancials = async () => {
    if (!selectedId) return;
    const payload = { client_id: selectedId, income: Number(form.income), cogs: Number(form.cogs), overhead: Number(form.overhead), period: form.period };
    if (financials) { await db.patch("financials", financials.id, payload); }
    else { await db.post("financials", payload); }
    setSaved(true); setTimeout(() => setSaved(false), 2500);
    loadFinancials(selectedId);
  };

  const income = Number(form.income) || 0;
  const cogs = Number(form.cogs) || 0;
  const overhead = Number(form.overhead) || 0;
  const netIncome = income - cogs - overhead;

  return (
    <div>
      <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: "0 0 24px" }}>Financials</h1>
      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20, marginBottom: 20 }}>
        <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: MUTED, marginBottom: 8, textTransform: "uppercase" }}>Select Client</label>
        <select style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none" }}
          value={selectedId} onChange={e => { setSelectedId(e.target.value); if (e.target.value) loadFinancials(e.target.value); }}>
          <option value="">— Choose a client —</option>
          {clients.filter(c => c.active).map(c => <option key={c.id} value={c.id}>{c.company}</option>)}
        </select>
      </div>
      {selectedId && !loading && (
        <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20, marginBottom: 20 }}>
          <h3 style={{ fontSize: 12, letterSpacing: 2, color: MUTED, textTransform: "uppercase", margin: "0 0 16px" }}>{financials ? "Update Financials" : "Add Financials"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 16 }}>
            {[{ key: "period", label: "Period (YYYY-MM)", type: "month" }, { key: "income", label: "Total Income ($)", type: "number" }, { key: "cogs", label: "COGS ($)", type: "number" }, { key: "overhead", label: "Overhead ($)", type: "number" }].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>{f.label}</label>
                <input style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
          </div>
          <div style={{ background: "#0F1117", border: "1px solid #1E2235", borderRadius: 2, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 10, letterSpacing: 2, color: MUTED, margin: "0 0 12px", textTransform: "uppercase" }}>Preview</p>
            {[{ label: "Income", val: income, color: "#1A9E6C" }, { label: "COGS", val: cogs, color: "#C0392B" }, { label: "Overhead", val: overhead, color: "#E67E22" }, { label: "Net Income", val: netIncome, color: netIncome >= 0 ? "#1A9E6C" : "#C0392B" }].map(r => (
              <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #1E2235", fontSize: 13 }}>
                <span style={{ color: MUTED }}>{r.label}</span>
                <span style={{ color: r.color, fontWeight: 700 }}>{fmt(r.val)}</span>
              </div>
            ))}
          </div>
          {saved && <div style={{ background: "#1A9E6C22", border: "1px solid #1A9E6C55", color: "#1A9E6C", padding: "10px 16px", borderRadius: 2, fontSize: 13, marginBottom: 12 }}>✓ Financials saved</div>}
          <button onClick={saveFinancials} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>Save Financials</button>
        </div>
      )}
    </div>
  );
}

function AIChat({ user, financials, arEntries, onClose }) {
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Hola! Soy tu asistente financiero de Legacy Tax & Strategy. Puedo explicarte tus números, responderte preguntas sobre tu negocio o ayudarte a entender tus resultados. ¿En qué te puedo ayudar?` }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const messagesEnd = useRef(null);
  const recognition = useRef(null);

  const income = financials?.income || 0;
  const cogs = financials?.cogs || 0;
  const overhead = financials?.overhead || 0;
  const netIncome = income - cogs - overhead;

  const systemPrompt = `Eres el asistente financiero de Legacy Tax & Strategy. Estás hablando con ${user.company}.
Sus datos financieros del período ${financials?.period || "actual"} son:
- Ingresos totales: ${fmt(income)}
- COGS (Costo de ventas): ${fmt(cogs)} (${pct(cogs, income)} del ingreso)
- Overhead (Gastos fijos): ${fmt(overhead)} (${pct(overhead, income)} del ingreso)
- Ingreso neto: ${fmt(netIncome)} (margen de ${pct(netIncome, income)})
- Cuentas por cobrar abiertas: ${arEntries.length} facturas por un total de ${fmt(arEntries.reduce((s, e) => s + Number(e.amount), 0))}
Responde de manera amigable, clara y en el idioma que te hablen (español o inglés). Sé conciso.`;

  useEffect(() => { messagesEnd.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text) => {
    if (!text.trim()) return;
    if (!ANTHROPIC_KEY) {
      setMessages(prev => [...prev, { role: "user", content: text }, { role: "assistant", content: "El asistente de IA estará disponible pronto. Contacta a Legacy Tax & Strategy para más información." }]);
      setInput(""); return;
    }
    const userMsg = { role: "user", content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput(""); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-api-key": ANTHROPIC_KEY, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({ model: "claude-sonnet-4-20250514", max_tokens: 500, system: systemPrompt, messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })) })
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Lo siento, no pude procesar tu pregunta.";
      setMessages(prev => [...prev, { role: "assistant", content: reply }]);
      if ("speechSynthesis" in window) { const u = new SpeechSynthesisUtterance(reply); u.lang = "es-MX"; window.speechSynthesis.speak(u); }
    } catch { setMessages(prev => [...prev, { role: "assistant", content: "Error de conexión. Intenta de nuevo." }]); }
    setLoading(false);
  };

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Usa Chrome para voz."); return; }
    recognition.current = new SR();
    recognition.current.lang = "es-MX";
    recognition.current.onresult = (e) => { const t = e.results[0][0].transcript; setInput(t); send(t); };
    recognition.current.onend = () => setListening(false);
    recognition.current.start(); setListening(true);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 200, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: 16 }}>
      <div style={{ background: CARD_BG, border: "1px solid #2A2F42", borderRadius: 4, width: "100%", maxWidth: 520, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid #1E2235", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 2, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>✦</div>
            <div><p style={{ fontSize: 13, fontWeight: 700, margin: 0, color: GOLD }}>Legacy AI</p><p style={{ fontSize: 10, color: MUTED, margin: 0 }}>Asistente financiero</p></div>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, fontSize: 18, cursor: "pointer" }}>✕</button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 12 }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "80%", padding: "10px 14px", borderRadius: 3, background: m.role === "user" ? GOLD : "#1E2235", color: m.role === "user" ? "#0B0E18" : TEXT, fontSize: 13, lineHeight: 1.5 }}>{m.content}</div>
            </div>
          ))}
          {loading && <div style={{ display: "flex", justifyContent: "flex-start" }}><div style={{ padding: "10px 14px", borderRadius: 3, background: "#1E2235", color: MUTED, fontSize: 13 }}>Pensando…</div></div>}
          <div ref={messagesEnd} />
        </div>
        <div style={{ padding: "12px 16px", borderTop: "1px solid #1E2235", display: "flex", gap: 8, alignItems: "center" }}>
          <input style={{ flex: 1, background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", fontFamily: "inherit" }}
            placeholder="Escribe tu pregunta…" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send(input)} />
          <button onClick={startListening} style={{ background: listening ? "#C0392B" : "#1E2235", border: "none", borderRadius: 2, padding: "10px 12px", color: listening ? "#fff" : MUTED, cursor: "pointer", fontSize: 16 }}>{listening ? "⏹" : "🎤"}</button>
          <button onClick={() => send(input)} disabled={loading || !input.trim()} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "10px 14px", fontWeight: 700, cursor: "pointer", fontSize: 13, opacity: loading || !input.trim() ? 0.5 : 1 }}>→</button>
        </div>
      </div>
    </div>
  );
}

function Portal({ user, page, setPage, onLogout }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);
  const [financials, setFinancials] = useState(null);
  const [arEntries, setArEntries] = useState([]);
  const [showAI, setShowAI] = useState(false);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "financials", label: "Financials", icon: "◈" },
    ...(user.package >= 2 ? [{ id: "ar", label: "A/R", icon: "◉" }] : []),
    { id: "profile", label: "Profile", icon: "◎" },
  ];

  useEffect(() => {
    db.get("financials", `?client_id=eq.${user.id}&order=created_at.desc&limit=1`).then(data => { if (data && data.length > 0) setFinancials(data[0]); });
    if (user.package >= 2) { db.get("ar_entries", `?client_id=eq.${user.id}&order=created_at.desc`).then(data => { setArEntries(data || []); }); }
  }, [user.id, user.package]);

  const goTo = (id) => { setPage(id); setMenuOpen(false); };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: DARK, fontFamily: "Georgia, serif", color: TEXT }}>
      {isMobile && (
        <div style={{ background: SIDEBAR_BG, borderBottom: "1px solid #1E2235", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div><span style={{ fontSize: 16, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>LEGACY</span><span style={{ fontSize: 8, letterSpacing: 3, color: MUTED, marginLeft: 4 }}>TAX & STRATEGY</span></div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: GOLD, fontSize: 22, cursor: "pointer", padding: 4 }}>{menuOpen ? "✕" : "☰"}</button>
        </div>
      )}
      {isMobile && menuOpen && (
        <div style={{ background: SIDEBAR_BG, borderBottom: "1px solid #1E2235", position: "sticky", top: 53, zIndex: 99 }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1E2235", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 2, background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{user.logo}</div>
            <div><p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{user.company}</p><p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{PACKAGES[user.package].name}</p></div>
          </div>
          {nav.map(n => (
            <button key={n.id} onClick={() => goTo(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 20px", background: page === n.id ? "#C9A84C11" : "none", border: "none", borderLeft: page === n.id ? `3px solid ${GOLD}` : "3px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
          <button onClick={onLogout} style={{ display: "block", width: "100%", padding: "14px 20px", background: "none", border: "none", color: "#3A3F52", fontSize: 12, cursor: "pointer", textAlign: "left" }}>← Sign Out</button>
        </div>
      )}
      {!isMobile && (
        <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: "1px solid #1E2235", display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1E2235" }}>
            <span style={{ display: "block", fontSize: 18, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>LEGACY</span>
            <span style={{ display: "block", fontSize: 8, letterSpacing: 3, color: MUTED, marginTop: 3 }}>TAX & STRATEGY</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid #1E2235" }}>
            <div style={{ width: 36, height: 36, borderRadius: 2, background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user.logo}</div>
            <div><p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: TEXT }}>{user.company}</p><p style={{ fontSize: 10, color: MUTED, margin: 0, marginTop: 2 }}>{PACKAGES[user.package].name}</p></div>
          </div>
          <nav style={{ flex: 1, padding: "16px 0" }}>
            {nav.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 24px", background: page === n.id ? "#C9A84C11" : "none", border: "none", borderRight: page === n.id ? `2px solid ${GOLD}` : "2px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 13, cursor: "pointer", textAlign: "left" }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <div style={{ padding: "16px 24px", borderTop: "1px solid #1E2235" }}>
            <button onClick={() => setShowAI(true)} style={{ width: "100%", background: `linear-gradient(135deg, ${GOLD}22, ${GOLD}11)`, color: GOLD, border: `1px solid ${GOLD}44`, borderRadius: 2, padding: "10px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 0.5 }}>
              ✦ Ask Legacy AI
            </button>
          </div>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#3A3F52", fontSize: 12, cursor: "pointer", padding: "16px 24px", textAlign: "left" }}>← Sign Out</button>
        </aside>
      )}
      <main style={{ flex: 1, overflowY: "auto", background: DARK }}>
        {page === "dashboard" && <Dashboard user={user} setPage={setPage} isMobile={isMobile} financials={financials} arEntries={arEntries} onOpenAI={() => setShowAI(true)} />}
        {page === "financials" && <Financials user={user} isMobile={isMobile} financials={financials} />}
        {page === "ar" && <AR user={user} isMobile={isMobile} arEntries={arEntries} setArEntries={setArEntries} />}
        {page === "profile" && <Profile user={user} isMobile={isMobile} />}
      </main>
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: SIDEBAR_BG, borderTop: "1px solid #1E2235", display: "flex", zIndex: 100 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => goTo(n.id)} style={{ flex: 1, padding: "12px 4px", background: "none", border: "none", borderTop: page === n.id ? `2px solid ${GOLD}` : "2px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span><span>{n.label}</span>
            </button>
          ))}
          <button onClick={() => setShowAI(true)} style={{ flex: 1, padding: "12px 4px", background: "none", border: "none", borderTop: "2px solid transparent", color: GOLD, fontSize: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 16 }}>✦</span><span>AI</span>
          </button>
        </div>
      )}
      {showAI && <AIChat user={user} financials={financials} arEntries={arEntries} onClose={() => setShowAI(false)} />}
    </div>
  );
}

function Dashboard({ user, setPage, isMobile, financials, arEntries, onOpenAI }) {
  const income = financials?.income || 0;
  const cogs = financials?.cogs || 0;
  const overhead = financials?.overhead || 0;
  const netIncome = income - cogs - overhead;
  const overdueAR = arEntries.filter(a => a.status === "Overdue");
  const cards = [
    { label: "Total Income", value: fmt(income), sub: "This period", color: "#1A9E6C" },
    { label: "COGS", value: fmt(cogs), sub: pct(cogs, income) + " of income", color: "#C0392B" },
    { label: "Overhead", value: fmt(overhead), sub: pct(overhead, income) + " of income", color: "#E67E22" },
    { label: "Net Income", value: fmt(netIncome), sub: pct(netIncome, income) + " margin", color: netIncome >= 0 ? "#1A9E6C" : "#C0392B" },
  ];
  return (
    <div style={{ padding: isMobile ? "20px 16px 100px" : "36px 40px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: 0 }}>Dashboard</h1>
        <span style={{ fontSize: 11, color: MUTED }}>{financials?.period || new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
      </div>
      <div onClick={onOpenAI} style={{ background: `linear-gradient(135deg, ${GOLD}18, ${GOLD}08)`, border: `1px solid ${GOLD}33`, borderRadius: 2, padding: "14px 18px", marginBottom: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 13, fontWeight: 700, color: GOLD, margin: "0 0 3px" }}>✦ Legacy AI — Tu asistente financiero</p>
          <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Pregúntame sobre tus números, por voz o texto</p>
        </div>
        <span style={{ color: GOLD, fontSize: 18 }}>→</span>
      </div>
      {!financials && <div style={{ background: "#C9A84C11", border: "1px solid #C9A84C33", borderRadius: 2, padding: 16, marginBottom: 20, fontSize: 13, color: GOLD }}>Your financials are being prepared by Legacy Tax & Strategy.</div>}
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: isMobile ? 14 : "20px 22px" }}>
            <p style={{ fontSize: 9, letterSpacing: 2, color: MUTED, margin: "0 0 8px", textTransform: "uppercase" }}>{c.label}</p>
            <p style={{ fontSize: isMobile ? 16 : 22, fontWeight: 700, margin: "0 0 4px", color: c.color }}>{c.value}</p>
            <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>
      {income > 0 && (
        <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20, marginBottom: 16 }}>
          <h2 style={{ fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", margin: "0 0 16px" }}>Income Breakdown</h2>
          {[{ label: "COGS", val: cogs, color: "#C0392B" }, { label: "Overhead", val: overhead, color: "#E67E22" }, { label: "Net Income", val: Math.max(netIncome, 0), color: "#1A9E6C" }].map(b => (
            <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
              <span style={{ fontSize: 11, color: MUTED, width: isMobile ? 70 : 100, flexShrink: 0 }}>{b.label}</span>
              <div style={{ flex: 1, height: 8, background: "#1E2235", borderRadius: 1, overflow: "hidden" }}>
                <div style={{ height: "100%", width: pct(b.val, income), background: b.color, borderRadius: 1 }} />
              </div>
              <span style={{ fontSize: 11, color: TEXT, width: isMobile ? 70 : 90, textAlign: "right", flexShrink: 0 }}>{fmt(b.val)}</span>
            </div>
          ))}
        </div>
      )}
      {overdueAR.length > 0 && (
        <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderLeft: "3px solid #C0392B", borderRadius: 2, padding: 20 }}>
          <h2 style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", margin: "0 0 12px" }}>⚠ Overdue A/R</h2>
          {overdueAR.map(a => (
            <div key={a.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2235", fontSize: 13 }}>
              <span>{a.invoice} — {a.client_name}</span>
              <span style={{ color: "#C0392B", fontWeight: 700 }}>{fmt(a.amount)}</span>
            </div>
          ))}
          <button onClick={() => setPage("ar")} style={{ background: "none", border: "none", color: GOLD, fontSize: 12, cursor: "pointer", padding: "10px 0 0" }}>View all A/R →</button>
        </div>
      )}
    </div>
  );
}

function Financials({ user, isMobile, financials }) {
  const income = financials?.income || 0;
  const cogs = financials?.cogs || 0;
  const overhead = financials?.overhead || 0;
  const grossProfit = income - cogs;
  const netIncome = grossProfit - overhead;
  const rows = [
    { label: "Total Income", value: income }, { label: "Cost of Goods Sold (COGS)", value: -cogs },
    { label: "Gross Profit", value: grossProfit, bold: true }, { label: "Overhead", value: -overhead },
    { label: "Net Income", value: netIncome, bold: true, accent: true },
  ];
  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: "0 0 24px" }}>Financials</h1>
      {!financials && <div style={{ background: "#C9A84C11", border: "1px solid #C9A84C33", borderRadius: 2, padding: 16, marginBottom: 20, fontSize: 13, color: GOLD }}>Your financials are being prepared. Check back soon.</div>}
      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", margin: "0 0 16px" }}>Profit & Loss — {financials?.period || "—"}</h2>
        {rows.map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1E2235", fontSize: isMobile ? 13 : 14, fontWeight: r.bold ? 700 : 400, color: r.accent ? GOLD : TEXT }}>
            <span>{r.label}</span>
            <span style={{ color: r.value < 0 ? "#C0392B" : r.accent ? "#1A9E6C" : "inherit" }}>{r.value < 0 ? `(${fmt(Math.abs(r.value))})` : fmt(r.value)}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
        {[{ label: "Gross Margin", value: pct(grossProfit, income), desc: "Profit after COGS" }, { label: "Net Margin", value: pct(netIncome, income), desc: "Final profitability" }, { label: "Overhead Ratio", value: pct(overhead, income), desc: "Fixed cost burden" }, { label: "COGS Ratio", value: pct(cogs, income), desc: "Direct cost efficiency" }].map(m => (
          <div key={m.label} style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: GOLD, margin: "0 0 4px" }}>{m.value}</p>
            <p style={{ fontSize: 11, color: TEXT, margin: "0 0 4px", fontWeight: 600 }}>{m.label}</p>
            <p style={{ fontSize: 9, color: MUTED, margin: 0 }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AR({ user, isMobile, arEntries, setArEntries }) {
  const [form, setForm] = useState({ invoice: "", client_name: "", amount: "", due_date: "", status: "Pending" });
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);
  const totalAR = arEntries.reduce((s, e) => s + Number(e.amount), 0);
  const overdueAR = arEntries.filter(e => e.status === "Overdue").reduce((s, e) => s + Number(e.amount), 0);

  const addEntry = async () => {
    if (!form.invoice || !form.client_name || !form.amount) return;
    const payload = { ...form, amount: Number(form.amount), client_id: user.id };
    const data = await db.post("ar_entries", payload);
    if (data && data.length > 0) setArEntries([data[0], ...arEntries]);
    setForm({ invoice: "", client_name: "", amount: "", due_date: "", status: "Pending" });
    setAdding(false); setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: 0 }}>Accounts Receivable</h1>
        <button onClick={() => setAdding(!adding)} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>{adding ? "Cancel" : "+ Add"}</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[{ label: "Total A/R", val: fmt(totalAR), color: "#1A5C9E" }, { label: "Overdue", val: fmt(overdueAR), color: "#C0392B" }, { label: "Invoices", val: arEntries.length, color: "#1A5C9E" }].map(c => (
          <div key={c.label} style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: isMobile ? 12 : 20 }}>
            <p style={{ fontSize: 9, letterSpacing: 2, color: MUTED, margin: "0 0 6px", textTransform: "uppercase" }}>{c.label}</p>
            <p style={{ fontSize: isMobile ? 14 : 22, fontWeight: 700, margin: 0, color: c.color }}>{c.val}</p>
          </div>
        ))}
      </div>
      {adding && (
        <div style={{ background: CARD_BG, border: `1px solid ${GOLD}44`, borderRadius: 2, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: GOLD }}>New A/R Entry</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[{ key: "invoice", label: "Invoice #", type: "text", ph: "INV-004" }, { key: "client_name", label: "Client / Project", type: "text", ph: "Project name" }, { key: "amount", label: "Amount ($)", type: "number", ph: "0" }, { key: "due_date", label: "Due Date", type: "date", ph: "" }].map(f => (
              <div key={f.key}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>{f.label}</label>
                <input style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  type={f.type} placeholder={f.ph} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
              </div>
            ))}
            <div>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 1.5, color: MUTED, marginBottom: 6, textTransform: "uppercase" }}>Status</label>
              <select style={{ width: "100%", background: "#0F1117", border: "1px solid #2A2F42", borderRadius: 2, padding: "10px 12px", color: TEXT, fontSize: 14, outline: "none", boxSizing: "border-box" }}
                value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option>Pending</option><option>Overdue</option><option>Paid</option>
              </select>
            </div>
          </div>
          <button onClick={addEntry} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>Save Entry</button>
        </div>
      )}
      {saved && <div style={{ background: "#1A9E6C22", border: "1px solid #1A9E6C55", color: "#1A9E6C", padding: "10px 16px", borderRadius: 2, fontSize: 13, marginBottom: 16 }}>✓ Entry saved</div>}
      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2235", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>Invoice List</div>
        {arEntries.length === 0 ? <p style={{ color: MUTED, padding: 20, fontSize: 13 }}>No A/R entries yet.</p> :
          isMobile ? arEntries.map(e => (
            <div key={e.id} style={{ padding: "14px 16px", borderBottom: "1px solid #1E2235" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.invoice}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(e.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: MUTED }}>{e.client_name}</span>
                <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 10, fontWeight: 600, background: e.status === "Paid" ? "#1A9E6C22" : e.status === "Overdue" ? "#C0392B22" : "#1A5C9E22", color: e.status === "Paid" ? "#1A9E6C" : e.status === "Overdue" ? "#C0392B" : "#1A5C9E" }}>{e.status}</span>
              </div>
            </div>
          )) : (
            <>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", padding: "10px 16px", background: "#0B0E18", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>
                <span>Invoice</span><span>Client</span><span>Amount</span><span>Due</span><span>Status</span>
              </div>
              {arEntries.map(e => (
                <div key={e.id} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", padding: "12px 16px", borderTop: "1px solid #1E2235", fontSize: 13, alignItems: "center" }}>
                  <span style={{ fontWeight: 600 }}>{e.invoice}</span><span>{e.client_name}</span><span>{fmt(e.amount)}</span><span>{e.due_date || "—"}</span>
                  <span style={{ padding: "3px 10px", borderRadius: 2, fontSize: 11, fontWeight: 600, background: e.status === "Paid" ? "#1A9E6C22" : e.status === "Overdue" ? "#C0392B22" : "#1A5C9E22", color: e.status === "Paid" ? "#1A9E6C" : e.status === "Overdue" ? "#C0392B" : "#1A5C9E" }}>{e.status}</span>
                </div>
              ))}
            </>
          )}
      </div>
    </div>
  );
}

function Profile({ user, isMobile }) {
  const pkg = PACKAGES[user.package];
  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: "0 0 24px" }}>Profile</h1>
      <div style={{ display: "flex", alignItems: "center", gap: 20, background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 24, marginBottom: 16 }}>
        <div style={{ width: isMobile ? 50 : 64, height: isMobile ? 50 : 64, borderRadius: 2, background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: isMobile ? 14 : 18, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user.logo}</div>
        <div>
          <h2 style={{ fontSize: isMobile ? 16 : 20, fontWeight: 700, margin: "0 0 4px" }}>{user.company}</h2>
          <p style={{ fontSize: 12, color: MUTED, margin: "0 0 8px" }}>{user.email}</p>
          <span style={{ padding: "3px 10px", borderRadius: 2, fontSize: 11, fontWeight: 600, background: "#1A5C9E22", color: "#6CA0D4" }}>{pkg.name}</span>
        </div>
      </div>
      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20, marginBottom: 16 }}>
        <h2 style={{ fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", margin: "0 0 16px" }}>Your Package Includes</h2>
        {pkg.features.map(f => (
          <div key={f} style={{ padding: "10px 0", borderBottom: "1px solid #1E2235", fontSize: 13, display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ color: GOLD, fontWeight: 700 }}>✓</span> {f}
          </div>
        ))}
      </div>
      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20 }}>
        <h2 style={{ fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", margin: "0 0 16px" }}>Your Advisor</h2>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 2, background: GOLD, color: "#0B0E18", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>LT</div>
          <div>
            <p style={{ fontWeight: 700, margin: "0 0 4px", fontSize: 14 }}>Legacy Tax & Strategy</p>
            <p style={{ color: MUTED, fontSize: 12, margin: "2px 0" }}>Tijuana, B.C. — United States</p>
            <p style={{ color: MUTED, fontSize: 12, margin: "2px 0" }}>contact@legacytaxstrategy.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
