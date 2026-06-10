export const runtime = "nodejs";

const EXAMS = [
  { sub: "Mechanik 2", label: "KFT",         date: "2026-06-05" },
  { sub: "KL1",        label: "HA3",          date: "2026-06-07" },
  { sub: "DGL",        label: "Zwischentest", date: "2026-06-12" },
  { sub: "KL1",        label: "HA4",          date: "2026-06-21" },
  { sub: "ITP",        label: "Abgabe dts",   date: "2026-07-03" },
  { sub: "KL1",        label: "HA5",          date: "2026-07-05" },
  { sub: "ITP",        label: "Test",         date: "2026-07-14" },
  { sub: "DGL",        label: "Prüfung",      date: "2026-07-21" },
  { sub: "Ana2",       label: "Prüfung",      date: "2026-07-23" },
  { sub: "KL1",        label: "Test",         date: "2026-08-03" },
];

const TIPS = [
  "Starte eine 25-min Pomodoro-Session!",
  "Active Recall: Stoff ohne Notizen aus dem Kopf aufschreiben.",
  "Interleaving: Wechsle heute zwischen zwei Fächern.",
  "Kurze Session > keine Session. Los geht's!",
  "Spaced Repetition: Was hast du vor 3 Tagen gelernt — erinnerst du dich noch?",
  "Mock-Klausur: Löse 3 alte Aufgaben unter Klausurbedingungen.",
  "Schlaf gut — Gedächtnis wird im Schlaf konsolidiert.",
];

export async function GET() {
  const now = new Date();
  const urgent = EXAMS
    .map(e => ({ ...e, days: Math.ceil((new Date(e.date).getTime() - now.getTime()) / 86400000) }))
    .filter(e => e.days >= 0 && e.days <= 7)
    .sort((a, b) => a.days - b.days);

  const soon = EXAMS
    .map(e => ({ ...e, days: Math.ceil((new Date(e.date).getTime() - now.getTime()) / 86400000) }))
    .filter(e => e.days >= 0 && e.days <= 21)
    .sort((a, b) => a.days - b.days);

  let message: string;
  let title: string;
  let urgent_flag = false;

  if (urgent.length > 0) {
    const e = urgent[0];
    title = `⚠️  ${e.sub} — ${e.label}`;
    message = `Noch ${e.days} Tag${e.days === 1 ? "" : "e"}! Öffne den Lernplan auf http://localhost:3000`;
    urgent_flag = true;
  } else if (soon.length > 0) {
    const e = soon[0];
    title = `📚  Life OS — Lernerinnerung`;
    message = `${e.sub} ${e.label} in ${e.days} Tagen. Starte jetzt eine Pomodoro-Session!`;
  } else {
    title = "📚  Life OS — Lernzeit!";
    message = TIPS[now.getHours() % TIPS.length];
  }

  return Response.json({
    title,
    message,
    urgent: urgent_flag,
    next: soon[0] ?? null,
    timestamp: now.toISOString(),
  });
}
