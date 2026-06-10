"use client";

import { useState, useEffect, useRef } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Task { id: string; text: string; prio: "hoch" | "mittel" | "niedrig"; }

// ── Static group metadata ─────────────────────────────────────────────────────

const GROUP_META = {
  avionics: {
    name: "Avionics", sub: "Ground Station", col: "#60a5fa", icon: "◈",
    desc: "Entwicklung und Betrieb der Bodenstation — Telemetrie, Tracking, Kommunikation mit der Rakete.",
    defaultTasks: [
      { id: "av1", text: "Telemetrie-Protokoll dokumentieren",  prio: "hoch"    },
      { id: "av2", text: "Ground Station GUI testen",           prio: "hoch"    },
      { id: "av3", text: "RF-Link Budget berechnen",            prio: "mittel"  },
      { id: "av4", text: "Failsafe-Logic reviewen",             prio: "mittel"  },
      { id: "av5", text: "Sensor-Kalibrierung prüfen",          prio: "niedrig" },
    ] as Task[],
  },
  propulsion: {
    name: "Propulsion", sub: "Antriebssysteme", col: "#f97316", icon: "✦",
    desc: "Design und Test von Raketentriebwerken — Thrust, Brennkammer, Düsengeometrie, Treibstoffmischungen.",
    defaultTasks: [
      { id: "pr1", text: "Schubkurve letzte Brennkammer auswerten", prio: "hoch"    },
      { id: "pr2", text: "Neue Düsengeometrie simulieren",           prio: "hoch"    },
      { id: "pr3", text: "Teststand-Sicherheitsprotokoll aktualisieren", prio: "mittel" },
      { id: "pr4", text: "Treibstoffdaten dokumentieren",            prio: "niedrig" },
    ] as Task[],
  },
} as const;

type GroupId = keyof typeof GROUP_META;

// ── Propulsion Lernplan data ──────────────────────────────────────────────────

const PROP_PHASES = [
  {
    id: "p1", title: "Phase 1 — Grundlagen", col: "#60a5fa",
    weeks: [
      {
        id: "w1", week: "Woche 1", title: "Raketenprinzipien",
        topics: ["Impulserhaltung & Newton III", "Tsiolkowski-Raketengleichung", "Schub, Isp, Delta-v", "Massenstrom & Ausströmgeschwindigkeit"],
        resources: ["Sutton & Biblarz — Kap. 1–2", "MIT OCW 16.50 — Lecture 1–3"],
      },
      {
        id: "w2", week: "Woche 2", title: "Thermodynamik der Düsenströmung",
        topics: ["Isentrope Prozesse", "Mach-Zahl & Schallgeschwindigkeit", "Düsentypen (konvergent-divergent)", "Ideales & reales Gas"],
        resources: ["Sutton & Biblarz — Kap. 3", "Cantwell AA283 — Kap. 2–4 (kostenlos)"],
      },
      {
        id: "w3", week: "Woche 3", title: "Antriebsarten im Überblick",
        topics: ["Festtreibstoff (SRM) — Prinzip & Vor-/Nachteile", "Flüssigkeitsantrieb (LRE) — Pumpen & Injektoren", "Hybridantriebe — Kombination & Regression", "Elektrische Antriebe (kurzer Überblick)"],
        resources: ["Sutton & Biblarz — Kap. 4, 6, 15", "MIT OCW 16.512 — Lecture 1–4"],
      },
      {
        id: "w4", week: "Woche 4", title: "Treibstoffchemie & Isp",
        topics: ["Oxidatoren: LOX, N₂O, HNO₃", "Brennstoffe: HTPB, Paraffin, RP-1", "Spezifischer Impuls (Isp) berechnen", "CEA / CEARUN Simulation einführen"],
        resources: ["NASA SP-8064 — Solid Propellant Selection", "CEARUN: cearun.grc.nasa.gov"],
      },
    ],
  },
  {
    id: "p2", title: "Phase 2 — Antriebssysteme", col: "#f97316",
    weeks: [
      {
        id: "w5", week: "Woche 5", title: "Festtreibstoff-Motoren (SRM)",
        topics: ["Grain Design: BATES, star, finocyl", "Interne Ballistik & Brennflächenverlauf", "Abbrandrate (r = a·pⁿ, de St. Robert)", "Kammerdruckverlauf analysieren"],
        resources: ["NASA SP-8076 — Solid Propellant Grain Design", "NASA SP-8115 — Solid Rocket Motor Nozzles"],
      },
      {
        id: "w6", week: "Woche 6", title: "Flüssigtriebwerke (LRE)",
        topics: ["Injektortypen: Pintle, Swirl, Doublet", "Regenerative Kühlung & Filmkühlung", "Turbo-Pumpen & Druckaufbau", "Combustion stability basics"],
        resources: ["Sutton & Biblarz — Kap. 8–9", "MIT OCW 16.512 — Lecture 8–12"],
      },
      {
        id: "w7", week: "Woche 7", title: "Hybridantriebe",
        topics: ["Regressionsraten & Oxidatormassenstrom", "Paraffin als liquefying fuel", "N₂O als Oxidator (Einstieg)", "Hybriddesign-Parameter"],
        resources: ["NASA CR-183975 — Hybrid Propulsion Technology", "Zilliac et al. — Paraffin Hybrid Fuels (NTRS 20110016647)"],
      },
      {
        id: "w8", week: "Woche 8", title: "Düsendesign",
        topics: ["Halsquerschnitt (Throat Area) berechnen", "Expansionsverhältnis & Umgebungsdruck", "Konturformen: konisch, bell, aerospike", "Fertigungs- & Materialaspekte"],
        resources: ["NASA SP-8115 — Nozzles (vertiefen)", "Sutton & Biblarz — Kap. 3.3–3.5"],
      },
    ],
  },
  {
    id: "p3", title: "Phase 3 — Design & Tests", col: "#4ade80",
    weeks: [
      {
        id: "w9", week: "Woche 9", title: "Simulation & CFD-Tools",
        topics: ["CEARUN — Thermochemie-Berechnungen", "RPA (Rocket Propulsion Analysis)", "OpenRocket — Gesamtrakete simulieren", "Ergebnisse validieren & interpretieren"],
        resources: ["CEARUN: cearun.grc.nasa.gov", "RPA: propulsion-analysis.com", "OpenRocket: openrocket.info"],
      },
      {
        id: "w10", week: "Woche 10", title: "Teststand & Messtechnik",
        topics: ["Kraft- & Drucksensoren kalibrieren", "Datenerfassung (DAQ) & Abtastrate", "Sicherheitsprotokoll & Risikoanalyse", "Statischer Brenntest auswerten"],
        resources: ["BEARS Sicherheitsprotokoll", "Sutton & Biblarz — Kap. 20 (Testing)"],
      },
      {
        id: "w11", week: "Woche 11", title: "Performance-Analyse",
        topics: ["Charakteristische Geschwindigkeit c*", "Schubkoeffizient Cf", "Messungen vs. Simulation vergleichen", "Losses analysieren (divergenz, zwei-phasen)"],
        resources: ["Cantwell AA283 — Kap. 6–7", "MIT OCW 16.512 — Lecture 14–16"],
      },
      {
        id: "w12", week: "Woche 12", title: "Abschluss-Projekt & Dokumentation",
        topics: ["Eigenes Triebwerkskonzept entwerfen (auf Papier)", "CEARUN + RPA vollständig durchrechnen", "Technischer Bericht schreiben", "Präsentation für BEARS vorbereiten"],
        resources: ["Alle bisherigen Quellen", "NASA Technical Report Format"],
      },
    ],
  },
];

const PROP_RESOURCES = [
  {
    cat: "Bücher", col: "#a78bfa",
    items: [
      { title: "Rocket Propulsion Elements (9th ed.)", author: "Sutton & Biblarz", note: "Das Standardwerk — kaufen oder Bibliothek", url: null },
      { title: "Aircraft and Rocket Propulsion (AA283)", author: "Brian J. Cantwell, Stanford", note: "Kostenloses PDF — vollständiges Lehrbuch", url: "https://web.stanford.edu/~cantwell/AA283_Course_Material/AA283_Course_BOOK/AA283_Aircraft_and_Rocket_Propulsion_BOOK_Brian_J_Cantwell_May_28_2024.pdf" },
    ],
  },
  {
    cat: "MIT OpenCourseWare", col: "#60a5fa",
    items: [
      { title: "16.50 Introduction to Propulsion Systems", author: "MIT OCW, Spring 2012", note: "Vorlesungen, Problem Sets, Exams — kostenlos", url: "https://ocw.mit.edu/courses/16-50-introduction-to-propulsion-systems-spring-2012/" },
      { title: "16.512 Rocket Propulsion", author: "MIT OCW, Fall 2005", note: "Vertiefung: Flüssig- & Festtriebwerke", url: "https://ocw.mit.edu/courses/16-512-rocket-propulsion-fall-2005/" },
    ],
  },
  {
    cat: "NASA Technical Reports", col: "#f97316",
    items: [
      { title: "NASA SP-8115 — Solid Rocket Motor Nozzles", author: "NASA, 1975", note: "Klassisches Referenzhandbuch Düsendesign", url: "https://ntrs.nasa.gov/citations/19760007645" },
      { title: "NASA SP-8064 — Solid Propellant Selection", author: "NASA, 1971", note: "Treibstoffauswahl & Charakterisierung", url: "https://ntrs.nasa.gov/citations/19710019929" },
      { title: "NASA SP-8076 — Grain Design & Internal Ballistics", author: "NASA, 1972", note: "Grain-Design & interne Ballistik", url: "https://ntrs.nasa.gov/citations/19720017826" },
      { title: "NASA CR-183975 — Hybrid Propulsion Technology", author: "NASA, 1989", note: "Hybridantrieb Technologieprogramm", url: "https://ntrs.nasa.gov/citations/19890013306" },
      { title: "Paraffin Hybrid Rocket Fuels", author: "Zilliac et al. (NTRS 20110016647)", note: "Paraffin als schnell abbrennendes Hybridbrennstoff", url: "https://ntrs.nasa.gov/citations/20110016647" },
    ],
  },
  {
    cat: "Simulation-Tools", col: "#4ade80",
    items: [
      { title: "CEARUN — Chemical Equilibrium with Applications", author: "NASA Glenn Research Center", note: "Thermochemie-Berechnungen direkt im Browser", url: "https://cearun.grc.nasa.gov/" },
      { title: "RPA — Rocket Propulsion Analysis", author: "Alexander Ponomarenko", note: "Vollständige Triebwerksanalyse (kostenlose Basisversion)", url: "http://propulsion-analysis.com/downloads.htm" },
      { title: "OpenRocket", author: "Open Source", note: "Gesamtrakete simulieren — Stabilität, Flugbahn", url: "https://openrocket.info/" },
    ],
  },
  {
    cat: "YouTube", col: "#22d3ee",
    items: [
      { title: "BPS.space", author: "Joe Barnard", note: "Amateurraketen Engineering — Thrust Vectoring, Tests", url: "https://www.youtube.com/@bpsspace" },
      { title: "Integza", author: "Integza", note: "Triebwerksbau und -tests — Rotating Detonation, Aerospike", url: "https://www.youtube.com/@integza" },
      { title: "Everyday Astronaut", author: "Tim Dodd", note: "Tiefe Erklärungen: Raptor, BE-4, Merlin, Nozzle Flows", url: "https://www.youtube.com/@EverydayAstronaut" },
      { title: "Scott Manley", author: "Scott Manley", note: "Raumfahrtgeschichte, Physik, neue Entwicklungen", url: "https://www.youtube.com/@scottmanley" },
    ],
  },
];

// ── GitHub repos ──────────────────────────────────────────────────────────────

const GITHUB_REPOS = [
  { name: "orbital-mechanics-simulator", desc: "Orbitalmechanik — Keplersche Bahnen, Gravitationsfelder. Direkt relevant für BEARS-Trajectories.", lang: "Python", col: "#f97316", tags: ["Simulation","Physik","BEARS"], url: "https://github.com/lucy3000/orbital-mechanics-simulator", status: "aktiv" },
  { name: "Simulation-Gravitation",       desc: "N-Körper Gravitationssimulation. Grundlage für Raketenflugbahn-Berechnungen.",                    lang: "Python", col: "#60a5fa", tags: ["Simulation","Physik"],         url: "https://github.com/lucy3000/Simulation-Gravitation",       status: "aktiv" },
  { name: "Jarvis",                       desc: "Persönlicher Assistent / Automatisierungsprojekt.",                                               lang: "Python", col: "#a78bfa", tags: ["Automation","AI"],             url: "https://github.com/lucy3000/Jarvis",                       status: "aktiv" },
  { name: "Seminararbeit-Neuromorphe-Computer", desc: "Seminararbeit über neuromorphes Computing — gehirnähnliche Rechnerarchitekturen.",          lang: "Python", col: "#4ade80", tags: ["Research","Neuromorphik"],    url: "https://github.com/lucy3000/Seminararbeit-Neuromorphe-Computer", status: "abgeschlossen" },
  { name: "KNN",                          desc: "K-Nearest-Neighbors Implementation — Machine Learning Klassifikation.",                           lang: "Python", col: "#22d3ee", tags: ["ML","Klassifikation"],        url: "https://github.com/lucy3000/KNN",                          status: "abgeschlossen" },
];

const PRIO_COL: Record<string, string> = { hoch: "#ef4444", mittel: "#f59e0b", niedrig: "#52526a" };

// ── Component ─────────────────────────────────────────────────────────────────

type Tab = "bears" | "github";
type PropSubSection = "tasks" | "lernplan";

export default function ProjektePage() {
  const [tab, setTab]                         = useState<Tab>("bears");
  const [activeGroup, setActiveGroup]         = useState<GroupId>("avionics");
  const [propSub, setPropSub]                 = useState<PropSubSection>("tasks");
  const [newTaskText, setNewTaskText]         = useState("");
  const [newTaskPrio, setNewTaskPrio]         = useState<Task["prio"]>("mittel");
  const [editingTask, setEditingTask]         = useState<string | null>(null);
  const [editingText, setEditingText]         = useState("");
  const [expandedPhase, setExpandedPhase]     = useState<string | null>("p1");
  const inputRef = useRef<HTMLInputElement>(null);

  // Persistent state
  const [done, setDone]         = useState<Record<string, boolean>>({});
  const [tasks, setTasks]       = useState<Record<GroupId, Task[]>>({
    avionics:   GROUP_META.avionics.defaultTasks,
    propulsion: GROUP_META.propulsion.defaultTasks,
  });
  const [notes, setNotes]       = useState<Record<string, string>>({});
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [planDone, setPlanDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const d = localStorage.getItem("bears-done");      if (d) setDone(JSON.parse(d));
      const t = localStorage.getItem("bears-tasks");     if (t) setTasks(JSON.parse(t));
      const n = localStorage.getItem("bears-notes");     if (n) setNotes(JSON.parse(n));
      const p = localStorage.getItem("prop-plan-done");  if (p) setPlanDone(JSON.parse(p));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { localStorage.setItem("bears-done",     JSON.stringify(done));     }, [done]);
  useEffect(() => { localStorage.setItem("bears-tasks",    JSON.stringify(tasks));    }, [tasks]);
  useEffect(() => { localStorage.setItem("bears-notes",    JSON.stringify(notes));    }, [notes]);
  useEffect(() => { localStorage.setItem("prop-plan-done", JSON.stringify(planDone)); }, [planDone]);

  const toggle = (id: string) => setDone(p => ({ ...p, [id]: !p[id] }));
  const togglePlan = (id: string) => setPlanDone(p => ({ ...p, [id]: !p[id] }));

  const addTask = () => {
    const text = newTaskText.trim();
    if (!text) return;
    const id = `custom-${Date.now()}`;
    setTasks(prev => ({ ...prev, [activeGroup]: [...prev[activeGroup], { id, text, prio: newTaskPrio }] }));
    setNewTaskText("");
    inputRef.current?.focus();
  };

  const deleteTask = (id: string) => {
    setTasks(prev => ({ ...prev, [activeGroup]: prev[activeGroup].filter(t => t.id !== id) }));
    setDone(prev => { const next = { ...prev }; delete next[id]; return next; });
  };

  const saveEdit = (id: string) => {
    if (editingText.trim()) {
      setTasks(prev => ({ ...prev, [activeGroup]: prev[activeGroup].map(t => t.id === id ? { ...t, text: editingText.trim() } : t) }));
    }
    setEditingTask(null);
  };

  const changePrio = (id: string) => {
    const order: Task["prio"][] = ["hoch", "mittel", "niedrig"];
    setTasks(prev => ({
      ...prev,
      [activeGroup]: prev[activeGroup].map(t => {
        if (t.id !== id) return t;
        return { ...t, prio: order[(order.indexOf(t.prio) + 1) % 3] };
      }),
    }));
  };

  const group      = GROUP_META[activeGroup];
  const groupTasks = tasks[activeGroup] ?? [];
  const sorted     = [...groupTasks].sort((a, b) => ["hoch","mittel","niedrig"].indexOf(a.prio) - ["hoch","mittel","niedrig"].indexOf(b.prio));
  const openCount  = sorted.filter(t => !done[t.id]).length;
  const doneCount  = sorted.length - openCount;

  // Lernplan progress
  const allWeekIds     = PROP_PHASES.flatMap(p => p.weeks.map(w => w.id));
  const planDoneCount  = allWeekIds.filter(id => planDone[id]).length;

  const TABS = [
    { id: "bears" as Tab, label: "BEARS" },
    { id: "github" as Tab, label: "GitHub" },
  ];

  return (
    <div className="page">
      <div className="page-title">Projekte</div>
      <div className="page-sub">BEARS Raketenclub · GitHub — lucy3000</div>

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

      {/* ── BEARS ── */}
      {tab === "bears" && (
        <div>
          {/* Header */}
          <div className="card" style={{ marginBottom: "14px", borderColor: "#ffffff0a" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ fontSize: "26px" }}>🚀</div>
              <div>
                <div style={{ fontFamily: "var(--display)", fontSize: "17px", fontStyle: "italic", fontWeight: 700 }}>BEARS</div>
                <div style={{ fontSize: "10px", color: "var(--muted2)", marginTop: "2px" }}>Di 16–21 · Do 16–22 · Avionics · Propulsion</div>
              </div>
            </div>
          </div>

          {/* Group picker */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
            {(Object.keys(GROUP_META) as GroupId[]).map(gid => {
              const g = GROUP_META[gid];
              return (
                <button key={gid} className="gym-tab"
                  style={activeGroup === gid ? { borderColor: g.col, color: g.col } : {}}
                  onClick={() => setActiveGroup(gid)}
                >
                  {g.icon} {g.name}
                </button>
              );
            })}
          </div>

          {/* Propulsion sub-tabs */}
          {activeGroup === "propulsion" && (
            <div style={{ display: "flex", gap: "0", marginBottom: "14px", borderBottom: "1px solid var(--border2)" }}>
              {([["tasks", "Aufgaben"], ["lernplan", "3-Monats-Lernplan"]] as [PropSubSection, string][]).map(([id, label]) => (
                <button key={id} onClick={() => setPropSub(id)} style={{
                  padding: "6px 14px", background: "transparent", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: "10px", letterSpacing: "0.5px",
                  color: propSub === id ? "#f97316" : "var(--muted2)",
                  borderBottom: propSub === id ? "1px solid #f97316" : "1px solid transparent",
                  border: "none", borderRadius: 0, marginBottom: "-1px", transition: "color 0.12s",
                }}>
                  {label}
                  {id === "lernplan" && (
                    <span style={{ marginLeft: "6px", fontSize: "9px", color: "var(--muted2)" }}>
                      {planDoneCount}/{allWeekIds.length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* ── TASKS view ── */}
          {(activeGroup !== "propulsion" || propSub === "tasks") && (
            <>
              {/* Group detail */}
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "17px", fontStyle: "italic", fontWeight: 700, color: group.col, marginBottom: "3px" }}>{group.name} — {group.sub}</div>
                <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "6px" }}>{group.desc}</div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <div style={{ height: "2px", flex: 1, background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: group.col, width: `${sorted.length ? (doneCount / sorted.length) * 100 : 0}%`, transition: "width 0.4s" }}></div>
                  </div>
                  <span style={{ fontSize: "10px", color: group.col }}>{doneCount}/{sorted.length}</span>
                </div>
              </div>

              {/* Task list */}
              <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "10px" }}>
                {sorted.length === 0 && (
                  <div style={{ padding: "14px", fontSize: "11px", color: "var(--muted2)", textAlign: "center" }}>
                    Keine Aufgaben — füge eine hinzu ↓
                  </div>
                )}
                {sorted.map(task => (
                  <div key={task.id} style={{
                    display: "flex", alignItems: "center", gap: "8px",
                    padding: "8px 12px", borderBottom: "1px solid var(--border)",
                    opacity: done[task.id] ? 0.35 : 1, transition: "opacity 0.15s",
                  }}>
                    <div
                      className="checkbox"
                      style={{ borderColor: done[task.id] ? group.col : "var(--border2)", background: done[task.id] ? group.col : "transparent", cursor: "pointer", flexShrink: 0 }}
                      onClick={() => toggle(task.id)}
                    >
                      {done[task.id] ? "✓" : ""}
                    </div>

                    {editingTask === task.id ? (
                      <input
                        autoFocus
                        value={editingText}
                        onChange={e => setEditingText(e.target.value)}
                        onBlur={() => saveEdit(task.id)}
                        onKeyDown={e => { if (e.key === "Enter") saveEdit(task.id); if (e.key === "Escape") setEditingTask(null); }}
                        style={{ flex: 1, background: "var(--card2)", border: `1px solid ${group.col}66`, color: "var(--text)", fontFamily: "var(--mono)", fontSize: "11px", padding: "2px 6px", borderRadius: "2px", outline: "none" }}
                      />
                    ) : (
                      <span
                        onDoubleClick={() => { setEditingTask(task.id); setEditingText(task.text); }}
                        style={{ flex: 1, fontSize: "11px", cursor: "text", textDecoration: done[task.id] ? "line-through" : "none" }}
                        title="Doppelklick zum Bearbeiten"
                      >
                        {task.text}
                      </span>
                    )}

                    <span
                      onClick={() => changePrio(task.id)}
                      title="Klicken zum Ändern"
                      style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "2px", border: `1px solid ${PRIO_COL[task.prio]}44`, color: PRIO_COL[task.prio], cursor: "pointer", flexShrink: 0 }}
                    >
                      {task.prio}
                    </span>

                    <span
                      onClick={() => deleteTask(task.id)}
                      title="Löschen"
                      style={{ fontSize: "12px", color: "var(--muted)", cursor: "pointer", lineHeight: 1, flexShrink: 0 }}
                    >
                      ×
                    </span>
                  </div>
                ))}
              </div>

              {/* Add task */}
              <div style={{ display: "flex", gap: "6px", marginBottom: "16px" }}>
                <input
                  ref={inputRef}
                  value={newTaskText}
                  onChange={e => setNewTaskText(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addTask(); }}
                  placeholder="Neue Aufgabe..."
                  style={{
                    flex: 1, background: "var(--card)", border: "1px solid var(--border2)",
                    color: "var(--text)", fontFamily: "var(--mono)", fontSize: "11px",
                    padding: "7px 10px", borderRadius: "3px", outline: "none",
                  }}
                />
                {(["hoch","mittel","niedrig"] as Task["prio"][]).map(p => (
                  <button key={p} onClick={() => setNewTaskPrio(p)} style={{
                    padding: "4px 8px", background: "transparent", cursor: "pointer",
                    border: `1px solid ${newTaskPrio === p ? PRIO_COL[p] : "var(--border)"}`,
                    color: newTaskPrio === p ? PRIO_COL[p] : "var(--muted2)",
                    borderRadius: "2px", fontSize: "9px", fontFamily: "var(--mono)",
                    transition: "all 0.12s",
                  }}>
                    {p}
                  </button>
                ))}
                <button onClick={addTask} style={{
                  padding: "4px 12px", background: "var(--card2)", border: "1px solid var(--border2)",
                  color: "var(--text)", borderRadius: "2px", cursor: "pointer",
                  fontFamily: "var(--mono)", fontSize: "11px", transition: "all 0.15s",
                }}>
                  + Add
                </button>
              </div>

              {/* Notes */}
              <div className="sec-label">Notizen — {group.name}</div>
              <div className="card" style={{ padding: "10px" }}>
                {editingNote === activeGroup ? (
                  <textarea
                    autoFocus
                    defaultValue={notes[activeGroup] || ""}
                    onBlur={e => { setNotes(p => ({ ...p, [activeGroup]: e.target.value })); setEditingNote(null); }}
                    style={{ width: "100%", minHeight: "80px", background: "transparent", border: "none", color: "var(--text)", fontFamily: "var(--mono)", fontSize: "11px", resize: "vertical", outline: "none", lineHeight: "1.6" }}
                  />
                ) : (
                  <div
                    onClick={() => setEditingNote(activeGroup)}
                    style={{ fontSize: "11px", color: notes[activeGroup] ? "var(--text)" : "var(--muted2)", cursor: "text", minHeight: "40px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}
                  >
                    {notes[activeGroup] || "Klicken zum Bearbeiten..."}
                  </div>
                )}
              </div>
            </>
          )}

          {/* ── LERNPLAN view ── */}
          {activeGroup === "propulsion" && propSub === "lernplan" && (
            <div>
              {/* Header */}
              <div style={{ marginBottom: "16px" }}>
                <div style={{ fontFamily: "var(--display)", fontSize: "18px", fontStyle: "italic", fontWeight: 700, color: "#f97316", marginBottom: "4px" }}>
                  Propulsion — 3-Monats-Lernplan
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "10px", lineHeight: 1.6 }}>
                  12 Wochen · Grundlagen → Systeme → Design & Tests · wissenschaftliche Quellen & Simulation
                </div>
                {/* Overall progress bar */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ flex: 1, height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                    <div style={{ height: "100%", background: "#f97316", width: `${(planDoneCount / allWeekIds.length) * 100}%`, transition: "width 0.4s" }}></div>
                  </div>
                  <span style={{ fontSize: "10px", color: "#f97316", flexShrink: 0 }}>{planDoneCount} / {allWeekIds.length} Wochen</span>
                </div>
              </div>

              {/* Phases */}
              {PROP_PHASES.map(phase => {
                const phaseDone  = phase.weeks.filter(w => planDone[w.id]).length;
                const isExpanded = expandedPhase === phase.id;
                return (
                  <div key={phase.id} style={{ marginBottom: "10px" }}>
                    {/* Phase header — click to expand/collapse */}
                    <div
                      onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 14px", background: "var(--card)", border: `1px solid ${phase.col}22`,
                        borderRadius: "4px", cursor: "pointer", transition: "border-color 0.15s",
                      }}
                    >
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: phase.col, flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 700, letterSpacing: "0.5px", color: "var(--accent)" }}>{phase.title}</div>
                        <div style={{ fontSize: "9px", color: "var(--muted2)", marginTop: "2px" }}>{phase.weeks.length} Wochen</div>
                      </div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <div style={{ height: "2px", width: "60px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
                          <div style={{ height: "100%", background: phase.col, width: `${(phaseDone / phase.weeks.length) * 100}%` }}></div>
                        </div>
                        <span style={{ fontSize: "9px", color: phase.col }}>{phaseDone}/{phase.weeks.length}</span>
                        <span style={{ fontSize: "10px", color: "var(--muted2)" }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>

                    {/* Week list */}
                    {isExpanded && (
                      <div style={{ borderLeft: `2px solid ${phase.col}33`, marginLeft: "14px", paddingLeft: "14px", marginTop: "6px" }}>
                        {phase.weeks.map(week => (
                          <div key={week.id} className="card" style={{
                            marginBottom: "8px", borderColor: planDone[week.id] ? `${phase.col}44` : "var(--border)",
                            opacity: planDone[week.id] ? 0.6 : 1, transition: "opacity 0.2s",
                          }}>
                            <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                              {/* Checkbox */}
                              <div
                                className="checkbox"
                                style={{
                                  marginTop: "2px", flexShrink: 0, cursor: "pointer",
                                  borderColor: planDone[week.id] ? phase.col : "var(--border2)",
                                  background: planDone[week.id] ? phase.col : "transparent",
                                }}
                                onClick={() => togglePlan(week.id)}
                              >
                                {planDone[week.id] ? "✓" : ""}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", gap: "8px", alignItems: "baseline", marginBottom: "6px" }}>
                                  <span style={{ fontSize: "9px", color: phase.col, fontFamily: "var(--mono)" }}>{week.week}</span>
                                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)", letterSpacing: "0.3px" }}>
                                    {week.title}
                                  </span>
                                </div>
                                {/* Topics */}
                                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                                  {week.topics.map(topic => (
                                    <span key={topic} style={{
                                      fontSize: "9px", color: "var(--muted2)", padding: "2px 6px",
                                      border: "1px solid var(--border)", borderRadius: "2px",
                                    }}>
                                      {topic}
                                    </span>
                                  ))}
                                </div>
                                {/* Resources */}
                                <div style={{ fontSize: "9px", color: "var(--muted2)", lineHeight: 1.6 }}>
                                  <span style={{ color: phase.col }}>→ </span>
                                  {week.resources.join(" · ")}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Resources section */}
              <div style={{ marginTop: "24px" }}>
                <div className="sec-label">Ressourcen & Quellen</div>
                {PROP_RESOURCES.map(cat => (
                  <div key={cat.cat} style={{ marginBottom: "14px" }}>
                    <div style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 700, color: cat.col, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                      {cat.cat}
                    </div>
                    {cat.items.map(item => (
                      <div key={item.title} className="card" style={{ marginBottom: "6px", borderColor: `${cat.col}1a`, padding: "10px 14px" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "8px" }}>
                          <div style={{ flex: 1 }}>
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, color: cat.col, textDecoration: "none" }}
                              >
                                {item.title} ↗
                              </a>
                            ) : (
                              <span style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, color: cat.col }}>{item.title}</span>
                            )}
                            <div style={{ fontSize: "9px", color: "var(--muted2)", marginTop: "1px" }}>{item.author}</div>
                            <div style={{ fontSize: "10px", color: "var(--muted2)", marginTop: "4px", lineHeight: 1.5 }}>{item.note}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── GITHUB ── */}
      {tab === "github" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700 }}>lucy3000</div>
            <a href="https://github.com/lucy3000" target="_blank" rel="noopener noreferrer"
              style={{ fontSize: "10px", color: "var(--muted2)", textDecoration: "none", border: "1px solid var(--border)", padding: "4px 10px", borderRadius: "2px" }}>
              github.com/lucy3000 ↗
            </a>
          </div>
          {GITHUB_REPOS.map(repo => (
            <div key={repo.name} className="card" style={{ marginBottom: "8px", borderColor: `${repo.col}1a` }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: "8px", marginBottom: "6px" }}>
                <a href={repo.url} target="_blank" rel="noopener noreferrer"
                  style={{ fontFamily: "var(--mono)", fontSize: "12px", fontWeight: 700, color: repo.col, textDecoration: "none" }}>
                  {repo.name} ↗
                </a>
                <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "2px", border: `1px solid ${repo.status === "aktiv" ? "#4ade8044" : "var(--border)"}`, color: repo.status === "aktiv" ? "#4ade80" : "var(--muted2)", marginLeft: "auto", flexShrink: 0 }}>
                  {repo.status}
                </span>
              </div>
              <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "8px", lineHeight: "1.5" }}>{repo.desc}</div>
              <div style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "9px", color: repo.col, padding: "1px 5px", border: `1px solid ${repo.col}33`, borderRadius: "2px" }}>{repo.lang}</span>
                {repo.tags.map(tag => (
                  <span key={tag} style={{ fontSize: "9px", color: "var(--muted2)", padding: "1px 5px", border: "1px solid var(--border)", borderRadius: "2px" }}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
