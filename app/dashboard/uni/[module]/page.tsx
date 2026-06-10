"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

// ── Module data ───────────────────────────────────────────────────────────────

const MODULES = {
  mech2: {
    code: "MECH2", name: "Mechanik 2", ects: 6, col: "#f97316",
    examDate: "2026-06-05", examLabel: "KFT 5. Jun",
    strategy: "Alte Klausuren durchrechnen — KFT-Format: offene Aufgaben, kein Multiple Choice. Formelblatt erlaubt.",
    difficulty: 4,
    sections: [
      {
        title: "Kinematik des starren Körpers",
        topics: [
          { id: "m2-k1", text: "Geschwindigkeit & Beschleunigung eines Punktes am Körper" },
          { id: "m2-k2", text: "Winkelgeschwindigkeit ω, Winkelbeschleunigung α" },
          { id: "m2-k3", text: "Momentanpol (ebene Bewegung)" },
          { id: "m2-k4", text: "Relativbewegung: v = v₀ + ω × r" },
        ],
      },
      {
        title: "Kinetik",
        topics: [
          { id: "m2-d1", text: "Newton-Euler-Gleichungen (Translation + Rotation)" },
          { id: "m2-d2", text: "Trägheitstensor & Steiner-Anteil" },
          { id: "m2-d3", text: "Drallsatz: Ḣ = M" },
          { id: "m2-d4", text: "Energiemethode: T = ½mv² + ½Iω²" },
        ],
      },
      {
        title: "Schwingungen",
        topics: [
          { id: "m2-s1", text: "Freie ungedämpfte Schwingung: mẍ + kx = 0, ω₀ = √(k/m)" },
          { id: "m2-s2", text: "Gedämpfte Schwingung: Fallunterscheidung D < 1, = 1, > 1" },
          { id: "m2-s3", text: "Erzwungene Schwingung: Amplitude & Phasengang" },
          { id: "m2-s4", text: "Resonanz: ω = ω₀ → maximale Amplitude" },
        ],
      },
      {
        title: "3D-Mechanik",
        topics: [
          { id: "m2-3d1", text: "Eulersche Winkel: Präzession, Nutation, Eigenschwingung" },
          { id: "m2-3d2", text: "Kreisel: symmetrischer Kreisel, Kreiselpräzession" },
          { id: "m2-3d3", text: "Euler-Gleichungen der Rotation" },
        ],
      },
    ],
    formulas: [
      { label: "Relativgeschwindigkeit",    tex: "v_B = v_A + ω × r_{AB}" },
      { label: "Newton-Euler (Translation)", tex: "F = m·a_S" },
      { label: "Newton-Euler (Rotation)",   tex: "M_S = I_S · α" },
      { label: "Kinetische Energie",        tex: "T = ½m·v_S² + ½I_S·ω²" },
      { label: "Drallsatz",                 tex: "Ḣ_S = M_S" },
      { label: "Eigenfrequenz",             tex: "ω₀ = √(k/m)" },
      { label: "Dämpfungsmaß",              tex: "D = d/(2√(km))" },
    ],
    tips: [
      "Immer zuerst FKB (Freikörperbild) zeichnen — Punkte für Systematik!",
      "Trägheitsmomente nicht auswendig lernen: Steiner-Anteil I = I_S + m·d² kennen und Tabelle nutzen",
      "Schwingungsaufgaben: Ansatz x(t) = X·cos(ωt + φ) und dann Randbedingungen",
      "Klausurformat: ~4 Aufgaben, je 20–25 Punkte, erste Teilaufgabe immer lösbar",
    ],
  },

  kl1: {
    code: "KL1", name: "Klassische Mechanik 1", ects: 6, col: "#60a5fa",
    examDate: "2026-08-03", examLabel: "Test 3. Aug",
    strategy: "HAs wöchentlich abgeben — Bonuspunkte nicht verspielen. Lagrange & Hamilton als Kern der Klausur.",
    difficulty: 5,
    sections: [
      {
        title: "Lagrange-Formalismus",
        topics: [
          { id: "kl-l1", text: "Verallgemeinerte Koordinaten q_i und Freiheitsgrade" },
          { id: "kl-l2", text: "Lagrange-Funktion: L = T − V" },
          { id: "kl-l3", text: "Euler-Lagrange-Gleichungen: d/dt(∂L/∂q̇) − ∂L/∂q = 0" },
          { id: "kl-l4", text: "Zwangsbedingungen & verallgemeinerte Kräfte" },
          { id: "kl-l5", text: "Zyklische Koordinaten → Erhaltungsgrößen" },
        ],
      },
      {
        title: "Hamiltonscher Formalismus",
        topics: [
          { id: "kl-h1", text: "Kanonische Impulse: p_i = ∂L/∂q̇_i" },
          { id: "kl-h2", text: "Hamilton-Funktion: H = Σp_i·q̇_i − L" },
          { id: "kl-h3", text: "Hamiltonsche Bewegungsgleichungen (kanonische Gleichungen)" },
          { id: "kl-h4", text: "Legendre-Transformation" },
          { id: "kl-h5", text: "Poisson-Klammern: {f,g}" },
        ],
      },
      {
        title: "Erhaltungsgrößen & Symmetrien",
        topics: [
          { id: "kl-e1", text: "Noether-Theorem: Symmetrie → Erhaltungsgröße" },
          { id: "kl-e2", text: "Energieerhaltung (Zeittranslationssymmetrie)" },
          { id: "kl-e3", text: "Impulserhaltung (Raumtranslationssymmetrie)" },
          { id: "kl-e4", text: "Drehimpulserhaltung (Rotationssymmetrie)" },
        ],
      },
      {
        title: "Zentralkraftprobleme",
        topics: [
          { id: "kl-z1", text: "Zweiteilchenproblem → Schwerpunkt & Relativbewegung" },
          { id: "kl-z2", text: "Effektives Potential V_eff = V(r) + L²/2μr²" },
          { id: "kl-z3", text: "Keplersche Gesetze & elliptische Bahnen" },
          { id: "kl-z4", text: "Bahn-Gleichung (Bertrand-Problem)" },
        ],
      },
      {
        title: "Starrer Körper & Kreisel",
        topics: [
          { id: "kl-s1", text: "Trägheitstensor I_{ij}" },
          { id: "kl-s2", text: "Hauptachsentransformation: Diagonalform" },
          { id: "kl-s3", text: "Euler-Gleichungen für den Kreisel" },
          { id: "kl-s4", text: "Eulersche Winkel & Kreiselpräzession" },
        ],
      },
    ],
    formulas: [
      { label: "Euler-Lagrange",        tex: "d/dt(∂L/∂q̇ᵢ) − ∂L/∂qᵢ = Qᵢ" },
      { label: "Hamilton-Funktion",     tex: "H = Σpᵢq̇ᵢ − L" },
      { label: "Kanonische Gleichungen",tex: "q̇ᵢ = ∂H/∂pᵢ, ṗᵢ = −∂H/∂qᵢ" },
      { label: "Kanonischer Impuls",    tex: "pᵢ = ∂L/∂q̇ᵢ" },
      { label: "Effektives Potential",  tex: "V_eff = V(r) + L²/(2μr²)" },
      { label: "Drehimpuls",            tex: "L = r × p = I·ω" },
    ],
    tips: [
      "HAs strukturiert lösen: erst Ansatz (L aufstellen), dann EL-Gleichungen, dann Auswerten",
      "Hamilton oft einfacher als Lagrange bei zyklischen Koordinaten",
      "Zentralkraftproblem: Schwerpunktsystem zuerst einführen, Relativkoordinate r",
      "Für Klausur: Noether-Theorem immer anwenden wenn Symmetrie erkennbar",
    ],
  },

  dgl: {
    code: "DGL", name: "DGL für Ing", ects: 5, col: "#a78bfa",
    examDate: "2026-07-21", examLabel: "Prüfung 21. Jul",
    strategy: "Formelsammlung aufbauen + Zwischentest als Meilenstein. Lösungstypen als Kochrezepte lernen.",
    difficulty: 3,
    sections: [
      {
        title: "Lineare DGL 1. Ordnung",
        topics: [
          { id: "dg-1a", text: "Trennung der Variablen: y'=f(x)g(y) → ∫dy/g = ∫f dx" },
          { id: "dg-1b", text: "Variation der Konstanten: y = C(x)·e^(∫p dx)" },
          { id: "dg-1c", text: "Lineare DGL: y' + p(x)y = q(x)" },
          { id: "dg-1d", text: "Bernoullische DGL: y' + p(x)y = q(x)·yⁿ → Substitution z=y^(1-n)" },
        ],
      },
      {
        title: "Lineare DGL 2. Ordnung",
        topics: [
          { id: "dg-2a", text: "Charakteristisches Polynom: ay'' + by' + cy = 0 → λ² + (b/a)λ + c/a = 0" },
          { id: "dg-2b", text: "3 Fälle: reell verschieden, reell gleich, konjugiert komplex" },
          { id: "dg-2c", text: "Partikulärlösung (Ansatz): polynomialer, exp., trigon. Störterm" },
          { id: "dg-2d", text: "Superpositionsprinzip: y = y_h + y_p" },
          { id: "dg-2e", text: "Resonanzfall: Ansatz mit zusätzlichem x multiplizieren" },
        ],
      },
      {
        title: "Systeme von DGLs",
        topics: [
          { id: "dg-s1", text: "Matrixform: ẋ = Ax, A ist Koeffizientenmatrix" },
          { id: "dg-s2", text: "Eigenwerte & Eigenvektoren bestimmen" },
          { id: "dg-s3", text: "Fundamentalsystem: n linear unabhängige Lösungen" },
          { id: "dg-s4", text: "Entkopplung durch Diagonalisierung" },
        ],
      },
      {
        title: "Laplace-Transformation",
        topics: [
          { id: "dg-l1", text: "Definition: L{f}(s) = ∫₀^∞ f(t)e^(-st) dt" },
          { id: "dg-l2", text: "Rechenregeln: Linearität, Verschiebung, Differentiation" },
          { id: "dg-l3", text: "Tabelle: L{1}=1/s, L{eᵃᵗ}=1/(s-a), L{sin}=ω/(s²+ω²)" },
          { id: "dg-l4", text: "Anfangswertproblem mit Laplace lösen (Partialbruchzerlegung!)" },
        ],
      },
      {
        title: "Numerik",
        topics: [
          { id: "dg-n1", text: "Explizites Euler-Verfahren: y_{n+1} = y_n + h·f(t_n, y_n)" },
          { id: "dg-n2", text: "Runge-Kutta 4. Ordnung (RK4): Koeffizienten k₁–k₄" },
          { id: "dg-n3", text: "Konvergenz & Stabilität: Schrittweitenabhängigkeit" },
        ],
      },
    ],
    formulas: [
      { label: "Trennung der Variablen", tex: "∫ dy/g(y) = ∫ f(x) dx + C" },
      { label: "Variation d. Konstanten", tex: "y = e^{-P(x)}·(∫q(x)e^{P(x)}dx + C)" },
      { label: "Char. Polynom (2. Ord.)", tex: "λ² + (b/a)λ + c/a = 0" },
      { label: "Laplace — Differentiation", tex: "L{f'}(s) = s·F(s) − f(0)" },
      { label: "Euler-Verfahren",           tex: "y_{n+1} = y_n + h·f(t_n, y_n)" },
    ],
    tips: [
      "Kochrezept-Ansatz: erst Typ erkennen (Trennung? Variation? Laplace?), dann Standardverfahren",
      "Partialbruchzerlegung ist bei Laplace der häufigste Schritt — üben!",
      "Zwischentest 12. Jun: DGL 1. & 2. Ordnung + Systeme — Laplace kommt später",
      "Formelsammlung selbst schreiben — keine Zeit zum Nachschlagen in der Klausur",
    ],
  },

  ana2: {
    code: "ANA2", name: "Analysis 2", ects: 6, col: "#4ade80",
    examDate: "2026-07-23", examLabel: "Prüfung 23. Jul",
    strategy: "Interleaving mit DGL — viele Methoden sind gleich. Satz von Stokes & Gauß als Hauptaufgaben.",
    difficulty: 4,
    sections: [
      {
        title: "Mehrdimensionale Differentialrechnung",
        topics: [
          { id: "an-d1", text: "Partielle Ableitungen & Gradient ∇f" },
          { id: "an-d2", text: "Jacobi-Matrix & totales Differential" },
          { id: "an-d3", text: "Richtungsableitung: D_v f = ∇f · v̂" },
          { id: "an-d4", text: "Hessematrix & Extremwerte (Hauptminoren)" },
          { id: "an-d5", text: "Lagrange-Multiplikatoren (Extrema mit Nebenbedingung)" },
        ],
      },
      {
        title: "Mehrdimensionale Integration",
        topics: [
          { id: "an-i1", text: "Doppelintegral: ∬_D f(x,y) dA, Reihenfolge wechseln" },
          { id: "an-i2", text: "Dreifachintegral: ∭_V f dV" },
          { id: "an-i3", text: "Koordinatentransformation: Polarkoordinaten (r,φ)" },
          { id: "an-i4", text: "Zylinderkoordinaten (r,φ,z) & Kugelkoordinaten (r,θ,φ)" },
          { id: "an-i5", text: "Substitutionsregel: Jacobi-Determinante |∂(x,y)/∂(u,v)|" },
        ],
      },
      {
        title: "Kurvenintegrale",
        topics: [
          { id: "an-k1", text: "Kurvenintegral 1. Art: ∫_C f ds (Bogenlänge)" },
          { id: "an-k2", text: "Kurvenintegral 2. Art: ∫_C F · dr (Arbeit)" },
          { id: "an-k3", text: "Wegunabhängigkeit & Potentialfeld: F = ∇φ" },
          { id: "an-k4", text: "Green'scher Satz in der Ebene" },
        ],
      },
      {
        title: "Flächenintegrale & Vektoranalysis",
        topics: [
          { id: "an-f1", text: "Flächenintegral 1. Art: ∬_S f dS" },
          { id: "an-f2", text: "Flächenintegral 2. Art: ∬_S F · n dS (Fluss)" },
          { id: "an-f3", text: "Stokes'scher Satz: ∮_∂S F·dr = ∬_S (∇×F)·n dS" },
          { id: "an-f4", text: "Gauß'scher Integralsatz: ∬_∂V F·n dS = ∭_V div F dV" },
          { id: "an-f5", text: "Rotation rot F = ∇×F, Divergenz div F = ∇·F" },
        ],
      },
    ],
    formulas: [
      { label: "Gradient",               tex: "∇f = (∂f/∂x, ∂f/∂y, ∂f/∂z)" },
      { label: "Jacobi-Determinante",    tex: "|J| = |∂(x,y)/∂(u,v)|" },
      { label: "Polar (2D)",             tex: "dA = r dr dφ" },
      { label: "Kugel (3D)",             tex: "dV = r²sin(θ) dr dθ dφ" },
      { label: "Stokes",                 tex: "∮_{∂S} F·dr = ∬_S (∇×F)·n̂ dS" },
      { label: "Gauß",                   tex: "∬_{∂V} F·n̂ dS = ∭_V div F dV" },
    ],
    tips: [
      "Stokes & Gauß: immer prüfen ob direkter oder indirekter Weg einfacher ist",
      "Koordinatentransformation: Jacobi-Determinante nicht vergessen!",
      "Kurvenintegrale: Parametrisierung sorgfältig wählen (oft Richtung wichtig!)",
      "Interleaving: Ana2 + DGL an einem Tag — Laplace & Ana2 ergänzen sich",
    ],
  },

  itp: {
    code: "ITP", name: "ITP", ects: 4, col: "#22d3ee",
    examDate: "2026-07-14", examLabel: "Test 14. Jul",
    strategy: "dts-Projekte kontinuierlich bearbeiten. Nicht alles auf Deadline schieben — Implementierung braucht Zeit.",
    difficulty: 3,
    sections: [
      {
        title: "Datenstrukturen",
        topics: [
          { id: "it-d1", text: "Arrays & dynamische Arrays (ArrayList)" },
          { id: "it-d2", text: "Verkettete Listen (einfach, doppelt)" },
          { id: "it-d3", text: "Stack (LIFO) & Queue (FIFO)" },
          { id: "it-d4", text: "Binäre Suchbäume (BST), AVL-Bäume" },
          { id: "it-d5", text: "Hash-Tabellen: Hash-Funktion, Kollisionsbehandlung" },
          { id: "it-d6", text: "Graphen: Adjazenzmatrix, Adjazenzliste" },
        ],
      },
      {
        title: "Algorithmen",
        topics: [
          { id: "it-a1", text: "Sortieralgorithmen: Bubble, Selection, Insertion, Merge, Quick" },
          { id: "it-a2", text: "Komplexität: O(1), O(log n), O(n), O(n log n), O(n²)" },
          { id: "it-a3", text: "Binäre Suche: O(log n)" },
          { id: "it-a4", text: "Graphenalgorithmen: BFS, DFS" },
          { id: "it-a5", text: "Dijkstra: Kürzester Pfad in gewichtetem Graph" },
        ],
      },
      {
        title: "Programmierparadigmen",
        topics: [
          { id: "it-p1", text: "Objektorientierte Programmierung: Klassen, Vererbung, Polymorphismus" },
          { id: "it-p2", text: "Funktionale Programmierung: Funktionen höherer Ordnung, map/filter/reduce" },
          { id: "it-p3", text: "Prozedurale Programmierung: Kontrollstrukturen, Modularisierung" },
          { id: "it-p4", text: "Rekursion & Basisfall (Backtracking)" },
        ],
      },
      {
        title: "dts-Abgaben",
        topics: [
          { id: "it-dts1", text: "dts 1 — Grundlagen: abgegeben ✓" },
          { id: "it-dts2", text: "dts 2 (Abgabe 3. Jul) — rechtzeitig beginnen!" },
          { id: "it-dts3", text: "dts 3 (Abgabe 17. Jul) — nach Test abgeben" },
          { id: "it-dts4", text: "Unittest & Dokumentation für jede Abgabe" },
        ],
      },
    ],
    formulas: [
      { label: "Merge Sort",      tex: "T(n) = 2T(n/2) + O(n) → O(n log n)" },
      { label: "Binäre Suche",    tex: "T(n) = T(n/2) + O(1) → O(log n)" },
      { label: "Dijkstra",        tex: "O((V + E) log V) mit Min-Heap" },
      { label: "BFS/DFS",         tex: "O(V + E)" },
      { label: "Hash-Tabelle",    tex: "avg O(1) Suche, worst O(n) bei Kollisionen" },
    ],
    tips: [
      "dts-Abgaben: IMMER 1 Woche vor Deadline fertig sein — Bugs kosten Zeit",
      "ITP Test: Algorithmen implementieren können (nicht nur Theorie)",
      "Übungsfragen: Komplexität analysieren & begründen können",
      "Graphen: BFS vs. DFS anhand von Beispielen üben",
    ],
  },
};

type ModuleKey = keyof typeof MODULES;

// ── Component ─────────────────────────────────────────────────────────────────

type SubTab = "overview" | "topics" | "formulas" | "notes";

export default function ModulePage() {
  const params    = useParams();
  const moduleKey = (params.module as string)?.toLowerCase() as ModuleKey;
  const mod       = MODULES[moduleKey];

  const [subTab, setSubTab]       = useState<SubTab>("overview");
  const [topicDone, setTopicDone] = useState<Record<string, boolean>>({});
  const [notes, setNotes]         = useState("");
  const [editingNotes, setEditingNotes] = useState(false);

  useEffect(() => {
    if (!moduleKey) return;
    try {
      const t = localStorage.getItem(`mod-topics-${moduleKey}`);
      if (t) setTopicDone(JSON.parse(t));
      const n = localStorage.getItem(`mod-notes-${moduleKey}`);
      if (n) setNotes(n);
    } catch { /* ignore */ }
  }, [moduleKey]);

  useEffect(() => {
    if (!moduleKey) return;
    localStorage.setItem(`mod-topics-${moduleKey}`, JSON.stringify(topicDone));
  }, [topicDone, moduleKey]);

  useEffect(() => {
    if (!moduleKey) return;
    localStorage.setItem(`mod-notes-${moduleKey}`, notes);
  }, [notes, moduleKey]);

  if (!mod) {
    return (
      <div className="page">
        <Link href="/dashboard/uni" style={{ fontSize: "11px", color: "var(--muted2)", textDecoration: "none" }}>← Zurück</Link>
        <div style={{ marginTop: "20px", color: "var(--muted2)" }}>Modul nicht gefunden.</div>
      </div>
    );
  }

  const allTopics   = mod.sections.flatMap(s => s.topics);
  const doneCount   = allTopics.filter(t => topicDone[t.id]).length;
  const today       = new Date();
  const daysLeft    = Math.ceil((new Date(mod.examDate).getTime() - today.getTime()) / 86400000);

  const SUB_TABS: { id: SubTab; label: string }[] = [
    { id: "overview",  label: "Überblick" },
    { id: "topics",    label: `Themen (${doneCount}/${allTopics.length})` },
    { id: "formulas",  label: "Formeln" },
    { id: "notes",     label: "Notizen" },
  ];

  return (
    <div className="page">
      {/* Back link */}
      <Link href="/dashboard/uni" style={{
        fontSize: "10px", color: "var(--muted2)", textDecoration: "none",
        fontFamily: "var(--mono)", display: "inline-flex", alignItems: "center", gap: "4px",
        marginBottom: "12px",
      }}>
        ← Uni
      </Link>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
        <div>
          <span className="tag" style={{ color: mod.col, borderColor: `${mod.col}44`, background: `${mod.col}11` }}>{mod.code}</span>
          <div style={{ fontFamily: "var(--display)", fontSize: "22px", fontStyle: "italic", fontWeight: 700, margin: "6px 0 3px", color: "var(--accent)" }}>
            {mod.name}
          </div>
          <div style={{ fontSize: "10px", color: "var(--muted2)" }}>{mod.ects} ECTS</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "11px", color: daysLeft <= 14 ? "#ef4444" : mod.col, fontWeight: 700 }}>{mod.examLabel}</div>
          <div style={{ fontSize: "24px", fontFamily: "var(--mono)", fontWeight: 700, color: daysLeft <= 14 ? "#ef4444" : mod.col, lineHeight: 1.2, marginTop: "4px" }}>
            {daysLeft}d
          </div>
          <div style={{ fontSize: "9px", color: "var(--muted2)" }}>verbleibend</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "16px" }}>
        <div style={{ flex: 1, height: "3px", background: "var(--border)", borderRadius: "2px", overflow: "hidden" }}>
          <div style={{ height: "100%", background: mod.col, width: `${(doneCount / allTopics.length) * 100}%`, transition: "width 0.4s" }}></div>
        </div>
        <span style={{ fontSize: "10px", color: mod.col, flexShrink: 0 }}>{doneCount}/{allTopics.length} Themen</span>
      </div>

      {/* Difficulty */}
      <div style={{ display: "flex", gap: "3px", alignItems: "center", marginBottom: "16px" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{ width: "20px", height: "3px", borderRadius: "1px", background: i < mod.difficulty ? mod.col : "var(--border)" }}></div>
        ))}
        <span style={{ fontSize: "9px", color: "var(--muted2)", marginLeft: "6px" }}>Schwierigkeit</span>
      </div>

      {/* Sub-tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "18px", overflowX: "auto" }}>
        {SUB_TABS.map(t => (
          <button key={t.id} onClick={() => setSubTab(t.id)} style={{
            padding: "7px 14px", background: "transparent", cursor: "pointer",
            fontFamily: "var(--sans)", fontSize: "11px", fontWeight: 600,
            letterSpacing: "0.5px", textTransform: "uppercase", whiteSpace: "nowrap",
            color: subTab === t.id ? "var(--accent)" : "var(--muted2)",
            borderBottom: subTab === t.id ? `1px solid ${mod.col}` : "1px solid transparent",
            border: "none", borderRadius: 0, marginBottom: "-1px", transition: "color 0.15s",
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ── */}
      {subTab === "overview" && (
        <div>
          <div className="card" style={{ marginBottom: "14px", borderColor: `${mod.col}22` }}>
            <div style={{ fontSize: "10px", color: mod.col, fontFamily: "var(--mono)", marginBottom: "4px" }}>STRATEGIE</div>
            <div style={{ fontSize: "11px", color: "var(--text)", lineHeight: 1.6 }}>{mod.strategy}</div>
          </div>

          <div className="sec-label">Klausur-Tipps</div>
          <div className="card" style={{ padding: "10px 14px", marginBottom: "14px" }}>
            {mod.tips.map((tip, i) => (
              <div key={i} style={{ display: "flex", gap: "10px", marginBottom: i < mod.tips.length - 1 ? "8px" : 0, fontSize: "11px" }}>
                <span style={{ color: mod.col, flexShrink: 0 }}>→</span>
                <span style={{ color: "var(--text)", lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>

          <div className="sec-label">Abschnitte</div>
          {mod.sections.map(sec => {
            const secDone = sec.topics.filter(t => topicDone[t.id]).length;
            return (
              <div key={sec.title} className="card" style={{ marginBottom: "8px", borderColor: secDone === sec.topics.length ? `${mod.col}44` : "var(--border)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--accent)", fontFamily: "var(--sans)" }}>{sec.title}</span>
                  <span style={{ fontSize: "10px", color: mod.col }}>{secDone}/{sec.topics.length}</span>
                </div>
                <div style={{ marginTop: "6px", height: "2px", background: "var(--border)", borderRadius: "1px", overflow: "hidden" }}>
                  <div style={{ height: "100%", background: mod.col, width: `${(secDone / sec.topics.length) * 100}%`, transition: "width 0.4s" }}></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── TOPICS ── */}
      {subTab === "topics" && (
        <div>
          {mod.sections.map(sec => (
            <div key={sec.title} style={{ marginBottom: "16px" }}>
              <div style={{ fontFamily: "var(--sans)", fontSize: "12px", fontWeight: 700, color: mod.col, letterSpacing: "0.5px", marginBottom: "6px", textTransform: "uppercase" }}>
                {sec.title}
              </div>
              <div className="card" style={{ padding: 0, overflow: "hidden" }}>
                {sec.topics.map((topic, i) => (
                  <div
                    key={topic.id}
                    onClick={() => setTopicDone(p => ({ ...p, [topic.id]: !p[topic.id] }))}
                    style={{
                      display: "flex", alignItems: "center", gap: "10px",
                      padding: "8px 12px", cursor: "pointer",
                      borderBottom: i < sec.topics.length - 1 ? "1px solid var(--border)" : "none",
                      opacity: topicDone[topic.id] ? 0.4 : 1, transition: "opacity 0.15s",
                    }}
                  >
                    <div className="checkbox" style={{
                      flexShrink: 0,
                      borderColor: topicDone[topic.id] ? mod.col : "var(--border2)",
                      background: topicDone[topic.id] ? mod.col : "transparent",
                    }}>
                      {topicDone[topic.id] ? "✓" : ""}
                    </div>
                    <span style={{ fontSize: "11px", textDecoration: topicDone[topic.id] ? "line-through" : "none" }}>
                      {topic.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FORMULAS ── */}
      {subTab === "formulas" && (
        <div>
          <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "14px" }}>
            Wichtigste Formeln für die Klausur — handschriftlich auf ein Blatt übertragen!
          </div>
          {mod.formulas.map((f, i) => (
            <div key={i} className="card" style={{ marginBottom: "8px", borderColor: `${mod.col}1a` }}>
              <div style={{ fontSize: "9px", color: mod.col, fontFamily: "var(--mono)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                {f.label}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: "13px", color: "var(--accent)", letterSpacing: "0.3px" }}>
                {f.tex}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── NOTES ── */}
      {subTab === "notes" && (
        <div>
          <div style={{ fontSize: "10px", color: "var(--muted2)", marginBottom: "10px" }}>
            Eigene Notizen, Fragen, Lücken — klicken zum Bearbeiten.
          </div>
          <div className="card" style={{ padding: "12px" }}>
            {editingNotes ? (
              <textarea
                autoFocus
                value={notes}
                onChange={e => setNotes(e.target.value)}
                onBlur={() => setEditingNotes(false)}
                style={{
                  width: "100%", minHeight: "200px", background: "transparent",
                  border: "none", color: "var(--text)", fontFamily: "var(--mono)",
                  fontSize: "11px", resize: "vertical", outline: "none", lineHeight: 1.7,
                }}
              />
            ) : (
              <div
                onClick={() => setEditingNotes(true)}
                style={{
                  fontSize: "11px", minHeight: "120px", cursor: "text",
                  color: notes ? "var(--text)" : "var(--muted2)",
                  whiteSpace: "pre-wrap", lineHeight: 1.7,
                }}
              >
                {notes || "Klicken um Notizen zu schreiben...\n\nIdeen: offene Fragen, schwierige Aufgaben, eigene Herleitungen"}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
