"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const EXAMS = [
  { sub: "Mechanik 2", label: "KFT",          date: "2026-06-05", time: "13:00", col: "#f97316" },
  { sub: "KL1",        label: "HA3",           date: "2026-06-07", time: "22:45", col: "#60a5fa" },
  { sub: "DGL",        label: "Zwischentest",  date: "2026-06-12", time: "22:00", col: "#a78bfa" },
  { sub: "KL1",        label: "HA4",           date: "2026-06-21", time: "22:45", col: "#60a5fa" },
  { sub: "ITP",        label: "Abgabe dts",    date: "2026-07-03", time: "16:00", col: "#22d3ee" },
  { sub: "KL1",        label: "HA5",           date: "2026-07-05", time: "22:45", col: "#60a5fa" },
  { sub: "ITP",        label: "Test",          date: "2026-07-14", time: "16:00", col: "#22d3ee" },
  { sub: "DGL",        label: "Prüfung",       date: "2026-07-21", time: "13:30", col: "#a78bfa" },
  { sub: "Ana2",       label: "Prüfung",       date: "2026-07-23", time: "15:00", col: "#4ade80" },
  { sub: "KL1",        label: "Test",          date: "2026-08-03", time: "12:00", col: "#60a5fa" },
];

const WEEK_EVENTS: Record<string, { label: string; col: string; href: string }[]> = {
  Mo: [{ label: "🏃 Easy Run", col: "#60a5fa", href: "/dashboard/sport" }, { label: "🥊 Boxen 18:00", col: "#8888ff", href: "/dashboard/sport" }],
  Di: [{ label: "Uni", col: "#a78bfa", href: "/dashboard/uni" }, { label: "🚀 BEARS 16–21", col: "#f97316", href: "/dashboard/projekte" }],
  Mi: [{ label: "🏋️ GYM A", col: "#4ade80", href: "/dashboard/sport" }, { label: "🥊 Boxen 18:00", col: "#8888ff", href: "/dashboard/sport" }],
  Do: [{ label: "🏃 Intervalle", col: "#60a5fa", href: "/dashboard/sport" }, { label: "🚀 BEARS 16–22", col: "#f97316", href: "/dashboard/projekte" }],
  Fr: [{ label: "🏋️ GYM B", col: "#f97316", href: "/dashboard/sport" }],
  Sa: [{ label: "Bäcker 7–11", col: "#f59e0b", href: "#" }, { label: "🏃 Long Run", col: "#22d3ee", href: "/dashboard/sport" }],
  So: [{ label: "Ruhetag 💤", col: "#28283a", href: "#" }],
};

const DAYS_DE = ["So","Mo","Di","Mi","Do","Fr","Sa"];

const PHASES = [
  { id: "p1", title: "Sofort-Modus",      from: "2026-05-27", to: "2026-06-05", col: "#ef4444", focus: "Mechanik 2" },
  { id: "p2", title: "DGL Zwischentest",  from: "2026-06-06", to: "2026-06-12", col: "#f59e0b", focus: "DGL" },
  { id: "p3", title: "Breite Basis",      from: "2026-06-13", to: "2026-07-13", col: "#4ade80", focus: "Alle Fächer" },
  { id: "p4", title: "Prüfungsmarathon",  from: "2026-07-14", to: "2026-07-23", col: "#f97316", focus: "ITP → DGL → Ana2" },
  { id: "p5", title: "KL1 Endspurt",      from: "2026-07-24", to: "2026-08-03", col: "#60a5fa", focus: "KL1" },
];

const QUOTES = [
  "Jede 25-Minuten-Session bringt dich näher ans Ziel.",
  "Active Recall schlägt Lesen. Teste dich selbst.",
  "Interleaving: Wechsle heute zwischen zwei Fächern.",
  "Kurze Session > Keine Session.",
  "Schlaf ist kein Feind — er festigt das Gelernte.",
  "Spaced Repetition: Heute wiederholen, was du vor 3 Tagen gelernt hast.",
];

const HABITS = [
  { id: "h-es",    label: "🇪🇸 Spanisch 30 min",  col: "#f97316" },
  { id: "h-ru",    label: "🇷🇺 Russisch 30 min",   col: "#60a5fa" },
  { id: "h-pom",   label: "🍅 Lerneinheit (1+ Pomodoro)", col: "#ffffff" },
  { id: "h-sport", label: "🏋️ Sport / Gym",        col: "#4ade80" },
  { id: "h-sleep", label: "😴 Vor 23:00 schlafen", col: "#a78bfa" },
];

export default function DashboardPage() {
  const [now, setNow] = useState(() => new Date());
  const [quote, setQuote] = useState("");
  const [habits, setHabits] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setNow(new Date());
    setQuote(QUOTES[new Date().getHours() % QUOTES.length]);
    const id = setInterval(() => setNow(new Date()), 60000);
    // Load habits for today
    try {
      const key = `habits-${new Date().toDateString()}`;
      const raw = localStorage.getItem(key);
      if (raw) setHabits(JSON.parse(raw));
    } catch {}
    return () => clearInterval(id);
  }, []);

  const toggleHabit = (id: string) => {
    setHabits(prev => {
      const next = { ...prev, [id]: !prev[id] };
      try { localStorage.setItem(`habits-${new Date().toDateString()}`, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const daysUntil = (d: string) => Math.ceil((new Date(d).getTime() - now.getTime()) / 86400000);
  const todayKey  = DAYS_DE[now.getDay()];
  const todayEvs  = WEEK_EVENTS[todayKey] ?? [];

  const upcoming = EXAMS
    .map(e => ({ ...e, days: daysUntil(e.date) }))
    .filter(e => e.days >= 0)
    .sort((a, b) => a.days - b.days)
    .slice(0, 5);

  const nextExam = upcoming[0];

  const currentPhase = PHASES.find(p => now >= new Date(p.from) && now <= new Date(p.to)) ?? PHASES[0];
  const finalExams = upcoming.filter(e => ["Prüfung", "Test"].includes(e.label));

  return (
    <div className="page">
      {/* ── Hero ── */}
      <div className="dash-hero">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: "9px", color: "var(--muted2)", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px" }}>
              {todayKey} · SoSe 2026
            </div>
            <div style={{ fontFamily: "var(--display)", fontSize: "28px", fontStyle: "italic", fontWeight: 700, lineHeight: 1, color: "var(--accent)" }}>
              {currentPhase.title}
            </div>
            <div style={{ fontSize: "10px", color: currentPhase.col, marginTop: "6px", fontWeight: 700 }}>
              Fokus: {currentPhase.focus}
            </div>
            {quote && (
              <div style={{ fontSize: "10px", color: "var(--muted2)", marginTop: "10px", fontStyle: "italic", maxWidth: "280px", lineHeight: 1.5 }}>
                "{quote}"
              </div>
            )}
          </div>
          {nextExam && (
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: "9px", color: "var(--muted2)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "4px" }}>Nächstes</div>
              <div className="dash-stat-num" style={{ color: nextExam.days <= 7 ? "#ef4444" : nextExam.col }}>
                {nextExam.days}d
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted2)", marginTop: "3px" }}>
                {nextExam.sub} {nextExam.label}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Today ── */}
      {todayEvs.length > 0 && (
        <>
          <div className="sec-label">Heute</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "4px" }}>
            {todayEvs.map(ev => (
              <Link key={ev.label} href={ev.href} style={{
                padding: "6px 12px", borderRadius: "3px",
                border: `1px solid ${ev.col}44`, background: `${ev.col}0d`,
                color: ev.col, fontSize: "11px", fontWeight: 700,
                textDecoration: "none", fontFamily: "var(--sans)", letterSpacing: "0.5px",
              }}>
                {ev.label}
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Upcoming deadlines ── */}
      <div className="sec-label">Nächste Termine</div>
      <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "16px" }}>
        {upcoming.map(e => (
          <div key={e.date + e.label} style={{
            display: "flex", alignItems: "center", gap: "10px",
            padding: "9px 14px", borderBottom: "1px solid var(--border)",
          }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: e.col, flexShrink: 0 }}></div>
            <div style={{ flex: 1, fontSize: "11px" }}>
              <span style={{ color: e.col, fontWeight: 700 }}>{e.sub}</span>
              <span style={{ color: "var(--muted2)", marginLeft: "6px" }}>{e.label}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "11px", fontWeight: 700, color: e.days <= 7 ? "#ef4444" : "var(--muted2)" }}>
                {e.days === 0 ? "Heute!" : `in ${e.days}d`}
              </span>
              <div style={{ fontSize: "9px", color: "var(--muted2)" }}>{e.time}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Exam countdown ── */}
      {finalExams.length > 0 && (
        <>
          <div className="sec-label">Prüfungen</div>
          <div className="grid2" style={{ marginBottom: "16px" }}>
            {finalExams.map(e => (
              <Link key={e.sub + e.label} href="/dashboard/uni" style={{ textDecoration: "none" }}>
                <div className="card" style={{ borderColor: `${e.col}33`, cursor: "pointer" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "15px", fontStyle: "italic", fontWeight: 700, marginBottom: "4px", color: "var(--accent)" }}>
                    {e.sub}
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--muted2)", marginBottom: "8px" }}>{e.date.split("-").reverse().slice(0,2).join(".")}</div>
                  <div style={{ fontSize: "22px", fontWeight: 700, color: e.days <= 21 ? "#ef4444" : e.col, fontFamily: "var(--mono)" }}>
                    {e.days}d
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Habit Tracker ── */}
      <div className="sec-label">Heute — Habits</div>
      <div className="card" style={{ padding: "4px 14px", marginBottom: "16px" }}>
        {HABITS.map(h => {
          const done = !!habits[h.id];
          return (
            <div key={h.id} className={`habit-row ${done ? "done" : ""}`} onClick={() => toggleHabit(h.id)}>
              <div className="checkbox" style={{
                borderColor: done ? h.col : "var(--border2)",
                background: done ? h.col : "transparent",
                flexShrink: 0,
              }}>
                {done ? "✓" : ""}
              </div>
              <span className="habit-label" style={{ textDecoration: done ? "line-through" : "none" }}>{h.label}</span>
              {done && <span className="habit-badge" style={{ color: h.col, borderColor: `${h.col}44` }}>✓</span>}
            </div>
          );
        })}
        <div style={{ fontSize: "9px", color: "var(--muted2)", textAlign: "right", padding: "6px 0 2px" }}>
          {Object.values(habits).filter(Boolean).length}/{HABITS.length} heute
        </div>
      </div>

      {/* ── Quick nav ── */}
      <div className="sec-label">Schnellzugriff</div>
      <div className="dash-grid">
        {[
          { href: "/dashboard/uni",       icon: "◐", title: "Lernplan",   sub: "Phasen · Methoden · Termine",  col: "#a78bfa" },
          { href: "/dashboard/sport",     icon: "▣", title: "Sport",      sub: "Gym · Boxen · Laufen",          col: "#4ade80" },
          { href: "/dashboard/projekte",  icon: "🚀", title: "BEARS",      sub: "Avionics · Propulsion",         col: "#f97316" },
          { href: "/dashboard/timetable", icon: "▦", title: "Wochenplan", sub: "Aktuelle Woche",                col: "#60a5fa" },
        ].map(q => (
          <Link key={q.href} href={q.href} className="quick-card" style={{ borderColor: `${q.col}22` }}>
            <div className="quick-card-icon">{q.icon}</div>
            <div className="quick-card-title" style={{ color: q.col }}>{q.title}</div>
            <div className="quick-card-sub">{q.sub}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
