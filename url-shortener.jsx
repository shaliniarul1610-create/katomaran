import { useState, useEffect, useCallback, useRef } from "react";

// ── Utility helpers ──────────────────────────────────────────────────────────
const generateCode = (alias) => {
  if (alias) return alias.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-");
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const isValidUrl = (url) => {
  try { new URL(url); return true; } catch { return false; }
};

const fmtDate = (ts) => {
  if (!ts) return "—";
  const d = new Date(ts);
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const fmtTime = (ts) => {
  if (!ts) return "Never";
  const d = new Date(ts);
  return d.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
};

const timeAgo = (ts) => {
  const diff = Date.now() - ts;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// Generate QR code using Google Charts API (no external lib needed)
const qrUrl = (text) =>
  `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(text)}&size=200x200&bgcolor=fff&color=1a1a2e`;

// ── Inline CSS ────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,300&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a14;
    --bg2: #11111e;
    --bg3: #1a1a2e;
    --surface: #1e1e32;
    --surface2: #252540;
    --border: rgba(255,255,255,0.08);
    --border2: rgba(255,255,255,0.14);
    --accent: #7c6af7;
    --accent2: #a594f9;
    --accent3: #6c5ce7;
    --teal: #00d2c8;
    --coral: #ff6b6b;
    --amber: #ffbe76;
    --green: #55efc4;
    --text: #f0f0ff;
    --text2: #9898b8;
    --text3: #5e5e7e;
    --radius: 12px;
    --radius2: 8px;
    --font-head: 'Syne', sans-serif;
    --font-body: 'DM Sans', sans-serif;
    --shadow: 0 4px 24px rgba(0,0,0,0.4);
    --glow: 0 0 32px rgba(124,106,247,0.15);
  }

  body { background: var(--bg); color: var(--text); font-family: var(--font-body); font-size: 15px; line-height: 1.6; }

  /* Layout */
  .app { min-height: 100vh; display: flex; flex-direction: column; }
  .nav { background: var(--bg2); border-bottom: 1px solid var(--border); padding: 0 32px; height: 64px; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 100; }
  .nav-logo { font-family: var(--font-head); font-size: 22px; font-weight: 800; background: linear-gradient(135deg, var(--accent2), var(--teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; letter-spacing: -0.5px; }
  .nav-logo span { color: var(--accent); -webkit-text-fill-color: var(--accent2); }
  .nav-actions { display: flex; align-items: center; gap: 12px; }
  .main { flex: 1; max-width: 1100px; margin: 0 auto; width: 100%; padding: 32px 24px; }

  /* Buttons */
  .btn { display: inline-flex; align-items: center; gap: 8px; padding: 10px 20px; border-radius: var(--radius2); font-family: var(--font-body); font-size: 14px; font-weight: 500; cursor: pointer; border: none; transition: all 0.18s ease; white-space: nowrap; }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent2); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(124,106,247,0.4); }
  .btn-primary:active { transform: translateY(0); }
  .btn-ghost { background: transparent; color: var(--text2); border: 1px solid var(--border2); }
  .btn-ghost:hover { background: var(--surface); color: var(--text); }
  .btn-danger { background: transparent; color: var(--coral); border: 1px solid rgba(255,107,107,0.3); }
  .btn-danger:hover { background: rgba(255,107,107,0.1); }
  .btn-teal { background: rgba(0,210,200,0.12); color: var(--teal); border: 1px solid rgba(0,210,200,0.25); }
  .btn-teal:hover { background: rgba(0,210,200,0.2); }
  .btn-sm { padding: 6px 12px; font-size: 13px; }
  .btn-icon { padding: 8px; width: 36px; height: 36px; justify-content: center; }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; transform: none !important; }

  /* Forms */
  .form-group { display: flex; flex-direction: column; gap: 6px; }
  .label { font-size: 13px; font-weight: 500; color: var(--text2); letter-spacing: 0.02em; }
  .input { background: var(--bg3); border: 1px solid var(--border2); color: var(--text); border-radius: var(--radius2); padding: 11px 14px; font-family: var(--font-body); font-size: 14px; outline: none; transition: border 0.18s; width: 100%; }
  .input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(124,106,247,0.12); }
  .input::placeholder { color: var(--text3); }
  .input.error { border-color: var(--coral); }
  .error-msg { font-size: 12px; color: var(--coral); }
  .help-text { font-size: 12px; color: var(--text3); }

  /* Cards */
  .card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 24px; }
  .card-sm { padding: 16px 20px; }

  /* Auth page */
  .auth-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); position: relative; overflow: hidden; padding: 24px; }
  .auth-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 60% 50% at 50% -10%, rgba(124,106,247,0.15), transparent); pointer-events: none; }
  .auth-card { background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px; padding: 40px; width: 100%; max-width: 420px; position: relative; z-index: 1; }
  .auth-logo { font-family: var(--font-head); font-size: 28px; font-weight: 800; background: linear-gradient(135deg, var(--accent2), var(--teal)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; text-align: center; margin-bottom: 6px; }
  .auth-sub { text-align: center; color: var(--text3); font-size: 14px; margin-bottom: 32px; }
  .auth-tabs { display: flex; background: var(--bg3); border-radius: var(--radius2); padding: 4px; margin-bottom: 28px; }
  .auth-tab { flex: 1; padding: 8px; text-align: center; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; color: var(--text2); transition: all 0.18s; border: none; background: transparent; font-family: var(--font-body); }
  .auth-tab.active { background: var(--surface2); color: var(--text); }

  /* Dashboard */
  .page-header { margin-bottom: 28px; }
  .page-title { font-family: var(--font-head); font-size: 26px; font-weight: 700; color: var(--text); letter-spacing: -0.5px; }
  .page-sub { color: var(--text3); font-size: 14px; margin-top: 4px; }

  /* Stats row */
  .stats-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 20px; }
  .stat-label { font-size: 12px; color: var(--text3); letter-spacing: 0.04em; text-transform: uppercase; font-weight: 500; margin-bottom: 8px; }
  .stat-val { font-family: var(--font-head); font-size: 32px; font-weight: 700; color: var(--text); line-height: 1; }
  .stat-sub { font-size: 12px; color: var(--text3); margin-top: 4px; }

  /* Shorten form */
  .shorten-card { background: linear-gradient(135deg, var(--bg3) 0%, var(--surface) 100%); border: 1px solid var(--border2); border-radius: var(--radius); padding: 28px; margin-bottom: 28px; position: relative; overflow: hidden; }
  .shorten-card::before { content: ''; position: absolute; top: -40px; right: -40px; width: 200px; height: 200px; background: radial-gradient(circle, rgba(124,106,247,0.08), transparent 70%); pointer-events: none; }
  .shorten-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; }
  .shorten-full { grid-column: 1 / -1; }

  /* URL table */
  .url-list { display: flex; flex-direction: column; gap: 12px; }
  .url-item { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius); padding: 18px 20px; display: grid; grid-template-columns: 1fr auto; gap: 16px; align-items: start; transition: border-color 0.18s; }
  .url-item:hover { border-color: var(--border2); }
  .url-original { font-size: 13px; color: var(--text3); word-break: break-all; margin-bottom: 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 500px; }
  .url-short { font-family: var(--font-head); font-size: 18px; font-weight: 700; color: var(--accent2); letter-spacing: -0.3px; }
  .url-meta { display: flex; gap: 16px; margin-top: 8px; flex-wrap: wrap; }
  .meta-badge { font-size: 12px; color: var(--text3); display: flex; align-items: center; gap: 4px; }
  .meta-badge.clicks { color: var(--teal); font-weight: 600; }
  .url-actions { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }

  /* Analytics */
  .analytics-header { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
  .visits-list { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; }
  .visit-item { display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background: var(--bg3); border-radius: var(--radius2); font-size: 13px; }
  .visit-time { color: var(--text3); }
  .visit-ago { color: var(--accent2); font-size: 12px; font-weight: 500; }

  /* Chart */
  .chart-wrap { position: relative; width: 100%; height: 220px; margin-top: 8px; }

  /* Badges */
  .badge { display: inline-flex; align-items: center; gap: 4px; padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 500; }
  .badge-purple { background: rgba(124,106,247,0.15); color: var(--accent2); }
  .badge-teal { background: rgba(0,210,200,0.12); color: var(--teal); }
  .badge-coral { background: rgba(255,107,107,0.12); color: var(--coral); }
  .badge-amber { background: rgba(255,190,118,0.12); color: var(--amber); }

  /* Toast */
  .toasts { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
  .toast { background: var(--surface2); border: 1px solid var(--border2); border-radius: var(--radius2); padding: 12px 18px; font-size: 14px; color: var(--text); display: flex; align-items: center; gap: 10px; min-width: 240px; pointer-events: all; animation: slideIn 0.25s ease; box-shadow: var(--shadow); }
  .toast.success { border-left: 3px solid var(--green); }
  .toast.error { border-left: 3px solid var(--coral); }
  @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }

  /* Modal */
  .modal-bg { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 500; display: flex; align-items: center; justify-content: center; padding: 24px; backdrop-filter: blur(4px); }
  .modal { background: var(--bg2); border: 1px solid var(--border2); border-radius: 20px; padding: 32px; width: 100%; max-width: 520px; max-height: 80vh; overflow-y: auto; }
  .modal-title { font-family: var(--font-head); font-size: 20px; font-weight: 700; margin-bottom: 20px; }

  /* QR */
  .qr-img { width: 180px; height: 180px; border-radius: var(--radius); background: #fff; padding: 8px; display: block; margin: 0 auto; }

  /* Tabs */
  .tabs { display: flex; gap: 4px; border-bottom: 1px solid var(--border); margin-bottom: 24px; }
  .tab { padding: 10px 18px; font-size: 14px; font-weight: 500; color: var(--text3); cursor: pointer; border: none; background: transparent; border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: var(--font-body); transition: all 0.18s; }
  .tab.active { color: var(--accent2); border-bottom-color: var(--accent2); }
  .tab:hover:not(.active) { color: var(--text2); }

  /* Expiry warning */
  .expired { opacity: 0.5; }
  .expiry-badge { font-size: 11px; padding: 2px 8px; border-radius: 99px; background: rgba(255,190,118,0.15); color: var(--amber); }

  /* Empty state */
  .empty { text-align: center; padding: 60px 24px; color: var(--text3); }
  .empty-icon { font-size: 48px; margin-bottom: 16px; opacity: 0.4; }
  .empty-title { font-family: var(--font-head); font-size: 18px; font-weight: 600; color: var(--text2); margin-bottom: 8px; }

  /* Loading */
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: #fff; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Divider */
  .divider { height: 1px; background: var(--border); margin: 20px 0; }

  /* Progress bar */
  .progress-bar { height: 6px; background: var(--bg3); border-radius: 99px; overflow: hidden; }
  .progress-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--accent), var(--teal)); transition: width 0.4s ease; }

  /* Responsive */
  @media (max-width: 640px) {
    .shorten-grid { grid-template-columns: 1fr; }
    .nav { padding: 0 16px; }
    .main { padding: 20px 16px; }
    .url-item { grid-template-columns: 1fr; }
    .url-actions { flex-wrap: wrap; }
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 99px; }

  /* Copy flash */
  @keyframes copyFlash { 0% { background: rgba(85,239,196,0.2); } 100% { background: transparent; } }
  .copy-flash { animation: copyFlash 0.5s ease; }
`;

// ── Storage helpers (simulated DB in memory) ─────────────────────────────────
const DB = {
  users: [
    { id: "u1", name: "Demo User", email: "demo@linksnip.io", password: "demo1234", createdAt: Date.now() - 86400000 * 30 }
  ],
  urls: [
    {
      id: "url1", userId: "u1", originalUrl: "https://www.anthropic.com/research/claude",
      shortCode: "claude", alias: "claude", clicks: 142,
      createdAt: Date.now() - 86400000 * 15, expiresAt: null,
      visits: Array.from({ length: 10 }, (_, i) => ({ ts: Date.now() - i * 3600000 * 2.5, country: "IN", browser: "Chrome" }))
    },
    {
      id: "url2", userId: "u1", originalUrl: "https://github.com/anthropics/anthropic-sdk-python",
      shortCode: "sdk-py", alias: "sdk-py", clicks: 58,
      createdAt: Date.now() - 86400000 * 8, expiresAt: null,
      visits: Array.from({ length: 5 }, (_, i) => ({ ts: Date.now() - i * 7200000, country: "US", browser: "Firefox" }))
    }
  ],
  nextId: 100
};

// ── Toast component ───────────────────────────────────────────────────────────
function Toasts({ toasts }) {
  return (
    <div className="toasts">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ── Auth Page ─────────────────────────────────────────────────────────────────
function AuthPage({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const validate = () => {
    const e = {};
    if (tab === "signup" && !form.name.trim()) e.name = "Name is required";
    if (!form.email.includes("@")) e.email = "Enter a valid email";
    if (form.password.length < 6) e.password = "At least 6 characters";
    if (tab === "signup" && form.password !== form.confirm) e.confirm = "Passwords don't match";
    return e;
  };

  const submit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === "login") {
        const user = DB.users.find(u => u.email === form.email && u.password === form.password);
        if (user) { onLogin(user); }
        else { showToast("Invalid email or password", "error"); }
      } else {
        if (DB.users.find(u => u.email === form.email)) {
          showToast("Email already registered", "error"); return;
        }
        const user = { id: `u${DB.nextId++}`, name: form.name, email: form.email, password: form.password, createdAt: Date.now() };
        DB.users.push(user);
        showToast("Account created! Logging you in...");
        setTimeout(() => onLogin(user), 1000);
      }
    }, 800);
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="auth-wrap">
      <div className="auth-bg" />
      <div className="auth-card">
        <div className="auth-logo">⚡ LinkSnip</div>
        <div className="auth-sub">Shorten links. Track every click.</div>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setErrors({}); }}>Sign in</button>
          <button className={`auth-tab ${tab === "signup" ? "active" : ""}`} onClick={() => { setTab("signup"); setErrors({}); }}>Create account</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {tab === "signup" && (
            <div className="form-group">
              <label className="label">Full name</label>
              <input className={`input ${errors.name ? "error" : ""}`} placeholder="Alex Johnson" value={form.name} onChange={e => set("name", e.target.value)} />
              {errors.name && <span className="error-msg">{errors.name}</span>}
            </div>
          )}
          <div className="form-group">
            <label className="label">Email address</label>
            <input className={`input ${errors.email ? "error" : ""}`} type="email" placeholder="you@example.com" value={form.email} onChange={e => set("email", e.target.value)} />
            {errors.email && <span className="error-msg">{errors.email}</span>}
          </div>
          <div className="form-group">
            <label className="label">Password</label>
            <input className={`input ${errors.password ? "error" : ""}`} type="password" placeholder="••••••••" value={form.password} onChange={e => set("password", e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
            {errors.password && <span className="error-msg">{errors.password}</span>}
          </div>
          {tab === "signup" && (
            <div className="form-group">
              <label className="label">Confirm password</label>
              <input className={`input ${errors.confirm ? "error" : ""}`} type="password" placeholder="••••••••" value={form.confirm} onChange={e => set("confirm", e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
              {errors.confirm && <span className="error-msg">{errors.confirm}</span>}
            </div>
          )}
          <button className="btn btn-primary" style={{ width: "100%", marginTop: 8, justifyContent: "center", padding: "13px" }} onClick={submit} disabled={loading}>
            {loading ? <span className="spinner" /> : tab === "login" ? "Sign in" : "Create account"}
          </button>
          {tab === "login" && (
            <div style={{ textAlign: "center" }}>
              <span className="help-text">Demo: </span>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: 12 }} onClick={() => { setForm(f => ({ ...f, email: "demo@linksnip.io", password: "demo1234" })); }}>Fill demo credentials</button>
            </div>
          )}
        </div>
      </div>
      {toast && (
        <div style={{ position: "fixed", bottom: 24, right: 24 }}>
          <div className={`toast ${toast.type}`}><span>{toast.type === "success" ? "✓" : "✕"}</span>{toast.msg}</div>
        </div>
      )}
    </div>
  );
}

// ── Shorten Form ──────────────────────────────────────────────────────────────
function ShortenForm({ userId, onCreated, addToast }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiry, setExpiry] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const submit = () => {
    const e = {};
    if (!url.trim()) e.url = "URL is required";
    else if (!isValidUrl(url)) e.url = "Enter a valid URL (include https://)";
    if (alias && DB.urls.find(u => u.shortCode === alias.toLowerCase())) e.alias = "This alias is already taken";
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setLoading(true);
    setTimeout(() => {
      let code = alias ? alias.toLowerCase().replace(/[^a-z0-9-]/g, "-") : generateCode();
      while (!alias && DB.urls.find(u => u.shortCode === code)) code = generateCode();
      const newUrl = {
        id: `url${DB.nextId++}`, userId, originalUrl: url.trim(),
        shortCode: code, alias: alias || null,
        clicks: 0, createdAt: Date.now(),
        expiresAt: expiry ? new Date(expiry).getTime() : null,
        visits: []
      };
      DB.urls.push(newUrl);
      setUrl(""); setAlias(""); setExpiry(""); setLoading(false);
      onCreated(newUrl);
      addToast("Short link created!", "success");
    }, 600);
  };

  return (
    <div className="shorten-card">
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Create short link</div>
        <div style={{ fontSize: 13, color: "var(--text3)" }}>Paste any URL to generate a trackable short link</div>
      </div>
      <div className="form-group" style={{ marginBottom: 12 }}>
        <input className={`input ${errors.url ? "error" : ""}`} placeholder="https://example.com/very/long/url/goes/here" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && submit()} />
        {errors.url && <span className="error-msg">{errors.url}</span>}
      </div>
      <div style={{ marginBottom: 12 }}>
        <button className="btn btn-ghost btn-sm" onClick={() => setShowAdvanced(a => !a)} style={{ fontSize: 12, padding: "4px 10px" }}>
          {showAdvanced ? "▲ Hide options" : "▼ Advanced options"}
        </button>
      </div>
      {showAdvanced && (
        <div className="shorten-grid" style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label className="label">Custom alias (optional)</label>
            <input className={`input ${errors.alias ? "error" : ""}`} placeholder="my-link" value={alias} onChange={e => setAlias(e.target.value)} />
            {errors.alias && <span className="error-msg">{errors.alias}</span>}
            <span className="help-text">snip.io/<strong>{alias || "xxxxx"}</strong></span>
          </div>
          <div className="form-group">
            <label className="label">Expiry date (optional)</label>
            <input className="input" type="date" value={expiry} onChange={e => setExpiry(e.target.value)} min={new Date().toISOString().split("T")[0]} />
          </div>
        </div>
      )}
      <button className="btn btn-primary" onClick={submit} disabled={loading} style={{ padding: "11px 28px" }}>
        {loading ? <><span className="spinner" /> Shortening…</> : "⚡ Shorten URL"}
      </button>
    </div>
  );
}

// ── Analytics Modal ───────────────────────────────────────────────────────────
function AnalyticsModal({ urlData, onClose }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  // Build daily clicks for last 7 days
  const dailyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const label = d.toLocaleDateString("en", { weekday: "short" });
    const dayStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    const count = urlData.visits.filter(v => v.ts >= dayStart && v.ts < dayEnd).length;
    return { label, count };
  });

  useEffect(() => {
    if (!chartRef.current) return;
    const script = document.createElement("script");
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    script.onload = () => {
      if (chartInstance.current) chartInstance.current.destroy();
      chartInstance.current = new window.Chart(chartRef.current, {
        type: "bar",
        data: {
          labels: dailyData.map(d => d.label),
          datasets: [{
            label: "Clicks",
            data: dailyData.map(d => d.count),
            backgroundColor: "rgba(124,106,247,0.6)",
            borderColor: "#7c6af7",
            borderWidth: 1.5,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#9898b8", font: { size: 12 } } },
            y: { grid: { color: "rgba(255,255,255,0.05)" }, ticks: { color: "#9898b8", font: { size: 12 }, stepSize: 1 }, beginAtZero: true }
          }
        }
      });
    };
    document.head.appendChild(script);
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, []);

  const shortUrl = `snip.io/${urlData.shortCode}`;
  const isExpired = urlData.expiresAt && urlData.expiresAt < Date.now();

  return (
    <div className="modal-bg" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 20, fontWeight: 700, color: "var(--accent2)" }}>{shortUrl}</div>
            <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2, maxWidth: 340, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{urlData.originalUrl}</div>
          </div>
          <button className="btn btn-ghost btn-sm btn-icon" onClick={onClose} style={{ flexShrink: 0 }}>✕</button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 24 }}>
          <div className="stat-card" style={{ padding: 14 }}>
            <div className="stat-label">Total clicks</div>
            <div className="stat-val" style={{ fontSize: 26, color: "var(--teal)" }}>{urlData.clicks}</div>
          </div>
          <div className="stat-card" style={{ padding: 14 }}>
            <div className="stat-label">Last visit</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>{urlData.visits.length ? timeAgo(Math.max(...urlData.visits.map(v => v.ts))) : "Never"}</div>
          </div>
          <div className="stat-card" style={{ padding: 14 }}>
            <div className="stat-label">Created</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 600, marginTop: 4 }}>{fmtDate(urlData.createdAt)}</div>
          </div>
        </div>

        {isExpired && <div className="badge badge-coral" style={{ marginBottom: 16 }}>⚠ Link expired</div>}

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 8 }}>Clicks — last 7 days</div>
          <div className="chart-wrap"><canvas ref={chartRef} role="img" aria-label={`Bar chart showing daily clicks for last 7 days for ${shortUrl}`}>Daily click history</canvas></div>
        </div>

        <div className="divider" />

        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 10 }}>Recent visits</div>
          {urlData.visits.length === 0 ? (
            <div style={{ color: "var(--text3)", fontSize: 13 }}>No visits yet</div>
          ) : (
            <div className="visits-list">
              {[...urlData.visits].reverse().slice(0, 20).map((v, i) => (
                <div key={i} className="visit-item">
                  <span>{fmtTime(v.ts)}</span>
                  <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                    <span className="badge badge-purple">{v.browser}</span>
                    <span className="visit-ago">{timeAgo(v.ts)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="divider" />

        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: "var(--text2)", marginBottom: 12 }}>QR Code</div>
          <img src={qrUrl(`https://${shortUrl}`)} alt="QR code" className="qr-img" />
          <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 8 }}>Scan to open link</div>
        </div>
      </div>
    </div>
  );
}

// ── URL Item ──────────────────────────────────────────────────────────────────
function UrlItem({ urlData, onDelete, onAnalytics, onCopy, onRedirect }) {
  const [copied, setCopied] = useState(false);
  const isExpired = urlData.expiresAt && urlData.expiresAt < Date.now();
  const shortUrl = `snip.io/${urlData.shortCode}`;

  const handleCopy = () => {
    onCopy(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`url-item ${isExpired ? "expired" : ""}`}>
      <div>
        <div className="url-original" title={urlData.originalUrl}>🔗 {urlData.originalUrl}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <button className="url-short" style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-head)", fontSize: 17, color: "var(--accent2)", letterSpacing: "-0.3px" }} onClick={() => onRedirect(urlData)} title="Click to simulate redirect">
            {shortUrl}
          </button>
          {urlData.alias && <span className="badge badge-purple">custom</span>}
          {isExpired && <span className="expiry-badge">expired</span>}
          {urlData.expiresAt && !isExpired && <span className="expiry-badge" style={{ background: "rgba(0,210,200,0.1)", color: "var(--teal)" }}>expires {fmtDate(urlData.expiresAt)}</span>}
        </div>
        <div className="url-meta">
          <span className="meta-badge clicks">⚡ {urlData.clicks} clicks</span>
          <span className="meta-badge">📅 {fmtDate(urlData.createdAt)}</span>
          {urlData.visits.length > 0 && <span className="meta-badge">🕐 {timeAgo(Math.max(...urlData.visits.map(v => v.ts)))}</span>}
        </div>
      </div>
      <div className="url-actions">
        <button className={`btn btn-ghost btn-sm ${copied ? "copy-flash" : ""}`} onClick={handleCopy} title="Copy short URL">
          {copied ? "✓ Copied" : "Copy"}
        </button>
        <button className="btn btn-teal btn-sm" onClick={() => onAnalytics(urlData)}>Analytics</button>
        <button className="btn btn-danger btn-sm btn-icon" onClick={() => onDelete(urlData.id)} title="Delete">✕</button>
      </div>
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, onLogout }) {
  const [urls, setUrls] = useState(() => DB.urls.filter(u => u.userId === user.id));
  const [analyticsUrl, setAnalyticsUrl] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [redirectModal, setRedirectModal] = useState(null);

  const addToast = useCallback((msg, type = "success") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000);
  }, []);

  const refreshUrls = () => setUrls([...DB.urls.filter(u => u.userId === user.id)]);

  const handleCreated = () => refreshUrls();

  const handleDelete = (id) => {
    DB.urls = DB.urls.filter(u => u.id !== id);
    refreshUrls();
    addToast("Link deleted", "success");
  };

  const handleCopy = (text) => {
    try { navigator.clipboard.writeText(`https://${text}`); } catch {}
    addToast("Copied to clipboard!", "success");
  };

  const handleRedirect = (urlData) => {
    if (urlData.expiresAt && urlData.expiresAt < Date.now()) {
      addToast("This link has expired", "error"); return;
    }
    // Simulate click tracking
    const browsers = ["Chrome", "Firefox", "Safari", "Edge"];
    const visit = { ts: Date.now(), country: "IN", browser: browsers[Math.floor(Math.random() * browsers.length)] };
    urlData.visits.push(visit);
    urlData.clicks++;
    refreshUrls();
    setRedirectModal(urlData);
  };

  // Filter & sort
  const filtered = urls
    .filter(u => !search || u.originalUrl.includes(search) || u.shortCode.includes(search))
    .sort((a, b) => {
      if (sortBy === "newest") return b.createdAt - a.createdAt;
      if (sortBy === "clicks") return b.clicks - a.clicks;
      if (sortBy === "oldest") return a.createdAt - b.createdAt;
      return 0;
    });

  const totalClicks = urls.reduce((s, u) => s + u.clicks, 0);
  const topUrl = urls.sort((a, b) => b.clicks - a.clicks)[0];

  return (
    <div className="app">
      <style>{css}</style>
      <nav className="nav">
        <div className="nav-logo">⚡ LinkSnip</div>
        <div className="nav-actions">
          <span style={{ fontSize: 13, color: "var(--text3)" }}>Hi, {user.name.split(" ")[0]}</span>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
        </div>
      </nav>

      <main className="main">
        <div className="page-header">
          <div className="page-title">My Links</div>
          <div className="page-sub">Manage and track all your shortened URLs</div>
        </div>

        {/* Stats */}
        <div className="stats-row">
          <div className="stat-card">
            <div className="stat-label">Total links</div>
            <div className="stat-val">{urls.length}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total clicks</div>
            <div className="stat-val" style={{ color: "var(--teal)" }}>{totalClicks}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Top link</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700, color: "var(--accent2)", marginTop: 6 }}>
              {topUrl ? `snip.io/${topUrl.shortCode}` : "—"}
            </div>
            {topUrl && <div className="stat-sub">{topUrl.clicks} clicks</div>}
          </div>
          <div className="stat-card">
            <div className="stat-label">Active links</div>
            <div className="stat-val">{urls.filter(u => !u.expiresAt || u.expiresAt > Date.now()).length}</div>
          </div>
        </div>

        {/* Shorten form */}
        <ShortenForm userId={user.id} onCreated={handleCreated} addToast={addToast} />

        {/* Controls */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16, flexWrap: "wrap" }}>
          <input className="input" style={{ maxWidth: 260, fontSize: 13 }} placeholder="Search links…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="input" style={{ maxWidth: 160, fontSize: 13 }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="clicks">Most clicks</option>
          </select>
          <span style={{ fontSize: 13, color: "var(--text3)", marginLeft: "auto" }}>{filtered.length} link{filtered.length !== 1 ? "s" : ""}</span>
        </div>

        {/* URL list */}
        {filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔗</div>
            <div className="empty-title">{search ? "No links match your search" : "No links yet"}</div>
            <div style={{ fontSize: 14 }}>{search ? "Try a different keyword" : "Create your first short link above"}</div>
          </div>
        ) : (
          <div className="url-list">
            {filtered.map(u => (
              <UrlItem key={u.id} urlData={u}
                onDelete={handleDelete}
                onAnalytics={setAnalyticsUrl}
                onCopy={handleCopy}
                onRedirect={handleRedirect}
              />
            ))}
          </div>
        )}
      </main>

      {analyticsUrl && <AnalyticsModal urlData={analyticsUrl} onClose={() => setAnalyticsUrl(null)} />}

      {redirectModal && (
        <div className="modal-bg" onClick={() => setRedirectModal(null)}>
          <div className="modal" style={{ maxWidth: 400, textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🚀</div>
            <div style={{ fontFamily: "var(--font-head)", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Redirect simulated</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20, wordBreak: "break-all" }}>{redirectModal.originalUrl}</div>
            <div style={{ background: "var(--bg3)", borderRadius: "var(--radius2)", padding: "12px 16px", fontSize: 13, color: "var(--teal)", marginBottom: 20 }}>
              ✓ Click tracked · {redirectModal.clicks} total clicks
            </div>
            <button className="btn btn-primary" style={{ width: "100%", justifyContent: "center" }} onClick={() => { setRedirectModal(null); }}>Close</button>
          </div>
        </div>
      )}

      <Toasts toasts={toasts} />
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);

  const handleLogin = (u) => setUser(u);
  const handleLogout = () => setUser(null);

  if (!user) {
    return (
      <>
        <style>{css}</style>
        <AuthPage onLogin={handleLogin} />
      </>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}
