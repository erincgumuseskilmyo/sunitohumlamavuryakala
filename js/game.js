/* ============================================================
   GAME.JS — Vur-Yakala: Suni Tohumlama
   Akış: giriş (ad, soyad, öğrenci no) → 5 tur → sonuç + puan tablosu
============================================================ */

const ROUND_MS = 20000;
const BANNER_MS = 1600;
const HOLE_COUNT = 9;
const START_LIVES = 5;
const LIFE_BONUS = 25;

const $ = (id) => document.getElementById(id);
const board = new Leaderboard();
let player = null;
let state = null;

/* ---------- Ses (dosyasız, Web Audio) ---------- */
let audioCtx = null;
function beep(freq, ms, type = 'sine', vol = 0.08) {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(vol, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + ms / 1000);
    o.connect(g).connect(audioCtx.destination);
    o.start();
    o.stop(audioCtx.currentTime + ms / 1000);
  } catch { /* ses desteklenmiyor olabilir */ }
}
const sfx = {
  good: (combo) => beep(520 + Math.min(combo, 6) * 60, 120, 'triangle'),
  bad: () => beep(150, 260, 'sawtooth', 0.06),
  round: () => { beep(660, 120); setTimeout(() => beep(880, 160), 130); },
};

/* ---------- Yardımcılar ---------- */
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function show(screenId) {
  document.querySelectorAll('.screen').forEach((s) => s.classList.toggle('active', s.id === screenId));
  window.scrollTo(0, 0);
}
function titleCaseTr(s) {
  return s
    .trim()
    .replace(/\s+/g, ' ')
    .split(' ')
    .map((w) => w.charAt(0).toLocaleUpperCase('tr') + w.slice(1).toLocaleLowerCase('tr'))
    .join(' ');
}

/* ---------- Görseller ----------
   Her kartın görseli gorseller/<kart id>.<uzantı> dosyasından okunur.
   Uzantılar sırayla denenir; hiçbiri yoksa kartta emoji gösterilir.
   Dosya adları için: gorsel-kontrol.html */
const IMG_DIR = 'gorseller';
const IMG_EXTS = ['jpg', 'jpeg', 'png', 'webp', 'gif'];
function findImage(id) {
  return new Promise((resolve) => {
    let i = 0;
    const tryNext = () => {
      if (i >= IMG_EXTS.length) return resolve(null);
      const url = `${IMG_DIR}/${id}.${IMG_EXTS[i++]}`;
      const im = new Image();
      im.onload = () => resolve(url);
      im.onerror = tryNext;
      im.src = url;
    };
    tryNext();
  });
}
const ALL_CARDS = ROUNDS.flatMap((r) => [...r.correct, ...r.wrong]);
const imagesReady = Promise.all(ALL_CARDS.map(async (c) => { c.src = await findImage(c.id); }));

/* ---------- Puan tablosu ---------- */
async function renderBoard(listId, statusId) {
  const ol = $(listId);
  ol.innerHTML = '<li class="muted">Yükleniyor…</li>';
  const { list, source } = await board.fetchTop();
  const msg = board.statusMessage;
  $(statusId).textContent = msg || (source === 'online' ? `Sınıf kodu: ${STV_CONFIG.groupCode} · her öğrencinin en iyi puanı` : '');
  if (!list.length) {
    ol.innerHTML = '<li class="muted">Henüz puan yok. İlk sen ol!</li>';
    return;
  }
  ol.innerHTML = list
    .map((r) => `<li class="${Leaderboard.isMe(r, player) ? 'me' : ''}">
        <span class="nm">${esc(r.display)}</span>
        <span class="no">${esc(r.masked)}</span>
        <span class="sc">${r.score}</span></li>`)
    .join('');
}

/* ---------- Giriş ---------- */
function initLogin() {
  const saved = board.getPlayer();
  if (saved) {
    $('in-first').value = saved.firstName || '';
    $('in-last').value = saved.lastName || '';
    $('in-no').value = saved.studentNo || '';
  }
  $('in-no').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, ''); });

  $('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const first = titleCaseTr($('in-first').value);
    const last = titleCaseTr($('in-last').value);
    const no = $('in-no').value.trim();
    const nameRe = /^[\p{L}][\p{L} '.-]*$/u;
    let err = '';
    if (!first || !nameRe.test(first)) err = 'Adını harflerle yaz.';
    else if (!last || !nameRe.test(last)) err = 'Soyadını harflerle yaz.';
    else if (!/^\d{5,15}$/.test(no)) err = 'Öğrenci numarası 5–15 haneli, yalnızca rakam olmalı.';
    $('login-error').textContent = err;
    if (err) return;
    player = { firstName: first, lastName: last, studentNo: no };
    board.savePlayer(player);
    imagesReady.then(startGame);
  });

  $('howto-toggle').addEventListener('click', () => $('howto').classList.toggle('open'));
  $('credits-toggle').addEventListener('click', () => $('credits').classList.toggle('open'));
  $('credits').innerHTML =
    '<p>Birinci turdaki renet, cerrahi iğne, inek ağız sondası ve muşet görselleri ile beşinci turdaki kart çizimleri ImageGen ile üretildi. Fotoğraf kaynakları aşağıda listelenmiştir.</p><ul>' +
    CREDITS.map((c) => `<li><a href="${esc(c.source)}" target="_blank" rel="noopener">${esc(c.title)}</a> — ${esc(c.author)} · ${esc(c.license)}</li>`).join('') +
    '</ul>';

  $('retry-btn').addEventListener('click', startGame);
  $('change-player-btn').addEventListener('click', () => {
    show('login-screen');
    renderBoard('board-login', 'board-status-login');
    $('in-first').focus();
  });

  renderBoard('board-login', 'board-status-login');
}

/* ---------- Oyun ---------- */
function buildField() {
  const field = $('field');
  field.innerHTML = '';
  for (let i = 0; i < HOLE_COUNT; i++) {
    const h = document.createElement('div');
    h.className = 'hole';
    field.appendChild(h);
  }
}

function startGame() {
  if (state) stopTimers();
  state = {
    score: 0,
    lives: START_LIVES,
    round: 0,
    timeLeft: ROUND_MS,
    combo: 0,
    maxCombo: 0,
    correctCount: 0,
    wrongHits: [],   // {round, card}
    missed: ROUNDS.map(() => new Set()),
    holes: new Array(HOLE_COUNT).fill(null),
    paused: true,
    running: true,
    startedAt: performance.now(),
    lastTick: performance.now(),
    spawnTimer: null,
    tickId: null,
    lastCards: [],
  };
  show('game-screen');
  buildField();
  updateHUD();
  beginRound();
  state.tickId = setInterval(tick, 100);
}

function beginRound() {
  const r = ROUNDS[state.round];
  state.paused = true;
  state.timeLeft = ROUND_MS;
  clearHoles();
  $('instruction').textContent = r.instruction;
  $('round-label').textContent = `Tur ${state.round + 1}/${ROUNDS.length}`;
  $('timer-inner').style.width = '100%';
  $('timer-inner').classList.remove('low');
  const banner = $('round-banner');
  banner.innerHTML = `<div class="big">Tur ${state.round + 1}: ${esc(r.title)}</div><div class="sub">${esc(r.instruction)}</div>`;
  banner.classList.add('show');
  sfx.round();
  const s = state;
  setTimeout(() => {
    if (state !== s || !s.running) return;
    banner.classList.remove('show');
    state.paused = false;
    state.lastTick = performance.now();
    scheduleSpawn(250);
  }, BANNER_MS);
}

/* Süre setInterval ile ilerler; sekme gizliyken (öğrenci başka
   uygulamaya geçtiğinde) süre de kart çıkışı da durur. */
function tick() {
  if (!state || !state.running) return;
  const now = performance.now();
  const dt = now - state.lastTick;
  state.lastTick = now;
  if (!state.paused && !document.hidden) {
    state.timeLeft -= dt;
    const pct = Math.max(0, state.timeLeft / ROUND_MS) * 100;
    $('timer-inner').style.width = pct + '%';
    $('timer-inner').classList.toggle('low', pct < 25);
    if (state.timeLeft <= 0) {
      clearTimeout(state.spawnTimer);
      state.round++;
      if (state.round >= ROUNDS.length) return endGame(true);
      beginRound();
    }
  }
}

/* Hız ayarı: kartların çıkma aralığı (ms). Büyüdükçe oyun yavaşlar. */
function spawnDelay() {
  return Math.max(1000, 1400 - state.round * 60 - Math.random() * 150);
}
function scheduleSpawn(ms) {
  clearTimeout(state.spawnTimer);
  state.spawnTimer = setTimeout(() => {
    if (!state.running || state.paused) return;
    if (!document.hidden) spawnItem();
    scheduleSpawn(spawnDelay());
  }, ms);
}

function pickCard(round) {
  const isCorrect = Math.random() < 0.5;
  const pool = isCorrect ? round.correct : round.wrong;
  const visible = new Set(state.holes.filter(Boolean).map((h) => h.card.l));
  const fresh = pool.filter((c) => !visible.has(c.l) && !state.lastCards.includes(c.l));
  const choices = fresh.length ? fresh : pool.filter((c) => !visible.has(c.l));
  if (!choices.length) return null;
  const card = choices[Math.floor(Math.random() * choices.length)];
  state.lastCards = [card.l, ...state.lastCards].slice(0, 3);
  return { card, isCorrect };
}

function spawnItem() {
  const empty = state.holes.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!empty.length) return;
  const idx = empty[Math.floor(Math.random() * empty.length)];
  const picked = pickCard(ROUNDS[state.round]);
  if (!picked) return;
  const { card, isCorrect } = picked;

  const el = document.createElement('div');
  el.className = 'item';
  el.innerHTML =
    `<div class="pic">${card.src ? `<img src="${esc(card.src)}" alt="">` : `<span class="emoji">${card.e}</span>`}</div>` +
    `<div class="label">${esc(card.l)}</div>`;
  const holeEl = $('field').children[idx];
  holeEl.appendChild(el);
  void el.offsetWidth; // başlangıç konumunu uygula, sonra yukarı kaydır
  el.classList.add('up');

  /* Kartın delikte kalma süresi (ms). Büyüdükçe vurmak kolaylaşır. */
  const life = Math.max(2100, 2700 - state.round * 120) + Math.random() * 400;
  const entry = { el, card, isCorrect, round: state.round };
  entry.hideTimer = setTimeout(() => expire(idx, entry), life);
  state.holes[idx] = entry;

  el.addEventListener('pointerdown', (e) => { e.preventDefault(); hit(idx, entry); });
}

function expire(idx, entry) {
  if (state.holes[idx] !== entry) return;
  state.holes[idx] = null;
  if (entry.isCorrect && state.running) {
    state.missed[entry.round].add(entry.card.l);
    if (state.combo > 0) { state.combo = 0; updateCombo(); }
  }
  entry.el.classList.remove('up');
  setTimeout(() => entry.el.remove(), 220);
}

function hit(idx, entry) {
  if (!state.running || state.paused || state.holes[idx] !== entry) return;
  clearTimeout(entry.hideTimer);
  state.holes[idx] = null;
  const holeEl = $('field').children[idx];

  if (entry.isCorrect) {
    state.combo++;
    state.maxCombo = Math.max(state.maxCombo, state.combo);
    const pts = 10 + Math.min(state.combo - 1, 5) * 2;
    state.score += pts;
    state.correctCount++;
    entry.el.classList.add('hit-good');
    floater(holeEl, `+${pts}`, 'good');
    sfx.good(state.combo);
  } else {
    state.lives--;
    state.combo = 0;
    state.wrongHits.push({ round: entry.round, card: entry.card });
    entry.el.classList.add('hit-bad');
    floater(holeEl, '−1 can', 'bad');
    sfx.bad();
    const f = $('field');
    f.classList.remove('shake');
    void f.offsetWidth;
    f.classList.add('shake');
  }
  updateHUD();
  setTimeout(() => entry.el.remove(), 220);
  if (state.lives <= 0) endGame(false);
}

function floater(holeEl, text, cls) {
  const f = document.createElement('div');
  f.className = 'floater ' + cls;
  f.textContent = text;
  holeEl.appendChild(f);
  setTimeout(() => f.remove(), 750);
}

function updateCombo() {
  $('combo').textContent = state.combo >= 2 ? `🔥 ${state.combo} kombo!` : '';
}
function updateHUD() {
  const l = Math.max(0, state.lives);
  $('hearts').textContent = '❤️'.repeat(l) + '🖤'.repeat(START_LIVES - l);
  $('score-box').textContent = `${state.score} puan`;
  updateCombo();
}

function clearHoles() {
  state.holes.forEach((h) => { if (h) { clearTimeout(h.hideTimer); h.el.remove(); } });
  state.holes.fill(null);
}
function stopTimers() {
  state.running = false;
  clearTimeout(state.spawnTimer);
  clearInterval(state.tickId);
  clearHoles();
  $('round-banner').classList.remove('show');
}

/* ---------- Sonuç ---------- */
async function endGame(finished) {
  stopTimers();
  const bonus = finished ? state.lives * LIFE_BONUS : 0;
  state.score += bonus;
  const missedCount = state.missed.reduce((n, s) => n + s.size, 0);
  const duration = Math.max(1, Math.round((performance.now() - state.startedAt) / 1000));

  show('end-screen');
  $('end-title').textContent = finished ? 'Tüm Turlar Tamamlandı!' : 'Canların Bitti!';

  let grade;
  if (state.score >= 900) grade = 'Çok İyi 🌟';
  else if (state.score >= 600) grade = 'İyi 👍';
  else if (state.score >= 300) grade = 'Orta 🙂';
  else grade = 'Tekrar Et 🔁';
  $('grade-label').textContent = `${grade} · ${state.score} puan`;

  $('end-stats').innerHTML = [
    [state.correctCount, 'doğru vuruş'],
    [state.wrongHits.length, 'yanlış vuruş'],
    [state.maxCombo, 'en uzun kombo'],
    [finished ? `+${bonus}` : '—', 'can bonusu'],
  ].map(([v, t]) => `<div class="stat"><b>${v}</b><span>${t}</span></div>`).join('');

  renderRecap();

  const st = $('submit-status');
  st.className = 'submit-status';
  st.textContent = 'Puan kaydediliyor…';
  const res = await board.submit({
    firstName: player.firstName,
    lastName: player.lastName,
    studentNo: player.studentNo,
    score: state.score,
    correctCount: state.correctCount,
    wrongCount: state.wrongHits.length,
    missedCount,
    maxCombo: state.maxCombo,
    livesLeft: Math.max(0, state.lives),
    finished,
    durationSeconds: duration,
  });
  if (res.ok) {
    st.textContent = `✔ ${player.firstName} ${player.lastName} (${player.studentNo}) — puan ortak tabloya kaydedildi.`;
    st.classList.add('ok');
  } else {
    st.textContent = 'Puan yalnızca bu cihaza kaydedildi (ortak tabloya gönderilemedi).';
  }
  renderBoard('board-end', 'board-status-end');
}

function renderRecap() {
  $('recap').innerHTML = ROUNDS.map((r, i) => {
    const wrongMap = new Map();
    state.wrongHits.filter((w) => w.round === i).forEach((w) => {
      const prev = wrongMap.get(w.card.l);
      wrongMap.set(w.card.l, { card: w.card, n: prev ? prev.n + 1 : 1 });
    });
    const wrong = [...wrongMap.values()];
    const missed = r.correct.filter((c) => state.missed[i].has(c.l));
    let html = `<div class="recap-item"><div class="recap-title">Tur ${i + 1} · ${esc(r.title)}: ${esc(r.instruction)}</div>`;
    if (wrong.length) {
      html += '<div class="bad">Yanlış vurduğun kartlar:</div><ul>' +
        wrong.map((w) => `<li><b>${esc(w.card.l)}</b>${w.n > 1 ? ` (${w.n} kez)` : ''} — ${esc(w.card.w)}</li>`).join('') + '</ul>';
    }
    if (missed.length) {
      html += '<div>Kaçırdığın doğrular:</div><ul>' +
        missed.map((c) => `<li><b>${esc(c.l)}</b> — ${esc(c.w)}</li>`).join('') + '</ul>';
    }
    html += '<div class="good">Bu turun doğruları:</div><ul>' +
      r.correct.map((c) => `<li><b>${esc(c.l)}</b> — ${esc(c.w)}</li>`).join('') + '</ul></div>';
    return html;
  }).join('');
}

initLogin();
