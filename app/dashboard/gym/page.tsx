"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const GYM: Record<string, any> = {
  a: {
    tag: "TAG A",
    day: "Mittwoch",
    title: "Push + Beine",
    sub: "Brust · Schultern · Trizeps · Beine (leicht)",
    col: "#4ade80",
    warn: "Gewichte LEICHTER als normal! Boxen um 18:00.",
    sections: [
      { name: "Warm-Up", exs: [["Rudergerät", "1", "5 min", "—"], ["Aufwärmsatz Bankdrücken", "2", "15 Wdh", "50%"]] },
      { name: "Push — Oberkörper", exs: [["Bankdrücken (Langhantel)", "4", "6–8 Wdh", "Mittel"], ["Militärpress (Langhantel)", "3", "8 Wdh", "Mittel"], ["Trizeps Pushdown (Kabel)", "3", "12 Wdh", "Leicht"]] },
      { name: "Beine — Leicht", exs: [["Front Squat (Langhantel)", "3", "8 Wdh", "Mittel"], ["Hip Thrust (Langhantel)", "3", "10 Wdh", "Mittel"], ["Leg Press (Maschine)", "3", "12 Wdh", "Mittel"]] },
      { name: "Core Finisher", exs: [["Pallof Press (Kabel)", "2", "12 je Seite", "Leicht"], ["Hollow Body Hold", "2", "20 Sek", "—"]] },
    ],
  },
  b: {
    tag: "TAG B",
    day: "Freitag",
    title: "Pull + Beine",
    sub: "Rücken · Bizeps · Beine (schwer) · Core",
    col: "#f97316",
    warn: null,
    sections: [
      { name: "Warm-Up", exs: [["Rudergerät", "1", "5 min", "—"], ["Klimmzüge Aufwärmsatz", "2", "5 Wdh", "—"]] },
      { name: "Pull — Rücken & Bizeps", exs: [["Klimmzüge (Gewichtet)", "4", "5–6 Wdh", "Schwer"], ["Kreuzheben (Langhantel)", "4", "5 Wdh", "Schwer"], ["Pendlay Row", "3", "6 Wdh", "Schwer"], ["Face Pull (Kabel)", "3", "15 Wdh", "Leicht"]] },
      { name: "Beine — Schwer", exs: [["Back Squat (Langhantel)", "4", "5 Wdh", "Schwer"], ["Rumänisches Kreuzheben", "3", "8 Wdh", "Schwer"], ["Hip Thrust (Langhantel)", "4", "8 Wdh", "Schwer"], ["Bulgarische Split Squats", "3", "10 je Bein", "Mittel"]] },
      { name: "Core Power", exs: [["Kabelrotation (stehend)", "3", "12 je Seite", "Mittel"], ["Ab-Wheel Rollout", "3", "10 Wdh", "—"]] },
    ],
  },
};

const LOAD_COLS: Record<string, string> = { Schwer: "#4ade80", Mittel: "#888", Leicht: "#555", "—": "#444", "50%": "#555" };

export default function GymPage() {
  const searchParams = useSearchParams();
  const [activeGym, setActiveGym] = useState(searchParams.get("tab") || "a");
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try { return JSON.parse(localStorage.getItem("gym-checked") || "{}"); } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem("gym-checked", JSON.stringify(checked));
  }, [checked]);

  const g = GYM[activeGym];
  const totalEx = g.sections.reduce((a: number, s: any) => a + s.exs.length, 0);
  const doneEx = g.sections.reduce((a: number, s: any, si: number) => a + s.exs.filter((_: any, ei: number) => checked[`${activeGym}-${si}-${ei}`]).length, 0);
  const pct = totalEx ? Math.round((doneEx / totalEx) * 100) : 0;

  return (
    <div className="page">
      <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
        {["a", "b"].map((id: any) => (
          <button
            key={id}
            className={`gym-tab ${activeGym === id ? "active" : ""}`}
            style={activeGym === id ? { borderColor: GYM[id].col, color: GYM[id].col, background: `${GYM[id].col}15` } : {}}
            onClick={() => setActiveGym(id)}
          >
            {GYM[id].tag}
          </button>
        ))}
      </div>
      <div className="page-title">{g.title}</div>
      <div className="page-sub">{g.sub}</div>
      {g.warn && <div style={{ color: "#f59e0b", fontSize: "12px", marginBottom: "12px" }}>⚠️ {g.warn}</div>}
      <div style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "12px" }}>
        Fortschritt: {doneEx}/{totalEx} ({pct}%)
      </div>
      {g.sections.map((section: any, si: number) => (
        <div key={section.name}>
          <div className="sec-div">{section.name}</div>
          <div className="card" style={{ padding: "0", overflow: "hidden", marginBottom: "4px" }}>
            {section.exs.map(([name, sets, , load]: [string, string, string, string], ei: number) => {
              const key = `${activeGym}-${si}-${ei}`;
              const done = !!checked[key];
              const lc = LOAD_COLS[load] || "#555";
              return (
                <div 
                  key={key} 
                  className={`ex-row ${done ? "done" : ""}`} 
                  onClick={() => setChecked((prev: any) => ({ ...prev, [key]: !prev[key] }))}
                  style={{ cursor: "pointer" }}
                >
                  <div className="checkbox" style={{ borderColor: done ? g.col : "#333", background: done ? g.col : "transparent", cursor: "pointer" }}>
                    {done ? "✓" : ""}
                  </div>
                  <div className={`ex-name ${done ? "done" : ""}`} style={{ cursor: "pointer" }}>{name}</div>
                  <div className="ex-sets" style={{ color: g.col, cursor: "pointer" }}>{sets}×</div>
                  {load !== "—" && (
                    <span 
                      className="load-badge" 
                      style={{ color: lc, borderColor: `${lc}44`, background: `${lc}11`, cursor: "pointer" }}
                    >
                      {load}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
