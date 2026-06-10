"use client";

import { useState, useEffect } from "react";

const SESSIONS = [
  {
    id: "mon",
    day: "Montag",
    time: "18:00",
    focus: "Technik + Kondition",
    col: "#e30600",
    drills: [
      { id: "m1", text: "Seilspringen — 3× 3 min" },
      { id: "m2", text: "Schattenboxen — 3× 2 min" },
      { id: "m3", text: "Sandsack — 4× 3 min" },
      { id: "m4", text: "Pratzen — 3× 3 min" },
      { id: "m5", text: "Stretching 10 min" },
    ],
  },
  {
    id: "wed",
    day: "Mittwoch",
    time: "18:00",
    focus: "Sparring + Kraft",
    col: "#c41230",
    drills: [
      { id: "w1", text: "Aufwärmen Seilspringen — 2× 3 min" },
      { id: "w2", text: "Technikarbeit Pratzen — 3× 3 min" },
      { id: "w3", text: "Sparring — 3× 3 min" },
      { id: "w4", text: "Körper-Kondition Übungen" },
      { id: "w5", text: "Cool-down + Stretching" },
    ],
  },
];

const TECHNIQUES = [
  { id: "t1", name: "Jab–Cross", cat: "Kombos", level: "Basis" },
  { id: "t2", name: "Jab–Cross–Hook", cat: "Kombos", level: "Basis" },
  { id: "t3", name: "Jab–Cross–Hook–Uppercut", cat: "Kombos", level: "Mittel" },
  { id: "t4", name: "Body–Jab–Head", cat: "Kombos", level: "Mittel" },
  { id: "t5", name: "Slip außen", cat: "Defense", level: "Basis" },
  { id: "t6", name: "Slip innen + Counter", cat: "Defense", level: "Mittel" },
  { id: "t7", name: "Roll under + Hook", cat: "Defense", level: "Mittel" },
  { id: "t8", name: "Pivot + Jab", cat: "Footwork", level: "Mittel" },
];

const LEVEL_COL: Record<string, string> = { Basis: "#4ade80", Mittel: "#f59e0b", Schwer: "#ef4444" };

export default function BoxingPage() {
  const [done, setDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("box-done") || "{}"); } catch { return {}; }
  });
  const [techDone, setTechDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("box-tech") || "{}"); } catch { return {}; }
  });
  const [activeTab, setActiveTab] = useState<"mon" | "wed">("mon");

  useEffect(() => { localStorage.setItem("box-done", JSON.stringify(done)); }, [done]);
  useEffect(() => { localStorage.setItem("box-tech", JSON.stringify(techDone)); }, [techDone]);

  const toggle = (id: string) => setDone(p => ({ ...p, [id]: !p[id] }));
  const toggleTech = (id: string) => setTechDone(p => ({ ...p, [id]: !p[id] }));

  const session = SESSIONS.find(s => s.id === activeTab)!;
  const doneCount = session.drills.filter(d => done[d.id]).length;

  const cats = [...new Set(TECHNIQUES.map(t => t.cat))];
  const techMastered = TECHNIQUES.filter(t => techDone[t.id]).length;

  return (
    <div className="page">
      <div className="page-title">Boxen</div>
      <div className="page-sub">2× pro Woche · Mo + Mi 18:00 · {techMastered}/{TECHNIQUES.length} Techniken gemeistert</div>

      {/* ── Session tabs ── */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        {SESSIONS.map(s => (
          <button
            key={s.id}
            className="gym-tab"
            style={activeTab === s.id ? { borderColor: s.col, color: s.col, background: `${s.col}15` } : {}}
            onClick={() => setActiveTab(s.id as "mon" | "wed")}
          >
            {s.day}
          </button>
        ))}
      </div>

      {/* ── Session detail ── */}
      <div className="card" style={{ borderColor: `${session.col}33`, marginBottom: "10px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
          <div>
            <span className="tag" style={{ color: session.col, borderColor: `${session.col}44`, background: `${session.col}11` }}>
              {session.time}
            </span>
            <span style={{ fontFamily: "var(--display)", fontSize: "14px", fontWeight: 700, marginLeft: "8px", fontStyle: "italic" }}>
              {session.focus}
            </span>
          </div>
          <span style={{ fontSize: "11px", color: session.col, fontWeight: 700 }}>
            {doneCount}/{session.drills.length}
          </span>
        </div>

        <div style={{ height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden", marginBottom: "10px" }}>
          <div style={{ height: "100%", background: session.col, width: `${(doneCount / session.drills.length) * 100}%`, transition: "width 0.5s" }}></div>
        </div>

        {session.drills.map(d => (
          <div
            key={d.id}
            className={`technique-row ${done[d.id] ? "done" : ""}`}
            onClick={() => toggle(d.id)}
          >
            <div
              className="checkbox"
              style={{
                borderColor: done[d.id] ? session.col : "var(--border2)",
                background: done[d.id] ? session.col : "transparent",
              }}
            >
              {done[d.id] ? "✓" : ""}
            </div>
            <span style={{ fontSize: "11px" }}>{d.text}</span>
          </div>
        ))}
      </div>

      {/* ── Technique library ── */}
      <div className="sec-label">Technik-Bibliothek</div>
      {cats.map(cat => (
        <div key={cat} style={{ marginBottom: "8px" }}>
          <div className="sec-div">{cat}</div>
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            {TECHNIQUES.filter(t => t.cat === cat).map(t => (
              <div
                key={t.id}
                className={`technique-row ${techDone[t.id] ? "done" : ""}`}
                onClick={() => toggleTech(t.id)}
              >
                <div
                  className="checkbox"
                  style={{
                    borderColor: techDone[t.id] ? LEVEL_COL[t.level] : "var(--border2)",
                    background: techDone[t.id] ? LEVEL_COL[t.level] : "transparent",
                  }}
                >
                  {techDone[t.id] ? "✓" : ""}
                </div>
                <span style={{ fontSize: "11px", flex: 1 }}>{t.name}</span>
                <span style={{
                  fontSize: "8px", padding: "1px 5px", borderRadius: "2px",
                  border: `1px solid ${LEVEL_COL[t.level]}44`,
                  color: LEVEL_COL[t.level], background: `${LEVEL_COL[t.level]}11`,
                }}>
                  {t.level}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
