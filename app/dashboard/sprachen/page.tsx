"use client";

import { useState, useEffect } from "react";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Week {
  id: string;
  week: string;
  title: string;
  topics: string[];
  resources: string[];
}

interface Phase {
  id: string;
  title: string;
  col: string;
  weeks: Week[];
}

// ── Spanish Plan ──────────────────────────────────────────────────────────────

const ES_PHASES: Phase[] = [
  {
    id: "es-p1", title: "Phase 1 — Grundlagen", col: "#f97316",
    weeks: [
      {
        id: "es-w1", week: "Woche 1", title: "Aussprache & Alphabet",
        topics: ["Spanisches Alphabet & Buchstaben", "Vokale: klare, reine Aussprache", "ll, rr, ñ, h, j meistern", "Betonung & Akzentzeichen"],
        resources: ["Language Transfer Spanisch — Audio 1–10 (kostenlos)", "Dreaming Spanish: Komprehensives Input — 1h"],
      },
      {
        id: "es-w2", week: "Woche 2", title: "Presente & Grundvokabular",
        topics: ["Presente de indicativo: -ar, -er, -ir Verben", "ser vs. estar — fundamentaler Unterschied", "100 häufigste spanische Wörter (Anki)", "Zahlen, Farben, Wochentage"],
        resources: ["Language Transfer — Audio 11–25", "Anki: Spanish Top 2000 Words Deck"],
      },
      {
        id: "es-w3", week: "Woche 3", title: "Erste Gespräche",
        topics: ["Begrüßung, Vorstellung, sich verabschieden", "Unregelmäßige Verben: ir, ser, estar, tener, hacer", "Artikel: el/la/los/las", "Pronomen: yo, tú, él/ella, nosotros"],
        resources: ["Language Transfer — Audio 26–40", "Dreaming Spanish Beginner Playlist", "Duolingo (max 15 min/Tag)"],
      },
      {
        id: "es-w4", week: "Woche 4", title: "Alltagssituationen",
        topics: ["Einkaufen, Restaurant, Unterwegs", "Possessivpronomen: mi, tu, su, nuestro", "Gustar-Konstruktion (me gusta...)", "200-Wörter-Test: Was kannst du schon?"],
        resources: ["Language Transfer — Audio 41–50 (Ende!)", "Dreaming Spanish: Intermediate Beginner", "Anki täglich 10–15 Karten"],
      },
    ],
  },
  {
    id: "es-p2", title: "Phase 2 — Kommunikation", col: "#a78bfa",
    weeks: [
      {
        id: "es-w5", week: "Woche 5", title: "Vergangenheit I — Pretérito Indefinido",
        topics: ["Pretérito Indefinido: reguläre Formen", "Unregelmäßige Verben: fui, hice, tuve, dije", "Signalwörter: ayer, la semana pasada, hace...", "Kurze Texte über vergangene Ereignisse schreiben"],
        resources: ["Study Spanish: Preterite Guide (studyspanish.com)", "Spanisch mit Miriam (YouTube) — Pretérito"],
      },
      {
        id: "es-w6", week: "Woche 6", title: "Vergangenheit II — Pretérito Imperfecto",
        topics: ["Pretérito Imperfecto: -aba, -ía Formen", "Indefinido vs. Imperfecto — wann was?", "Erzählungen auf Spanisch: zwei Tempora kombinieren", "Hörverständnis: spanische Podcasts (langsam)"],
        resources: ["Podcast: Españolistos (mittleres Niveau)", "Coffee Break Spanish Staffel 2", "Anki: Verb Conjugation Deck"],
      },
      {
        id: "es-w7", week: "Woche 7", title: "Zukunft & Konditional",
        topics: ["Futuro Simple: -é, -ás, -á...", "Condicional Simple: -ía, -ías...", "Ir a + Infinitivo (nahe Zukunft)", "Wenn-dann-Sätze: Si + Presente + Futuro"],
        resources: ["Dreaming Spanish: Upper Intermediate", "Schreiben: eigene Zukunftspläne auf Spanisch"],
      },
      {
        id: "es-w8", week: "Woche 8", title: "Konversationspraxis",
        topics: ["Tandem-Partner suchen (iTalki, Tandem App)", "Alltägliche Gespräche üben (Café, Reise, Studium)", "Leseverständnis: einfache Artikel auf spanisch", "Eigene Grammatikfehler analysieren"],
        resources: ["italki.com — Community Tutor", "News in Slow Spanish (Podcast)", "El País — einfache Artikel lesen"],
      },
    ],
  },
  {
    id: "es-p3", title: "Phase 3 — Fortgeschritten", col: "#4ade80",
    weeks: [
      {
        id: "es-w9", week: "Woche 9", title: "Subjuntivo — Konjunktiv",
        topics: ["Presente de Subjuntivo bilden", "Verwendung: Wünsche, Emotionen, Zweifel, Empfehlungen", "Que + Subjuntivo Konstruktionen", "Espero que..., Quiero que..., Es importante que..."],
        resources: ["StudySpanish.com — Subjunctive Guide", "Spanisch mit Miriam — Subjuntivo erklärt"],
      },
      {
        id: "es-w10", week: "Woche 10", title: "Komplexe Grammatik",
        topics: ["Reflexive Verben: me llamo, se levanta...", "Por vs. Para — die häufigste Verwechslung", "Ser vs. Estar vertiefen (Zustände vs. Eigenschaften)", "Satzverbindungen: aunque, sin embargo, a pesar de"],
        resources: ["Assimil Spanisch — Lektionen 60–80", "SpanishPod101 Advanced"],
      },
      {
        id: "es-w11", week: "Woche 11", title: "Immersion & Lesen",
        topics: ["Spanisches Buch lesen: Kurzgeschichten (Nivel A2/B1)", "Spanische Serien: La Casa de Papel / Club de Cuervos (Untertitel)", "Täglich 30 min nur Spanisch hören", "Vokabular aus Kontext ableiten — kein Wörterbuch"],
        resources: ["Dreaming Spanish: Intermediate/Advanced", "Serie: Extra en Español (YouTube, perfekt für Lerner)", "Buch: Español en marcha B1"],
      },
      {
        id: "es-w12", week: "Woche 12", title: "Abschluss & Niveau-Test",
        topics: ["DELE A2/B1 Probeklausur (kostenfrei online)", "Freies Schreiben: 300 Wörter ohne Hilfsmittel", "Tandem-Gespräch: 30 min auf Spanisch", "Lernplan für die nächsten 3 Monate erstellen"],
        resources: ["Instituto Cervantes — DELE Probetest", "Tandem App — native speakers", "Cervantes.es Selbsteinstufungstest"],
      },
    ],
  },
];

// ── Russian Plan ──────────────────────────────────────────────────────────────

const RU_PHASES: Phase[] = [
  {
    id: "ru-p1", title: "Phase 1 — Kyrillisch & Grundlagen", col: "#60a5fa",
    weeks: [
      {
        id: "ru-w1", week: "Woche 1", title: "Kyrillisches Alphabet",
        topics: ["Kyrillische Buchstaben in 3 Tagen — Blöcke lernen", "Buchstaben wie Latein: А, Е, О, К, М, Т", "Falsche Freunde: Р=R, Н=N, В=V, С=S, Х=X", "Einfache Wörter lesen üben: Москва, Россия, Привет"],
        resources: ["Russian with Anastasia (YouTube) — Alphabet Playlist", "Anki: Russian Alphabet + Aussprache Deck"],
      },
      {
        id: "ru-w2", week: "Woche 2", title: "Aussprache & erste Sätze",
        topics: ["Vokalreduktion: о→а außerhalb der Betonung", "Konsonantenhärtung & Palatalisierung", "Привет / Здравствуйте / Пока / Спасибо", "Ich bin... / Das ist... / Mein Name ist..."],
        resources: ["Russian with Anastasia — Aussprache Basics", "Russisch Lernen mit Spaß (YouTube)", "Language Transfer Russian (wenn verfügbar)"],
      },
      {
        id: "ru-w3", week: "Woche 3", title: "Grundvokabular & Präsens",
        topics: ["200 häufigste russische Wörter (Anki)", "Verbkonjugation Präsens: говорить, читать, писать", "Zahlen 1–100", "Farben, Wochentage, Monate"],
        resources: ["Anki: Russian Top 1000 Frequency Deck", "LiveRussian (YouTube) — Basic Vocabulary"],
      },
      {
        id: "ru-w4", week: "Woche 4", title: "Kasussystem — Einführung",
        topics: ["6 Kasus verstehen: Nominativ, Genitiv, Dativ, Akkusativ, Instrumental, Präpositional", "Nominativ & Akkusativ zuerst: Subjekt & Objekt", "Maskulin / Feminin / Neutrum / Plural", "Erste einfache Sätze mit Kasus bilden"],
        resources: ["Russian Grammar Table (russianlessons.net)", "Анастасия: Kasus-Playlist"],
      },
    ],
  },
  {
    id: "ru-p2", title: "Phase 2 — Grammatik", col: "#f97316",
    weeks: [
      {
        id: "ru-w5", week: "Woche 5", title: "Kasus I — Genitiv & Dativ",
        topics: ["Genitiv: нет + Genitiv (kein...), nach Zahlen", "Dativ: Richtung zu jemandem; mir gefällt (мне нравится)", "Deklinationstabellen Substantive (м/ж/н)", "Präpositionen mit festem Kasus: в, на, из, от, к, у"],
        resources: ["russianlessons.net — Cases Guide", "Anki: Russian Cases Deck"],
      },
      {
        id: "ru-w6", week: "Woche 6", title: "Kasus II — Instrumental & Präpositional",
        topics: ["Instrumental: mit jemandem sein (с другом)", "Beruf/Eigenschaft: Я — студент (kein Verb sein!)", "Präpositional: über etwas reden (о чём?)", "Wo-Fragen: в/на + Präpositional"],
        resources: ["Master Russian (masterrussian.com) — Cases", "Übungsbuch: Russian Grammar in Use"],
      },
      {
        id: "ru-w7", week: "Woche 7", title: "Verbaspekte",
        topics: ["Perfektiv vs. Imperfektiv — der wichtigste russische Begriff", "Vollendete Handlung (сделать) vs. andauernde (делать)", "Aspektpaare lernen: делать/сделать, говорить/сказать", "Vergangenheit bilden: -л, -ла, -ло, -ли"],
        resources: ["Anastasia: Verbal Aspects Explained", "Russlandjournals.com — Aspect Guide"],
      },
      {
        id: "ru-w8", week: "Woche 8", title: "Vergangenheit & Zukunft",
        topics: ["Vergangenheitsform aller Verbtypen", "Einfache Zukunft: imperfektiv буду + Infinitiv", "Komplexe Zukunft: perfektiv konjugiert", "Kurzgeschichten auf Russisch lesen"],
        resources: ["Slow Russian Podcast (russianepisodes.com)", "Anki: Russische Verben Top 200"],
      },
    ],
  },
  {
    id: "ru-p3", title: "Phase 3 — Praxis & Immersion", col: "#4ade80",
    weeks: [
      {
        id: "ru-w9", week: "Woche 9", title: "Lesen & Hörverständnis",
        topics: ["Kinderbücher auf Russisch lesen (echt auf Kyrillisch!)", "Russische Nachrichten: BBC Russian, РБК", "Slow Russian Podcast: 1 Folge pro Tag", "Unbekannte Wörter aus Kontext erschließen"],
        resources: ["Slow Russian: slowrussian.net", "BBC Russian: bbc.com/russian", "Buch: Русский язык A1/A2 (Goldene Liste)"],
      },
      {
        id: "ru-w10", week: "Woche 10", title: "Sprechen & Schreiben",
        topics: ["Russischen Tandem-Partner suchen", "30 min Gespräch über Alltag auf Russisch", "Tagebuch auf Russisch schreiben (5 Sätze/Tag)", "Aussprache korrigieren lassen"],
        resources: ["iTalki: russische Tutor*innen", "HelloTalk App", "Lang-8 oder Tandem zum Schreiben"],
      },
      {
        id: "ru-w11", week: "Woche 11", title: "Erweitertes Vokabular",
        topics: ["Themenvokabular: Technik, Wissenschaft, Reisen", "Idiome und feste Ausdrücke: конечно, ничего, давай", "Russische Sprichwörter lernen (Anki-Deck)", "Lesen: Kurzgeschichten (Tschechow, Tolstoi — vereinfacht)"],
        resources: ["Anki: Advanced Russian Vocabulary", "Buch: Elementary Russian Reader (Akhmanova)"],
      },
      {
        id: "ru-w12", week: "Woche 12", title: "Abschluss & Selbstbewertung",
        topics: ["TORFL A1/A2 Probetest machen", "Freies Schreiben: Brief auf Russisch (200 Wörter)", "Film auf Russisch ohne Untertitel: 15 min", "Lernplan für Monat 4–6 erstellen"],
        resources: ["TORFL Probetest: test.ru", "Film: Ирония судьбы (russischer Klassiker)", "Russian Progress Test: russiantest.ru"],
      },
    ],
  },
];

// ── Resources ─────────────────────────────────────────────────────────────────

const LANG_RESOURCES = {
  es: [
    {
      cat: "Kurse (kostenlos)", col: "#f97316",
      items: [
        { title: "Language Transfer — Spanisch", note: "Das beste kostenlose Spanischkurs-Audio (50 Lektionen). Aufbau logischer statt auswendig.", url: "https://www.languagetransfer.org/spanish" },
        { title: "Dreaming Spanish", note: "Komprehensives Input-Methode auf YouTube — Anfänger bis Fortgeschritten.", url: "https://www.youtube.com/@DreamingSpanish" },
        { title: "Extra en Español (YouTube)", note: "Sitcom für Sprachlerner — perfekt für Anfänger, sehr unterhaltsam.", url: "https://www.youtube.com/watch?v=MBKgckFKl9c" },
      ],
    },
    {
      cat: "Vokabular & Grammatik", col: "#a78bfa",
      items: [
        { title: "Anki — Spanish Top 2000 Deck", note: "Spaced-Repetition Karten der häufigsten Wörter. Täglich 10–15 Karten reichen.", url: "https://ankiweb.net/shared/info/712832019" },
        { title: "StudySpanish.com", note: "Gratis Grammatikerklärungen inkl. Übungen — besonders Konjunktiv.", url: "https://studyspanish.com" },
        { title: "Real Academia Española", note: "Offizielle Grammatik & Wörterbuch der spanischen Sprache.", url: "https://www.rae.es" },
      ],
    },
    {
      cat: "Podcasts & Medien", col: "#4ade80",
      items: [
        { title: "Coffee Break Spanish", note: "Strukturierter Podcast von A1–B2. Klare Erklärungen, auch als App.", url: "https://coffeebreaklanguages.com/coffeebreakspanish/" },
        { title: "News in Slow Spanish", note: "Aktuelle Nachrichten in langsamem Spanisch — ideal ab A2.", url: "https://www.newsinslowspanish.com" },
        { title: "Españolistos Podcast", note: "Colombianer sprechen über Alltagsthemen — authentisches Spanisch.", url: "https://www.espanolistos.com" },
      ],
    },
    {
      cat: "Konversation", col: "#22d3ee",
      items: [
        { title: "iTalki", note: "Community Tutor*innen ab ~8€/h — ideal für Konversationspraxis.", url: "https://www.italki.com" },
        { title: "Tandem App", note: "Sprachtausch mit Native Speakers (gratis). Chat + Sprachnotizen.", url: "https://www.tandem.net" },
        { title: "DELE Prüfungsvorbereitung", note: "Offizielles Niveau-Zertifikat vom Instituto Cervantes. A1–C2.", url: "https://www.cervantes.es/lengua_y_ensenanza/certificados_espanol/dele/informacion_general.htm" },
      ],
    },
  ],
  ru: [
    {
      cat: "Kurse & YouTube", col: "#60a5fa",
      items: [
        { title: "Russian with Anastasia", note: "Beste YouTube-Kanal für Russisch — Alphabet, Grammatik, Aussprache. Kostenlos.", url: "https://www.youtube.com/@RussianWithAnastasia" },
        { title: "Live Russian", note: "Natürliches Russisch aus dem Alltag — Videos für A1 bis B1.", url: "https://www.youtube.com/@LiveRussian" },
        { title: "Russlandjournals", note: "Detaillierte Grammatikvideos auf Deutsch.", url: "https://www.youtube.com/@russlandjournals" },
      ],
    },
    {
      cat: "Vokabular & Anki", col: "#a78bfa",
      items: [
        { title: "Anki — Russian Frequency Deck", note: "Top 1000 russische Wörter mit Audio — täglich 10–20 Karten.", url: "https://ankiweb.net/shared/info/1420786875" },
        { title: "Anki — Russian Cases", note: "Kasusformen systematisch üben — alle 6 Fälle.", url: "https://ankiweb.net/shared/decks/russian" },
        { title: "masterrussian.com", note: "Gratis Grammatikerklärungen: Kasus, Verben, Aspekte.", url: "https://masterrussian.com" },
      ],
    },
    {
      cat: "Hören & Lesen", col: "#4ade80",
      items: [
        { title: "Slow Russian Podcast", note: "Kurze Episoden zu Alltagsthemen — langsam gesprochen, mit Transkript.", url: "https://www.slowrussian.net" },
        { title: "russianlessons.net", note: "Gratis strukturierter Russischkurs online — sehr gut für Grammatik.", url: "https://russianlessons.net" },
        { title: "BBC Russian", note: "Echte russische Nachrichten — für Fortgeschrittene.", url: "https://www.bbc.com/russian" },
      ],
    },
    {
      cat: "Konversation & Test", col: "#22d3ee",
      items: [
        { title: "iTalki — Russische Tutor*innen", note: "Russische Native Speakers ab ~7€/h. Community Tutors für freies Gespräch.", url: "https://www.italki.com/en/teachers/russian" },
        { title: "HelloTalk", note: "Sprachtausch-App — Russisch gegen Deutsch/Englisch. Gratis.", url: "https://www.hellotalk.com" },
        { title: "TORFL Probetest", note: "Offizielles russisches Sprachniveau-Zertifikat. A1–C2.", url: "http://www.torfl.ru/english" },
      ],
    },
  ],
};

// ── Component ─────────────────────────────────────────────────────────────────

type LangTab = "es" | "ru";
type ViewTab = "plan" | "resources";

export default function SprachenPage() {
  const [lang, setLang]           = useState<LangTab>("es");
  const [view, setView]           = useState<ViewTab>("plan");
  const [expandedPhase, setExpandedPhase] = useState<string | null>("es-p1");
  const [planDone, setPlanDone]   = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const p = localStorage.getItem("lang-plan-done");
      if (p) setPlanDone(JSON.parse(p));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("lang-plan-done", JSON.stringify(planDone));
  }, [planDone]);

  const togglePlan = (id: string) => setPlanDone(p => ({ ...p, [id]: !p[id] }));

  const phases       = lang === "es" ? ES_PHASES : RU_PHASES;
  const allWeekIds   = phases.flatMap(p => p.weeks.map(w => w.id));
  const doneCount    = allWeekIds.filter(id => planDone[id]).length;
  const resources    = LANG_RESOURCES[lang];

  const langMeta = {
    es: { flag: "🇪🇸", name: "Spanisch",  col: "#f97316", note: "3 Monate · B1-Ziel · 30–45 min täglich" },
    ru: { flag: "🇷🇺", name: "Russisch",   col: "#60a5fa", note: "3 Monate · A2-Ziel · 30–45 min täglich" },
  };
  const meta = langMeta[lang];

  // Reset expanded phase when switching language
  const switchLang = (l: LangTab) => {
    setLang(l);
    setExpandedPhase(l === "es" ? "es-p1" : "ru-p1");
  };

  return (
    <div className="page">
      <div className="page-title">Sprachen</div>
      <div className="page-sub">Spanisch · Russisch · 3-Monats-Pläne</div>

      {/* Language picker */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
        {(["es", "ru"] as LangTab[]).map(l => (
          <button key={l} onClick={() => switchLang(l)} style={{
            padding: "8px 18px", background: "transparent", cursor: "pointer",
            border: `1px solid ${lang === l ? langMeta[l].col : "var(--border2)"}`,
            color: lang === l ? langMeta[l].col : "var(--muted2)",
            borderRadius: "3px", fontFamily: "var(--sans)", fontSize: "13px",
            fontWeight: 700, letterSpacing: "1px", transition: "all 0.15s",
          }}>
            {langMeta[l].flag}  {langMeta[l].name}
          </button>
        ))}
      </div>

      {/* View sub-tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "18px" }}>
        {([["plan", "3-Monats-Plan"], ["resources", "Ressourcen"]] as [ViewTab, string][]).map(([id, label]) => (
          <button key={id} onClick={() => setView(id)} style={{
            padding: "7px 16px", background: "transparent", cursor: "pointer",
            fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 600,
            letterSpacing: "1px", textTransform: "uppercase",
            color: view === id ? "var(--accent)" : "var(--muted2)",
            borderBottom: view === id ? "1px solid var(--accent)" : "1px solid transparent",
            border: "none", borderRadius: 0, marginBottom: "-1px", transition: "color 0.15s",
          }}>
            {label}
          </button>
        ))}
      </div>

      {/* ── LERNPLAN ── */}
      {view === "plan" && (
        <div>
          {/* Header */}
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
              <span style={{ fontSize: "22px" }}>{meta.flag}</span>
              <div style={{ fontFamily: "var(--display)", fontSize: "18px", fontStyle: "italic", fontWeight: 700, color: meta.col }}>
                {meta.name} — 3-Monats-Lernplan
              </div>
            </div>
            <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "10px" }}>{meta.note}</div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <div style={{ flex: 1, height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
                <div style={{ height: "100%", background: meta.col, width: `${(doneCount / allWeekIds.length) * 100}%`, transition: "width 0.4s" }}></div>
              </div>
              <span style={{ fontSize: "10px", color: meta.col, flexShrink: 0 }}>{doneCount} / {allWeekIds.length} Wochen</span>
            </div>
          </div>

          {/* Phases */}
          {phases.map(phase => {
            const phaseDone  = phase.weeks.filter(w => planDone[w.id]).length;
            const isExpanded = expandedPhase === phase.id;
            return (
              <div key={phase.id} style={{ marginBottom: "10px" }}>
                <div
                  onClick={() => setExpandedPhase(isExpanded ? null : phase.id)}
                  style={{
                    display: "flex", alignItems: "center", gap: "10px",
                    padding: "10px 14px", background: "var(--card)",
                    border: `1px solid ${phase.col}22`, borderRadius: "4px",
                    cursor: "pointer", transition: "border-color 0.15s",
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

                {isExpanded && (
                  <div style={{ borderLeft: `2px solid ${phase.col}33`, marginLeft: "14px", paddingLeft: "14px", marginTop: "6px" }}>
                    {phase.weeks.map(week => (
                      <div key={week.id} className="card" style={{
                        marginBottom: "8px",
                        borderColor: planDone[week.id] ? `${phase.col}44` : "var(--border)",
                        opacity: planDone[week.id] ? 0.6 : 1, transition: "opacity 0.2s",
                      }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
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
        </div>
      )}

      {/* ── RESSOURCEN ── */}
      {view === "resources" && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
            <span style={{ fontSize: "18px" }}>{meta.flag}</span>
            <div style={{ fontFamily: "var(--display)", fontSize: "17px", fontStyle: "italic", fontWeight: 700, color: meta.col }}>
              {meta.name} — Ressourcen & Links
            </div>
          </div>

          {resources.map(cat => (
            <div key={cat.cat} style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 700, color: cat.col, letterSpacing: "1px", textTransform: "uppercase", marginBottom: "6px" }}>
                {cat.cat}
              </div>
              {cat.items.map(item => (
                <div key={item.title} className="card" style={{ marginBottom: "6px", borderColor: `${cat.col}1a`, padding: "10px 14px" }}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: "var(--mono)", fontSize: "11px", fontWeight: 700, color: cat.col, textDecoration: "none", display: "block", marginBottom: "4px" }}
                  >
                    {item.title} ↗
                  </a>
                  <div style={{ fontSize: "10px", color: "var(--muted2)", lineHeight: 1.5 }}>{item.note}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
