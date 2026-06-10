"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

// ── Exam & deadline data (from calendar) ─────────────────────────────────────

const EXAMS = [
  { id: "mech2-kft",  sub: "Mechanik 2", label: "KFT",           date: "2026-06-05", time: "13:00", col: "#f97316", type: "Vortest" },
  { id: "kl1-ha3",    sub: "KL1",        label: "HA3",           date: "2026-06-07", time: "22:45", col: "#60a5fa", type: "Hausaufgabe" },
  { id: "dgl-zwt",    sub: "DGL",        label: "Zwischentest",  date: "2026-06-12", time: "22:00", col: "#a78bfa", type: "Zwischentest" },
  { id: "kl1-ha4",    sub: "KL1",        label: "HA4",           date: "2026-06-21", time: "22:45", col: "#60a5fa", type: "Hausaufgabe" },
  { id: "dts1",       sub: "ITP",        label: "Abgabe dts",    date: "2026-07-03", time: "16:00", col: "#22d3ee", type: "Abgabe" },
  { id: "kl1-ha5",    sub: "KL1",        label: "HA5",           date: "2026-07-05", time: "22:45", col: "#60a5fa", type: "Hausaufgabe" },
  { id: "itp-test",   sub: "ITP",        label: "Test",          date: "2026-07-14", time: "16:00", col: "#22d3ee", type: "Prüfung" },
  { id: "dts2",       sub: "ITP",        label: "Abgabe dts",    date: "2026-07-17", time: "16:00", col: "#22d3ee", type: "Abgabe" },
  { id: "dgl-final",  sub: "DGL",        label: "Prüfung",       date: "2026-07-21", time: "13:30", col: "#a78bfa", type: "Prüfung" },
  { id: "ana2-final", sub: "Ana2",       label: "Prüfung",       date: "2026-07-23", time: "15:00", col: "#4ade80", type: "Prüfung" },
  { id: "kl1-test",   sub: "KL1",        label: "Test",          date: "2026-08-03", time: "12:00", col: "#60a5fa", type: "Prüfung" },
  { id: "kl1-ha6",    sub: "KL1",        label: "HA6",           date: "2026-08-09", time: "22:45", col: "#60a5fa", type: "Hausaufgabe" },
];

const MODULES = [
  {
    code: "MECH2", name: "Mechanik 2",        ects: 6, col: "#f97316",
    topics: ["Kinematik starrer Körper", "Kinetik", "Schwingungen", "Dreidimensionale Mechanik"],
    examDate: "2026-06-05", examLabel: "KFT 5. Jun",
    strategy: "Alte Klausuren durchrechnen — KFT kommt in 9 Tagen!",
    difficulty: 4,
  },
  {
    code: "KL1",   name: "Klassische Mechanik 1", ects: 6, col: "#60a5fa",
    topics: ["Lagrange-Formalismus", "Erhaltungsgrößen", "Hamiltonsche Mechanik", "Zentralkraftprobleme", "Starrer Körper"],
    examDate: "2026-08-03", examLabel: "Test 3. Aug",
    strategy: "HAs wöchentlich + regelmäßige Aufgaben mit Spaced Repetition",
    difficulty: 5,
  },
  {
    code: "DGL",   name: "DGL für Ing",      ects: 5, col: "#a78bfa",
    topics: ["Lineare DGLs 1. & 2. Ordnung", "Systeme von DGLs", "Laplace-Transformation", "Numerik"],
    examDate: "2026-07-21", examLabel: "Prüfung 21. Jul",
    strategy: "Formelsammlung aufbauen + Zwischentest als Meilenstein nutzen",
    difficulty: 3,
  },
  {
    code: "ANA2",  name: "Analysis 2",       ects: 6, col: "#4ade80",
    topics: ["Mehrdimensionale Integration", "Kurven- & Flächenintegrale", "Vektoranalysis (Stokes, Gauß)", "Fourierreihen"],
    examDate: "2026-07-23", examLabel: "Prüfung 23. Jul",
    strategy: "Interleaving mit DGL — viele gemeinsame Methoden",
    difficulty: 4,
  },
  {
    code: "ITP",   name: "ITP",              ects: 4, col: "#22d3ee",
    topics: ["Datenstrukturen", "Algorithmen", "Programmierparadigmen", "dts-Abgaben"],
    examDate: "2026-07-14", examLabel: "Test 14. Jul",
    strategy: "dts-Projekte kontinuierlich bearbeiten — nicht alles auf Deadline schieben",
    difficulty: 3,
  },
];

// ── Study plan phases ─────────────────────────────────────────────────────────

const PHASES = [
  {
    id: "p1", label: "Phase 1", title: "Sofort-Modus",
    from: "2026-05-27", to: "2026-06-05",
    focus: "Mechanik 2",
    badge: "9 Tage",
    badgeCol: "#ef4444",
    desc: "KFT Mechanik2 am 5. Jun — voller Fokus. KL1 HA3 nebenbei fertigstellen.",
    daily: [
      { sub: "Mechanik 2", h: 3, col: "#f97316" },
      { sub: "KL1 HA3",    h: 1, col: "#60a5fa" },
      { sub: "DGL",        h: 0.5, col: "#a78bfa" },
    ],
    tactics: [
      "Alle alten Klausuren Mechanik2 durchrechnen (Active Recall)",
      "Fehler sofort nachschlagen — nicht übergehen",
      "Formelblatt handschriftlich erstellen",
    ],
  },
  {
    id: "p2", label: "Phase 2", title: "DGL Zwischentest",
    from: "2026-06-06", to: "2026-06-12",
    focus: "DGL",
    badge: "7 Tage",
    badgeCol: "#f59e0b",
    desc: "DGL Zwischentest am 12. Jun. Mech2 KFT ist durch — jetzt DGL Vollgas.",
    daily: [
      { sub: "DGL",        h: 3,   col: "#a78bfa" },
      { sub: "KL1",        h: 1,   col: "#60a5fa" },
      { sub: "Ana2",       h: 0.5, col: "#4ade80" },
    ],
    tactics: [
      "DGL Formelsammlung aufbauen (Spaced Repetition Anki-Karten)",
      "Aufgaben von alten Zwischentests lösen",
      "Interleave: DGL und Ana2 haben gemeinsame Methoden",
    ],
  },
  {
    id: "p3", label: "Phase 3", title: "Breite Basis",
    from: "2026-06-13", to: "2026-07-13",
    focus: "Alle Fächer",
    badge: "30 Tage",
    badgeCol: "#4ade80",
    desc: "Gleichmäßig alle Fächer voranbringen. ITP dts-Abgaben nicht verschleppen!",
    daily: [
      { sub: "KL1",        h: 1.5, col: "#60a5fa" },
      { sub: "Ana2",       h: 1.5, col: "#4ade80" },
      { sub: "DGL",        h: 1,   col: "#a78bfa" },
      { sub: "ITP",        h: 1,   col: "#22d3ee" },
    ],
    tactics: [
      "Interleaving: Täglich Fächer mischen, nicht 4h nur ein Fach",
      "Wöchentliche Wiederholung aller vorherigen Themen (Spaced Rep)",
      "ITP dts regelmäßig bearbeiten — mind. 1h/Woche",
      "KL1 HAs pünktlich abgeben (HA4, HA5)",
    ],
  },
  {
    id: "p4", label: "Phase 4", title: "Prüfungsmarathon",
    from: "2026-07-14", to: "2026-07-23",
    focus: "ITP → DGL → Ana2",
    badge: "10 Tage",
    badgeCol: "#f97316",
    desc: "ITP Test 14. Jul, Prüfung DGL 21. Jul, Ana2 23. Jul. Drei in zehn Tagen.",
    daily: [
      { sub: "Tagesfokus", h: 4,   col: "#ffffff" },
      { sub: "Wiederholung andere", h: 1, col: "#52526a" },
    ],
    tactics: [
      "14. Jul: ITP — 3 Tage vorher nur ITP",
      "15–20. Jul: DGL — Vollständige Formelsammlung + Mock-Klausur",
      "21. Jul abends: Ana2 Light-Review (kein neues Material!)",
      "Schlaf priorisieren: 7–8h, kein Cramming nach Mitternacht",
    ],
  },
  {
    id: "p5", label: "Phase 5", title: "KL1 Endspurt",
    from: "2026-07-24", to: "2026-08-03",
    focus: "KL1",
    badge: "11 Tage",
    badgeCol: "#60a5fa",
    desc: "KL1 Test am 3. Aug. Ana2 + DGL sind durch — voller Fokus auf Lagrange & Hamiltonformalismus.",
    daily: [
      { sub: "KL1",        h: 4,   col: "#60a5fa" },
      { sub: "Wiederholung", h: 0.5, col: "#52526a" },
    ],
    tactics: [
      "Alle Übungsblätter nochmals durchrechnen ohne Lösung",
      "Lagrange & Hamiltonsche Mechanik — Derivationen auswendig können",
      "Mock-Prüfung 2 Tage vor Test unter Klausurbedingungen",
    ],
  },
];

// ── Productivity science tips ─────────────────────────────────────────────────

const SCIENCE_TIPS = [
  { icon: "◈", title: "Active Recall",  tip: "Aktives Abrufen schlägt Wiederlesen — Prüfe dich selbst. Studierende, die sich selbst testen, vergessen nur 13% nach 2 Tagen (vs. 56% beim Wiederlesen).", src: "Karpicke, Purdue 2012" },
  { icon: "◉", title: "Spaced Repetition", tip: "Verteile Lerneinheiten über Zeit — 1, 3, 7, 14 Tage. Anki oder manuelles Wiederholen verdoppelt die Retention im Vergleich zu Massed Practice.", src: "Meta-Analyse, Springer 2025" },
  { icon: "▣", title: "Interleaving",   tip: "Wechsle zwischen Fächern und Aufgabentypen. Gemischtes Üben führte in Studien zu 63% vs. 54% Retention nach einem Monat. Fühlt sich schwerer an — ist effektiver.", src: "PMC 2024, Interleaving STEM" },
  { icon: "◐", title: "Pomodoro 25/5",  tip: "Kognitive Leistung sinkt nach ~25–30 min. 25 min Vollgas + 5 min Pause ist die optimal getestete Einheit. Handy weg, Tür zu.", src: "PMC 2025, Attention Research" },
  { icon: "✦", title: "Schlaf",         tip: "Schlaf konsolidiert Gedächtnis. 7–8h sind keine Verschwendung — Crammen nach Mitternacht kostet mehr als es bringt. Gelernte Inhalte werden im Schlaf gefestigt.", src: "Walker 2017, Why We Sleep" },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Tab = "module" | "lernplan" | "termine" | "wissenschaft";

export default function UniPage() {
  const [tab, setTab] = useState<Tab>("lernplan");
  const [doneDl, setDoneDl] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("uni-done") || "{}"); } catch { return {}; }
  });
  const [grades, setGrades] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("uni-grades") || "{}"); } catch { return {}; }
  });
  const [editingGrade, setEditingGrade] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem("uni-done", JSON.stringify(doneDl)); }, [doneDl]);
  useEffect(() => { localStorage.setItem("uni-grades", JSON.stringify(grades)); }, [grades]);

  const today = new Date("2026-05-27");
  const daysUntil = (dateStr: string) => Math.ceil((new Date(dateStr).getTime() - today.getTime()) / 86400000);

  const currentPhase = PHASES.find(p => {
    const from = new Date(p.from), to = new Date(p.to);
    return today >= from && today <= to;
  }) ?? PHASES[0];

  const upcomingExams = EXAMS
    .filter(e => daysUntil(e.date) >= 0)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4);

  const TABS: { id: Tab; label: string }[] = [
    { id: "lernplan",    label: "Lernplan" },
    { id: "module",      label: "Module" },
    { id: "termine",     label: "Termine" },
    { id: "wissenschaft", label: "Methoden" },
  ];

  const fmtDate = (s: string) => {
    const d = new Date(s);
    return `${d.getDate().toString().padStart(2,"0")}.${(d.getMonth()+1).toString().padStart(2,"0")}.`;
  };

  return (
    <div className="page">
      <div className="page-title">Uni</div>
      <div className="page-sub" style={{ display: "flex", gap: "12px", alignItems: "center" }}>
        <span>SoSe 2026 · 2. Semester · 27 ECTS</span>
        {upcomingExams[0] && (
          <span style={{ color: daysUntil(upcomingExams[0].date) <= 10 ? "#ef4444" : "var(--muted2)" }}>
            Nächstes: {upcomingExams[0].sub} {upcomingExams[0].label} in {daysUntil(upcomingExams[0].date)}d
          </span>
        )}
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "20px" }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: "8px 16px", background: "transparent", cursor: "pointer",
            fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", textTransform: "uppercase",
            color: tab === t.id ? "var(--accent)" : "var(--muted2)",
            borderBottom: tab === t.id ? "1px solid var(--accent)" : "1px solid transparent",
            border: "none", borderRadius: 0, marginBottom: "-1px", transition: "color 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── LERNPLAN ── */}
      {tab === "lernplan" && (
        <div>
          {/* Phase timeline */}
          <div style={{ display: "flex", gap: "4px", marginBottom: "20px", overflowX: "auto", paddingBottom: "4px" }}>
            {PHASES.map((p, i) => {
              const isActive = p.id === currentPhase.id;
              const isPast = new Date(p.to) < today;
              return (
                <div key={p.id} style={{
                  flex: 1, minWidth: "90px", padding: "8px 10px", borderRadius: "3px",
                  border: `1px solid ${isActive ? p.badgeCol : "var(--border)"}`,
                  background: isActive ? `${p.badgeCol}0f` : "var(--card)",
                  opacity: isPast ? 0.4 : 1,
                }}>
                  <div style={{ fontSize: "8px", color: isActive ? p.badgeCol : "var(--muted2)", letterSpacing: "2px", textTransform: "uppercase", marginBottom: "3px" }}>
                    {p.label}
                  </div>
                  <div style={{ fontSize: "11px", fontFamily: "var(--display)", fontStyle: "italic", fontWeight: 700, color: isActive ? "var(--accent)" : "var(--text)" }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: "9px", color: "var(--muted2)", marginTop: "3px" }}>
                    {fmtDate(p.from)} – {fmtDate(p.to)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Current phase detail */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
              <span style={{ fontSize: "9px", padding: "2px 8px", borderRadius: "2px", background: `${currentPhase.badgeCol}22`, color: currentPhase.badgeCol, fontWeight: 700, letterSpacing: "1px" }}>
                JETZT — {currentPhase.badge}
              </span>
              <div style={{ fontFamily: "var(--display)", fontSize: "18px", fontStyle: "italic", fontWeight: 700 }}>
                {currentPhase.title}
              </div>
            </div>
            <div style={{ fontSize: "11px", color: "var(--muted2)", marginBottom: "14px" }}>{currentPhase.desc}</div>

            {/* Daily time allocation */}
            <div className="sec-label">Tagesplanung</div>
            <div style={{ marginBottom: "14px" }}>
              {currentPhase.daily.map(d => (
                <div key={d.sub} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                  <span style={{ fontSize: "10px", width: "110px", color: d.col, fontWeight: 600 }}>{d.sub}</span>
                  <div style={{ flex: 1, height: "6px", background: "var(--border)", borderRadius: "3px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: d.col, width: `${(d.h / 5) * 100}%`, opacity: 0.8 }}></div>
                  </div>
                  <span style={{ fontSize: "10px", color: "var(--muted2)", width: "30px" }}>{d.h}h</span>
                </div>
              ))}
            </div>

            {/* Phase tactics */}
            <div className="sec-label">Taktik</div>
            <div className="card" style={{ padding: "10px 14px" }}>
              {currentPhase.tactics.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: i < currentPhase.tactics.length - 1 ? "8px" : 0, fontSize: "11px" }}>
                  <span style={{ color: currentPhase.badgeCol, flexShrink: 0 }}>→</span>
                  <span style={{ color: "var(--text)" }}>{t}</span>
                </div>
              ))}
            </div>
          </div>

          {/* All phases overview */}
          <div className="sec-label">Alle Phasen</div>
          {PHASES.map(p => (
            <div key={p.id} className="card" style={{ marginBottom: "8px", borderColor: p.id === currentPhase.id ? `${p.badgeCol}44` : "var(--border)", opacity: new Date(p.to) < today ? 0.5 : 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                <div>
                  <span style={{ fontSize: "9px", color: p.badgeCol, fontWeight: 700, letterSpacing: "1px", marginRight: "8px" }}>{p.label.toUpperCase()}</span>
                  <span style={{ fontFamily: "var(--display)", fontSize: "14px", fontStyle: "italic", fontWeight: 700 }}>{p.title}</span>
                </div>
                <span style={{ fontSize: "9px", color: "var(--muted2)" }}>{fmtDate(p.from)} – {fmtDate(p.to)}</span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "8px" }}>{p.desc}</div>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {p.daily.map(d => (
                  <span key={d.sub} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "2px", border: `1px solid ${d.col}33`, color: d.col }}>
                    {d.sub} {d.h}h
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── MODULE ── */}
      {tab === "module" && (
        <div>
          {MODULES.map(m => {
            const days = daysUntil(m.examDate);
            const urgent = days <= 14;
            const moduleSlug = m.code.toLowerCase();
            return (
              <div key={m.code} style={{ position: "relative", marginBottom: "10px" }}>
                <div className="card" style={{ borderColor: urgent ? `${m.col}44` : "var(--border)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
                        <span className="tag" style={{ color: m.col, borderColor: `${m.col}44`, background: `${m.col}11` }}>{m.code}</span>
                        <Link href={`/dashboard/uni/${moduleSlug}`} style={{
                          fontSize: "9px", color: "var(--muted2)", textDecoration: "none",
                          border: "1px solid var(--border)", padding: "1px 6px", borderRadius: "2px",
                          fontFamily: "var(--mono)", transition: "color 0.12s",
                        }}>
                          Details →
                        </Link>
                      </div>
                      <Link href={`/dashboard/uni/${moduleSlug}`} style={{ textDecoration: "none" }}>
                        <div style={{ fontFamily: "var(--display)", fontSize: "16px", fontStyle: "italic", fontWeight: 700, margin: "0 0 2px", color: "var(--accent)", cursor: "pointer" }}>{m.name}</div>
                      </Link>
                      <div style={{ fontSize: "9px", color: "var(--muted2)" }}>{m.ects} ECTS</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: "11px", color: urgent ? "#ef4444" : m.col, fontWeight: 700 }}>{m.examLabel}</div>
                      <div style={{ fontSize: "9px", color: urgent ? "#ef4444" : "var(--muted2)", marginTop: "2px" }}>in {days} Tagen</div>
                      {/* Grade */}
                      <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "4px", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "9px", color: "var(--muted2)" }}>Note:</span>
                        {editingGrade === m.code ? (
                          <input autoFocus type="text" defaultValue={grades[m.code] || ""} className="grade-input"
                            style={{ width: "50px" }}
                            onBlur={e => { setGrades(p => ({ ...p, [m.code]: e.target.value })); setEditingGrade(null); }}
                            onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                          />
                        ) : (
                          <span onClick={() => setEditingGrade(m.code)} style={{ fontSize: "12px", fontWeight: 700, color: grades[m.code] ? m.col : "var(--muted2)", cursor: "pointer" }}>
                            {grades[m.code] || "—"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Difficulty */}
                  <div style={{ display: "flex", gap: "3px", marginBottom: "10px" }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} style={{ width: "20px", height: "3px", borderRadius: "1px", background: i < m.difficulty ? m.col : "var(--border)" }}></div>
                    ))}
                    <span style={{ fontSize: "9px", color: "var(--muted2)", marginLeft: "6px" }}>Schwierigkeit</span>
                  </div>
                  {/* Topics */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", marginBottom: "10px" }}>
                    {m.topics.map(t => (
                      <span key={t} style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "2px", border: "1px solid var(--border2)", color: "var(--muted2)" }}>{t}</span>
                    ))}
                  </div>
                  {/* Strategy */}
                  <div style={{ fontSize: "10px", color: "var(--muted2)", borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                    <span style={{ color: m.col }}>→ </span>{m.strategy}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TERMINE ── */}
      {tab === "termine" && (
        <div>
          <div style={{ marginBottom: "20px" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700, marginBottom: "4px" }}>
              Timeline
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted2)" }}>
              {EXAMS.filter(e => doneDl[e.id]).length}/{EXAMS.length} erledigt
            </div>
          </div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {EXAMS.map((e, i) => {
              const days = daysUntil(e.date);
              const done = !!doneDl[e.id];
              const isPast = days < 0;
              const isUrgent = days >= 0 && days <= 7;
              return (
                <div
                  key={e.id}
                  className={`deadline-row ${done ? "done" : ""}`}
                  onClick={() => setDoneDl(p => ({ ...p, [e.id]: !p[e.id] }))}
                >
                  <div className="checkbox" style={{ borderColor: done ? e.col : "var(--border2)", background: done ? e.col : "transparent" }}>
                    {done ? "✓" : ""}
                  </div>
                  <div className="dl-dot" style={{ background: e.col }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "11px", fontWeight: 600 }}>
                      <span style={{ color: e.col }}>{e.sub}</span> — {e.label}
                    </div>
                    <div style={{ fontSize: "9px", color: "var(--muted2)" }}>{e.type}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: "11px", color: isUrgent ? "#ef4444" : isPast ? "var(--muted)" : "var(--muted2)" }}>
                      {fmtDate(e.date)} {e.time}
                    </div>
                    <div style={{ fontSize: "9px", color: isUrgent ? "#ef4444" : "var(--muted2)" }}>
                      {isPast ? "vorbei" : `in ${days}d`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── WISSENSCHAFT ── */}
      {tab === "wissenschaft" && (
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700, marginBottom: "4px" }}>
            Science-Based Learning
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "20px" }}>
            Basierend auf Kognitionswissenschaft & Lernforschung
          </div>
          {SCIENCE_TIPS.map(t => (
            <div key={t.title} className="card" style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", gap: "12px" }}>
                <div style={{ fontSize: "16px", color: "var(--accent2)", flexShrink: 0, paddingTop: "1px" }}>{t.icon}</div>
                <div>
                  <div style={{ fontFamily: "var(--sans)", fontSize: "13px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px", color: "var(--accent)" }}>
                    {t.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text)", lineHeight: "1.5", marginBottom: "6px" }}>{t.tip}</div>
                  <div style={{ fontSize: "9px", color: "var(--muted2)", fontStyle: "italic" }}>Quelle: {t.src}</div>
                </div>
              </div>
            </div>
          ))}
          <div className="card" style={{ marginTop: "16px", borderColor: "var(--border2)" }}>
            <div style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 700, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "8px", color: "var(--accent)" }}>
              Optimale Studien-Session
            </div>
            {[
              ["0–5 min",   "Setup: Handy weg, Ziel definieren (was will ich heute können?)"],
              ["5–30 min",  "Deep Work Einheit 1: Aufgaben lösen (kein Wiederlesen!)"],
              ["30–35 min", "Pause: Wasser, kurz bewegen"],
              ["35–60 min", "Deep Work Einheit 2: anderes Teilgebiet (Interleaving!)"],
              ["60–65 min", "Pause"],
              ["65–90 min", "Active Recall: Alles aus dem Kopf aufschreiben, ohne Notizen"],
              ["90 min",    "Lernziel prüfen, nächste Session planen"],
            ].map(([time, desc]) => (
              <div key={time as string} style={{ display: "flex", gap: "12px", marginBottom: "6px", fontSize: "10px" }}>
                <span style={{ color: "var(--accent2)", width: "60px", flexShrink: 0 }}>{time}</span>
                <span style={{ color: "var(--text)" }}>{desc}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
