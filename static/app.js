// ── Constants ──────────────────────────────────────────────────────────────────
const WORK_SECS   = 25 * 60;
const SHORT_BREAK =  5 * 60;
const LONG_BREAK  = 15 * 60;
const POM_SUBJECTS = ['Mechanik 2','KL1','DGL','Ana2','ITP','BEARS','Spanisch','Russisch'];
const REMINDER_TIPS = [
  'Active Recall schlägt Wiederlesen — teste dich selbst.',
  '25 Minuten Vollgas, keine Ablenkung. Los geht\'s.',
  'Kurze Session > keine Session. Starte jetzt.',
  'Interleaving: Wechsle heute zwischen zwei Fächern.',
  'Spaced Repetition: Was hast du vor 3 Tagen gelernt?',
  'Noch kein Pomodoro heute? Das ändern wir jetzt.',
  '10 Minuten Einstieg genügen — Trägheit überwinden.',
  'Formelblatt aufmachen und 3 Formeln auswendig lernen.',
];
const EXAMS_GLOBAL = [
  {sub:'Mechanik 2',label:'KFT',         date:'2026-06-05',col:'#f97316'},
  {sub:'KL1',       label:'HA3',          date:'2026-06-07',col:'#60a5fa'},
  {sub:'DGL',       label:'Zwischentest', date:'2026-06-12',col:'#a78bfa'},
  {sub:'KL1',       label:'HA4',          date:'2026-06-21',col:'#60a5fa'},
  {sub:'ITP',       label:'Abgabe dts',   date:'2026-07-03',col:'#22d3ee'},
  {sub:'KL1',       label:'HA5',          date:'2026-07-05',col:'#60a5fa'},
  {sub:'ITP',       label:'Test',         date:'2026-07-14',col:'#22d3ee'},
  {sub:'DGL',       label:'Prüfung',      date:'2026-07-21',col:'#a78bfa'},
  {sub:'Ana2',      label:'Prüfung',      date:'2026-07-23',col:'#4ade80'},
  {sub:'KL1',       label:'Test',         date:'2026-08-03',col:'#60a5fa'},
];

// ── State ──────────────────────────────────────────────────────────────────────
let pomState    = 'idle';   // idle | running | paused | break
let pomSecs     = WORK_SECS;
let pomSessions = 0;
let pomSubject  = 'KL1';
let pomInterval = null;
let focusMode   = false;
let nextReminderAt = Date.now() + 20 * 60 * 1000;
let lastActivity   = Date.now();
let completedSubject = 'KL1';
let studyLog = [];

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(secs) {
  return String(Math.floor(secs/60)).padStart(2,'0') + ':' + String(secs%60).padStart(2,'0');
}
function daysUntilGlobal(s) {
  return Math.ceil((new Date(s) - new Date()) / 86400000);
}

// ── Clock ──────────────────────────────────────────────────────────────────────
const DAYS_DE_FULL   = ['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'];
const MONTHS_DE      = ['Jan','Feb','Mär','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];

function tickClock() {
  const now = new Date();
  const timeEl = document.getElementById('clock-time');
  const dateEl = document.getElementById('clock-date');
  if (timeEl) timeEl.textContent = now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  if (dateEl) dateEl.textContent = DAYS_DE_FULL[now.getDay()].slice(0,2) + ' ' + now.getDate() + '. ' + MONTHS_DE[now.getMonth()];

  // Progress bars
  const y  = ((now - new Date(now.getFullYear(),0,1)) / (365.25*86400000) * 100)|0;
  const m  = (now.getDate() / new Date(now.getFullYear(),now.getMonth()+1,0).getDate() * 100)|0;
  const w  = (now.getDay() / 7 * 100)|0;
  const set = (id, val) => {
    const el = document.getElementById(id); if (el) el.style.width = val+'%';
  };
  const setTxt = (id, val) => {
    const el = document.getElementById(id); if (el) el.textContent = val;
  };
  set('bar-year', y);   setTxt('pct-year', y);
  set('bar-month', m);  setTxt('pct-month', m);
  set('bar-week', w);   setTxt('pct-week', w);
  // Drawer clock sync
  const dc = document.getElementById('drawer-clock');
  const dd = document.getElementById('drawer-date');
  if (dc) dc.textContent = now.toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
  if (dd) dd.textContent = DAYS_DE_FULL[now.getDay()].slice(0,2) + ' ' + now.getDate() + '. ' + MONTHS_DE[now.getMonth()];
  set('d-bar-year', y);  setTxt('d-pct-year', y);
  set('d-bar-month', m); setTxt('d-pct-month', m);
}
setInterval(tickClock, 1000);
tickClock();

// ── Pixel canvas banner ────────────────────────────────────────────────────────
(function drawCanvas() {
  const canvas = document.getElementById('pixel-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const palette = ['#000000','#020208','#040410','#060612','#08081a','#010106','#03030e','#05050a','#070714','#0a0a1e','#000004','#030309','#05050b','#07070f'];
  const W = canvas.offsetWidth || 800;
  const H = canvas.offsetHeight || 72;
  canvas.width = W; canvas.height = H;
  const cols = Math.ceil(W/6), rows = Math.ceil(H/6);
  for (let r=0;r<rows;r++) for (let c=0;c<cols;c++) {
    const i = r*cols+c;
    ctx.fillStyle = palette[(Math.floor((Math.sin(i*0.9+r*1.5)*0.5+0.5)*palette.length))%palette.length];
    ctx.fillRect(c*6, r*6, 6, 6);
  }
})();

// ── Streak ─────────────────────────────────────────────────────────────────────
(function initStreak() {
  try {
    const today     = new Date().toDateString();
    const lastVisit = localStorage.getItem('last-visit') || '';
    const current   = parseInt(localStorage.getItem('streak') || '0');
    let streak;
    if (lastVisit !== today) {
      const yesterday = new Date(Date.now()-86400000).toDateString();
      streak = lastVisit === yesterday ? current+1 : 1;
      localStorage.setItem('streak', String(streak));
      localStorage.setItem('last-visit', today);
    } else {
      streak = current;
    }
    if (streak > 0) {
      const sec = document.getElementById('streak-section');
      if (sec) sec.style.display = '';
      const numEl = document.getElementById('streak-num');
      const subEl = document.getElementById('streak-sub');
      if (numEl) {
        numEl.textContent = streak;
        numEl.style.color = streak>=14?'#f59e0b':streak>=7?'#f97316':streak>=3?'#60a5fa':'var(--accent)';
      }
      if (subEl) subEl.textContent = 'Tag' + (streak===1?'':'e') + (streak>=14?' 🔥':streak>=7?' ⚡':'');

      // Study log
      const raw = localStorage.getItem('study-log');
      if (raw) {
        studyLog = JSON.parse(raw);
        if (studyLog.length > 0) {
          const logEl = document.getElementById('streak-log');
          if (logEl) {
            logEl.style.display = '';
            logEl.innerHTML = '<div style="font-size:8px;color:var(--muted2);letter-spacing:1px;text-transform:uppercase;margin-bottom:4px;">Letzte Sessions</div>' +
              studyLog.slice(0,3).map(e=>`<div style="font-size:9px;color:var(--muted2);margin-bottom:3px;display:flex;gap:6px;"><span style="color:var(--muted);flex-shrink:0;">${e.time}</span><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${e.note}</span></div>`).join('');
          }
        }
      }
    }
  } catch(_) {}
})();

// ── Notifications ──────────────────────────────────────────────────────────────
(function initNotif() {
  if (typeof Notification === 'undefined') return;
  if (Notification.permission === 'default') {
    const bar = document.getElementById('notif-bar-inline');
    if (bar) bar.style.display = 'flex';
  }
  // Urgent exam check (max once per 2h)
  try {
    const lastCheck = parseInt(localStorage.getItem('last-notif-check') || '0');
    if (Date.now() - lastCheck > 2*60*60*1000) {
      localStorage.setItem('last-notif-check', String(Date.now()));
      const urgent = EXAMS_GLOBAL.map(e=>({...e,days:daysUntilGlobal(e.date)}))
        .filter(e=>e.days>=0&&e.days<=7).sort((a,b)=>a.days-b.days);
      if (urgent.length>0) {
        const e = urgent[0];
        setTimeout(() => sendNotif(`⚠️ ${e.sub} — ${e.label} in ${e.days} Tag${e.days===1?'':'en'}!`,
          'Öffne den Lernplan und starte eine Pomodoro-Session.'), 2500);
      }
    }
  } catch(_) {}
})();

function requestNotif() {
  if (typeof Notification !== 'undefined') {
    Notification.requestPermission().then(p => {
      document.getElementById('notif-bar-inline').style.display = 'none';
      if (p === 'granted') addToast('✓ Benachrichtigungen aktiv', 'Du bekommst jetzt Lern-Erinnerungen.', 'info');
    });
  }
}

function sendNotif(title, body) {
  if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
    new Notification(title, {body, icon: '/static/favicon.ico'});
  }
  addToast(title, body, 'urgent');
}

// ── Toast notifications ────────────────────────────────────────────────────────
let toastId = 0;
function addToast(title, body, kind='info') {
  const id = ++toastId;
  const container = document.getElementById('toast-container');
  if (!container) return;
  const el = document.createElement('div');
  el.className = 'toast ' + kind;
  el.id = 'toast-'+id;
  el.innerHTML = `<div class="toast-title" style="color:${kind==='urgent'?'#ef4444':'var(--accent)'};">${title}</div><div class="toast-body">${body}</div>`;
  el.onclick = () => removeToast(id);
  container.appendChild(el);
  setTimeout(() => removeToast(id), 6000);
}
function removeToast(id) {
  const el = document.getElementById('toast-'+id);
  if (!el) return;
  el.classList.add('removing');
  setTimeout(() => el.remove(), 220);
}

// ── Pomodoro ───────────────────────────────────────────────────────────────────
(function buildPomSubjects() {
  const container = document.getElementById('pom-subjects');
  if (!container) return;
  POM_SUBJECTS.forEach(s => {
    const b = document.createElement('button');
    b.className = 'pom-sub-btn' + (s === pomSubject ? ' selected' : '');
    b.textContent = s;
    b.onclick = () => {
      pomSubject = s;
      container.querySelectorAll('.pom-sub-btn').forEach(x => x.classList.remove('selected'));
      b.classList.add('selected');
    };
    container.appendChild(b);
  });
})();

function pomShowPicker() {
  document.getElementById('pom-idle').style.display    = 'none';
  document.getElementById('pom-picker').style.display  = '';
  document.getElementById('pom-running').style.display = 'none';
}
function pomStart() {
  pomState    = 'running';
  pomSecs     = WORK_SECS;
  document.getElementById('pom-idle').style.display    = 'none';
  document.getElementById('pom-picker').style.display  = 'none';
  document.getElementById('pom-running').style.display = '';
  startPomInterval();
  updatePomDisplay();
}
function pomPause() {
  if (pomState === 'running') {
    pomState = 'paused';
    clearInterval(pomInterval);
    pomInterval = null;
    document.getElementById('pom-pause-btn').textContent = '▶';
    const fpb = document.getElementById('focus-pause-btn');
    if (fpb) fpb.textContent = '▶ Weiter';
  } else if (pomState === 'paused') {
    pomState = 'running';
    startPomInterval();
    document.getElementById('pom-pause-btn').textContent = '⏸';
    const fpb = document.getElementById('focus-pause-btn');
    if (fpb) fpb.textContent = '⏸ Pause';
  }
}
function pomStop() {
  pomState    = 'idle';
  pomSecs     = WORK_SECS;
  pomSessions = 0;
  clearInterval(pomInterval);
  pomInterval = null;
  document.getElementById('pom-idle').style.display    = '';
  document.getElementById('pom-picker').style.display  = 'none';
  document.getElementById('pom-running').style.display = 'none';
  closeFocus();
}
function pomSkipBreak() {
  pomState = 'running';
  pomSecs  = WORK_SECS;
  clearInterval(pomInterval);
  pomInterval = null;
  document.getElementById('pom-ctrl-work').style.display  = '';
  document.getElementById('pom-ctrl-break').style.display = 'none';
  startPomInterval();
  updatePomDisplay();
}
function pomFocus() { openFocus(); }

function startPomInterval() {
  if (pomInterval) clearInterval(pomInterval);
  pomInterval = setInterval(() => {
    if (pomState !== 'running' && pomState !== 'break') return;
    pomSecs--;
    if (pomSecs <= 0) {
      if (pomState === 'running') {
        pomSessions++;
        const breakLen = pomSessions % 4 === 0 ? LONG_BREAK : SHORT_BREAK;
        pomState = 'break';
        pomSecs  = breakLen;
        sendNotif(`✅ Pomodoro #${pomSessions} fertig!`,
          `${pomSubject} — ${pomSessions%4===0?'Lange Pause (15 min)!':'Kurze Pause (5 min). Bewegen!'}`);
        completedSubject = pomSubject;
        document.getElementById('pom-ctrl-work').style.display  = 'none';
        document.getElementById('pom-ctrl-break').style.display = '';
        setTimeout(openSessionLog, 700);
      } else {
        pomState = 'idle';
        pomSecs  = WORK_SECS;
        clearInterval(pomInterval);
        pomInterval = null;
        sendNotif('🎯 Pause vorbei!', `Weiter mit ${pomSubject}. Starte die nächste Session!`);
        document.getElementById('pom-idle').style.display    = '';
        document.getElementById('pom-running').style.display = 'none';
        closeFocus();
      }
    }
    updatePomDisplay();
  }, 1000);
}

function updatePomDisplay() {
  const isBreak = pomState === 'break';
  const totalSecs = isBreak ? (pomSessions%4===0?LONG_BREAK:SHORT_BREAK) : WORK_SECS;
  const pct = (1 - pomSecs/totalSecs) * 100;
  const color = isBreak ? '#22d3ee' : (pomState==='running' ? '#ffffff' : 'var(--muted2)');

  const dispEl  = document.getElementById('pom-display');
  const labelEl = document.getElementById('pom-label');
  const barEl   = document.getElementById('pom-bar');
  if (dispEl)  { dispEl.textContent = (isBreak?'☕ ':'')+fmt(pomSecs); dispEl.style.color = color; }
  if (labelEl) labelEl.textContent = (isBreak?'PAUSE':pomSubject) + ' · #'+(pomSessions+(isBreak?0:1))+' Session';
  if (barEl)   { barEl.style.width = pct+'%'; barEl.style.background = color; }

  // Dots
  const dotsEl = document.getElementById('pom-dots');
  if (dotsEl && pomSessions > 0) {
    dotsEl.innerHTML = Array.from({length:Math.min(pomSessions,8)}).map((_,i) =>
      `<div style="width:5px;height:5px;border-radius:50%;background:${i%4===3?'#22d3ee':'var(--muted2)'}"></div>`).join('');
  }

  // Focus overlay sync
  if (focusMode) {
    const ft = document.getElementById('focus-time');
    const fb = document.getElementById('focus-bar');
    const fp = document.getElementById('focus-phase');
    const fs = document.getElementById('focus-subject');
    const fss= document.getElementById('focus-session');
    if (ft)  { ft.textContent = fmt(pomSecs); ft.style.color = color; }
    if (fb)  { fb.style.width = pct+'%'; fb.style.background = color; }
    if (fp)  fp.textContent = isBreak ? '☕ Pause' : 'Deep Work';
    if (fs)  fs.textContent = isBreak ? 'Erholen & Bewegen' : pomSubject;
    if (fss) fss.textContent = 'Session #'+(pomSessions+(isBreak?0:1));
  }
}

function openFocus() {
  if (pomState === 'idle') return;
  focusMode = true;
  document.getElementById('focus-overlay').style.display = 'flex';
  updatePomDisplay();
}
function closeFocus() {
  focusMode = false;
  const ov = document.getElementById('focus-overlay');
  if (ov) ov.style.display = 'none';
}

// ── Session Log ────────────────────────────────────────────────────────────────
function openSessionLog() {
  const el = document.getElementById('session-log');
  const sub = document.getElementById('session-log-sub');
  if (el) el.style.display = '';
  if (sub) sub.textContent = completedSubject + ' · Was hast du gelernt?';
  const inp = document.getElementById('session-log-input');
  if (inp) { inp.value = ''; inp.focus(); }
}
function closeSessionLog() {
  const el = document.getElementById('session-log');
  if (el) el.style.display = 'none';
}
function saveSessionLog() {
  const inp = document.getElementById('session-log-input');
  const text = inp ? inp.value.trim() : '';
  if (text) {
    const entry = {
      time: new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),
      subject: completedSubject,
      note: text,
    };
    studyLog = [entry, ...studyLog].slice(0, 30);
    try { localStorage.setItem('study-log', JSON.stringify(studyLog)); } catch(_) {}
  }
  closeSessionLog();
}
document.addEventListener('DOMContentLoaded', () => {
  const inp = document.getElementById('session-log-input');
  if (inp) inp.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveSessionLog();
    if (e.key === 'Escape') closeSessionLog();
  });
});

// ── Motivation content ─────────────────────────────────────────────────────────
const MOTIV_WINDOWS = [
  { type:'💬 Motivations-Zitat', col:'#a855f7', winTitle:'✎ Motivation.txt',
    entries:[
      { msg:'Das Einzige, was zwischen dir und deinem Ziel steht, ist die Geschichte, die du dir selbst erzählst.',
        sub:'Jede Lernsession zählt. Auch kurze. Auch die schwierigen.', src:'— Jordan Belfort (angepasst)' },
      { msg:'Du musst nicht perfekt starten. Du musst nur starten.',
        sub:'Ein Pomodoro jetzt ist besser als der perfekte Plan morgen.', src:'— unbekannt' },
      { msg:'Erfolg ist die Summe kleiner Anstrengungen, täglich wiederholt.',
        sub:'Spaced Repetition funktioniert — wenn man es tut.', src:'— Robert Collier' },
      { msg:'Die Müdigkeit, die du jetzt fühlst, ist die Investition in die Person, die du werden willst.',
        sub:'Active Recall ist anstrengend — das ist der Beweis, dass es wirkt.', src:'— unbekannt' },
      { msg:'Vergleiche dich nicht mit anderen. Vergleiche dich mit dem, der du gestern warst.',
        sub:'Ein Tag, eine Session, ein Konzept — das reicht.', src:'— Jordan B. Peterson' },
    ]},
  { type:'🧠 Lernwissenschaft', col:'#22d3ee', winTitle:'◉ Kognitions-Tipp',
    entries:[
      { msg:'Active Recall schlägt passives Lesen um Faktor 3.',
        sub:'Klappe das Buch zu. Schreib alles auf, was du weißt. DANN vergleiche.', src:'— Karpicke & Roediger, 2008' },
      { msg:'Spaced Repetition: Das Vergessen ist kein Feind, es ist der Mechanismus.',
        sub:'Wiederhole Stoff nach 1, 3, 7 und 14 Tagen — die Kurve flacht dramatisch ab.', src:'— Ebbinghaus Forgetting Curve' },
      { msg:'Interleaving: Wechsle heute zwischen zwei Fächern.',
        sub:'Gemischtes Üben fühlt sich schwerer an, produziert aber 20–30% bessere Ergebnisse.', src:'— Taylor & Rohrer, 2010' },
      { msg:'Schlaf konsolidiert Gedächtnis — ohne Ausnahme.',
        sub:'Lernen nach Mitternacht kostet mehr als es bringt. 7–8h sind keine Faulheit.', src:'— Matthew Walker, Why We Sleep' },
      { msg:'Die "Illusion of Knowing": Nochmal lesen fühlt sich wie Lernen an — ist es aber nicht.',
        sub:'Wähle Active Recall über Highlighting. Immer.', src:'— Bjork, 1994' },
    ]},
  { type:'⚡ Energie-Check', col:'#f59e0b', winTitle:'⚡ Status.exe',
    entries:[
      { msg:'Hohe Energie → jetzt das Schwerste angehen.',
        sub:'Mechanik 2, KL1, DGL — die schwierigen Konzepte jetzt, nicht nach dem Abendessen.', src:'— Ultradian Rhythm Research' },
      { msg:'Niedrige Energie? Wiederholung statt neuem Stoff.',
        sub:'Alte Aufgaben durchschauen, Karteikarten, Notizen lesen — auch das zählt.', src:'— Empfehlung: Life OS' },
      { msg:'Trinke jetzt ein Glas Wasser.',
        sub:'Dehydration von 2% reduziert kognitive Leistung um bis zu 20%. Es klingt simpel — weil es so ist.', src:'— Journal of Nutrition, 2012' },
      { msg:'90 Minuten Deep Work ist das Optimum des Gehirns.',
        sub:'Danach sinkt die Effizienz stark. Mache eine echte Pause — kein Scrollen.', src:'— Huberman Lab Podcast' },
    ]},
  { type:'🎯 Prüfungs-Coaching', col:'#ef4444', winTitle:'🎯 Exam-Coach.exe',
    entries:[
      { msg:'2 Wochen vor der Prüfung: Aufgaben lösen, nicht Stoff wiederholen.',
        sub:'Alte Klausuren sind dein bestes Werkzeug. Ohne Lösungen. Zeit stoppen.', src:'— Testing Effect, 2006' },
      { msg:'Eine Formelsammlung handschriftlich zu erstellen ist Lernen.',
        sub:'Der Akt des Schreibens kodiert Informationen tiefer als Tippen.', src:'— Mueller & Oppenheimer, 2014' },
      { msg:'Erkläre es wie einem 10-Jährigen.',
        sub:'Wenn du es nicht einfach erklären kannst, hast du es noch nicht wirklich verstanden.', src:'— Feynman-Technik' },
    ]},
  { type:'🏆 Fortschritt', col:'#4ade80', winTitle:'★ Achievements',
    entries:[
      { msg:'Jede Pomodoro-Session ist eine Investition in deine Zukunft.',
        sub:'25 Minuten heute = ein Konzept besser verstanden = eine Prüfung sicherer bestanden.', src:'— Life OS Motivation' },
      { msg:'Du bist weiter als gestern.',
        sub:'Fortschritt ist nicht immer sichtbar. Vertrau dem Prozess und den Daten.', src:'— Life OS' },
      { msg:'Disziplin ist die Brücke zwischen Zielen und Ergebnissen.',
        sub:'Du musst es nicht mögen. Du musst es nur tun.', src:'— Jim Rohn' },
    ]},
];

function _randEntry(arr) { return arr[Math.floor(Math.random()*arr.length)]; }

// ── Reminder Modal ─────────────────────────────────────────────────────────────
function showReminder(force=false) {
  if (pomState === 'running' && !force) return;
  if (!force && Date.now() < nextReminderAt) return;
  nextReminderAt = Date.now() + 20*60*1000;

  let dlAll = [];
  try { dlAll = JSON.parse(localStorage.getItem('uni-dl-v3')||'[]'); } catch {}
  const urgent = dlAll
    .filter(d => !d.done)
    .map(d => ({...d, days: daysUntilGlobal(d.date)}))
    .filter(d => d.days >= 0 && d.days <= 10)
    .sort((a,b) => a.days - b.days)[0];

  const titleEl  = document.getElementById('reminder-title');
  const bodyEl   = document.getElementById('reminder-body');
  const tagEl    = document.getElementById('reminder-tag');
  const srcEl    = document.getElementById('reminder-source');
  const winTitle = document.getElementById('reminder-win-title');

  // Pick a motivation entry or show urgent deadline
  const cat = _randEntry(MOTIV_WINDOWS);
  const entry = _randEntry(cat.entries);

  if (urgent) {
    const subCol = urgent.col || 'var(--pink)';
    if (winTitle) winTitle.textContent = '⏰ Deadline-Alarm';
    if (tagEl)   { tagEl.textContent = '🚨 ' + urgent.subject; tagEl.style.color = subCol; }
    if (titleEl) titleEl.textContent = `${urgent.label} in ${urgent.days} Tag${urgent.days===1?'':'en'}!`;
    if (bodyEl)  bodyEl.textContent  = 'Starte jetzt eine Lernsession. Jede Stunde zählt.';
    if (srcEl)   srcEl.textContent   = '— Life OS Deadline-Monitor';
    window._reminderSubject = urgent.subject;
  } else {
    if (winTitle) winTitle.textContent = cat.winTitle;
    if (tagEl)   { tagEl.textContent = cat.type; tagEl.style.color = cat.col; }
    if (titleEl) titleEl.textContent = entry.msg;
    if (bodyEl)  bodyEl.textContent  = entry.sub;
    if (srcEl)   srcEl.textContent   = entry.src;
    window._reminderSubject = pomSubject;
  }
  const modal = document.getElementById('reminder-modal');
  if (modal) modal.style.display = 'flex';
}

function closeReminder() {
  const modal = document.getElementById('reminder-modal');
  if (modal) modal.style.display = 'none';
}
function reminderStart() {
  closeReminder();
  pomSubject = window._reminderSubject || pomSubject;
  pomStart();
}
function reminderSnooze() {
  nextReminderAt = Date.now() + 30*60*1000;
  closeReminder();
  addToast('⏸ Snooze 30 min', 'Bis gleich!', 'info');
}

// ── Floating motivation bubbles ────────────────────────────────────────────────
let motivBubbleCount = 0;
function showMotivBubble() {
  const stack = document.getElementById('motiv-stack');
  if (!stack) return;
  // Max 3 visible at once
  const existing = stack.querySelectorAll('.motiv-bubble');
  if (existing.length >= 3) existing[0].remove();

  const cat   = _randEntry(MOTIV_WINDOWS);
  const entry = _randEntry(cat.entries);
  const id    = 'mb-' + Date.now();

  const el = document.createElement('div');
  el.className = 'motiv-bubble';
  el.id = id;
  el.innerHTML = `
    <div class="rw-bar">
      <div class="rw-dots">
        <div class="rw-dot r" onclick="closeMotivBubble('${id}')" style="cursor:pointer;"></div>
        <div class="rw-dot y"></div>
        <div class="rw-dot g"></div>
      </div>
      <div class="rw-title">${cat.winTitle}</div>
      <div class="rw-close" onclick="closeMotivBubble('${id}')">✕</div>
    </div>
    <div class="motiv-bubble-body">
      <div style="font-size:9px;letter-spacing:1.5px;text-transform:uppercase;font-weight:700;color:${cat.col};margin-bottom:7px;">${cat.type}</div>
      <div class="motiv-bubble-msg">${entry.msg}</div>
      <div class="motiv-bubble-sub">${entry.sub}</div>
      <div style="font-size:9px;color:var(--muted);margin-top:5px;font-style:italic;">${entry.src}</div>
    </div>`;
  stack.appendChild(el);

  // Auto-dismiss after 18 seconds
  setTimeout(() => closeMotivBubble(id), 18000);
}

function closeMotivBubble(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.add('hiding');
  setTimeout(() => el.remove(), 300);
}

// Show first bubble after 90 seconds, then every 25 min
setTimeout(() => showMotivBubble(), 90000);
setInterval(() => showMotivBubble(), 25 * 60 * 1000);

// Expose for sidebar button
window.showMotivBubble = showMotivBubble;

// ── Inactivity-based reminder ──────────────────────────────────────────────────
document.addEventListener('mousemove', () => { lastActivity = Date.now(); });
document.addEventListener('keydown',   () => { lastActivity = Date.now(); }, true);
setInterval(() => {
  if (Date.now() - lastActivity > 20*60*1000) showReminder();
}, 5*60*1000);

// ── Hourly learning reminder ───────────────────────────────────────────────────
setInterval(() => {
  const h = new Date().getHours(), m = new Date().getMinutes();
  if ([9,14,19].includes(h) && m < 5) {
    const urgent = EXAMS_GLOBAL.map(e=>({...e,days:daysUntilGlobal(e.date)})).filter(e=>e.days>=0&&e.days<=14).sort((a,b)=>a.days-b.days);
    const msg = urgent.length>0
      ? `${urgent[0].sub} ${urgent[0].label} in ${urgent[0].days}d — jetzt lernen!`
      : 'Zeit für eine Lerneinheit. Starte einen Pomodoro!';
    sendNotif('📚 Lernzeit!', msg);
    showReminder();
  }
}, 4*60*1000);

// ── Keyboard shortcuts ─────────────────────────────────────────────────────────
document.addEventListener('keydown', e => {
  const tag = e.target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA') return;
  if (e.key === 'Escape') {
    closeFocus();
    closeReminder();
    closeDrawer();
  }
  if ((e.key === 'p' || e.key === 'P') && pomState === 'idle' && !e.ctrlKey && !e.metaKey) {
    pomShowPicker();
  }
  if ((e.key === 'f' || e.key === 'F') && pomState === 'running') {
    focusMode ? closeFocus() : openFocus();
  }
});

// ── Mobile Drawer ──────────────────────────────────────────────────────────────
let drawerOpen = false;

function toggleDrawer() {
  drawerOpen ? closeDrawer() : openDrawer();
}
function openDrawer() {
  drawerOpen = true;
  document.getElementById('drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
  document.getElementById('hamburger-btn').classList.add('open');
  syncDrawerData();
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  drawerOpen = false;
  document.getElementById('drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
  const hb = document.getElementById('hamburger-btn');
  if (hb) hb.classList.remove('open');
  document.body.style.overflow = '';
}
function syncDrawerData() {
  // Streak
  try {
    const streak = parseInt(localStorage.getItem('streak') || '0');
    if (streak > 0) {
      const ds = document.getElementById('drawer-streak');
      if (ds) ds.style.display = '';
      const dn = document.getElementById('drawer-streak-num');
      const db = document.getElementById('drawer-streak-sub');
      if (dn) dn.textContent = streak;
      if (db) db.textContent = 'Tag' + (streak === 1 ? '' : 'e');
    }
  } catch {}
  // Pomodoro status
  const ps = document.getElementById('drawer-pom-status');
  if (ps) {
    if (pomState === 'running') ps.textContent = '▶ ' + pomSubject + ' läuft — ' + fmt(pomSecs);
    else if (pomState === 'break') ps.textContent = '☕ Pause — ' + fmt(pomSecs);
    else if (pomState === 'paused') ps.textContent = '⏸ Pausiert — ' + fmt(pomSecs);
    else ps.textContent = pomSessions > 0 ? pomSessions + ' Sessions heute' : '—';
  }
  // Gamify from gamify.js
  try {
    const gs = JSON.parse(localStorage.getItem('g-state') || '{}');
    const xp = gs.xp || 0;
    const level = Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 50)) / 2));
    const thisXP = level * (level - 1) * 50;
    const nextXP = (level + 1) * level * 50;
    const pct = nextXP > thisXP ? Math.min(100, Math.round((xp - thisXP) / (nextXP - thisXP) * 100)) : 100;
    const names = [[0,'Schlafwandler'],[3,'Erwachter'],[6,'Lernender'],[10,'Fokussierter'],[15,'Meister'],[22,'Experte'],[30,'Legende'],[40,'Übermensch']];
    let cls = names[0][1];
    for (const [t,n] of names) { if (level >= t) cls = n; else break; }
    const dl = document.getElementById('drawer-level');
    const dc = document.getElementById('drawer-class');
    const dx = document.getElementById('drawer-xp-bar');
    if (dl) dl.textContent = 'Lv.' + level;
    if (dc) dc.textContent = cls;
    if (dx) dx.style.width = pct + '%';
  } catch {}
}
