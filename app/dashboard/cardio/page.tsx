"use client";

const RUNS = [
  {
    day: "Montag",
    type: "Easy Run",
    dur: "40 min",
    int: "Locker",
    col: "#60a5fa",
    desc: "Puls ~130–140. Vor dem Boxabend — sanft bleiben.",
    why: "Bereitet den Körper für Boxen abends vor.",
    tips: ["Morgens nüchtern oder leichtes Frühstück", "Atemrhythmus: 3 Schritte ein, 2 aus", "Flaches Gelände"],
  },
  {
    day: "Donnerstag",
    type: "Intervalle",
    dur: "30 min",
    int: "Hart",
    col: "#ef4444",
    desc: "8× (1 min Sprint / 1 min Gehen) + 5 min Warm-up + 5 min Cool-down.",
    why: "VO2max steigt = mehr Luft in den letzten Runden.",
    tips: ["Sprint: 85–90% Maximalpuls", "Nicht komplett stehenbleiben in Pause", "Auch auf Laufband möglich"],
  },
  {
    day: "Samstag",
    type: "Long Run",
    dur: "50–60 min",
    int: "Mittel",
    col: "#4ade80",
    desc: "Gleichmäßiges, mittleres Tempo. Puls ~140–155.",
    why: "Aerobe Basis aufbauen für alle 3 Runden.",
    tips: ["Nach dem Bäcker: erst essen, 1h warten", "Hügel einbauen für Beinkraft", "Musik oder Podcast erlaubt"],
  },
];

export default function CardioPage() {
  return (
    <div className="page">
      <div className="page-title">Jogging & Cardio</div>
      <div className="page-sub">3× pro Woche</div>
      {RUNS.map((r) => (
        <div key={r.day} className="card">
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
            <div style={{ color: r.col, fontWeight: "700" }}>{r.type}</div>
            <div style={{ fontSize: "11px", color: r.col }}>{r.dur}</div>
          </div>
          <div style={{ fontSize: "12px", marginBottom: "4px" }}>{r.day}</div>
          <div style={{ fontSize: "11px", color: "var(--muted)" }}>{r.desc}</div>
          <div style={{ fontSize: "10px", color: "var(--muted2)", marginTop: "6px" }}>💡 {r.why}</div>
          {r.tips.length > 0 && (
            <div style={{ fontSize: "10px", color: "var(--muted2)", marginTop: "4px" }}>
              <div>💪 Tipps:</div>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {r.tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
