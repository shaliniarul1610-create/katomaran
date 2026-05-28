import { useState, useEffect, useCallback, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════════
   GLOBAL STYLES
═══════════════════════════════════════════════════════════════════ */
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Cabinet+Grotesk:wght@400;500;700;800;900&family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --c-bg:       #09090f;
  --c-bg2:      #111118;
  --c-bg3:      #18181f;
  --c-surface:  #1e1e28;
  --c-surf2:    #252532;
  --c-border:   rgba(255,255,255,0.07);
  --c-border2:  rgba(255,255,255,0.13);

  --c-violet:   #8b5cf6;
  --c-violet2:  #a78bfa;
  --c-rose:     #f43f5e;
  --c-rose2:    #fb7185;
  --c-amber:    #f59e0b;
  --c-amber2:   #fbbf24;
  --c-cyan:     #06b6d4;
  --c-cyan2:    #22d3ee;
  --c-emerald:  #10b981;
  --c-emerald2: #34d399;
  --c-orange:   #f97316;
  --c-orange2:  #fb923c;
  --c-pink:     #ec4899;
  --c-pink2:    #f472b6;

  --c-text:     #f1f0ff;
  --c-text2:    #9490b5;
  --c-text3:    #524f6b;
  --c-text4:    #35324a;

  --r-sm: 8px;
  --r-md: 12px;
  --r-lg: 16px;
  --r-xl: 24px;
  --r-full: 9999px;

  --f-display: 'Cabinet Grotesk', sans-serif;
  --f-body:    'Instrument Sans', sans-serif;

  --sh-glow-v: 0 0 40px rgba(139,92,246,0.18);
  --sh-glow-r: 0 0 40px rgba(244,63,94,0.18);
  --sh-glow-c: 0 0 40px rgba(6,182,212,0.18);
  --sh-card: 0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.25);
}

html, body { height: 100%; }
body {
  background: var(--c-bg);
  color: var(--c-text);
  font-family: var(--f-body);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 5px; height: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--c-surf2); border-radius: var(--r-full); }

/* ── Typography ── */
.f-display { font-family: var(--f-display); }

/* ── Buttons ── */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 7px;
  padding: 10px 20px; border-radius: var(--r-sm); border: none; cursor: pointer;
  font-family: var(--f-body); font-size: 14px; font-weight: 600;
  transition: all 0.17s cubic-bezier(.4,0,.2,1); white-space: nowrap; text-decoration: none;
  position: relative; overflow: hidden;
}
.btn::after {
  content: ''; position: absolute; inset: 0;
  background: rgba(255,255,255,0); transition: background 0.15s;
}
.btn:hover::after { background: rgba(255,255,255,0.07); }
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none !important; }

.btn-violet  { background: var(--c-violet); color: #fff; box-shadow: 0 4px 16px rgba(139,92,246,0.35); }
.btn-violet:hover  { background: #7c3aed; box-shadow: 0 6px 24px rgba(139,92,246,0.5); }
.btn-rose    { background: var(--c-rose); color: #fff; box-shadow: 0 4px 16px rgba(244,63,94,0.35); }
.btn-rose:hover    { background: #e11d48; }
.btn-cyan    { background: var(--c-cyan); color: #0a0a0f; box-shadow: 0 4px 16px rgba(6,182,212,0.35); }
.btn-cyan:hover    { background: #0891b2; color: #fff; }
.btn-emerald { background: var(--c-emerald); color: #0a0a0f; box-shadow: 0 4px 16px rgba(16,185,129,0.35); }
.btn-emerald:hover { background: #059669; color: #fff; }
.btn-ghost   {
  background: transparent; color: var(--c-text2);
  border: 1px solid var(--c-border2);
}
.btn-ghost:hover { background: var(--c-surface); color: var(--c-text); }
.btn-danger  { background: transparent; color: var(--c-rose2); border: 1px solid rgba(244,63,94,0.25); }
.btn-danger:hover { background: rgba(244,63,94,0.1); }
.btn-sm { padding: 7px 14px; font-size: 13px; }
.btn-xs { padding: 5px 10px; font-size: 12px; border-radius: 6px; }
.btn-icon { padding: 8px; width: 36px; height: 36px; flex-shrink: 0; }

/* ── Inputs ── */
.input {
  width: 100%; background: var(--c-bg3); border: 1px solid var(--c-border2);
  color: var(--c-text); border-radius: var(--r-sm);
  padding: 11px 14px; font-family: var(--f-body); font-size: 14px;
  outline: none; transition: border-color 0.18s, box-shadow 0.18s;
}
.input:focus { border-color: var(--c-violet); box-shadow: 0 0 0 3px rgba(139,92,246,0.15); }
.input::placeholder { color: var(--c-text3); }
.input.err { border-color: var(--c-rose); }
.input.err:focus { box-shadow: 0 0 0 3px rgba(244,63,94,0.15); }
.input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(0.6); cursor: pointer; }
.label { font-size: 12px; font-weight: 600; color: var(--c-text3); text-transform: uppercase; letter-spacing: .06em; margin-bottom: 6px; display: block; }
.err-msg { font-size: 12px; color: var(--c-rose2); margin-top: 5px; display: flex; align-items: center; gap: 4px; }

/* ── Cards ── */
.card {
  background: var(--c-surface); border: 1px solid var(--c-border);
  border-radius: var(--r-lg); box-shadow: var(--sh-card);
}
.card-inner { padding: 22px 24px; }
.card-sm { padding: 16px 18px; }

/* ── Badges ── */
.badge {
  display: inline-flex; align-items: center; gap: 4px;
  padding: 3px 9px; border-radius: var(--r-full);
  font-size: 11px; font-weight: 700; letter-spacing: .03em; text-transform: uppercase;
}
.badge-violet  { background: rgba(139,92,246,0.15); color: var(--c-violet2); border: 1px solid rgba(139,92,246,0.25); }
.badge-rose    { background: rgba(244,63,94,0.12);  color: var(--c-rose2);   border: 1px solid rgba(244,63,94,0.2); }
.badge-cyan    { background: rgba(6,182,212,0.12);  color: var(--c-cyan2);   border: 1px solid rgba(6,182,212,0.2); }
.badge-emerald { background: rgba(16,185,129,0.12); color: var(--c-emerald2);border: 1px solid rgba(16,185,129,0.2); }
.badge-amber   { background: rgba(245,158,11,0.12); color: var(--c-amber2);  border: 1px solid rgba(245,158,11,0.2); }
.badge-orange  { background: rgba(249,115,22,0.12); color: var(--c-orange2); border: 1px solid rgba(249,115,22,0.2); }
.badge-pink    { background: rgba(236,72,153,0.12); color: var(--c-pink2);   border: 1px solid rgba(236,72,153,0.2); }

/* ── Layout ── */
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }
.topbar {
  background: rgba(9,9,15,0.85); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--c-border);
  position: sticky; top: 0; z-index: 200;
  padding: 0 28px; height: 62px;
  display: flex; align-items: center; justify-content: space-between;
}
.logo {
  font-family: var(--f-display); font-size: 22px; font-weight: 900;
  letter-spacing: -0.5px;
  background: linear-gradient(135deg, var(--c-violet2) 0%, var(--c-cyan2) 50%, var(--c-emerald2) 100%);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.main-content { flex: 1; max-width: 1160px; width: 100%; margin: 0 auto; padding: 32px 24px; }

/* ── Sidebar nav ── */
.layout-grid { display: grid; grid-template-columns: 220px 1fr; gap: 28px; }
.sidebar { display: flex; flex-direction: column; gap: 4px; position: sticky; top: 90px; height: fit-content; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 10px 14px; border-radius: var(--r-sm);
  font-size: 14px; font-weight: 500; color: var(--c-text2);
  cursor: pointer; transition: all 0.15s; border: none; background: none;
  font-family: var(--f-body); text-align: left; width: 100%;
}
.nav-item:hover { background: var(--c-surface); color: var(--c-text); }
.nav-item.active { background: var(--c-surface); color: var(--c-text); font-weight: 600; }
.nav-item .nav-dot {
  width: 7px; height: 7px; border-radius: 50%; margin-left: auto; flex-shrink: 0;
}

/* ── Section headers ── */
.section-head { margin-bottom: 24px; }
.section-title {
  font-family: var(--f-display); font-size: 24px; font-weight: 800;
  color: var(--c-text); letter-spacing: -0.4px;
}
.section-sub { font-size: 13px; color: var(--c-text3); margin-top: 3px; }

/* ── Stats strip ── */
.stats-strip { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 26px; }
.stat-tile {
  border-radius: var(--r-md); padding: 18px 20px; position: relative; overflow: hidden;
  border: 1px solid var(--c-border);
}
.stat-tile::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.stat-tile.sv::before { background: linear-gradient(90deg, var(--c-violet), var(--c-pink)); }
.stat-tile.sc::before { background: linear-gradient(90deg, var(--c-cyan), var(--c-emerald)); }
.stat-tile.sa::before { background: linear-gradient(90deg, var(--c-amber), var(--c-orange)); }
.stat-tile.sr::before { background: linear-gradient(90deg, var(--c-rose), var(--c-orange)); }
.stat-tile-label { font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: .08em; color: var(--c-text3); margin-bottom: 10px; }
.stat-tile-val { font-family: var(--f-display); font-size: 34px; font-weight: 900; line-height: 1; color: var(--c-text); }
.stat-tile-sub { font-size: 12px; color: var(--c-text3); margin-top: 5px; }

/* ── Shorten form ── */
.shorten-bar {
  background: linear-gradient(135deg, #1a1428 0%, #141620 50%, #0e1a1c 100%);
  border: 1px solid var(--c-border2); border-radius: var(--r-xl);
  padding: 28px 28px 24px; margin-bottom: 28px; position: relative; overflow: hidden;
}
.shorten-bar::after {
  content: ''; position: absolute; top: -80px; right: -80px;
  width: 280px; height: 280px; border-radius: 50%;
  background: radial-gradient(circle, rgba(139,92,246,0.08), transparent 70%);
  pointer-events: none;
}
.shorten-row { display: flex; gap: 12px; align-items: flex-start; }
.shorten-row .input { flex: 1; height: 46px; font-size: 15px; }
.opts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; margin-top: 14px; }
.adv-toggle {
  font-size: 12px; color: var(--c-text3); cursor: pointer; background: none; border: none;
  font-family: var(--f-body); display: flex; align-items: center; gap: 5px; margin-top: 10px;
  transition: color 0.15s; padding: 0;
}
.adv-toggle:hover { color: var(--c-violet2); }

/* ── URL cards ── */
.url-grid { display: flex; flex-direction: column; gap: 10px; }
.url-card {
  border-radius: var(--r-md); border: 1px solid var(--c-border);
  padding: 0; overflow: hidden; transition: border-color 0.18s;
  position: relative;
}
.url-card:hover { border-color: var(--c-border2); }
.url-card-strip { height: 3px; width: 100%; }
.url-card-body { padding: 16px 20px 14px; display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items: start; }
.url-orig { font-size: 12px; color: var(--c-text3); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 520px; margin-bottom: 4px; }
.url-short {
  font-family: var(--f-display); font-size: 19px; font-weight: 800;
  letter-spacing: -0.3px; cursor: pointer; border: none; background: none;
  text-align: left; padding: 0; display: block; transition: opacity 0.15s;
}
.url-short:hover { opacity: 0.75; }
.url-meta { display: flex; gap: 14px; flex-wrap: wrap; margin-top: 8px; }
.url-meta-item { font-size: 12px; color: var(--c-text3); display: flex; align-items: center; gap: 4px; }
.url-meta-item.hlt { font-weight: 700; }
.url-actions { display: flex; gap: 7px; align-items: center; flex-shrink: 0; }
.url-expired { opacity: 0.45; }
.url-expired .url-card-strip { background: var(--c-text4) !important; }

/* ── Modal ── */
.modal-backdrop {
  position: fixed; inset: 0; background: rgba(0,0,0,0.75);
  backdrop-filter: blur(6px); z-index: 500;
  display: flex; align-items: center; justify-content: center; padding: 24px;
}
.modal {
  background: var(--c-bg2); border: 1px solid var(--c-border2);
  border-radius: var(--r-xl); width: 100%; max-width: 580px;
  max-height: 85vh; overflow-y: auto; box-shadow: 0 32px 80px rgba(0,0,0,0.6);
  animation: modalIn 0.22s cubic-bezier(.34,1.56,.64,1);
}
@keyframes modalIn { from { transform: scale(0.94) translateY(8px); opacity: 0; } to { transform: none; opacity: 1; } }
.modal-head {
  padding: 24px 26px 20px; border-bottom: 1px solid var(--c-border);
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.modal-body { padding: 24px 26px; }
.modal-title { font-family: var(--f-display); font-size: 20px; font-weight: 800; }

/* ── Analytics ── */
.analytics-kpi { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; margin-bottom: 22px; }
.kpi-box {
  border-radius: var(--r-md); padding: 16px 18px;
  background: var(--c-bg3); border: 1px solid var(--c-border);
}
.kpi-label { font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: .07em; color: var(--c-text3); margin-bottom: 6px; }
.kpi-val { font-family: var(--f-display); font-size: 28px; font-weight: 900; line-height: 1; }
.visit-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: var(--r-sm);
  background: var(--c-bg3); border: 1px solid var(--c-border);
  font-size: 13px; gap: 12px;
}
.visit-row + .visit-row { margin-top: 6px; }
.visit-info { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.visit-time { font-size: 11px; color: var(--c-text3); }

/* ── Chart bar ── */
.chart-wrap { position: relative; height: 180px; }

/* ── Auth ── */
.auth-page {
  min-height: 100vh; display: flex; align-items: center; justify-content: center;
  padding: 24px; position: relative; overflow: hidden;
}
.auth-bg {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 55% 45% at 20% 20%, rgba(139,92,246,0.1), transparent),
    radial-gradient(ellipse 50% 40% at 80% 80%, rgba(6,182,212,0.08), transparent),
    radial-gradient(ellipse 40% 50% at 60% 20%, rgba(244,63,94,0.06), transparent);
}
.auth-card {
  width: 100%; max-width: 440px; position: relative; z-index: 1;
  background: var(--c-bg2); border: 1px solid var(--c-border2);
  border-radius: var(--r-xl); padding: 42px 38px;
  box-shadow: 0 32px 80px rgba(0,0,0,0.5), var(--sh-glow-v);
}
.auth-logo { text-align: center; margin-bottom: 6px; }
.auth-logo .logo { font-size: 30px; }
.auth-headline { text-align: center; color: var(--c-text3); font-size: 14px; margin-bottom: 32px; }
.auth-tabs-wrap { display: flex; background: var(--c-bg3); border-radius: var(--r-sm); padding: 4px; margin-bottom: 28px; gap: 4px; }
.auth-tab {
  flex: 1; padding: 9px; text-align: center; border-radius: 6px;
  cursor: pointer; font-size: 14px; font-weight: 600; color: var(--c-text3);
  transition: all 0.17s; border: none; background: transparent; font-family: var(--f-body);
}
.auth-tab.active { background: var(--c-surf2); color: var(--c-text); }
.auth-form { display: flex; flex-direction: column; gap: 16px; }
.auth-divider { text-align: center; color: var(--c-text4); font-size: 12px; margin: 4px 0; }

/* ── Verification screen ── */
.verify-screen {
  text-align: center; padding: 12px 0;
}
.verify-icon { font-size: 52px; margin-bottom: 16px; }
.verify-code-display {
  font-family: var(--f-display); font-size: 40px; font-weight: 900;
  letter-spacing: 12px; color: var(--c-violet2);
  background: var(--c-bg3); border: 1px solid var(--c-border2);
  border-radius: var(--r-md); padding: 18px; margin: 20px 0 8px;
  text-align: center;
}
.verify-subtitle { font-size: 13px; color: var(--c-text3); margin-bottom: 20px; }

/* ── Toast ── */
.toasts-wrap { position: fixed; bottom: 24px; right: 24px; z-index: 9999; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.toast {
  display: flex; align-items: center; gap: 10px;
  padding: 13px 18px; border-radius: var(--r-md);
  font-size: 14px; font-weight: 500; pointer-events: all;
  animation: toastIn 0.25s cubic-bezier(.34,1.4,.64,1);
  box-shadow: 0 8px 32px rgba(0,0,0,0.4);
  min-width: 260px; max-width: 380px;
}
@keyframes toastIn { from { transform: translateX(110%); opacity: 0; } to { transform: none; opacity: 1; } }
.toast.success { background: #0d1f18; border: 1px solid rgba(16,185,129,0.4); color: var(--c-emerald2); }
.toast.error   { background: #1f0d12; border: 1px solid rgba(244,63,94,0.4); color: var(--c-rose2); }
.toast.info    { background: #0d1525; border: 1px solid rgba(6,182,212,0.4); color: var(--c-cyan2); }
.toast.warn    { background: #1f1700; border: 1px solid rgba(245,158,11,0.4); color: var(--c-amber2); }
.toast-icon { font-size: 16px; flex-shrink: 0; }

/* ── Copy flash ── */
@keyframes flashGreen { 0%,100%{background:transparent} 50%{background:rgba(16,185,129,0.12)} }
.flash { animation: flashGreen 0.4s ease; }

/* ── Empty state ── */
.empty-state { text-align: center; padding: 60px 24px; }
.empty-icon { font-size: 52px; opacity: 0.35; margin-bottom: 16px; }
.empty-title { font-family: var(--f-display); font-size: 20px; font-weight: 800; color: var(--c-text2); margin-bottom: 8px; }
.empty-sub { font-size: 14px; color: var(--c-text3); }

/* ── Spinner ── */
.spin { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.25); border-top-color: currentColor; border-radius: 50%; animation: spinning 0.65s linear infinite; flex-shrink: 0; }
@keyframes spinning { to { transform: rotate(360deg); } }

/* ── Divider ── */
.divider { height: 1px; background: var(--c-border); margin: 20px 0; }

/* ── Tabs ── */
.tabs { display: flex; border-bottom: 1px solid var(--c-border); margin-bottom: 22px; gap: 2px; }
.tab-btn {
  padding: 10px 18px; font-size: 14px; font-weight: 600;
  color: var(--c-text3); cursor: pointer; border: none; background: transparent;
  border-bottom: 2px solid transparent; margin-bottom: -1px; font-family: var(--f-body);
  transition: all 0.16s;
}
.tab-btn.active { color: var(--c-violet2); border-bottom-color: var(--c-violet2); }
.tab-btn:hover:not(.active) { color: var(--c-text2); }

/* ── CSV Drop zone ── */
.drop-zone {
  border: 2px dashed var(--c-border2); border-radius: var(--r-lg);
  padding: 40px 24px; text-align: center; cursor: pointer;
  transition: all 0.18s; position: relative;
}
.drop-zone:hover, .drop-zone.drag { border-color: var(--c-violet); background: rgba(139,92,246,0.05); }
.drop-zone input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }
.drop-icon { font-size: 36px; margin-bottom: 10px; opacity: 0.6; }

/* ── Public stats ── */
.pub-stat-card { border-radius: var(--r-lg); padding: 28px; background: var(--c-surface); border: 1px solid var(--c-border); }

/* ── Responsive ── */
@media (max-width: 768px) {
  .layout-grid { grid-template-columns: 1fr; }
  .sidebar { display: none; }
  .stats-strip { grid-template-columns: repeat(2,1fr); }
  .topbar { padding: 0 16px; }
  .main-content { padding: 20px 14px; }
  .opts-row { grid-template-columns: 1fr; }
  .analytics-kpi { grid-template-columns: 1fr 1fr; }
  .auth-card { padding: 28px 22px; }
  .shorten-row { flex-direction: column; }
}
@media (max-width: 480px) {
  .stats-strip { grid-template-columns: 1fr 1fr; }
  .url-card-body { grid-template-columns: 1fr; }
  .url-actions { flex-wrap: wrap; }
}

/* ── Animations ── */
@keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
.fade-up { animation: fadeUp 0.3s ease both; }
.fade-up-1 { animation-delay: 0.05s; }
.fade-up-2 { animation-delay: 0.1s; }
.fade-up-3 { animation-delay: 0.15s; }
.fade-up-4 { animation-delay: 0.2s; }

/* ── Progress ── */
.progress { height: 5px; background: var(--c-bg3); border-radius: var(--r-full); overflow: hidden; }
.progress-bar { height: 100%; border-radius: var(--r-full); background: linear-gradient(90deg, var(--c-violet), var(--c-cyan)); transition: width 0.4s ease; }

/* ── Edit input ── */
.inline-edit { display: flex; gap: 8px; align-items: center; margin-top: 6px; }
.inline-edit .input { flex: 1; height: 36px; font-size: 13px; }
`;

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & HELPERS
═══════════════════════════════════════════════════════════════════ */
const URL_COLORS = [
  { strip: "linear-gradient(90deg,#8b5cf6,#ec4899)", text: "#a78bfa", cls: "badge-violet" },
  { strip: "linear-gradient(90deg,#06b6d4,#10b981)", text: "#22d3ee", cls: "badge-cyan" },
  { strip: "linear-gradient(90deg,#f43f5e,#f97316)", text: "#fb7185", cls: "badge-rose" },
  { strip: "linear-gradient(90deg,#f59e0b,#84cc16)", text: "#fbbf24", cls: "badge-amber" },
  { strip: "linear-gradient(90deg,#10b981,#06b6d4)", text: "#34d399", cls: "badge-emerald" },
  { strip: "linear-gradient(90deg,#ec4899,#8b5cf6)", text: "#f472b6", cls: "badge-pink" },
  { strip: "linear-gradient(90deg,#f97316,#f59e0b)", text: "#fb923c", cls: "badge-orange" },
];

const BROWSERS = ["Chrome", "Firefox", "Safari", "Edge", "Opera", "Brave"];
const DEVICES  = ["Desktop", "Mobile", "Tablet"];
const COUNTRIES= ["IN", "US", "GB", "DE", "JP", "FR", "BR", "CA", "AU", "SG"];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uid  = () => Math.random().toString(36).slice(2,10);

const isURL = (s) => { try { return !!new URL(s); } catch { return false; } };

const fmtDate = (ts) => ts ? new Date(ts).toLocaleDateString("en-IN", { day:"numeric", month:"short", year:"numeric" }) : "—";
const fmtFull = (ts) => ts ? new Date(ts).toLocaleString("en-IN", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" }) : "Never";
const timeAgo = (ts) => {
  const d = Date.now() - ts;
  if (d < 60000) return "Just now";
  if (d < 3600000) return Math.floor(d/60000) + "m ago";
  if (d < 86400000) return Math.floor(d/3600000) + "h ago";
  return Math.floor(d/86400000) + "d ago";
};

const hashPw = (s) => {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return h.toString(16);
};

const genCode = (alias) => {
  if (alias) return alias.toLowerCase().replace(/[^a-z0-9-_]/g,"").slice(0,20);
  const c = "abcdefghijklmnopqrstuvwxyz0123456789";
  return Array.from({length:6},()=>c[Math.floor(Math.random()*c.length)]).join("");
};

const colorForUrl = (id) => URL_COLORS[parseInt(id.replace(/\D/g,"").slice(-1)||"0") % URL_COLORS.length];

/* ═══════════════════════════════════════════════════════════════════
   MOCK DATABASE (in-memory, simulates PostgreSQL)
═══════════════════════════════════════════════════════════════════ */
const DB = {
  users: [
    {
      id:"u1", name:"Priya Sharma", email:"priya@demo.io",
      pwHash: hashPw("Demo@1234"), verified:true,
      createdAt: Date.now()-86400000*45, avatar:"PS"
    }
  ],
  urls: [
    {
      id:"url1", userId:"u1", shortCode:"prisma",
      originalUrl:"https://www.prisma.io/docs/getting-started/quickstart",
      alias:"prisma", clicks:327, createdAt:Date.now()-86400000*20, expiresAt:null,
      visits: Array.from({length:40},(_, i) => ({
        ts: Date.now() - i * 4.2*3600000,
        browser: rand(BROWSERS), device: rand(DEVICES), country: rand(COUNTRIES)
      }))
    },
    {
      id:"url2", userId:"u1", shortCode:"gist42",
      originalUrl:"https://gist.github.com/example/very-long-url-path-that-demonstrates-shortening-power",
      alias:null, clicks:89, createdAt:Date.now()-86400000*12, expiresAt:null,
      visits: Array.from({length:12},(_, i) => ({
        ts: Date.now() - i * 8*3600000,
        browser: rand(BROWSERS), device: rand(DEVICES), country: rand(COUNTRIES)
      }))
    },
    {
      id:"url3", userId:"u1", shortCode:"design",
      originalUrl:"https://www.figma.com/community/file/1234567890/design-system-tokens-components",
      alias:"design", clicks:215, createdAt:Date.now()-86400000*5,
      expiresAt: Date.now() + 86400000*10,
      visits: Array.from({length:30},(_, i) => ({
        ts: Date.now() - i * 3*3600000,
        browser: rand(BROWSERS), device: rand(DEVICES), country: rand(COUNTRIES)
      }))
    }
  ],
  pending: [], // { email, name, code, pwHash, expiresAt }
  _id: 200,
  nextId() { return `id${this._id++}`; }
};

/* ═══════════════════════════════════════════════════════════════════
   MOCK API (simulates REST endpoints + email sending)
═══════════════════════════════════════════════════════════════════ */
const API = {
  delay: (ms=500) => new Promise(r => setTimeout(r, ms)),

  async signup({ name, email, password }) {
    await this.delay(700);
    if (DB.users.find(u => u.email===email)) throw new Error("Email already registered");
    const code = String(Math.floor(100000+Math.random()*900000));
    DB.pending = DB.pending.filter(p => p.email!==email);
    DB.pending.push({ email, name, code, pwHash:hashPw(password), expiresAt:Date.now()+600000 });
    return { code, message:"Verification code sent to "+email };
  },

  async verify({ email, code }) {
    await this.delay(600);
    const p = DB.pending.find(x => x.email===email && x.code===code);
    if (!p) throw new Error("Invalid or expired code");
    if (p.expiresAt < Date.now()) throw new Error("Code expired. Request a new one.");
    const user = { id:DB.nextId(), name:p.name, email:p.email, pwHash:p.pwHash, verified:true, createdAt:Date.now(), avatar:p.name.split(" ").map(w=>w[0]).join("").toUpperCase().slice(0,2) };
    DB.users.push(user);
    DB.pending = DB.pending.filter(x => x.email!==email);
    return user;
  },

  async login({ email, password }) {
    await this.delay(600);
    const u = DB.users.find(u => u.email===email && u.pwHash===hashPw(password));
    if (!u) throw new Error("Incorrect email or password");
    if (!u.verified) throw new Error("Please verify your email first");
    return u;
  },

  async createUrl({ userId, originalUrl, alias, expiresAt }) {
    await this.delay(550);
    if (!isURL(originalUrl)) throw new Error("Enter a valid URL (include https://)");
    let code = genCode(alias);
    if (!code) code = genCode();
    while (DB.urls.find(u => u.shortCode===code)) {
      if (alias) throw new Error("Alias already taken. Choose another.");
      code = genCode();
    }
    const url = {
      id: DB.nextId(), userId, shortCode:code, originalUrl, alias:alias||null,
      clicks:0, createdAt:Date.now(), expiresAt:expiresAt||null, visits:[]
    };
    DB.urls.push(url);
    return url;
  },

  async deleteUrl(id) {
    await this.delay(400);
    DB.urls = DB.urls.filter(u => u.id!==id);
    return true;
  },

  async editUrl(id, newOriginalUrl) {
    await this.delay(400);
    if (!isURL(newOriginalUrl)) throw new Error("Enter a valid URL");
    const u = DB.urls.find(u => u.id===id);
    if (!u) throw new Error("Link not found");
    u.originalUrl = newOriginalUrl;
    return u;
  },

  async trackClick(shortCode) {
    await this.delay(200);
    const u = DB.urls.find(u => u.shortCode===shortCode);
    if (!u) throw new Error("Link not found");
    if (u.expiresAt && u.expiresAt < Date.now()) throw new Error("Link has expired");
    const visit = { ts:Date.now(), browser:rand(BROWSERS), device:rand(DEVICES), country:rand(COUNTRIES) };
    u.visits.push(visit);
    u.clicks++;
    return { originalUrl: u.originalUrl, visit };
  },

  async getPublicStats(shortCode) {
    await this.delay(300);
    const u = DB.urls.find(u => u.shortCode===shortCode);
    if (!u) throw new Error("Link not found");
    return { shortCode:u.shortCode, clicks:u.clicks, createdAt:u.createdAt, lastVisit: u.visits.length ? Math.max(...u.visits.map(v=>v.ts)) : null };
  },

  getUrlsForUser(userId) {
    return DB.urls.filter(u => u.userId===userId);
  }
};

/* ═══════════════════════════════════════════════════════════════════
   TOAST SYSTEM
═══════════════════════════════════════════════════════════════════ */
function useToast() {
  const [toasts, setToasts] = useState([]);
  const add = useCallback((msg, type="success") => {
    const id = uid();
    setToasts(t => [...t.slice(-4), {id, msg, type}]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3500);
  }, []);
  return { toasts, add };
}
const TOAST_ICONS = { success:"✓", error:"✕", info:"ℹ", warn:"⚠" };
function Toasts({ toasts }) {
  return (
    <div className="toasts-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type}`}>
          <span className="toast-icon">{TOAST_ICONS[t.type]}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CHART COMPONENT (Chart.js)
═══════════════════════════════════════════════════════════════════ */
function DailyChart({ visits, color="#8b5cf6" }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  const dailyData = useMemo(() => {
    const days = Array.from({length:7},(_,i)=>{
      const d = new Date(); d.setDate(d.getDate()-(6-i));
      const label = d.toLocaleDateString("en",{weekday:"short"});
      const s = new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime();
      const count = visits.filter(v=>v.ts>=s && v.ts<s+86400000).length;
      return {label, count};
    });
    return days;
  }, [visits]);

  useEffect(() => {
    if (!canvasRef.current) return;
    const loadChart = () => {
      if (!window.Chart) return;
      if (chartRef.current) chartRef.current.destroy();
      chartRef.current = new window.Chart(canvasRef.current, {
        type:"bar",
        data:{
          labels: dailyData.map(d=>d.label),
          datasets:[{
            label:"Clicks", data:dailyData.map(d=>d.count),
            backgroundColor: color+"55", borderColor: color,
            borderWidth:2, borderRadius:6,
          }]
        },
        options:{
          responsive:true, maintainAspectRatio:false,
          plugins:{ legend:{display:false} },
          scales:{
            x:{ grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:"#524f6b",font:{size:11,family:"'Instrument Sans',sans-serif"}} },
            y:{ grid:{color:"rgba(255,255,255,0.04)"}, ticks:{color:"#524f6b",font:{size:11},stepSize:1}, beginAtZero:true, min:0 }
          }
        }
      });
    };
    if (window.Chart) { loadChart(); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.js";
    s.onload = loadChart;
    document.head.appendChild(s);
    return () => { if (chartRef.current) chartRef.current.destroy(); };
  }, [dailyData, color]);

  return (
    <div className="chart-wrap">
      <canvas ref={canvasRef} role="img" aria-label="Daily click chart for last 7 days">
        {dailyData.map(d=>`${d.label}:${d.count}`).join(", ")}
      </canvas>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ANALYTICS MODAL
═══════════════════════════════════════════════════════════════════ */
function AnalyticsModal({ urlData, onClose }) {
  const col  = colorForUrl(urlData.id);
  const lastV = urlData.visits.length ? Math.max(...urlData.visits.map(v=>v.ts)) : null;
  const isExpired = urlData.expiresAt && urlData.expiresAt < Date.now();

  const deviceCounts = useMemo(()=>{
    const c = {};
    urlData.visits.forEach(v=>{ c[v.device]=(c[v.device]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[urlData.visits]);

  const browserCounts = useMemo(()=>{
    const c = {};
    urlData.visits.forEach(v=>{ c[v.browser]=(c[v.browser]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]);
  },[urlData.visits]);

  const countryCounts = useMemo(()=>{
    const c = {};
    urlData.visits.forEach(v=>{ c[v.country]=(c[v.country]||0)+1; });
    return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,5);
  },[urlData.visits]);

  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div>
            <div className="modal-title" style={{color:col.text}}>snap.io/{urlData.shortCode}</div>
            <div style={{fontSize:12,color:"var(--c-text3)",marginTop:3,wordBreak:"break-all",maxWidth:420}}>{urlData.originalUrl}</div>
            <div style={{marginTop:8,display:"flex",gap:8,flexWrap:"wrap"}}>
              {urlData.alias && <span className="badge badge-violet">Custom alias</span>}
              {isExpired && <span className="badge badge-rose">Expired</span>}
              {urlData.expiresAt && !isExpired && <span className="badge badge-amber">Expires {fmtDate(urlData.expiresAt)}</span>}
            </div>
          </div>
          <button className="btn btn-ghost btn-icon btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {/* KPIs */}
          <div className="analytics-kpi">
            <div className="kpi-box">
              <div className="kpi-label">Total clicks</div>
              <div className="kpi-val" style={{color:col.text}}>{urlData.clicks}</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-label">Last visited</div>
              <div className="kpi-val" style={{fontSize:15,marginTop:6,fontWeight:700}}>{lastV ? timeAgo(lastV) : "Never"}</div>
            </div>
            <div className="kpi-box">
              <div className="kpi-label">Created</div>
              <div className="kpi-val" style={{fontSize:15,marginTop:6,fontWeight:700}}>{fmtDate(urlData.createdAt)}</div>
            </div>
          </div>

          {/* Chart */}
          <div style={{marginBottom:22}}>
            <div className="label" style={{marginBottom:10}}>Daily clicks — last 7 days</div>
            <DailyChart visits={urlData.visits} color={col.text} />
          </div>

          {/* Device & Browser */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:22}}>
            <div>
              <div className="label" style={{marginBottom:8}}>By device</div>
              {deviceCounts.map(([dev,cnt])=>(
                <div key={dev} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span>{dev}</span><span style={{color:"var(--c-text3)"}}>{cnt}</span>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{width:`${(cnt/urlData.clicks*100).toFixed(0)}%`}} /></div>
                </div>
              ))}
              {deviceCounts.length===0 && <div style={{color:"var(--c-text3)",fontSize:12}}>No data</div>}
            </div>
            <div>
              <div className="label" style={{marginBottom:8}}>By browser</div>
              {browserCounts.slice(0,4).map(([br,cnt])=>(
                <div key={br} style={{marginBottom:8}}>
                  <div style={{display:"flex",justifyContent:"space-between",fontSize:12,marginBottom:4}}>
                    <span>{br}</span><span style={{color:"var(--c-text3)"}}>{cnt}</span>
                  </div>
                  <div className="progress"><div className="progress-bar" style={{width:`${(cnt/urlData.clicks*100).toFixed(0)}%`,background:"linear-gradient(90deg,var(--c-cyan),var(--c-emerald))"}} /></div>
                </div>
              ))}
              {browserCounts.length===0 && <div style={{color:"var(--c-text3)",fontSize:12}}>No data</div>}
            </div>
          </div>

          {/* Countries */}
          {countryCounts.length>0 && (
            <div style={{marginBottom:22}}>
              <div className="label" style={{marginBottom:8}}>Top countries</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {countryCounts.map(([co,cnt])=>(
                  <span key={co} className="badge badge-violet">{co} · {cnt}</span>
                ))}
              </div>
            </div>
          )}

          <div className="divider" />

          {/* Recent visits */}
          <div>
            <div className="label" style={{marginBottom:10}}>Recent visit history</div>
            <div style={{maxHeight:240,overflowY:"auto",display:"flex",flexDirection:"column",gap:6}}>
              {urlData.visits.length===0 && <div style={{color:"var(--c-text3)",fontSize:13}}>No visits yet</div>}
              {[...urlData.visits].reverse().slice(0,20).map((v,i)=>(
                <div key={i} className="visit-row">
                  <div className="visit-info">
                    <span className="badge badge-violet">{v.browser}</span>
                    <span className="badge badge-cyan">{v.device}</span>
                    <span className="badge badge-emerald">{v.country}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:2}}>
                    <span style={{fontSize:12,color:"var(--c-text2)",fontWeight:600}}>{timeAgo(v.ts)}</span>
                    <span className="visit-time">{fmtFull(v.ts)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   REDIRECT MODAL (simulates server-side redirect)
═══════════════════════════════════════════════════════════════════ */
function RedirectModal({ urlData, onClose }) {
  const [loading, setLoading] = useState(true);
  useEffect(()=>{
    const t = setTimeout(()=>setLoading(false),1200);
    return ()=>clearTimeout(t);
  },[]);
  return (
    <div className="modal-backdrop" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal" style={{maxWidth:400,textAlign:"center"}}>
        <div className="modal-body" style={{paddingTop:36,paddingBottom:36}}>
          {loading ? (
            <>
              <div style={{fontSize:44,marginBottom:16}}>🚀</div>
              <div style={{fontFamily:"var(--f-display)",fontSize:18,fontWeight:800,marginBottom:8}}>Redirecting…</div>
              <div style={{fontSize:13,color:"var(--c-text3)",marginBottom:20}}>Tracking visit & forwarding to destination</div>
              <div style={{display:"flex",justifyContent:"center"}}><span className="spin" style={{width:28,height:28,borderWidth:3}}/></div>
            </>
          ) : (
            <>
              <div style={{fontSize:44,marginBottom:16}}>✅</div>
              <div style={{fontFamily:"var(--f-display)",fontSize:18,fontWeight:800,marginBottom:8}}>Click tracked!</div>
              <div style={{fontSize:13,color:"var(--c-text3)",wordBreak:"break-all",marginBottom:20}}>{urlData.originalUrl}</div>
              <div style={{background:"rgba(16,185,129,0.08)",border:"1px solid rgba(16,185,129,0.2)",borderRadius:"var(--r-md)",padding:"12px 16px",fontSize:13,color:"var(--c-emerald2)",marginBottom:20}}>
                ✓ Visit logged · {urlData.clicks} total clicks
              </div>
              <button className="btn btn-ghost" style={{width:"100%"}} onClick={onClose}>Close</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   SHORTEN FORM
═══════════════════════════════════════════════════════════════════ */
function ShortenForm({ userId, onCreated, toast }) {
  const [url, setUrl]       = useState("");
  const [alias, setAlias]   = useState("");
  const [expiry, setExpiry] = useState("");
  const [advanced, setAdv]  = useState(false);
  const [errs, setErrs]     = useState({});
  const [busy, setBusy]     = useState(false);

  const submit = async () => {
    const e = {};
    if (!url.trim()) e.url = "URL is required";
    else if (!isURL(url.trim())) e.url = "Enter a valid URL (start with https://)";
    if (Object.keys(e).length) { setErrs(e); return; }
    setErrs({}); setBusy(true);
    try {
      const r = await API.createUrl({ userId, originalUrl:url.trim(), alias:alias.trim()||null, expiresAt:expiry?new Date(expiry).getTime():null });
      setUrl(""); setAlias(""); setExpiry("");
      onCreated(r);
      toast("Short link created!", "success");
    } catch(ex) {
      toast(ex.message, "error");
    } finally { setBusy(false); }
  };

  const minDate = new Date(); minDate.setDate(minDate.getDate()+1);

  return (
    <div className="shorten-bar fade-up">
      <div style={{marginBottom:14}}>
        <div style={{fontFamily:"var(--f-display)",fontSize:17,fontWeight:800,marginBottom:2}}>Create a short link</div>
        <div style={{fontSize:13,color:"var(--c-text3)"}}>Paste any URL to generate a trackable short link instantly</div>
      </div>
      <div className="shorten-row">
        <input
          className={`input${errs.url?" err":""}`}
          placeholder="https://example.com/your/very/long/url/goes/here"
          value={url} onChange={e=>{setUrl(e.target.value);if(errs.url)setErrs({});}}
          onKeyDown={e=>e.key==="Enter"&&submit()}
        />
        <button className="btn btn-violet" onClick={submit} disabled={busy} style={{height:46,paddingLeft:24,paddingRight:24,flexShrink:0}}>
          {busy?<><span className="spin"/>Shortening…</>:"⚡ Shorten"}
        </button>
      </div>
      {errs.url && <div className="err-msg" style={{marginTop:6}}>⚠ {errs.url}</div>}

      <button className="adv-toggle" onClick={()=>setAdv(a=>!a)}>
        <span>{advanced?"▲":"▼"}</span> {advanced?"Hide advanced":"Advanced options"}
      </button>

      {advanced && (
        <div className="opts-row" style={{marginTop:10}}>
          <div>
            <label className="label">Custom alias</label>
            <input className={`input${errs.alias?" err":""}`} placeholder="my-link" value={alias} onChange={e=>setAlias(e.target.value)} />
            {alias && <div style={{fontSize:11,color:"var(--c-text3)",marginTop:4}}>snap.io/<strong style={{color:"var(--c-violet2)"}}>{alias}</strong></div>}
            {errs.alias && <div className="err-msg">{errs.alias}</div>}
          </div>
          <div>
            <label className="label">Expiry date (optional)</label>
            <input className="input" type="date" value={expiry} min={minDate.toISOString().split("T")[0]} onChange={e=>setExpiry(e.target.value)} />
          </div>
          <div style={{display:"flex",alignItems:"flex-end"}}>
            <div style={{fontSize:12,color:"var(--c-text3)",lineHeight:1.5}}>
              Links without expiry stay active forever. Set an expiry to auto-disable the link after the date.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   URL CARD
═══════════════════════════════════════════════════════════════════ */
function UrlCard({ urlData, onDelete, onAnalytics, onRedirect, onEdit, toast }) {
  const [copied, setCopied] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editVal, setEditVal] = useState(urlData.originalUrl);
  const [editBusy, setEditBusy] = useState(false);
  const [editErr, setEditErr] = useState("");

  const col = colorForUrl(urlData.id);
  const isExpired = urlData.expiresAt && urlData.expiresAt < Date.now();
  const shortUrl = `snap.io/${urlData.shortCode}`;

  const handleCopy = () => {
    try { navigator.clipboard.writeText(`https://${shortUrl}`); } catch {}
    setCopied(true);
    toast("Copied to clipboard!", "info");
    setTimeout(()=>setCopied(false),2000);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try { await API.deleteUrl(urlData.id); onDelete(urlData.id); toast("Link deleted","warn"); }
    catch(ex) { toast(ex.message,"error"); setDeleting(false); }
  };

  const handleEditSave = async () => {
    if (!editVal.trim()) { setEditErr("URL required"); return; }
    setEditBusy(true); setEditErr("");
    try {
      const updated = await API.editUrl(urlData.id, editVal.trim());
      onEdit(updated);
      setEditing(false);
      toast("Destination updated!", "success");
    } catch(ex) { setEditErr(ex.message); }
    finally { setEditBusy(false); }
  };

  return (
    <div className={`url-card${isExpired?" url-expired":""} fade-up`}>
      <div className="url-card-strip" style={{background: isExpired?"var(--c-text4)":col.strip}} />
      <div className="url-card-body">
        <div style={{minWidth:0}}>
          {editing ? (
            <div>
              <div className="inline-edit">
                <input className={`input${editErr?" err":""}`} value={editVal} onChange={e=>{setEditVal(e.target.value);setEditErr("");}} onKeyDown={e=>e.key==="Enter"&&handleEditSave()} />
                <button className="btn btn-emerald btn-xs" onClick={handleEditSave} disabled={editBusy}>{editBusy?<span className="spin"/>:"Save"}</button>
                <button className="btn btn-ghost btn-xs" onClick={()=>setEditing(false)}>Cancel</button>
              </div>
              {editErr && <div className="err-msg">{editErr}</div>}
            </div>
          ) : (
            <div className="url-orig" title={urlData.originalUrl}>🔗 {urlData.originalUrl}</div>
          )}
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap",marginTop:2}}>
            <button className="url-short" style={{color:col.text}} onClick={()=>onRedirect(urlData)}>
              {shortUrl}
            </button>
            {urlData.alias && <span className="badge badge-violet">alias</span>}
            {isExpired && <span className="badge badge-rose">expired</span>}
            {urlData.expiresAt && !isExpired && <span className="badge badge-amber">exp {fmtDate(urlData.expiresAt)}</span>}
          </div>
          <div className="url-meta">
            <span className="url-meta-item hlt" style={{color:col.text}}>⚡ {urlData.clicks} clicks</span>
            <span className="url-meta-item">📅 {fmtDate(urlData.createdAt)}</span>
            {urlData.visits.length>0 && <span className="url-meta-item">🕐 {timeAgo(Math.max(...urlData.visits.map(v=>v.ts)))}</span>}
          </div>
        </div>
        <div className="url-actions">
          <button className={`btn btn-ghost btn-sm${copied?" flash":""}`} onClick={handleCopy}>{copied?"✓ Copied":"Copy"}</button>
          <button className="btn btn-sm" style={{background:"rgba(139,92,246,0.1)",color:"var(--c-violet2)",border:"1px solid rgba(139,92,246,0.2)"}} onClick={()=>onAnalytics(urlData)}>Analytics</button>
          <button className="btn btn-ghost btn-icon btn-sm" title="Edit destination" onClick={()=>{setEditing(e=>!e);setEditVal(urlData.originalUrl);}}>✏️</button>
          <button className="btn btn-danger btn-icon btn-sm" onClick={handleDelete} disabled={deleting}>{deleting?<span className="spin"/>:"✕"}</button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   CSV BULK UPLOADER
═══════════════════════════════════════════════════════════════════ */
function BulkUploader({ userId, onCreated, toast }) {
  const [dragging, setDragging] = useState(false);
  const [results, setResults]   = useState([]);
  const [busy, setBusy]         = useState(false);

  const processCSV = async (text) => {
    const lines = text.split("\n").map(l=>l.trim()).filter(Boolean);
    setBusy(true); setResults([]);
    const out = [];
    for (const line of lines.slice(0,50)) {
      const url = line.split(",")[0].trim().replace(/^"|"$/g,"");
      if (!isURL(url)) { out.push({url,status:"error",msg:"Invalid URL"}); continue; }
      try {
        const r = await API.createUrl({userId,originalUrl:url});
        out.push({url,status:"ok",shortCode:r.shortCode});
        onCreated(r);
      } catch(ex) { out.push({url,status:"error",msg:ex.message}); }
      setResults([...out]);
    }
    setBusy(false);
    toast(`Processed ${out.length} URL${out.length!==1?"s":""}`, "success");
  };

  const onFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) { toast("Please upload a .csv file","error"); return; }
    const r = new FileReader();
    r.onload = e => processCSV(e.target.result);
    r.readAsText(file);
  };

  return (
    <div>
      <div className="section-head">
        <div className="section-title">Bulk URL Shortening</div>
        <div className="section-sub">Upload a CSV file with one URL per row (up to 50 URLs)</div>
      </div>
      <div className={`drop-zone${dragging?" drag":""}`}
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);onFile(e.dataTransfer.files[0])}}>
        <input type="file" accept=".csv" onChange={e=>onFile(e.target.files[0])} />
        <div className="drop-icon">📄</div>
        <div style={{fontFamily:"var(--f-display)",fontWeight:700,fontSize:16,marginBottom:6}}>Drop CSV file here</div>
        <div style={{fontSize:13,color:"var(--c-text3)"}}>or click to browse · One URL per row · Max 50 URLs</div>
        {busy && <div style={{marginTop:16,display:"flex",justifyContent:"center"}}><span className="spin" style={{width:22,height:22,borderWidth:3}}/></div>}
      </div>

      {results.length>0 && (
        <div style={{marginTop:20}}>
          <div className="label" style={{marginBottom:10}}>Results — {results.filter(r=>r.status==="ok").length}/{results.length} succeeded</div>
          <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:320,overflowY:"auto"}}>
            {results.map((r,i)=>(
              <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 14px",background:"var(--c-bg3)",borderRadius:"var(--r-sm)",border:"1px solid var(--c-border)",gap:12}}>
                <span style={{fontSize:12,color:"var(--c-text3)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",flex:1}}>{r.url}</span>
                {r.status==="ok"
                  ? <span className="badge badge-emerald">snap.io/{r.shortCode}</span>
                  : <span className="badge badge-rose">{r.msg}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{marginTop:20,padding:16,background:"var(--c-bg3)",borderRadius:"var(--r-md)",border:"1px solid var(--c-border)"}}>
        <div className="label" style={{marginBottom:8}}>CSV format example</div>
        <pre style={{fontSize:12,color:"var(--c-text3)",fontFamily:"monospace",lineHeight:1.8}}>
{`https://example.com/page-one
https://github.com/user/repo
https://docs.google.com/spreadsheet/...`}
        </pre>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   PUBLIC STATS PAGE
═══════════════════════════════════════════════════════════════════ */
function PublicStats({ toast }) {
  const [code, setCode] = useState("");
  const [data, setData] = useState(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState("");

  const lookup = async () => {
    if (!code.trim()) { setErr("Enter a short code"); return; }
    setBusy(true); setErr(""); setData(null);
    try {
      const r = await API.getPublicStats(code.trim());
      setData(r);
    } catch(ex) { setErr(ex.message); }
    finally { setBusy(false); }
  };

  return (
    <div>
      <div className="section-head">
        <div className="section-title">Public Stats</div>
        <div className="section-sub">Look up public click statistics for any short link</div>
      </div>
      <div style={{display:"flex",gap:10,marginBottom:20}}>
        <div style={{display:"flex",alignItems:"center",gap:0,flex:1,maxWidth:400}}>
          <span style={{background:"var(--c-bg3)",border:"1px solid var(--c-border2)",borderRight:"none",padding:"10px 14px",borderRadius:"var(--r-sm) 0 0 var(--r-sm)",fontSize:14,color:"var(--c-text3)",flexShrink:0}}>snap.io/</span>
          <input className={`input${err?" err":""}`} placeholder="short-code" value={code} onChange={e=>{setCode(e.target.value);setErr("");}} onKeyDown={e=>e.key==="Enter"&&lookup()} style={{borderRadius:"0 var(--r-sm) var(--r-sm) 0"}} />
        </div>
        <button className="btn btn-cyan" onClick={lookup} disabled={busy}>{busy?<span className="spin"/>:"Look up"}</button>
      </div>
      {err && <div className="err-msg" style={{marginBottom:12}}>⚠ {err}</div>}

      {data && (
        <div className="pub-stat-card fade-up">
          <div style={{fontFamily:"var(--f-display)",fontSize:22,fontWeight:900,color:"var(--c-violet2)",marginBottom:4}}>snap.io/{data.shortCode}</div>
          <div style={{fontSize:13,color:"var(--c-text3)",marginBottom:20}}>Created {fmtDate(data.createdAt)}</div>
          <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
            <div>
              <div className="kpi-label">Total clicks</div>
              <div style={{fontFamily:"var(--f-display)",fontSize:40,fontWeight:900,color:"var(--c-cyan2)"}}>{data.clicks}</div>
            </div>
            <div>
              <div className="kpi-label">Last visited</div>
              <div style={{fontFamily:"var(--f-display)",fontSize:22,fontWeight:800,marginTop:8}}>{data.lastVisit?timeAgo(data.lastVisit):"Never"}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════ */
function Dashboard({ user, onLogout }) {
  const { toasts, add: toast } = useToast();
  const [urls, setUrls]           = useState(() => API.getUrlsForUser(user.id));
  const [activeView, setActive]   = useState("links");
  const [analyticsUrl, setAnal]   = useState(null);
  const [redirectUrl, setRedir]   = useState(null);
  const [search, setSearch]       = useState("");
  const [sortBy, setSort]         = useState("newest");
  const [filterExp, setFiltExp]   = useState("all");

  const refresh = useCallback(()=>{ setUrls([...API.getUrlsForUser(user.id)]); },[user.id]);

  const handleCreated = (u)=>{ refresh(); };
  const handleDelete  = (id)=>{ setUrls(u=>u.filter(x=>x.id!==id)); };
  const handleEdit    = (updated)=>{ setUrls(u=>u.map(x=>x.id===updated.id?{...x,...updated}:x)); };

  const handleRedirect = async (urlData) => {
    try {
      await API.trackClick(urlData.shortCode);
      refresh();
      setRedir(DB.urls.find(u=>u.id===urlData.id));
    } catch(ex) { toast(ex.message,"error"); }
  };

  const totalClicks = urls.reduce((s,u)=>s+u.clicks,0);
  const activeLinks = urls.filter(u=>!u.expiresAt||u.expiresAt>Date.now()).length;
  const topLink = [...urls].sort((a,b)=>b.clicks-a.clicks)[0];

  const filtered = useMemo(()=>{
    let u = [...urls];
    if (search) u = u.filter(x=>x.originalUrl.toLowerCase().includes(search.toLowerCase())||x.shortCode.includes(search.toLowerCase()));
    if (filterExp==="active") u = u.filter(x=>!x.expiresAt||x.expiresAt>Date.now());
    if (filterExp==="expired") u = u.filter(x=>x.expiresAt&&x.expiresAt<Date.now());
    if (sortBy==="newest") u.sort((a,b)=>b.createdAt-a.createdAt);
    if (sortBy==="oldest") u.sort((a,b)=>a.createdAt-b.createdAt);
    if (sortBy==="clicks") u.sort((a,b)=>b.clicks-a.clicks);
    return u;
  },[urls,search,sortBy,filterExp]);

  const NAV = [
    {id:"links",icon:"🔗",label:"My Links"},
    {id:"bulk",icon:"📄",label:"Bulk Shorten"},
    {id:"public",icon:"📊",label:"Public Stats"},
  ];

  return (
    <div className="app-shell">
      <style>{STYLES}</style>
      <header className="topbar">
        <div className="logo">LinkSnap</div>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:"linear-gradient(135deg,var(--c-violet),var(--c-pink))",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--f-display)",fontWeight:800,fontSize:13}}>{user.avatar}</div>
            <span style={{fontSize:14,color:"var(--c-text2)",display:"none"}} className="sm-hide">{user.name}</span>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onLogout}>Sign out</button>
        </div>
      </header>

      <main className="main-content">
        <div className="layout-grid">
          {/* Sidebar */}
          <aside className="sidebar">
            <div style={{marginBottom:8,padding:"6px 14px",fontSize:11,fontWeight:700,letterSpacing:".08em",color:"var(--c-text4)",textTransform:"uppercase"}}>Navigation</div>
            {NAV.map(n=>(
              <button key={n.id} className={`nav-item${activeView===n.id?" active":""}`} onClick={()=>setActive(n.id)}>
                <span>{n.icon}</span> {n.label}
                {activeView===n.id && <span className="nav-dot" style={{background:"var(--c-violet)"}}/>}
              </button>
            ))}
            <div className="divider"/>
            <div style={{padding:"12px 14px",fontSize:12,color:"var(--c-text3)",lineHeight:1.6}}>
              <div style={{fontWeight:600,color:"var(--c-text2)",marginBottom:4}}>Your account</div>
              <div style={{wordBreak:"break-all"}}>{user.email}</div>
              <div style={{marginTop:4}}>Member since {fmtDate(user.createdAt)}</div>
            </div>
          </aside>

          {/* Main */}
          <div>
            {activeView==="links" && (
              <>
                {/* Stats */}
                <div className="stats-strip fade-up">
                  <div className="stat-tile sv" style={{background:"var(--c-surface)"}}>
                    <div className="stat-tile-label">Total links</div>
                    <div className="stat-tile-val">{urls.length}</div>
                    <div className="stat-tile-sub">{activeLinks} active</div>
                  </div>
                  <div className="stat-tile sc" style={{background:"var(--c-surface)"}}>
                    <div className="stat-tile-label">Total clicks</div>
                    <div className="stat-tile-val" style={{color:"var(--c-cyan2)"}}>{totalClicks}</div>
                    <div className="stat-tile-sub">all time</div>
                  </div>
                  <div className="stat-tile sa" style={{background:"var(--c-surface)"}}>
                    <div className="stat-tile-label">Top link clicks</div>
                    <div className="stat-tile-val" style={{color:"var(--c-amber2)"}}>{topLink?.clicks??0}</div>
                    <div className="stat-tile-sub">{topLink?`snap.io/${topLink.shortCode}`:"—"}</div>
                  </div>
                  <div className="stat-tile sr" style={{background:"var(--c-surface)"}}>
                    <div className="stat-tile-label">With alias</div>
                    <div className="stat-tile-val" style={{color:"var(--c-rose2)"}}>{urls.filter(u=>u.alias).length}</div>
                    <div className="stat-tile-sub">custom links</div>
                  </div>
                </div>

                {/* Shorten form */}
                <ShortenForm userId={user.id} onCreated={handleCreated} toast={toast} />

                {/* Controls */}
                <div style={{display:"flex",gap:10,alignItems:"center",marginBottom:14,flexWrap:"wrap"}} className="fade-up fade-up-2">
                  <input className="input" style={{maxWidth:260,height:38,fontSize:13}} placeholder="Search links…" value={search} onChange={e=>setSearch(e.target.value)} />
                  <select className="input" style={{maxWidth:150,height:38,fontSize:13}} value={sortBy} onChange={e=>setSort(e.target.value)}>
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="clicks">Most clicks</option>
                  </select>
                  <select className="input" style={{maxWidth:150,height:38,fontSize:13}} value={filterExp} onChange={e=>setFiltExp(e.target.value)}>
                    <option value="all">All links</option>
                    <option value="active">Active only</option>
                    <option value="expired">Expired only</option>
                  </select>
                  <span style={{marginLeft:"auto",fontSize:13,color:"var(--c-text3)"}}>{filtered.length} link{filtered.length!==1?"s":""}</span>
                </div>

                {/* URL list */}
                {filtered.length===0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🔗</div>
                    <div className="empty-title">{search?"No links match":"No links yet"}</div>
                    <div className="empty-sub">{search?"Try a different keyword":"Create your first short link above ↑"}</div>
                  </div>
                ) : (
                  <div className="url-grid">
                    {filtered.map(u=>(
                      <UrlCard key={u.id} urlData={u}
                        onDelete={handleDelete}
                        onAnalytics={setAnal}
                        onRedirect={handleRedirect}
                        onEdit={handleEdit}
                        toast={toast}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            {activeView==="bulk" && <BulkUploader userId={user.id} onCreated={handleCreated} toast={toast} />}
            {activeView==="public" && <PublicStats toast={toast} />}
          </div>
        </div>
      </main>

      {analyticsUrl && <AnalyticsModal urlData={analyticsUrl} onClose={()=>setAnal(null)} />}
      {redirectUrl && <RedirectModal urlData={redirectUrl} onClose={()=>setRedir(null)} />}
      <Toasts toasts={toasts} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   AUTH PAGE
═══════════════════════════════════════════════════════════════════ */
function AuthPage({ onLogin }) {
  const [tab, setTab]       = useState("login");
  const [step, setStep]     = useState("form"); // form | verify
  const [pendingEmail, setPE]= useState("");
  const [verifyCode, setVC]  = useState("");
  const [shownCode, setShownCode] = useState(""); // simulated email

  const [form, setForm] = useState({name:"",email:"",pw:"",pw2:""});
  const [errs, setErrs] = useState({});
  const [busy, setBusy] = useState(false);

  const { toasts, add: toast } = useToast();

  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const validate = () => {
    const e = {};
    if (tab==="signup"&&!form.name.trim()) e.name="Name is required";
    if (!form.email.includes("@")||!form.email.includes(".")) e.email="Enter a valid email address";
    if (form.pw.length<6) e.pw="Password must be at least 6 characters";
    if (tab==="signup"&&form.pw!==form.pw2) e.pw2="Passwords do not match";
    return e;
  };

  const handleSignup = async () => {
    const e = validate(); if (Object.keys(e).length){setErrs(e);return;}
    setErrs({}); setBusy(true);
    try {
      const r = await API.signup({name:form.name,email:form.email,password:form.pw});
      setShownCode(r.code);
      setPE(form.email);
      setStep("verify");
      toast(`Verification code sent to ${form.email}`, "info");
    } catch(ex) { toast(ex.message,"error"); }
    finally { setBusy(false); }
  };

  const handleVerify = async () => {
    if (!verifyCode.trim()){toast("Enter the 6-digit code","error");return;}
    setBusy(true);
    try {
      const user = await API.verify({email:pendingEmail,code:verifyCode});
      toast("Email verified! Welcome 🎉","success");
      setTimeout(()=>onLogin(user),500);
    } catch(ex) { toast(ex.message,"error"); }
    finally { setBusy(false); }
  };

  const handleLogin = async () => {
    const e = {};
    if (!form.email.includes("@")) e.email="Enter a valid email";
    if (!form.pw) e.pw="Password required";
    if (Object.keys(e).length){setErrs(e);return;}
    setErrs({}); setBusy(true);
    try {
      const user = await API.login({email:form.email,password:form.pw});
      toast("Welcome back!","success");
      setTimeout(()=>onLogin(user),400);
    } catch(ex) { toast(ex.message,"error"); }
    finally { setBusy(false); }
  };

  const switchTab = (t)=>{ setTab(t); setErrs({}); setStep("form"); setForm({name:"",email:"",pw:"",pw2:""}); };

  return (
    <div className="auth-page">
      <style>{STYLES}</style>
      <div className="auth-bg"/>
      <div className="auth-card fade-up">
        <div className="auth-logo"><span className="logo">LinkSnap</span></div>
        <div className="auth-headline">Shorten · Share · Track every click</div>

        {step==="verify" ? (
          <div className="verify-screen">
            <div className="verify-icon">📧</div>
            <div style={{fontFamily:"var(--f-display)",fontSize:20,fontWeight:800,marginBottom:6}}>Check your email</div>
            <div style={{fontSize:13,color:"var(--c-text3)",marginBottom:4}}>
              A 6-digit verification code was sent to
            </div>
            <div style={{fontSize:14,fontWeight:600,color:"var(--c-violet2)",marginBottom:16}}>{pendingEmail}</div>

            {/* Simulated email reveal — shows the code since email isn't actually sent */}
            <div style={{background:"rgba(139,92,246,0.08)",border:"1px solid rgba(139,92,246,0.2)",borderRadius:"var(--r-md)",padding:"14px 18px",marginBottom:16,textAlign:"left"}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--c-text3)",marginBottom:6,textTransform:"uppercase",letterSpacing:".06em"}}>📬 Simulated inbox · Demo only</div>
              <div style={{fontSize:13,color:"var(--c-text2)"}}>Your verification code:</div>
              <div className="verify-code-display">{shownCode}</div>
              <div style={{fontSize:11,color:"var(--c-text3)"}}>In production, this code would be sent via Nodemailer / SendGrid</div>
            </div>

            <div className="auth-form">
              <div>
                <label className="label">Enter 6-digit code</label>
                <input className="input" placeholder="000000" value={verifyCode} onChange={e=>setVC(e.target.value.replace(/\D/,"").slice(0,6))} onKeyDown={e=>e.key==="Enter"&&handleVerify()} style={{textAlign:"center",letterSpacing:8,fontSize:22,fontFamily:"var(--f-display)",fontWeight:800}} />
              </div>
              <button className="btn btn-violet" style={{width:"100%",height:46}} onClick={handleVerify} disabled={busy||verifyCode.length<6}>
                {busy?<><span className="spin"/>Verifying…</>:"✓ Verify & continue"}
              </button>
              <button className="btn btn-ghost btn-sm" style={{width:"100%"}} onClick={()=>setStep("form")}>← Back to sign up</button>
            </div>
          </div>
        ) : (
          <>
            <div className="auth-tabs-wrap">
              <button className={`auth-tab${tab==="login"?" active":""}`} onClick={()=>switchTab("login")}>Sign in</button>
              <button className={`auth-tab${tab==="signup"?" active":""}`} onClick={()=>switchTab("signup")}>Create account</button>
            </div>
            <div className="auth-form">
              {tab==="signup" && (
                <div>
                  <label className="label">Full name</label>
                  <input className={`input${errs.name?" err":""}`} placeholder="Priya Sharma" value={form.name} onChange={e=>set("name",e.target.value)} />
                  {errs.name && <div className="err-msg">⚠ {errs.name}</div>}
                </div>
              )}
              <div>
                <label className="label">Email address</label>
                <input className={`input${errs.email?" err":""}`} type="email" placeholder="you@example.com" value={form.email} onChange={e=>set("email",e.target.value)} />
                {errs.email && <div className="err-msg">⚠ {errs.email}</div>}
              </div>
              <div>
                <label className="label">Password</label>
                <input className={`input${errs.pw?" err":""}`} type="password" placeholder="Min. 6 characters" value={form.pw} onChange={e=>set("pw",e.target.value)} onKeyDown={e=>e.key==="Enter"&&(tab==="login"?handleLogin():null)} />
                {errs.pw && <div className="err-msg">⚠ {errs.pw}</div>}
              </div>
              {tab==="signup" && (
                <div>
                  <label className="label">Confirm password</label>
                  <input className={`input${errs.pw2?" err":""}`} type="password" placeholder="Repeat password" value={form.pw2} onChange={e=>set("pw2",e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSignup()} />
                  {errs.pw2 && <div className="err-msg">⚠ {errs.pw2}</div>}
                </div>
              )}
              <button className="btn btn-violet" style={{width:"100%",height:46,fontSize:15}} onClick={tab==="login"?handleLogin:handleSignup} disabled={busy}>
                {busy?<><span className="spin"/>{tab==="login"?"Signing in…":"Creating account…"}</>:tab==="login"?"Sign in →":"Create account →"}
              </button>
              {tab==="login" && (
                <div style={{textAlign:"center"}}>
                  <span style={{fontSize:12,color:"var(--c-text3)"}}>Demo: </span>
                  <button className="btn btn-ghost btn-xs" onClick={()=>setForm(f=>({...f,email:"priya@demo.io",pw:"Demo@1234"}))}>Fill demo credentials</button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      <Toasts toasts={toasts} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════ */
export default function App() {
  const [user, setUser] = useState(null);
  return user
    ? <Dashboard user={user} onLogout={()=>setUser(null)} />
    : <AuthPage onLogin={setUser} />;
}
