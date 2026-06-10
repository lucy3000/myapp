"use client";

import { useState, useEffect } from "react";

// ── Data ──────────────────────────────────────────────────────────────────────

const GYM: Record<string, any> = {
  a: {
    tag: "TAG A", day: "Mittwoch", title: "Push + Beine",
    sub: "Brust · Schultern · Trizeps · Beine (leicht)", col: "#4ade80",
    warn: "Gewichte LEICHTER — Boxen um 18:00.",
    sections: [
      { name: "Warm-Up", exs: [["Rudergerät", "1", "5 min", "—"], ["Aufwärmsatz Bankdrücken", "2", "15 Wdh", "50%"]] },
      { name: "Push — Oberkörper", exs: [["Bankdrücken (Langhantel)", "4", "6–8 Wdh", "Mittel"], ["Militärpress (Langhantel)", "3", "8 Wdh", "Mittel"], ["Trizeps Pushdown (Kabel)", "3", "12 Wdh", "Leicht"]] },
      { name: "Beine — Leicht", exs: [["Front Squat (Langhantel)", "3", "8 Wdh", "Mittel"], ["Hip Thrust (Langhantel)", "3", "10 Wdh", "Mittel"], ["Leg Press (Maschine)", "3", "12 Wdh", "Mittel"]] },
      { name: "Core Finisher", exs: [["Pallof Press (Kabel)", "2", "12 je Seite", "Leicht"], ["Hollow Body Hold", "2", "20 Sek", "—"]] },
    ],
  },
  b: {
    tag: "TAG B", day: "Freitag", title: "Pull + Beine",
    sub: "Rücken · Bizeps · Beine (schwer) · Core", col: "#f97316",
    warn: null,
    sections: [
      { name: "Warm-Up", exs: [["Rudergerät", "1", "5 min", "—"], ["Klimmzüge Aufwärmsatz", "2", "5 Wdh", "—"]] },
      { name: "Pull — Rücken & Bizeps", exs: [["Klimmzüge (Gewichtet)", "4", "5–6 Wdh", "Schwer"], ["Kreuzheben (Langhantel)", "4", "5 Wdh", "Schwer"], ["Pendlay Row", "3", "6 Wdh", "Schwer"], ["Face Pull (Kabel)", "3", "15 Wdh", "Leicht"]] },
      { name: "Beine — Schwer", exs: [["Back Squat (Langhantel)", "4", "5 Wdh", "Schwer"], ["Rumänisches Kreuzheben", "3", "8 Wdh", "Schwer"], ["Hip Thrust (Langhantel)", "4", "8 Wdh", "Schwer"], ["Bulgarische Split Squats", "3", "10 je Bein", "Mittel"]] },
      { name: "Core Power", exs: [["Kabelrotation (stehend)", "3", "12 je Seite", "Mittel"], ["Ab-Wheel Rollout", "3", "10 Wdh", "—"]] },
    ],
  },
};

const LOAD_COLS: Record<string, string> = { Schwer: "#4ade80", Mittel: "#52526a", Leicht: "#2a2a3a", "—": "#1e1e2a", "50%": "#2a2a3a" };

const BOX_SESSIONS = [
  {
    id: "mon", day: "Montag", time: "18:00", focus: "Technik + Kondition", col: "#a0a0ff",
    drills: [
      { id: "m1", text: "Seilspringen — 3× 3 min" },
      { id: "m2", text: "Schattenboxen — 3× 2 min" },
      { id: "m3", text: "Sandsack — 4× 3 min" },
      { id: "m4", text: "Pratzen — 3× 3 min" },
      { id: "m5", text: "Stretching 10 min" },
    ],
  },
  {
    id: "wed", day: "Mittwoch", time: "18:00", focus: "Sparring + Kraft", col: "#8888ff",
    drills: [
      { id: "w1", text: "Seilspringen — 2× 3 min" },
      { id: "w2", text: "Pratzen Technik — 3× 3 min" },
      { id: "w3", text: "Sparring — 3× 3 min" },
      { id: "w4", text: "Konditionsübungen" },
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

const RUNS = [
  { day: "Montag", type: "Easy Run", dur: "40 min", int: "Locker", col: "#60a5fa", desc: "Puls ~130–140. Vor dem Boxabend — sanft bleiben.", tips: ["Morgens nüchtern", "Atemrhythmus 3:2", "Flaches Gelände"] },
  { day: "Donnerstag", type: "Intervalle", dur: "30 min", int: "Hart", col: "#ef4444", desc: "8× (1 min Sprint / 1 min Gehen) + 5 min Warm-up + Cool-down.", tips: ["Sprint: 85–90% Maxpuls", "Nicht komplett stehenbleiben", "Auch Laufband möglich"] },
  { day: "Samstag", type: "Long Run", dur: "50–60 min", int: "Mittel", col: "#22d3ee", desc: "Gleichmäßiges Tempo. Puls ~140–155.", tips: ["1h nach Essen warten", "Hügel für Beinkraft", "Musik erlaubt"] },
];

const GOALS = [
  { name: "Bankdrücken", cur: "70 kg", tgt: "100 kg", pct: 70, col: "#4ade80" },
  { name: "Kreuzheben", cur: "90 kg", tgt: "140 kg", pct: 64, col: "#f97316" },
  { name: "Back Squat", cur: "80 kg", tgt: "120 kg", pct: 67, col: "#60a5fa" },
  { name: "Hip Thrust", cur: "60 kg", tgt: "100 kg", pct: 60, col: "#f59e0b" },
];

// ── Component ─────────────────────────────────────────────────────────────────

type Tab = "gym" | "boxen" | "laufen" | "ziele";

export default function SportPage() {
  const [tab, setTab] = useState<Tab>("gym");
  const [gymTag, setGymTag] = useState<"a" | "b">("a");
  const [boxSession, setBoxSession] = useState<"mon" | "wed">("mon");

  const [gymChecked, setGymChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("gym-checked") || "{}"); } catch { return {}; }
  });
  const [boxDone, setBoxDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("box-done") || "{}"); } catch { return {}; }
  });
  const [techDone, setTechDone] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("box-tech") || "{}"); } catch { return {}; }
  });

  useEffect(() => { localStorage.setItem("gym-checked", JSON.stringify(gymChecked)); }, [gymChecked]);
  useEffect(() => { localStorage.setItem("box-done", JSON.stringify(boxDone)); }, [boxDone]);
  useEffect(() => { localStorage.setItem("box-tech", JSON.stringify(techDone)); }, [techDone]);

  const toggleGym = (key: string) => setGymChecked(p => ({ ...p, [key]: !p[key] }));
  const toggleBox = (id: string) => setBoxDone(p => ({ ...p, [id]: !p[id] }));
  const toggleTech = (id: string) => setTechDone(p => ({ ...p, [id]: !p[id] }));

  const TABS: { id: Tab; label: string }[] = [
    { id: "gym", label: "Gym" },
    { id: "boxen", label: "Boxen" },
    { id: "laufen", label: "Laufen" },
    { id: "ziele", label: "Kraftziele" },
  ];

  return (
    <div className="page">
      <div className="page-title">Sport</div>
      <div className="page-sub">Gym · Boxen · Laufen · Kraftziele</div>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", gap: "0", marginBottom: "20px", borderBottom: "1px solid var(--border)" }}>
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px", background: "transparent", cursor: "pointer",
              fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 600,
              letterSpacing: "1px", textTransform: "uppercase",
              color: tab === t.id ? "var(--accent)" : "var(--muted2)",
              borderBottom: tab === t.id ? "1px solid var(--accent)" : "1px solid transparent",
              border: "none", borderRadius: 0, marginBottom: "-1px",
              transition: "color 0.15s",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── GYM ── */}
      {tab === "gym" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {(["a", "b"] as const).map(id => (
              <button
                key={id}
                className="gym-tab"
                style={gymTag === id ? { borderColor: GYM[id].col, color: GYM[id].col } : {}}
                onClick={() => setGymTag(id)}
              >
                {GYM[id].tag}
              </button>
            ))}
          </div>

          {(() => {
            const g = GYM[gymTag];
            const total = g.sections.reduce((a: number, s: any) => a + s.exs.length, 0);
            const done = g.sections.reduce((a: number, s: any, si: number) =>
              a + s.exs.filter((_: any, ei: number) => gymChecked[`${gymTag}-${si}-${ei}`]).length, 0);
            const pct = total ? Math.round((done / total) * 100) : 0;
            return (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700, marginBottom: "2px" }}>{g.title}</div>
                  <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "8px" }}>{g.sub} · {g.day}</div>
                  {g.warn && <div className="warn-box">⚠ {g.warn}</div>}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "2px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: g.col, width: `${pct}%`, transition: "width 0.5s" }}></div>
                    </div>
                    <span style={{ fontSize: "10px", color: g.col, fontWeight: 700 }}>{done}/{total}</span>
                  </div>
                </div>
                {g.sections.map((section: any, si: number) => (
                  <div key={section.name}>
                    <div className="sec-div">{section.name}</div>
                    <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "4px" }}>
                      {section.exs.map(([name, sets, , load]: string[], ei: number) => {
                        const key = `${gymTag}-${si}-${ei}`;
                        const isDone = !!gymChecked[key];
                        const lc = LOAD_COLS[load] || "var(--muted)";
                        return (
                          <div key={key} className={`ex-row ${isDone ? "done" : ""}`} onClick={() => toggleGym(key)}>
                            <div className="checkbox" style={{ borderColor: isDone ? g.col : "var(--border2)", background: isDone ? g.col : "transparent" }}>
                              {isDone ? "✓" : ""}
                            </div>
                            <div className={`ex-name ${isDone ? "done" : ""}`}>{name}</div>
                            <div className="ex-sets" style={{ color: g.col }}>{sets}×</div>
                            {load !== "—" && (
                              <span className="load-badge" style={{ color: lc, borderColor: `${lc}66` }}>{load}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </>
            );
          })()}
        </div>
      )}

      {/* ── BOXEN ── */}
      {tab === "boxen" && (
        <div>
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            {BOX_SESSIONS.map(s => (
              <button
                key={s.id}
                className="gym-tab"
                style={boxSession === s.id ? { borderColor: s.col, color: s.col } : {}}
                onClick={() => setBoxSession(s.id as "mon" | "wed")}
              >
                {s.day}
              </button>
            ))}
          </div>

          {(() => {
            const s = BOX_SESSIONS.find(x => x.id === boxSession)!;
            const done = s.drills.filter(d => boxDone[d.id]).length;
            return (
              <>
                <div style={{ marginBottom: "12px" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700, marginBottom: "2px" }}>{s.focus}</div>
                  <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "8px" }}>{s.day} · {s.time}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ flex: 1, height: "2px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
                      <div style={{ height: "100%", background: s.col, width: `${(done / s.drills.length) * 100}%`, transition: "width 0.5s" }}></div>
                    </div>
                    <span style={{ fontSize: "10px", color: s.col, fontWeight: 700 }}>{done}/{s.drills.length}</span>
                  </div>
                </div>
                <div className="card" style={{ padding: 0, overflow: "hidden", marginBottom: "16px" }}>
                  {s.drills.map(d => (
                    <div key={d.id} className={`technique-row ${boxDone[d.id] ? "done" : ""}`} onClick={() => toggleBox(d.id)}>
                      <div className="checkbox" style={{ borderColor: boxDone[d.id] ? s.col : "var(--border2)", background: boxDone[d.id] ? s.col : "transparent" }}>
                        {boxDone[d.id] ? "✓" : ""}
                      </div>
                      <span style={{ fontSize: "11px" }}>{d.text}</span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}

          <div className="sec-label">Technik-Bibliothek</div>
          <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "10px" }}>
            {TECHNIQUES.filter(t => techDone[t.id]).length}/{TECHNIQUES.length} gemeistert
          </div>
          {["Kombos", "Defense", "Footwork"].map(cat => (
            <div key={cat} style={{ marginBottom: "8px" }}>
              <div className="sec-div">{cat}</div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {TECHNIQUES.filter(t => t.cat === cat).map(t => (
                  <div key={t.id} className={`technique-row ${techDone[t.id] ? "done" : ""}`} onClick={() => toggleTech(t.id)}>
                    <div className="checkbox" style={{ borderColor: techDone[t.id] ? LEVEL_COL[t.level] : "var(--border2)", background: techDone[t.id] ? LEVEL_COL[t.level] : "transparent" }}>
                      {techDone[t.id] ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: "11px", flex: 1 }}>{t.name}</span>
                    <span style={{ fontSize: "8px", padding: "1px 5px", borderRadius: "2px", border: `1px solid ${LEVEL_COL[t.level]}44`, color: LEVEL_COL[t.level] }}>
                      {t.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── LAUFEN ── */}
      {tab === "laufen" && (
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700, marginBottom: "16px" }}>
            3× pro Woche
          </div>
          {RUNS.map(r => (
            <div key={r.day} className="card" style={{ marginBottom: "10px", borderColor: `${r.col}22` }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <div>
                  <span style={{ color: r.col, fontWeight: 700, fontSize: "12px" }}>{r.type}</span>
                  <span style={{ fontSize: "10px", color: "var(--muted2)", marginLeft: "10px" }}>{r.day}</span>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "9px", padding: "1px 6px", borderRadius: "2px", border: `1px solid ${r.col}44`, color: r.col }}>{r.int}</span>
                  <span style={{ fontSize: "11px", color: r.col, fontWeight: 700 }}>{r.dur}</span>
                </div>
              </div>
              <div style={{ fontSize: "11px", color: "var(--text)", marginBottom: "8px" }}>{r.desc}</div>
              {r.tips.map((tip, i) => (
                <div key={i} style={{ fontSize: "10px", color: "var(--muted2)", display: "flex", gap: "6px", marginBottom: "2px" }}>
                  <span style={{ color: r.col }}>—</span>{tip}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* ── ZIELE ── */}
      {tab === "ziele" && (
        <div>
          <div style={{ fontFamily: "var(--display)", fontSize: "20px", fontStyle: "italic", fontWeight: 700, marginBottom: "16px" }}>
            Kraftziele 2026
          </div>
          <div className="grid2">
            {GOALS.map(g => (
              <div key={g.name} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                  <div style={{ fontFamily: "var(--display)", fontSize: "14px", fontStyle: "italic", fontWeight: 700 }}>{g.name}</div>
                  <span style={{ fontSize: "11px", color: g.col, fontWeight: 700 }}>{g.pct}%</span>
                </div>
                <div style={{ fontSize: "11px", color: "var(--muted2)", marginBottom: "8px" }}>
                  {g.cur} <span style={{ color: "var(--border2)" }}>→</span> <span style={{ color: g.col }}>{g.tgt}</span>
                </div>
                <div style={{ height: "2px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: g.col, width: `${g.pct}%`, transition: "width 0.8s" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
