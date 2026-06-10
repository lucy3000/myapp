"use client";

const DAYS_DE = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

const EV_COLORS: Record<string, string> = {
  uni: "#3b82f6",
  box: "#ef4444",
  gym: "#4ade80",
  run: "#22d3ee",
  bears: "#a78bfa",
  work: "#f59e0b",
  rest: "#444",
  es: "#f97316",
  ru: "#60a5fa",
};

const WEEK = [
  { d: "Mo", full: "Montag",     ev: [["🏃 Easy Run 40min", "run"], ["Uni KL1+Mechanik", "uni"], ["🥊 Boxen 18:00", "box"], ["🇪🇸 Spanisch 30min", "es"]] },
  { d: "Di", full: "Dienstag",   ev: [["Uni Mechanik+KL1 Tut", "uni"], ["Bears 16–21", "bears"], ["🇷🇺 Russisch 30min", "ru"]] },
  { d: "Mi", full: "Mittwoch",   ev: [["🏋️ GYM A (leicht)", "gym"], ["Uni DGL VL", "uni"], ["🥊 Boxen 18:00", "box"], ["🇪🇸 Spanisch 30min", "es"]] },
  { d: "Do", full: "Donnerstag", ev: [["🏃 Intervalle 30min", "run"], ["Uni Mechanik VL", "uni"], ["Bears 16–22", "bears"], ["🇷🇺 Russisch 30min", "ru"]] },
  { d: "Fr", full: "Freitag",    ev: [["🏋️ GYM B (schwer)", "gym"], ["🇪🇸 Spanisch 30min", "es"]] },
  { d: "Sa", full: "Samstag",    ev: [["Bäcker 7–11", "work"], ["🏃 Long Run 50min", "run"]] },
  { d: "So", full: "Sonntag",    ev: [["Ruhetag 💤", "rest"], ["🇷🇺 Russisch 30min", "ru"]] },
];

export default function TimetablePage() {
  const todayD = DAYS_DE[new Date().getDay()];

  return (
    <div className="page">
      <div className="page-title">Wochenplan</div>
      <div className="page-sub">Aktuelle Woche</div>
      {WEEK.map((d) => (
        <div key={d.d} className={`week-row ${d.d === todayD ? "today" : ""}`}>
          <div className="day-label">
            <div className="day-short">{d.d}</div>
            <div className="day-full">{d.full}</div>
          </div>
          <div className="events-wrap">
            {d.ev.map((item: any) => (
              <div key={item[0]} className="event-chip" style={{ color: EV_COLORS[item[1]] }}>
                {item[0]}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
