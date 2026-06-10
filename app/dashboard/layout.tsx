"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import "../home.css";

// ── Constants ─────────────────────────────────────────────────────────────────

const EXAMS = [
  { sub: "Mechanik 2", label: "KFT",          date: "2026-06-05", col: "#f97316" },
  { sub: "KL1",        label: "HA3",           date: "2026-06-07", col: "#60a5fa" },
  { sub: "DGL",        label: "Zwischentest",  date: "2026-06-12", col: "#a78bfa" },
  { sub: "KL1",        label: "HA4",           date: "2026-06-21", col: "#60a5fa" },
  { sub: "ITP",        label: "Abgabe dts",    date: "2026-07-03", col: "#22d3ee" },
  { sub: "KL1",        label: "HA5",           date: "2026-07-05", col: "#60a5fa" },
  { sub: "ITP",        label: "Test",          date: "2026-07-14", col: "#22d3ee" },
  { sub: "DGL",        label: "Prüfung",       date: "2026-07-21", col: "#a78bfa" },
  { sub: "Ana2",       label: "Prüfung",       date: "2026-07-23", col: "#4ade80" },
  { sub: "KL1",        label: "Test",          date: "2026-08-03", col: "#60a5fa" },
];

const POM_SUBJECTS = ["Mechanik 2", "KL1", "DGL", "Ana2", "ITP", "BEARS", "Spanisch", "Russisch"];

const REMINDER_TIPS = [
  "Active Recall schlägt Wiederlesen — teste dich selbst.",
  "25 Minuten Vollgas, keine Ablenkung. Los geht's.",
  "Kurze Session > keine Session. Starte jetzt.",
  "Interleaving: Wechsle heute zwischen zwei Fächern.",
  "Spaced Repetition: Was hast du vor 3 Tagen gelernt?",
  "Noch kein Pomodoro heute? Das ändern wir jetzt.",
  "10 Minuten Einstieg genügen — Trägheit überwinden.",
  "Formelblatt aufmachen und 3 Formeln auswendig lernen.",
];

const WORK_SECS  = 25 * 60;
const SHORT_BREAK = 5 * 60;
const LONG_BREAK  = 15 * 60;

type PomState = "idle" | "running" | "paused" | "break";

interface Toast { id: number; title: string; body: string; kind: "urgent" | "pom" | "info"; removing?: boolean; }
interface LogEntry { time: string; subject: string; note: string; }

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmt(secs: number) {
  return `${String(Math.floor(secs / 60)).padStart(2,"0")}:${String(secs % 60).padStart(2,"0")}`;
}

function daysUntil(dateStr: string) {
  return Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
}

// ── Layout ────────────────────────────────────────────────────────────────────

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const toastIdRef = useRef(0);

  // Clock
  const [mounted, setMounted]   = useState(false);
  const [time, setTime]         = useState<Date | null>(null);
  const [progress, setProgress] = useState({ year: 0, month: 0, week: 0 });

  // Pomodoro
  const [pomState, setPomState]               = useState<PomState>("idle");
  const [pomSecs, setPomSecs]                 = useState(WORK_SECS);
  const [pomSubject, setPomSubject]           = useState("KL1");
  const [pomSessions, setPomSessions]         = useState(0);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  // Notifications & Toasts
  const [notifPermission, setNotifPermission] = useState<NotificationPermission | "unsupported">("default");
  const [showNotifBar, setShowNotifBar]       = useState(false);
  const [toasts, setToasts]                   = useState<Toast[]>([]);

  // ── NEW: Reminder Modal ────────────────────────────────────────────────────
  const [reminderVisible, setReminderVisible] = useState(false);
  const [reminderData, setReminderData]       = useState({ title: "", body: "", subject: "KL1", col: "var(--accent)" });

  // ── NEW: Focus Mode ────────────────────────────────────────────────────────
  const [focusMode, setFocusMode] = useState(false);

  // ── NEW: Session Log ───────────────────────────────────────────────────────
  const [sessionLogVisible, setSessionLogVisible] = useState(false);
  const [sessionLogInput, setSessionLogInput]     = useState("");
  const [studyLog, setStudyLog]                   = useState<LogEntry[]>([]);

  // ── NEW: Streak ────────────────────────────────────────────────────────────
  const [streak, setStreak] = useState(0);

  // ── Refs for stable callbacks ──────────────────────────────────────────────
  const pomStateRef         = useRef<PomState>("idle");
  const pomSubjectRef       = useRef("KL1");
  const completedSubjectRef = useRef("KL1");
  const lastActivityRef     = useRef(Date.now());
  const nextReminderAt      = useRef(Date.now() + 20 * 60 * 1000);

  // Keep refs in sync
  useEffect(() => { pomStateRef.current = pomState; }, [pomState]);
  useEffect(() => { pomSubjectRef.current = pomSubject; }, [pomSubject]);

  // ── Toast helpers ──────────────────────────────────────────────────────────
  const addToast = useCallback((title: string, body: string, kind: Toast["kind"] = "info") => {
    const id = ++toastIdRef.current;
    setToasts(prev => [...prev, { id, title, body, kind }]);
    setTimeout(() => {
      setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220);
    }, 6000);
  }, []);

  const removeToast = (id: number) => {
    setToasts(prev => prev.map(t => t.id === id ? { ...t, removing: true } : t));
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 220);
  };

  // ── Browser notification ───────────────────────────────────────────────────
  const sendBrowserNotif = useCallback((title: string, body: string) => {
    if (typeof Notification !== "undefined" && Notification.permission === "granted") {
      new Notification(title, { body, icon: "/favicon.ico" });
    }
    addToast(title, body, "urgent");
  }, [addToast]);

  // ── NEW: Show reminder modal ───────────────────────────────────────────────
  const showReminder = useCallback(() => {
    if (pomStateRef.current === "running") return;
    if (Date.now() < nextReminderAt.current) return;
    nextReminderAt.current = Date.now() + 20 * 60 * 1000;

    const urgent = EXAMS
      .map(e => ({ ...e, days: daysUntil(e.date) }))
      .filter(e => e.days >= 0 && e.days <= 14)
      .sort((a, b) => a.days - b.days)[0];

    if (urgent) {
      setReminderData({
        title: `${urgent.sub} — ${urgent.label}`,
        body: `Noch ${urgent.days} Tag${urgent.days === 1 ? "" : "e"} bis zur Abgabe. Starte jetzt eine Lernsession.`,
        subject: urgent.sub,
        col: urgent.col,
      });
    } else {
      setReminderData({
        title: "Zeit zu lernen!",
        body: REMINDER_TIPS[Math.floor(Math.random() * REMINDER_TIPS.length)],
        subject: pomSubjectRef.current,
        col: "var(--accent)",
      });
    }
    setReminderVisible(true);
  }, []);

  // ── NEW: Save session log entry ────────────────────────────────────────────
  const saveSessionLog = useCallback((input: string) => {
    if (input.trim()) {
      const entry: LogEntry = {
        time: new Date().toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
        subject: completedSubjectRef.current,
        note: input.trim(),
      };
      setStudyLog(prev => {
        const updated = [entry, ...prev].slice(0, 30);
        try { localStorage.setItem("study-log", JSON.stringify(updated)); } catch {}
        return updated;
      });
    }
    setSessionLogVisible(false);
    setSessionLogInput("");
  }, []);

  // ── Mount ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);

    // Canvas banner
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const palette = ["#000000","#020208","#040410","#060612","#08081a","#010106","#03030e","#05050a","#070714","#0a0a1e","#000004","#030309","#05050b","#07070f"];
        const W = canvas.offsetWidth, H = canvas.offsetHeight;
        canvas.width = W; canvas.height = H;
        const cols = Math.ceil(W / 6), rows = Math.ceil(H / 6);
        for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          ctx.fillStyle = palette[Math.floor((Math.sin(i * 0.9 + r * 1.5) * 0.5 + 0.5) * palette.length) % palette.length];
          ctx.fillRect(c * 6, r * 6, 6, 6);
        }
      }
    }

    // Notification permission
    if (typeof Notification === "undefined") {
      setNotifPermission("unsupported");
    } else {
      setNotifPermission(Notification.permission);
      if (Notification.permission === "default") setShowNotifBar(true);
    }

    // Urgent exam check (max once per 2h)
    const lastCheck = parseInt(localStorage.getItem("last-notif-check") || "0");
    if (Date.now() - lastCheck > 2 * 60 * 60 * 1000) {
      localStorage.setItem("last-notif-check", String(Date.now()));
      const urgent = EXAMS
        .map(e => ({ ...e, days: daysUntil(e.date) }))
        .filter(e => e.days >= 0 && e.days <= 7)
        .sort((a, b) => a.days - b.days);
      if (urgent.length > 0) {
        const e = urgent[0];
        setTimeout(() => {
          sendBrowserNotif(
            `⚠️ ${e.sub} — ${e.label} in ${e.days} Tag${e.days === 1 ? "" : "en"}!`,
            "Öffne den Lernplan und starte eine Pomodoro-Session."
          );
        }, 2500);
      }
    }

    // NEW: Streak calculation
    try {
      const today = new Date().toDateString();
      const lastVisit = localStorage.getItem("last-visit") || "";
      const current = parseInt(localStorage.getItem("streak") || "0");
      if (lastVisit !== today) {
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        const next = lastVisit === yesterday ? current + 1 : 1;
        setStreak(next);
        localStorage.setItem("streak", String(next));
        localStorage.setItem("last-visit", today);
      } else {
        setStreak(current);
      }
    } catch {}

    // NEW: Load study log
    try {
      const raw = localStorage.getItem("study-log");
      if (raw) setStudyLog(JSON.parse(raw));
    } catch {}

    // Hourly scheduled reminder + desktop notification
    const hourCheck = setInterval(() => {
      const h = new Date().getHours(), m = new Date().getMinutes();
      if ([9, 14, 19].includes(h) && m < 5) {
        const urgent = EXAMS.map(e => ({ ...e, days: daysUntil(e.date) })).filter(e => e.days >= 0 && e.days <= 14).sort((a, b) => a.days - b.days);
        const msg = urgent.length > 0
          ? `${urgent[0].sub} ${urgent[0].label} in ${urgent[0].days}d — jetzt lernen!`
          : "Zeit für eine Lerneinheit. Starte einen Pomodoro!";
        sendBrowserNotif("📚 Lernzeit!", msg);
        showReminder();
      }
    }, 4 * 60 * 1000);

    return () => clearInterval(hourCheck);
  }, [sendBrowserNotif, showReminder]);

  // ── Clock tick ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setTime(now);
      const y = Math.round(((now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / (365.25 * 86400000)) * 100);
      const m = Math.round((now.getDate() / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()) * 100);
      const w = Math.round((now.getDay() / 7) * 100);
      setProgress({ year: y, month: m, week: w });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Pomodoro ticker ────────────────────────────────────────────────────────
  useEffect(() => {
    if (pomState !== "running" && pomState !== "break") return;
    const id = setInterval(() => {
      setPomSecs(prev => {
        if (prev <= 1) {
          if (pomState === "running") {
            const newSessions = pomSessions + 1;
            setPomSessions(newSessions);
            const breakLen = newSessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK;
            setPomState("break");
            sendBrowserNotif(
              `✅ Pomodoro #${newSessions} fertig!`,
              `${pomSubject} — ${newSessions % 4 === 0 ? "Lange Pause (15 min)!" : "Kurze Pause (5 min). Bewegen!"}`
            );
            completedSubjectRef.current = pomSubject; // NEW
            setTimeout(() => setSessionLogVisible(true), 700); // NEW
            return breakLen;
          } else {
            setPomState("idle");
            setPomSecs(WORK_SECS);
            sendBrowserNotif("🎯 Pause vorbei!", `Weiter mit ${pomSubject}. Starte die nächste Session!`);
            return WORK_SECS;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [pomState, pomSessions, pomSubject, sendBrowserNotif]);

  // ── NEW: Inactivity-based reminder ────────────────────────────────────────
  useEffect(() => {
    const onActivity = () => { lastActivityRef.current = Date.now(); };
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("keydown", onActivity, true);

    const interval = setInterval(() => {
      if (Date.now() - lastActivityRef.current > 20 * 60 * 1000) {
        showReminder();
      }
    }, 5 * 60 * 1000);

    return () => {
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("keydown", onActivity, true);
      clearInterval(interval);
    };
  }, [showReminder]);

  // ── NEW: Keyboard shortcuts ────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.key === "Escape") {
        setFocusMode(false);
        setReminderVisible(false);
      }
      if ((e.key === "p" || e.key === "P") && pomState === "idle" && !e.ctrlKey && !e.metaKey) {
        setShowSubjectPicker(s => !s);
      }
      if ((e.key === "f" || e.key === "F") && pomState === "running") {
        setFocusMode(f => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pomState]);

  // ── Pomodoro helpers ───────────────────────────────────────────────────────
  const startPom = () => { setPomState("running"); setPomSecs(WORK_SECS); setShowSubjectPicker(false); };
  const pausePom = () => setPomState(s => s === "running" ? "paused" : "running");
  const stopPom  = () => { setPomState("idle"); setPomSecs(WORK_SECS); };

  const pomPct   = pomState === "break" ? (1 - pomSecs / SHORT_BREAK) * 100 : (1 - pomSecs / WORK_SECS) * 100;
  const pomColor = pomState === "break" ? "#22d3ee" : pomState === "running" ? "#ffffff" : "var(--muted2)";

  // ── Nav ────────────────────────────────────────────────────────────────────
  const navItems = [
    { label: "Uni",        href: "/dashboard/uni" },
    { label: "Sport",      href: "/dashboard/sport" },
    { label: "Projekte",   href: "/dashboard/projekte" },
    { label: "Sprachen",   href: "/dashboard/sprachen" },
    { label: "Wochenplan", href: "/dashboard/timetable" },
  ];
  const isActive = (href: string) => pathname.startsWith(href);

  const DAYS_DE   = ["So","Mo","Di","Mi","Do","Fr","Sa"];
  const MONTHS_DE = ["Jan","Feb","Mär","Apr","Mai","Jun","Jul","Aug","Sep","Okt","Nov","Dez"];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <>
      <div id="app">
        <div id="banner">
          <canvas ref={canvasRef} id="pixel-canvas"></canvas>
          <div id="banner-fade"></div>
          <div id="banner-title">
            <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "baseline", gap: "10px" }}>
              <div className="banner-icon">OS</div>
              <div className="banner-name">Life OS<span>Uni · Sport · Leben</span></div>
            </Link>
          </div>
          {showNotifBar && (
            <div style={{ position: "absolute", top: "8px", right: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "10px", color: "var(--muted2)" }}>Erinnerungen aktivieren?</span>
              <button className="notif-allow" onClick={() => {
                Notification.requestPermission().then(p => {
                  setNotifPermission(p);
                  setShowNotifBar(false);
                  if (p === "granted") addToast("✓ Benachrichtigungen aktiv", "Du bekommst jetzt Lern-Erinnerungen.", "info");
                });
              }}>Ja</button>
              <button className="notif-dismiss" onClick={() => setShowNotifBar(false)}>Nein</button>
            </div>
          )}
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <nav id="sidebar">
            <div className="sidebar-section-label">Menu</div>
            {navItems.map(({ label, href }) => (
              <Link key={href} href={href} className={`nav-item ${isActive(href) ? "active" : ""}`}>
                {label}
              </Link>
            ))}

            {/* ── Pomodoro ── */}
            <div id="pom-section">
              {pomState === "idle" ? (
                <>
                  {showSubjectPicker ? (
                    <>
                      <div style={{ fontSize: "8px", color: "var(--muted2)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "6px" }}>Fach wählen</div>
                      <div className="pom-subject-picker">
                        {POM_SUBJECTS.map(s => (
                          <button key={s} className={`pom-sub-btn ${pomSubject === s ? "selected" : ""}`} onClick={() => setPomSubject(s)}>
                            {s}
                          </button>
                        ))}
                      </div>
                      <div className="pom-controls" style={{ marginTop: "8px" }}>
                        <button className="pom-btn" onClick={startPom} style={{ color: "var(--accent)", borderColor: "var(--accent)" }}>
                          ▶ Start 25min
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <button className="pom-idle-btn" onClick={() => setShowSubjectPicker(true)}>
                        🍅 Pomodoro starten
                      </button>
                      <div style={{ fontSize: "8px", color: "var(--muted)", textAlign: "center", marginTop: "4px", letterSpacing: "1px" }}>P — Shortcut</div>
                    </>
                  )}
                </>
              ) : (
                <div className="pom-running">
                  <div className="pom-time" style={{ color: pomColor }}>
                    {pomState === "break" ? "☕ " : ""}{fmt(pomSecs)}
                  </div>
                  <div className="pom-subject-label">
                    {pomState === "break" ? "PAUSE" : pomSubject} · #{pomSessions + 1} Session
                  </div>
                  <div className="pom-progress">
                    <div className="pom-progress-fill" style={{ width: `${pomPct}%`, background: pomColor }}></div>
                  </div>
                  {pomState !== "break" && (
                    <div className="pom-controls">
                      <button className="pom-btn" onClick={pausePom}>{pomState === "running" ? "⏸" : "▶"}</button>
                      <button className="pom-btn stop" onClick={stopPom}>■</button>
                      {/* NEW: Focus Mode button */}
                      <button className="pom-btn" onClick={() => setFocusMode(true)} title="Fokus-Modus (F)" style={{ fontSize: "10px" }}>⛶</button>
                    </div>
                  )}
                  {pomState === "break" && (
                    <div className="pom-controls">
                      <button className="pom-btn" onClick={() => { setPomState("running"); setPomSecs(WORK_SECS); }}>
                        Überspringen ▶
                      </button>
                    </div>
                  )}
                  {pomSessions > 0 && (
                    <div style={{ display: "flex", gap: "3px", justifyContent: "center", marginTop: "6px" }}>
                      {Array.from({ length: Math.min(pomSessions, 8) }).map((_, i) => (
                        <div key={i} style={{ width: "5px", height: "5px", borderRadius: "50%", background: i % 4 === 3 ? "#22d3ee" : "var(--muted2)" }}></div>
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: "8px", color: "var(--muted)", textAlign: "center", marginTop: "4px", letterSpacing: "1px" }}>F — Fokus · ESC — Beenden</div>
                </div>
              )}
            </div>

            {/* ── Clock ── */}
            <div id="sidebar-clock">
              {mounted && time ? (
                <>
                  <div id="clock-time">{time.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}</div>
                  <div id="clock-date">{DAYS_DE[time.getDay()]} {time.getDate()}. {MONTHS_DE[time.getMonth()]}</div>
                  <div className="mini-progress">
                    {(["Jahr","Monat","Woche"] as const).map((label, i) => (
                      <div key={label} className="mp-row">
                        <div className="mp-bar-wrap">
                          <div className="mp-bar" style={{ width: `${[progress.year, progress.month, progress.week][i]}%` }}></div>
                        </div>
                        <span className="mp-label">{label} {[progress.year, progress.month, progress.week][i]}%</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div style={{ fontSize: "11px", color: "var(--muted2)" }}>—</div>
              )}
            </div>

            {/* ── NEW: Streak ── */}
            {streak > 0 && (
              <div className="streak-badge">
                <div className="streak-label">Streak</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "5px" }}>
                  <span className="streak-num" style={{ color: streak >= 14 ? "#f59e0b" : streak >= 7 ? "#f97316" : streak >= 3 ? "#60a5fa" : "var(--accent)" }}>
                    {streak}
                  </span>
                  <span className="streak-sub">Tag{streak === 1 ? "" : "e"} {streak >= 14 ? "🔥" : streak >= 7 ? "⚡" : ""}</span>
                </div>
                {studyLog.length > 0 && (
                  <div style={{ marginTop: "8px", borderTop: "1px solid var(--border)", paddingTop: "6px" }}>
                    <div style={{ fontSize: "8px", color: "var(--muted2)", letterSpacing: "1px", textTransform: "uppercase", marginBottom: "4px" }}>Letzte Sessions</div>
                    {studyLog.slice(0, 3).map((e, i) => (
                      <div key={i} style={{ fontSize: "9px", color: "var(--muted2)", marginBottom: "3px", display: "flex", gap: "6px" }}>
                        <span style={{ color: "var(--muted)", flexShrink: 0 }}>{e.time}</span>
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.note}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── NEW: Reminder trigger (manual) ── */}
            <div style={{ padding: "8px 12px" }}>
              <button
                onClick={() => {
                  nextReminderAt.current = 0; // force show
                  showReminder();
                }}
                style={{
                  width: "100%", padding: "6px", background: "transparent",
                  border: "1px dashed var(--border)", color: "var(--muted2)",
                  borderRadius: "3px", cursor: "pointer", fontFamily: "var(--mono)",
                  fontSize: "9px", letterSpacing: "1px", transition: "color 0.12s",
                }}
                onMouseEnter={e => (e.currentTarget.style.color = "var(--text)")}
                onMouseLeave={e => (e.currentTarget.style.color = "var(--muted2)")}
              >
                ⏰ Erinnerung anzeigen
              </button>
            </div>
          </nav>

          <main id="main">{children}</main>
        </div>
      </div>

      {/* ── Toasts ── */}
      <div id="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.kind} ${t.removing ? "removing" : ""}`} onClick={() => removeToast(t.id)}>
            <div className="toast-title" style={{ color: t.kind === "urgent" ? "#ef4444" : "var(--accent)" }}>{t.title}</div>
            <div className="toast-body">{t.body}</div>
          </div>
        ))}
      </div>

      {/* ── NEW: Reminder Modal ── */}
      {reminderVisible && (
        <div className="reminder-backdrop" onClick={e => { if (e.target === e.currentTarget) setReminderVisible(false); }}>
          <div className="reminder-card">
            <div className="reminder-tag" style={{ color: reminderData.col }}>⏰ Life OS — Erinnerung</div>
            <div className="reminder-title">{reminderData.title}</div>
            <div className="reminder-body">{reminderData.body}</div>
            <button
              className="reminder-start"
              onClick={() => {
                setReminderVisible(false);
                setPomSubject(reminderData.subject);
                startPom();
              }}
            >
              ▶ Pomodoro starten — 25 min
            </button>
            <div className="reminder-secondary">
              <button
                className="reminder-snooze"
                onClick={() => {
                  nextReminderAt.current = Date.now() + 30 * 60 * 1000;
                  setReminderVisible(false);
                  addToast("⏸ Erinnert in 30 min", "Snooze aktiviert.", "info");
                }}
              >
                Snooze 30 min
              </button>
              <button className="reminder-dismiss" onClick={() => setReminderVisible(false)}>
                Schon dabei ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── NEW: Focus Mode Overlay ── */}
      {focusMode && pomState !== "idle" && (
        <div className="focus-overlay">
          <div className="focus-phase">{pomState === "break" ? "☕ Pause" : "Deep Work"}</div>
          <div className="focus-subject">{pomState === "break" ? "Erholen & Bewegen" : pomSubject}</div>
          <div className="focus-time" style={{ color: pomColor }}>{fmt(pomSecs)}</div>
          <div className="focus-session">Session #{pomSessions + 1}</div>
          <div className="focus-bar-wrap">
            <div className="focus-bar" style={{ width: `${pomPct}%`, background: pomColor }}></div>
          </div>
          <div className="focus-controls">
            {pomState !== "break" && (
              <button className="focus-btn" onClick={pausePom}>
                {pomState === "running" ? "⏸ Pause" : "▶ Weiter"}
              </button>
            )}
            {pomState === "break" && (
              <button className="focus-btn" onClick={() => { setPomState("running"); setPomSecs(WORK_SECS); }}>
                ▶ Überspringen
              </button>
            )}
            <button className="focus-btn" onClick={() => { stopPom(); setFocusMode(false); }}>■ Stop</button>
            <button className="focus-btn" onClick={() => setFocusMode(false)}>↙ Minimieren</button>
          </div>
          <div className="focus-hint">ESC — Fokus-Modus beenden · F — Umschalten</div>
        </div>
      )}

      {/* ── NEW: Session Log prompt ── */}
      {sessionLogVisible && (
        <div className="session-log">
          <div className="session-log-title">✅ Session abgeschlossen!</div>
          <div className="session-log-sub">{completedSubjectRef.current} · Was hast du gelernt?</div>
          <input
            autoFocus
            className="session-log-input"
            value={sessionLogInput}
            onChange={e => setSessionLogInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === "Enter") saveSessionLog(sessionLogInput);
              if (e.key === "Escape") { setSessionLogVisible(false); setSessionLogInput(""); }
            }}
            placeholder="z.B. Lagrange-Gleichungen..."
          />
          <div className="session-log-actions">
            <button className="log-save" onClick={() => saveSessionLog(sessionLogInput)}>Speichern</button>
            <button className="log-skip" onClick={() => { setSessionLogVisible(false); setSessionLogInput(""); }}>Überspringen</button>
          </div>
        </div>
      )}
    </>
  );
}
