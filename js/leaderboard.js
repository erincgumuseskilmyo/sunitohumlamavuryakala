/* ============================================================
   LEADERBOARD.JS
   Online (Supabase) + yerel (localStorage) puan tablosu.

   Ayarlar js/config.js dosyasındadır. Supabase'e ulaşılamazsa
   oyun yerel moda düşer ve arayüz bunu açıkça söyler — hiçbir
   zaman sahte biçimde "ortak tablo hazır" demez.
============================================================ */

const SB = {
  url: (typeof STV_CONFIG !== 'undefined' && STV_CONFIG.supabaseUrl) || '',
  anonKey: (typeof STV_CONFIG !== 'undefined' && STV_CONFIG.supabaseAnonKey) || '',
  table: (typeof STV_CONFIG !== 'undefined' && STV_CONFIG.table) || 'suni_tohumlama_vy_scores',
  view: (typeof STV_CONFIG !== 'undefined' && STV_CONFIG.boardView) || 'suni_tohumlama_vy_board',
  groupCode: (typeof STV_CONFIG !== 'undefined' && STV_CONFIG.groupCode) || 'genel',
  topCount: (typeof STV_CONFIG !== 'undefined' && STV_CONFIG.topCount) || 20,
};

const LOCAL_KEY = 'suniTohumlamaVY.localScores';
const LOCAL_PLAYER_KEY = 'suniTohumlamaVY.player';

function maskNo(no) {
  const s = String(no || '');
  if (s.length <= 4) return s;
  return s.slice(0, 2) + '•'.repeat(Math.max(s.length - 4, 1)) + s.slice(-2);
}

class Leaderboard {
  constructor() {
    this.isOnlineConfigured = !!(
      SB.url && SB.anonKey && /^https:\/\/[^/]+\.supabase\.co\/?$/i.test(SB.url.trim())
    );
    this.online = navigator.onLine;
    this.lastError = null;
    this.tableMissing = false;
    this.projectPaused = false;
    window.addEventListener('online', () => (this.online = true));
    window.addEventListener('offline', () => (this.online = false));
  }

  get baseUrl() {
    return SB.url.trim().replace(/\/+$/, '');
  }

  get headers() {
    return { apikey: SB.anonKey, Authorization: `Bearer ${SB.anonKey}` };
  }

  /* Arayüzde gösterilecek dürüst durum mesajı (yoksa null). */
  get statusMessage() {
    if (!this.isOnlineConfigured)
      return 'Ortak puan tablosu kurulu değil — puanlar yalnızca bu cihazda saklanıyor.';
    if (!this.online) return 'İnternet bağlantısı yok; puan ortak tabloya gönderilemedi.';
    if (this.projectPaused)
      return 'Supabase projesi uykuda görünüyor. supabase.com panelinden projeyi "Restore" edin.';
    if (this.tableMissing)
      return "Ortak puan tablosu Supabase'de henüz oluşturulmamış (supabase-schema.sql çalıştırılmalı). Şimdilik bu cihazdaki puanlar gösteriliyor.";
    if (this.lastError) return `Ortak tabloya ulaşılamadı (${this.lastError}). Bu cihazdaki puanlar gösteriliyor.`;
    return null;
  }

  savePlayer(p) {
    try { localStorage.setItem(LOCAL_PLAYER_KEY, JSON.stringify(p)); } catch { /* kapalı olabilir */ }
  }

  getPlayer() {
    try { return JSON.parse(localStorage.getItem(LOCAL_PLAYER_KEY)) || null; } catch { return null; }
  }

  async submit(entry) {
    this._saveLocal(entry);
    if (!this.isOnlineConfigured) return { ok: false, reason: 'not_configured' };
    if (!this.online) return { ok: false, reason: 'offline' };
    try {
      const res = await fetch(`${this.baseUrl}/rest/v1/${SB.table}`, {
        method: 'POST',
        headers: { ...this.headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
        body: JSON.stringify({
          first_name: entry.firstName,
          last_name: entry.lastName,
          student_no: entry.studentNo,
          group_code: SB.groupCode,
          score: entry.score,
          correct_count: entry.correctCount,
          wrong_count: entry.wrongCount,
          missed_count: entry.missedCount,
          max_combo: entry.maxCombo,
          lives_left: entry.livesLeft,
          finished: entry.finished,
          duration_seconds: entry.durationSeconds,
        }),
      });
      if (!res.ok) {
        const body = await res.text().catch(() => '');
        throw new Error(`HTTP ${res.status}${body ? ' — ' + body.slice(0, 120) : ''}`);
      }
      this._clearErrors();
      return { ok: true };
    } catch (err) {
      this.lastError = this._shortError(err);
      console.warn('[Vur-Yakala] Puan gönderilemedi:', err);
      return { ok: false, reason: 'network_error' };
    }
  }

  async fetchTop() {
    const n = SB.topCount;
    if (this.isOnlineConfigured && this.online) {
      try {
        const params = new URLSearchParams({
          select: 'first_name,last_initial,student_no_masked,score,wrong_count,created_at',
          group_code: `eq.${SB.groupCode}`,
          order: 'score.desc,wrong_count.asc,created_at.asc',
          limit: String(n),
        });
        const res = await fetch(`${this.baseUrl}/rest/v1/${SB.view}?${params}`, { headers: this.headers });
        if (!res.ok) {
          const body = await res.text().catch(() => '');
          throw new Error(`HTTP ${res.status}${body ? ' — ' + body.slice(0, 120) : ''}`);
        }
        const rows = await res.json();
        this._clearErrors();
        return {
          source: 'online',
          list: rows.map((r) => ({
            display: `${r.first_name} ${r.last_initial}`,
            firstName: r.first_name,
            masked: r.student_no_masked,
            score: r.score,
            wrongCount: r.wrong_count,
          })),
        };
      } catch (err) {
        this.lastError = this._shortError(err);
        console.warn('[Vur-Yakala] Ortak tablo alınamadı:', err);
      }
    }
    return { source: 'local', list: this._bestLocal().slice(0, n) };
  }

  /* Tablodaki satır bu oyuncuya mı ait? (numara maskeli karşılaştırılır) */
  static isMe(row, player) {
    if (!player) return false;
    return (
      row.masked === maskNo(player.studentNo) &&
      (row.firstName || '').toLocaleLowerCase('tr') === (player.firstName || '').toLocaleLowerCase('tr')
    );
  }

  static compare(a, b) {
    if (b.score !== a.score) return b.score - a.score;
    return (a.wrongCount || 0) - (b.wrongCount || 0);
  }

  _clearErrors() {
    this.lastError = null;
    this.tableMissing = false;
    this.projectPaused = false;
  }

  _shortError(err) {
    const m = (err && err.message) || String(err);
    if (/PGRST205|42P01|HTTP 404/i.test(m)) this.tableMissing = true;
    if (/HTTP 50[234]|paused|infrastructure/i.test(m)) this.projectPaused = true;
    if (/Failed to fetch|NetworkError|load failed/i.test(m)) return 'bağlantı kurulamadı';
    return m.slice(0, 90);
  }

  _saveLocal(entry) {
    try {
      const list = this._readLocal();
      list.push({
        firstName: entry.firstName,
        lastName: entry.lastName,
        studentNo: entry.studentNo,
        score: entry.score,
        wrongCount: entry.wrongCount,
      });
      localStorage.setItem(LOCAL_KEY, JSON.stringify(list.sort(Leaderboard.compare).slice(0, 100)));
    } catch { /* kapalı olabilir */ }
  }

  _readLocal() {
    try { return JSON.parse(localStorage.getItem(LOCAL_KEY)) || []; } catch { return []; }
  }

  _bestLocal() {
    const seen = new Set();
    return this._readLocal()
      .sort(Leaderboard.compare)
      .filter((e) => (seen.has(e.studentNo) ? false : seen.add(e.studentNo)))
      .map((e) => ({
        display: `${e.firstName} ${(e.lastName || '').charAt(0)}.`,
        firstName: e.firstName,
        masked: maskNo(e.studentNo),
        score: e.score,
        wrongCount: e.wrongCount,
      }));
  }
}
