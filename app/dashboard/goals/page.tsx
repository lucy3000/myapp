"use client";

const GOALS = [
  { name: "Bankdrücken", cur: "70 kg", tgt: "100 kg", pct: 70, col: "#4ade80" },
  { name: "Kreuzheben", cur: "90 kg", tgt: "140 kg", pct: 64, col: "#f97316" },
  { name: "Back Squat", cur: "80 kg", tgt: "120 kg", pct: 67, col: "#60a5fa" },
  { name: "Hip Thrust", cur: "60 kg", tgt: "100 kg", pct: 60, col: "#f59e0b" },
];

export default function GoalsPage() {
  return (
    <div className="page">
      <div className="page-title">Gewichtsziele</div>
      <div className="page-sub">Kraftziele für 2026</div>
      <div className="grid2">
        {GOALS.map((g) => (
          <div key={g.name} className="card">
            <div style={{ color: g.col, fontWeight: "700", marginBottom: "8px" }}>{g.name}</div>
            <div style={{ fontSize: "12px", marginBottom: "6px" }}>
              <strong>{g.cur}</strong> → <span style={{ color: g.col }}>{g.tgt}</span>
            </div>
            <div style={{ fontSize: "10px", marginBottom: "6px" }}>
              Fortschritt: <strong>{g.pct}%</strong>
            </div>
            <div style={{ height: "4px", background: "#222", borderRadius: "2px", overflow: "hidden" }}>
              <div
                style={{
                  height: "100%",
                  background: g.col,
                  width: `${g.pct}%`,
                  transition: "width 0.3s ease",
                }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
