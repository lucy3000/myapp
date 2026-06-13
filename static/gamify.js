// ── Gamification System ──────────────────────────────────────────────────────

const XP_REWARDS = {
  pomodoro: 50,
  habit:    10,
  gym:      35,
  boxing:   30,
  run:      25,
  task:     20,
  language: 15,
  bears:    25,
};

const LEVEL_CLASSES = [
  [0,  'Schlafwandler'],
  [3,  'Erwachter'],
  [6,  'Lernender'],
  [10, 'Fokussierter'],
  [15, 'Meister'],
  [22, 'Experte'],
  [30, 'Legende'],
  [40, 'Übermensch'],
];

const STATS_DEF = [
  { key:'str', label:'STR', desc:'Sport & Gym',    color:'#22c55e' },
  { key:'int', label:'INT', desc:'Uni & Lernen',   color:'#60a5fa' },
  { key:'dex', label:'DEX', desc:'Sprachen',       color:'#f97316' },
  { key:'wis', label:'WIS', desc:'Projekte',       color:'#a855f7' },
];

const QUEST_POOL = [
  { id:'pom2',    text:'2 Pomodoros abschließen',        xp:100, stat:'int' },
  { id:'pom4',    text:'4 Pomodoros — Power Session',    xp:200, stat:'int' },
  { id:'gym',     text:'Gym-Session absolvieren',         xp:80,  stat:'str' },
  { id:'sport',   text:'Boxen oder Laufen',               xp:60,  stat:'str' },
  { id:'habits',  text:'Alle Habits abgehakt',            xp:50,  stat:'wis' },
  { id:'lang',    text:'Sprachen 30 min üben',            xp:60,  stat:'dex' },
  { id:'bears',   text:'BEARS-Aufgabe bearbeiten',        xp:70,  stat:'wis' },
  { id:'task3',   text:'3 Aufgaben abschließen',          xp:80,  stat:'wis' },
  { id:'login',   text:'Life OS heute geöffnet',          xp:15,  stat:null  },
  { id:'streak',  text:'Streak am Leben halten',          xp:25,  stat:null  },
];

const ACHIEVEMENTS = [
  { id:'first_pom', icon:'🍅', name:'Erster Funke',   desc:'1. Pomodoro',        check:s => s.pomTotal >= 1 },
  { id:'pom10',     icon:'🔥', name:'Hitzekopf',      desc:'10 Pomodoros',       check:s => s.pomTotal >= 10 },
  { id:'pom50',     icon:'⚡', name:'Blitzdenker',    desc:'50 Pomodoros',       check:s => s.pomTotal >= 50 },
  { id:'pom100',    icon:'💎', name:'Kristallgeist',  desc:'100 Pomodoros',      check:s => s.pomTotal >= 100 },
  { id:'streak3',   icon:'✨', name:'Funke',          desc:'3-Tage Streak',      check:s => s.streakMax >= 3 },
  { id:'streak7',   icon:'🌊', name:'Welle',          desc:'7-Tage Streak',      check:s => s.streakMax >= 7 },
  { id:'streak14',  icon:'🌀', name:'Strudel',        desc:'14-Tage Streak',     check:s => s.streakMax >= 14 },
  { id:'streak30',  icon:'🏆', name:'Unaufhaltsam',   desc:'30-Tage Streak',     check:s => s.streakMax >= 30 },
  { id:'lvl5',      icon:'⭐', name:'Aufgestiegener', desc:'Level 5 erreicht',   check:s => xpToLevel(s.xp) >= 5 },
  { id:'lvl10',     icon:'🌟', name:'Erleuchteter',   desc:'Level 10 erreicht',  check:s => xpToLevel(s.xp) >= 10 },
];

// ── XP / Level math ──────────────────────────────────────────────────────────
function xpToLevel(xp) {
  // n*(n-1)*50  → invert: level ≈ (1 + sqrt(1+8*xp/50)) / 2
  return Math.max(1, Math.floor((1 + Math.sqrt(1 + 8 * xp / 50)) / 2));
}
function levelThreshold(level) { return level * (level - 1) * 50; }
function levelClass(level) {
  let cls = LEVEL_CLASSES[0][1];
  for (const [threshold, name] of LEVEL_CLASSES) {
    if (level >= threshold) cls = name; else break;
  }
  return cls;
}

// ── State ────────────────────────────────────────────────────────────────────
function loadState() {
  try {
    return JSON.parse(localStorage.getItem('g-state') || '{}');
  } catch { return {}; }
}
function saveState(s) {
  try { localStorage.setItem('g-state', JSON.stringify(s)); } catch {}
}
function getState() {
  const s = loadState();
  return {
    xp:         s.xp         || 0,
    str:        s.str        || 0,
    int:        s.int        || 0,
    dex:        s.dex        || 0,
    wis:        s.wis        || 0,
    pomTotal:   s.pomTotal   || 0,
    streakMax:  s.streakMax  || 0,
    earnedAch:  s.earnedAch  || [],
    quests:     s.quests     || [],
    questDate:  s.questDate  || '',
    pomToday:   s.pomToday   || 0,
    taskToday:  s.taskToday  || 0,
    pomDate:    s.pomDate    || '',
    taskDate:   s.taskDate   || '',
  };
}

// ── Public API ───────────────────────────────────────────────────────────────
window.earnXP = function(amount, statKey, reason, sourceX, sourceY) {
  const s = getState();
  const oldLevel = xpToLevel(s.xp);
  s.xp += amount;
  if (statKey && s[statKey] !== undefined) {
    s[statKey] = Math.min(100, s[statKey] + Math.ceil(amount / 10));
  }
  // Track daily pomodoros / tasks for quests
  const today = new Date().toDateString();
  if (statKey === 'int') {
    if (s.pomDate !== today) { s.pomToday = 0; s.pomDate = today; }
    s.pomToday++;
    s.pomTotal++;
  }
  if (statKey === 'wis' && reason === 'task') {
    if (s.taskDate !== today) { s.taskToday = 0; s.taskDate = today; }
    s.taskToday++;
  }
  saveState(s);
  const newLevel = xpToLevel(s.xp);
  if (newLevel > oldLevel) triggerLevelUp(newLevel);
  checkAchievements(s);
  renderGamify();
  showXPGain(amount, reason || ('+' + amount + ' XP'), sourceX, sourceY);
};

window.gamifyQuestComplete = function(questId) {
  const s = getState();
  const q = s.quests.find(q => q.id === questId);
  if (!q || q.done) return;
  q.done = true;
  saveState(s);
  window.earnXP(q.xp, q.stat, 'Quest: ' + q.text);
  renderGamify();
};

// ── Daily Quests ─────────────────────────────────────────────────────────────
function ensureQuests() {
  const s = getState();
  const today = new Date().toDateString();
  if (s.questDate === today && s.quests.length > 0) return s;

  // Auto-complete "login" quest on new day
  const shuffled = [...QUEST_POOL].sort(() => Math.random() - 0.5);
  const chosen = shuffled.slice(0, 4);
  chosen.forEach(q => { if (q.id === 'login') q.done = true; });
  s.quests = chosen.map(q => ({ ...q, done: q.id === 'login' }));
  s.questDate = today;
  saveState(s);
  return s;
}

// ── Auto-quest tracking ───────────────────────────────────────────────────────
// Hook into existing pomodoro completion (called after each session ends)
const _origSendNotif = window.sendNotif;
// We'll track via earnXP calls, so no need to hook sendNotif

// ── Achievements ─────────────────────────────────────────────────────────────
function checkAchievements(s) {
  // Sync streak max
  try {
    const streakNow = parseInt(localStorage.getItem('streak') || '0');
    if (streakNow > s.streakMax) {
      s.streakMax = streakNow;
      saveState(s);
    }
  } catch {}

  let newEarned = false;
  ACHIEVEMENTS.forEach(a => {
    if (!s.earnedAch.includes(a.id) && a.check(s)) {
      s.earnedAch.push(a.id);
      newEarned = true;
      setTimeout(() => {
        addToast('🏆 Achievement freigeschaltet!', a.icon + ' ' + a.name + ' — ' + a.desc, 'info');
      }, 300);
    }
  });
  if (newEarned) saveState(s);
}

// ── XP Gain popup ─────────────────────────────────────────────────────────────
function showXPGain(amount, label, x, y) {
  const el = document.createElement('div');
  el.className = 'xp-gain-popup';
  el.textContent = '+' + amount + ' XP';
  el.style.left = (x || (window.innerWidth - 260)) + 'px';
  el.style.top  = (y || (window.innerHeight - 120)) + 'px';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1300);
}

function triggerLevelUp(newLevel) {
  const el = document.createElement('div');
  el.className = 'level-up-flash';
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 800);
  addToast('⬆ LEVEL UP!', 'Level ' + newLevel + ' erreicht — ' + levelClass(newLevel), 'info');
}

// ── Render ────────────────────────────────────────────────────────────────────
function renderGamify() {
  const s = ensureQuests();
  const level = xpToLevel(s.xp);
  const cls   = levelClass(level);
  const thisXP = levelThreshold(level);
  const nextXP = levelThreshold(level + 1);
  const pct    = nextXP > thisXP ? Math.min(100, Math.round((s.xp - thisXP) / (nextXP - thisXP) * 100)) : 100;

  // Level/XP card
  setEl('g-level-num',   level);
  setEl('g-class-name',  cls);
  setEl('g-level-badge', 'Lv.' + level);
  setStyle('g-xp-bar',   'width', pct + '%');
  setEl('g-xp-curr',     s.xp + ' XP');
  setEl('g-xp-next',     nextXP + ' XP');

  // Topbar (tablet/mobile)
  setEl('topbar-level', 'Lv.' + level);
  setStyle('topbar-xp-bar', 'width', pct + '%');

  // Stats
  const statsGrid = document.getElementById('g-stats-grid');
  if (statsGrid) {
    statsGrid.innerHTML = STATS_DEF.map(st => `
      <div class="stat-item">
        <div class="stat-label-row">
          <span class="stat-name">${st.label}</span>
          <span class="stat-val">${s[st.key] || 0}</span>
        </div>
        <div class="stat-bar-wrap">
          <div class="stat-bar" style="width:${s[st.key] || 0}%;background:${st.color};box-shadow:0 0 5px ${st.color}66;"></div>
        </div>
      </div>`).join('');
  }

  // Quests
  const questList = document.getElementById('g-quests-list');
  if (questList) {
    const done = s.quests.filter(q => q.done).length;
    setEl('g-quest-count', done + '/' + s.quests.length);
    questList.innerHTML = s.quests.map(q => `
      <div class="quest-item${q.done ? ' done' : ''}" onclick="gamifyQuestComplete('${q.id}')">
        <div class="quest-check">${q.done ? '✓' : ''}</div>
        <div class="quest-info">
          <div class="quest-text">${q.text}</div>
        </div>
        <div class="quest-xp">+${q.xp}</div>
      </div>`).join('');
  }

  // Boss battle
  const bossEl = document.getElementById('g-boss-content');
  if (bossEl) {
    const now = new Date();
    const exams = (window.EXAMS_GLOBAL || [])
      .map(e => ({ ...e, days: Math.ceil((new Date(e.date) - now) / 86400000) }))
      .filter(e => e.days >= 0)
      .sort((a, b) => a.days - b.days);
    if (exams.length > 0) {
      const boss = exams[0];
      const maxDays = 60;
      const hpPct = Math.max(5, Math.min(100, Math.round(boss.days / maxDays * 100)));
      bossEl.innerHTML = `
        <div class="boss-label">Nächster Gegner</div>
        <div class="boss-name" style="color:${boss.col || 'var(--red)'};">${boss.sub} — ${boss.label}</div>
        <div class="boss-days" style="color:${boss.days <= 7 ? 'var(--red)' : boss.col || 'var(--text)'};">${boss.days}</div>
        <div class="boss-unit">Tage verbleibend</div>
        <div class="boss-hp-wrap">
          <div class="boss-hp-bar" style="width:${hpPct}%;${boss.days<=7?'animation:pulse-glow 1s infinite;':''}"></div>
        </div>
        <div class="boss-hp-label">${boss.days <= 7 ? '⚠ KRITISCH — Lern-Sprint!' : boss.days <= 21 ? '— Vorbereitung läuft' : '— Zeit noch vorhanden'}</div>`;
    } else {
      bossEl.innerHTML = `<div style="font-size:9px;color:var(--muted);text-align:center;padding:8px 0;">Keine Prüfungen anstehend ✓</div>`;
    }
  }

  // Achievements
  const achList = document.getElementById('g-ach-list');
  if (achList) {
    const earned = s.earnedAch || [];
    setEl('g-ach-count', earned.length + '/' + ACHIEVEMENTS.length);
    const sorted = [...ACHIEVEMENTS].sort((a, b) => {
      const ae = earned.includes(a.id), be = earned.includes(b.id);
      return ae === be ? 0 : ae ? -1 : 1;
    });
    achList.innerHTML = sorted.slice(0, 6).map(a => {
      const e = earned.includes(a.id);
      return `<div class="ach-item${e ? ' earned' : ''}">
        <div class="ach-icon${e ? ' earned' : ''}">${a.icon}</div>
        <div><div class="ach-name">${a.name}</div><div class="ach-desc">${a.desc}</div></div>
      </div>`;
    }).join('');
  }
}

function setEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}
function setStyle(id, prop, val) {
  const el = document.getElementById(id);
  if (el) el.style[prop] = val;
}

// ── Pomodoro XP Hook ──────────────────────────────────────────────────────────
// Patch into the existing pomInterval — after each completed work session
// we call earnXP. We do this by hooking the global pomSessions variable change.
// The cleanest way: override the startPomInterval callback by patching after load.
(function hookPomodoro() {
  const origStart = window.startPomInterval;
  if (!origStart) {
    // app.js not loaded yet, try again
    setTimeout(hookPomodoro, 500);
    return;
  }

  // We track pomSessions before/after each tick
  let lastSessions = 0;
  setInterval(() => {
    if (typeof window.pomSessions !== 'undefined' && window.pomSessions > lastSessions) {
      const diff = window.pomSessions - lastSessions;
      for (let i = 0; i < diff; i++) {
        window.earnXP(XP_REWARDS.pomodoro, 'int', 'Pomodoro', window.innerWidth - 280, window.innerHeight - 100);
      }
      lastSessions = window.pomSessions;
      // Check quest completion
      const s = getState();
      const q2 = s.quests.find(q => q.id === 'pom2');
      const q4 = s.quests.find(q => q.id === 'pom4');
      if (q2 && !q2.done && s.pomToday >= 2) window.gamifyQuestComplete('pom2');
      if (q4 && !q4.done && s.pomToday >= 4) window.gamifyQuestComplete('pom4');
    }
  }, 2000);
})();

// ── Streak sync ───────────────────────────────────────────────────────────────
(function syncStreak() {
  try {
    const streak = parseInt(localStorage.getItem('streak') || '0');
    const s = getState();
    if (streak > s.streakMax) {
      s.streakMax = streak;
      saveState(s);
    }
    // Auto-complete streak quest
    const sq = s.quests.find(q => q.id === 'streak' || q.id === 'login');
    if (sq && !sq.done) {
      sq.done = true;
      saveState(s);
    }
  } catch {}
})();

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAchievements(getState());
  renderGamify();
});

// Also render immediately in case DOMContentLoaded already fired
if (document.readyState !== 'loading') {
  checkAchievements(getState());
  renderGamify();
}
