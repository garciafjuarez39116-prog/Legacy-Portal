import React, { useState, useEffect } from "react";

// ── Mock Data ──────────────────────────────────────────────────────────────────
const USERS = {
  "client@htaconstruction.com": {
    password: "hta2024",
    company: "HTA Construction & Development",
    logo: "HTA",
    package: 3,
    color: "#D4A843",
    ar: [
      { invoice: "INV-001", client: "Proyecto Mirador", amount: 45000, due: "2026-05-15", status: "Pending" },
      { invoice: "INV-002", client: "Edificio Norte", amount: 128000, due: "2026-04-30", status: "Overdue" },
      { invoice: "INV-003", client: "Residencial Vega", amount: 67500, due: "2026-06-01", status: "Pending" },
    ],
    financials: { income: 485000, cogs: 312000, overhead: 54000 },
  },
  "demo@legacy.com": {
    password: "demo123",
    company: "Demo Company LLC",
    logo: "DC",
    package: 2,
    color: "#6C8EBF",
    ar: [],
    financials: { income: 210000, cogs: 145000, overhead: 28000 },
  },
};

const PACKAGES = {
  1: { name: "Package 1", features: ["Monthly P&L Report", "Basic Bookkeeping", "Tax Filing Support"] },
  2: { name: "Package 2", features: ["Monthly P&L Report", "Full Bookkeeping", "Tax Filing Support", "A/R Tracking"] },
  3: { name: "Package 3", features: ["Monthly P&L Report", "Full Bookkeeping", "Tax Filing Support", "A/R Tracking", "Financial Projections", "Pricing Analysis", "Budget Planning"] },
};

const fmt = (n) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
const pct = (a, b) => b ? ((a / b) * 100).toFixed(1) + "%" : "—";

const GOLD = "#C9A84C";
const DARK = "#0F1117";
const CARD_BG = "#181C27";
const SIDEBAR_BG = "#0B0E18";
const TEXT = "#E8EAF0";
const MUTED = "#6B7280";

// ── Responsive Hook ────────────────────────────────────────────────────────────
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState("dashboard");
  if (!user) return <Login onLogin={(u) => { setUser(u); setPage("dashboard"); }} />;
  return <Portal user={user} page={page} setPage={setPage} onLogout={() => setUser(null)} />;
}

// ── Login ─────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = () => {
    setLoading(true); setError("");
    setTimeout(() => {
      const u = USERS[email.toLowerCase()];
      if (u && u.password === pass) { onLogin({ ...u, email }); }
      else { setError("Invalid credentials. Please try again."); }
      setLoading(false);
    }, 700);
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
              type={f.type} placeholder={f.ph} value={f.val}
              onChange={e => f.set(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handle()} />
          </div>
        ))}

        {error && <p style={{ color: "#E55", fontSize: 13, marginBottom: 12, textAlign: "center" }}>{error}</p>}
        <button style={{ width: "100%", background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: 14, fontSize: 13, letterSpacing: 2, fontWeight: 700, cursor: "pointer", marginTop: 8, textTransform: "uppercase", fontFamily: "Georgia, serif", opacity: loading ? 0.7 : 1 }}
          onClick={handle} disabled={loading}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
        <p style={{ textAlign: "center", color: "#3A3F52", fontSize: 11, marginTop: 20, letterSpacing: 1 }}>Access provided by Legacy Tax & Strategy</p>
      </div>
    </div>
  );
}

// ── Portal Shell ──────────────────────────────────────────────────────────────
function Portal({ user, page, setPage, onLogout }) {
  const isMobile = useIsMobile();
  const [menuOpen, setMenuOpen] = useState(false);

  const nav = [
    { id: "dashboard", label: "Dashboard", icon: "▦" },
    { id: "financials", label: "Financials", icon: "◈" },
    ...(user.package >= 2 ? [{ id: "ar", label: "A/R", icon: "◉" }] : []),
    { id: "profile", label: "Profile", icon: "◎" },
  ];

  const goTo = (id) => { setPage(id); setMenuOpen(false); };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh", background: DARK, fontFamily: "Georgia, serif", color: TEXT }}>

      {/* ── Mobile Top Bar ── */}
      {isMobile && (
        <div style={{ background: SIDEBAR_BG, borderBottom: "1px solid #1E2235", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 100 }}>
          <div>
            <span style={{ fontSize: 16, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>LEGACY</span>
            <span style={{ fontSize: 8, letterSpacing: 3, color: MUTED, marginLeft: 4 }}>TAX & STRATEGY</span>
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} style={{ background: "none", border: "none", color: GOLD, fontSize: 22, cursor: "pointer", padding: 4 }}>
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      )}

      {/* ── Mobile Dropdown Menu ── */}
      {isMobile && menuOpen && (
        <div style={{ background: SIDEBAR_BG, borderBottom: "1px solid #1E2235", position: "sticky", top: 53, zIndex: 99 }}>
          <div style={{ padding: "12px 20px", borderBottom: "1px solid #1E2235", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 2, background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fff" }}>{user.logo}</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0 }}>{user.company}</p>
              <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{PACKAGES[user.package].name}</p>
            </div>
          </div>
          {nav.map(n => (
            <button key={n.id} onClick={() => goTo(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "14px 20px", background: page === n.id ? "#C9A84C11" : "none", border: "none", borderLeft: page === n.id ? `3px solid ${GOLD}` : "3px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 14, cursor: "pointer", textAlign: "left" }}>
              <span>{n.icon}</span>{n.label}
            </button>
          ))}
          <button onClick={onLogout} style={{ display: "block", width: "100%", padding: "14px 20px", background: "none", border: "none", color: "#3A3F52", fontSize: 12, cursor: "pointer", textAlign: "left" }}>← Sign Out</button>
        </div>
      )}

      {/* ── Desktop Sidebar ── */}
      {!isMobile && (
        <aside style={{ width: 220, background: SIDEBAR_BG, borderRight: "1px solid #1E2235", display: "flex", flexDirection: "column", padding: "28px 0", position: "sticky", top: 0, height: "100vh" }}>
          <div style={{ padding: "0 24px 24px", borderBottom: "1px solid #1E2235" }}>
            <span style={{ display: "block", fontSize: 18, letterSpacing: 6, color: GOLD, fontWeight: 700 }}>LEGACY</span>
            <span style={{ display: "block", fontSize: 8, letterSpacing: 3, color: MUTED, marginTop: 3 }}>TAX & STRATEGY</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "16px 24px", borderBottom: "1px solid #1E2235" }}>
            <div style={{ width: 36, height: 36, borderRadius: 2, background: user.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{user.logo}</div>
            <div>
              <p style={{ fontSize: 12, fontWeight: 700, margin: 0, color: TEXT }}>{user.company}</p>
              <p style={{ fontSize: 10, color: MUTED, margin: 0, marginTop: 2, letterSpacing: 1 }}>{PACKAGES[user.package].name}</p>
            </div>
          </div>
          <nav style={{ flex: 1, padding: "16px 0" }}>
            {nav.map(n => (
              <button key={n.id} onClick={() => setPage(n.id)} style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "11px 24px", background: page === n.id ? "#C9A84C11" : "none", border: "none", borderRight: page === n.id ? `2px solid ${GOLD}` : "2px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 13, cursor: "pointer", textAlign: "left", letterSpacing: 0.5 }}>
                <span style={{ fontSize: 14 }}>{n.icon}</span>{n.label}
              </button>
            ))}
          </nav>
          <button onClick={onLogout} style={{ background: "none", border: "none", color: "#3A3F52", fontSize: 12, cursor: "pointer", padding: "16px 24px", textAlign: "left", letterSpacing: 1 }}>← Sign Out</button>
        </aside>
      )}

      {/* ── Main Content ── */}
      <main style={{ flex: 1, overflowY: "auto", background: DARK }}>
        {page === "dashboard" && <Dashboard user={user} setPage={setPage} isMobile={isMobile} />}
        {page === "financials" && <Financials user={user} isMobile={isMobile} />}
        {page === "ar" && <AR user={user} isMobile={isMobile} />}
        {page === "profile" && <Profile user={user} isMobile={isMobile} />}
      </main>

      {/* ── Mobile Bottom Nav ── */}
      {isMobile && (
        <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: SIDEBAR_BG, borderTop: "1px solid #1E2235", display: "flex", zIndex: 100 }}>
          {nav.map(n => (
            <button key={n.id} onClick={() => { goTo(n.id); setMenuOpen(false); }} style={{ flex: 1, padding: "12px 4px", background: "none", border: "none", borderTop: page === n.id ? `2px solid ${GOLD}` : "2px solid transparent", color: page === n.id ? GOLD : MUTED, fontSize: 10, cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <span style={{ fontSize: 16 }}>{n.icon}</span>
              <span style={{ letterSpacing: 0.5 }}>{n.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage, isMobile }) {
  const { income, cogs, overhead } = user.financials;
  const netIncome = income - cogs - overhead;

  const cards = [
    { label: "Total Income", value: fmt(income), sub: "This period", color: "#1A9E6C" },
    { label: "COGS", value: fmt(cogs), sub: pct(cogs, income) + " of income", color: "#C0392B" },
    { label: "Overhead", value: fmt(overhead), sub: pct(overhead, income) + " of income", color: "#E67E22" },
    { label: "Net Income", value: fmt(netIncome), sub: pct(netIncome, income) + " margin", color: netIncome >= 0 ? "#1A9E6C" : "#C0392B" },
  ];
  const overdueAR = user.ar.filter(a => a.status === "Overdue");

  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: 0, letterSpacing: 1 }}>Dashboard</h1>
        <span style={{ fontSize: 11, color: MUTED, letterSpacing: 1 }}>{new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
        {cards.map(c => (
          <div key={c.label} style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: isMobile ? "14px" : "20px 22px" }}>
            <p style={{ fontSize: 9, letterSpacing: 2, color: MUTED, margin: "0 0 8px", textTransform: "uppercase" }}>{c.label}</p>
            <p style={{ fontSize: isMobile ? 16 : 22, fontWeight: 700, margin: "0 0 4px", color: c.color }}>{c.value}</p>
            <p style={{ fontSize: 10, color: MUTED, margin: 0 }}>{c.sub}</p>
          </div>
        ))}
      </div>

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

      {overdueAR.length > 0 && (
        <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderLeft: "3px solid #C0392B", borderRadius: 2, padding: 20 }}>
          <h2 style={{ fontSize: 11, letterSpacing: 2, color: "#C0392B", textTransform: "uppercase", margin: "0 0 12px" }}>⚠ Overdue A/R</h2>
          {overdueAR.map(a => (
            <div key={a.invoice} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #1E2235", fontSize: 13 }}>
              <span>{a.invoice} — {a.client}</span>
              <span style={{ color: "#C0392B", fontWeight: 700 }}>{fmt(a.amount)}</span>
            </div>
          ))}
          <button onClick={() => setPage("ar")} style={{ background: "none", border: "none", color: GOLD, fontSize: 12, cursor: "pointer", padding: "10px 0 0", letterSpacing: 1 }}>View all A/R →</button>
        </div>
      )}
    </div>
  );
}

// ── Financials ────────────────────────────────────────────────────────────────
function Financials({ user, isMobile }) {
  const { income, cogs, overhead } = user.financials;
  const grossProfit = income - cogs;
  const netIncome = grossProfit - overhead;

  const rows = [
    { label: "Total Income", value: income, bold: false, accent: false },
    { label: "Cost of Goods Sold (COGS)", value: -cogs, bold: false, accent: false },
    { label: "Gross Profit", value: grossProfit, bold: true, accent: false },
    { label: "Overhead", value: -overhead, bold: false, accent: false },
    { label: "Net Income", value: netIncome, bold: true, accent: true },
  ];

  const metrics = [
    { label: "Gross Margin", value: pct(grossProfit, income), desc: "Profit after COGS" },
    { label: "Net Margin", value: pct(netIncome, income), desc: "Final profitability" },
    { label: "Overhead Ratio", value: pct(overhead, income), desc: "Fixed cost burden" },
    { label: "COGS Ratio", value: pct(cogs, income), desc: "Direct cost efficiency" },
  ];

  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: "0 0 24px", letterSpacing: 1 }}>Financials</h1>

      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 20, marginBottom: 20 }}>
        <h2 style={{ fontSize: 11, letterSpacing: 2, color: MUTED, textTransform: "uppercase", margin: "0 0 16px" }}>Profit & Loss Statement</h2>
        {rows.map(r => (
          <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #1E2235", fontSize: isMobile ? 13 : 14, fontWeight: r.bold ? 700 : 400, background: r.accent ? "#C9A84C08" : "transparent", color: r.accent ? GOLD : TEXT }}>
            <span>{r.label}</span>
            <span style={{ color: r.value < 0 ? "#C0392B" : r.accent ? "#1A9E6C" : "inherit" }}>
              {r.value < 0 ? `(${fmt(Math.abs(r.value))})` : fmt(r.value)}
            </span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
        {metrics.map(m => (
          <div key={m.label} style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: 16, textAlign: "center" }}>
            <p style={{ fontSize: isMobile ? 20 : 26, fontWeight: 700, color: GOLD, margin: "0 0 4px" }}>{m.value}</p>
            <p style={{ fontSize: 11, color: TEXT, margin: "0 0 4px", fontWeight: 600 }}>{m.label}</p>
            <p style={{ fontSize: 9, color: MUTED, margin: 0, letterSpacing: 1 }}>{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── A/R ───────────────────────────────────────────────────────────────────────
function AR({ user, isMobile }) {
  const [entries, setEntries] = useState(user.ar);
  const [form, setForm] = useState({ invoice: "", client: "", amount: "", due: "", status: "Pending" });
  const [adding, setAdding] = useState(false);
  const [saved, setSaved] = useState(false);

  const totalAR = entries.reduce((s, e) => s + Number(e.amount), 0);
  const overdueAR = entries.filter(e => e.status === "Overdue").reduce((s, e) => s + Number(e.amount), 0);

  const addEntry = () => {
    if (!form.invoice || !form.client || !form.amount) return;
    setEntries([...entries, { ...form, amount: Number(form.amount) }]);
    setForm({ invoice: "", client: "", amount: "", due: "", status: "Pending" });
    setAdding(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: 0, letterSpacing: 1 }}>Accounts Receivable</h1>
        <button onClick={() => setAdding(!adding)} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "9px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer", letterSpacing: 1 }}>
          {adding ? "Cancel" : "+ Add"}
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[{ label: "Total A/R", val: fmt(totalAR), color: "#1A5C9E" }, { label: "Overdue", val: fmt(overdueAR), color: "#C0392B" }, { label: "Open Invoices", val: entries.length, color: "#1A5C9E" }].map(c => (
          <div key={c.label} style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2, padding: isMobile ? 12 : 20 }}>
            <p style={{ fontSize: 9, letterSpacing: 2, color: MUTED, margin: "0 0 6px", textTransform: "uppercase" }}>{c.label}</p>
            <p style={{ fontSize: isMobile ? 14 : 22, fontWeight: 700, margin: 0, color: c.color }}>{c.val}</p>
          </div>
        ))}
      </div>

      {adding && (
        <div style={{ background: CARD_BG, border: `1px solid ${GOLD}44`, borderRadius: 2, padding: 20, marginBottom: 16 }}>
          <h3 style={{ fontSize: 13, fontWeight: 700, margin: "0 0 16px", color: GOLD, letterSpacing: 1 }}>New A/R Entry</h3>
          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12, marginBottom: 14 }}>
            {[{ key: "invoice", label: "Invoice #", type: "text", ph: "INV-004" }, { key: "client", label: "Client / Project", type: "text", ph: "Project name" }, { key: "amount", label: "Amount ($)", type: "number", ph: "0" }, { key: "due", label: "Due Date", type: "date", ph: "" }].map(f => (
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
          <button onClick={addEntry} style={{ background: GOLD, color: "#0B0E18", border: "none", borderRadius: 2, padding: "12px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", letterSpacing: 1, textTransform: "uppercase" }}>Save Entry</button>
        </div>
      )}

      {saved && <div style={{ background: "#1A9E6C22", border: "1px solid #1A9E6C55", color: "#1A9E6C", padding: "10px 16px", borderRadius: 2, fontSize: 13, marginBottom: 16 }}>✓ Entry saved</div>}

      <div style={{ background: CARD_BG, border: "1px solid #1E2235", borderRadius: 2 }}>
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #1E2235", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>Invoice List</div>
        {entries.length === 0 ? (
          <p style={{ color: MUTED, padding: 20, fontSize: 13 }}>No A/R entries yet.</p>
        ) : isMobile ? (
          entries.map((e, i) => (
            <div key={i} style={{ padding: "14px 16px", borderBottom: "1px solid #1E2235" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{e.invoice}</span>
                <span style={{ fontWeight: 700, fontSize: 13 }}>{fmt(e.amount)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, color: MUTED }}>{e.client}</span>
                <span style={{ padding: "2px 8px", borderRadius: 2, fontSize: 10, fontWeight: 600, background: e.status === "Paid" ? "#1A9E6C22" : e.status === "Overdue" ? "#C0392B22" : "#1A5C9E22", color: e.status === "Paid" ? "#1A9E6C" : e.status === "Overdue" ? "#C0392B" : "#1A5C9E" }}>{e.status}</span>
              </div>
              {e.due && <p style={{ fontSize: 11, color: MUTED, margin: "4px 0 0" }}>Due: {e.due}</p>}
            </div>
          ))
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", padding: "10px 16px", background: "#0B0E18", fontSize: 10, letterSpacing: 2, color: MUTED, textTransform: "uppercase" }}>
              <span>Invoice</span><span>Client</span><span>Amount</span><span>Due</span><span>Status</span>
            </div>
            {entries.map((e, i) => (
              <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr 1fr 1fr", padding: "12px 16px", borderTop: "1px solid #1E2235", fontSize: 13, alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{e.invoice}</span>
                <span>{e.client}</span>
                <span>{fmt(e.amount)}</span>
                <span>{e.due || "—"}</span>
                <span style={{ padding: "3px 10px", borderRadius: 2, fontSize: 11, fontWeight: 600, background: e.status === "Paid" ? "#1A9E6C22" : e.status === "Overdue" ? "#C0392B22" : "#1A5C9E22", color: e.status === "Paid" ? "#1A9E6C" : e.status === "Overdue" ? "#C0392B" : "#1A5C9E" }}>{e.status}</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Profile ───────────────────────────────────────────────────────────────────
function Profile({ user, isMobile }) {
  const pkg = PACKAGES[user.package];
  return (
    <div style={{ padding: isMobile ? "20px 16px 90px" : "36px 40px", maxWidth: 900 }}>
      <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, margin: "0 0 24px", letterSpacing: 1 }}>Profile</h1>

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
