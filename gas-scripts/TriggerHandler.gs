/**
 * ===============================================
 * TriggerHandler.gs — Unified Trigger via 1 Sheet
 * ===============================================
 * Satu sheet "Trigger" untuk semua scraper:
 *
 *   A1 = Command Expedite        B1 = Command BuyerRR
 *   A2 = Status Expedite         B2 = Status BuyerRR
 *   A3 = Updated Expedite        B3 = Updated BuyerRR
 *
 *   C1 = Command Monitor SDHO    D1 = Command Control Stuck FM
 *   C2 = Status Monitor SDHO     D2 = Status Control Stuck FM
 *   C3 = Updated Monitor SDHO    D3 = Updated Control Stuck FM
 *
 * onChange terpicu → cek A1, B1, C1, D1 secara independen.
 *
 * SETUP:
 *   1. Jalankan setupTriggerSheet() sekali
 *   2. Triggers → Add → onChangeTrigger → On change
 * ===============================================
 */

const SS_ID_TRIGGER = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
const SHEET_TRIGGER = 'Trigger';

let _activeTriggerCol = 'A';

function _getTriggerSheet() {
  return SpreadsheetApp.openById(SS_ID_TRIGGER).getSheetByName(SHEET_TRIGGER);
}

// Helper: set kolom jadi RUNNING + reset status/updated
function _setRunning(sheet, col) {
  sheet.getRange(col + '1').setValue('RUNNING');
  sheet.getRange(col + '2').setValue('0|Memulai...');
  sheet.getRange(col + '3').setValue('');
  SpreadsheetApp.flush();
}

// ============================================================
// onChange TRIGGER — entry point utama
// ============================================================
function onChangeTrigger(e) {
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) { Logger.log('❌ Sheet "Trigger" tidak ditemukan'); return; }

    const a1 = String(sheet.getRange('A1').getValue() || '').trim().toUpperCase();
    const b1 = String(sheet.getRange('B1').getValue() || '').trim().toUpperCase();
    const c1 = String(sheet.getRange('C1').getValue() || '').trim().toUpperCase();
    const d1 = String(sheet.getRange('D1').getValue() || '').trim().toUpperCase();

    Logger.log('🔍 onChangeTrigger — A1:"' + a1 + '" B1:"' + b1 + '" C1:"' + c1 + '" D1:"' + d1 + '"');

    // ── Expedite (A) ────────────────────────────────────────
    if (a1 === 'RUN' || a1 === 'RESUME') {
      Logger.log('🎯 Expedite: ' + a1);
      _activeTriggerCol = 'A';
      _setRunning(sheet, 'A');
      try {
        if (a1 === 'RUN') fetchExpediteData();
        else resumeExpediteScenarios();
      } catch (err) {
        setProgressError_(err.message);
        Logger.log('❌ Expedite: ' + err.message);
      } finally {
        sheet.getRange('A1').setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    // ── Buyer RR (B) ────────────────────────────────────────
    if (b1 === 'RUN' || b1 === 'RESUME') {
      Logger.log('🎯 BuyerRR: ' + b1);
      _activeTriggerCol = 'B';
      _setRunning(sheet, 'B');
      try {
        fetchBuyerRRData();
      } catch (err) {
        buyerRRSetProgressError_(err.message);
        Logger.log('❌ BuyerRR: ' + err.message);
      } finally {
        sheet.getRange('B1').setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    // ── Monitor SDHO (C) ────────────────────────────────────
    if (c1 === 'RUN' || c1 === 'RESUME') {
      Logger.log('🎯 Monitor SDHO: ' + c1);
      _activeTriggerCol = 'C';
      _setRunning(sheet, 'C');
      try {
        fetchSPXPickupOrders();
      } catch (err) {
        setPickupProgressError_(err.message);
        Logger.log('❌ Monitor SDHO: ' + err.message);
      } finally {
        sheet.getRange('C1').setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    // ── Control Stuck FM (D) ────────────────────────────────
    if (d1 === 'RUN' || d1 === 'RESUME') {
      Logger.log('🎯 Control Stuck FM: ' + d1);
      _activeTriggerCol = 'D';
      _setRunning(sheet, 'D');
      try {
        getSPXOrderCount();
      } catch (err) {
        csfmSetProgressError_(err.message);
        Logger.log('❌ Control Stuck FM: ' + err.message);
      } finally {
        sheet.getRange('D1').setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    // ── Backlog LM (E) ──────────────────────────────────────
    const e1 = String(sheet.getRange('E1').getValue() || '').trim().toUpperCase();
    if (e1 === 'RUN' || e1 === 'RESUME') {
      Logger.log('🎯 Backlog LM: ' + e1);
      _activeTriggerCol = 'E';
      _setRunning(sheet, 'E');
      try {
        if (e1 === 'RUN') TarikBacklog();
        else resumeBacklogSLS();
      } catch (err) {
        setProgressError_(err.message);
        Logger.log('❌ Backlog LM: ' + err.message);
      } finally {
        sheet.getRange('E1').setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    Logger.log('⏭️ Tidak ada command aktif — skip');

  } catch (outerErr) {
    Logger.log('❌ onChangeTrigger outer error: ' + outerErr.message);
  }
}

// ============================================================
// OVERRIDE setProgress_ — Expedite (kolom A) + Backlog LM (kolom E)
// Backlog LM menggunakan setProgress_/Done_/Error_ yang sama persis
// dengan Expedite. Kita bedakan target kolom dari _activeTriggerCol.
// ============================================================
function setProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent, message, done: false, error: null }), 600);
  } catch (e) {}
  const col = (_activeTriggerCol === 'E') ? 'E' : 'A';
  _writeStatus(col, percent, message);
}

function setProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600);
  } catch (e) {}
  const col = (_activeTriggerCol === 'E') ? 'E' : 'A';
  _writeStatus(col, 100, message);
}

function setProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600);
  } catch (e) {}
  const col = (_activeTriggerCol === 'E') ? 'E' : 'A';
  _writeStatus(col, 0, '❌ ' + message);
}

// ============================================================
// OVERRIDE buyerRRSetProgress_ — Buyer RR (kolom B)
// ============================================================
function buyerRRSetProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent, message, done: false, error: null }), 600);
  } catch (e) {}
  _writeStatus('B', percent, message);
}

function buyerRRSetProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600);
  } catch (e) {}
  _writeStatus('B', 100, message);
}

function buyerRRSetProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600);
  } catch (e) {}
  _writeStatus('B', 0, '❌ ' + message);
}

// ============================================================
// OVERRIDE setPickupProgress_ — Monitor SDHO (kolom C)
// ============================================================
function setPickupProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      'PICKUP_MONITOR_PROGRESS',
      JSON.stringify({ percent, message, done: false, error: null }), 600);
  } catch (e) {}
  _writeStatus('C', percent, message);
}

function setPickupProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      'PICKUP_MONITOR_PROGRESS',
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600);
  } catch (e) {}
  _writeStatus('C', 100, message);
}

function setPickupProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      'PICKUP_MONITOR_PROGRESS',
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600);
  } catch (e) {}
  _writeStatus('C', 0, '❌ ' + message);
}

// ============================================================
// OVERRIDE csfmSetProgress_ — Control Stuck FM (kolom D)
// ============================================================
function csfmSetProgress_(percent, message) {
  _writeStatus('D', percent, message);
}

function csfmSetProgressDone_(message) {
  _writeStatus('D', 100, message);
}

function csfmSetProgressError_(message) {
  _writeStatus('D', 0, '❌ ' + message);
}

/**
 * OVERRIDE logProgressControlStuckFM — Control Stuck FM
 * Script ini pakai logProgressControlStuckFM() bukan setProgress_().
 * Di-override di sini agar JUGA tulis ke sheet Trigger kolom D
 * sehingga dashboard bisa polling progress secara real-time.
 * isDone=true  → tulis 100% ke D2 (selesai)
 * isError=true → tulis error ke D2
 */
function logProgressControlStuckFM(message, isDone, isError) {
  // 1. Tulis ke CacheService (untuk popup GAS jika ada)
  try {
    const cache = CacheService.getScriptCache();
    let log = [];
    const cached = cache.get('controlstuckfm_progress_log');
    if (cached) { try { log = JSON.parse(cached); } catch (e) { log = []; } }
    log.push({ time: new Date().toLocaleTimeString('id-ID'), message, done: !!isDone, error: !!isError });
    if (log.length > 300) log = log.slice(log.length - 300);
    cache.put('controlstuckfm_progress_log', JSON.stringify(log), 600);
  } catch (e) {}

  // 2. Tulis ke sheet Trigger D2 (untuk polling dashboard)
  if (isError) {
    _writeStatus('D', 0, '❌ ' + message);
  } else if (isDone) {
    _writeStatus('D', 100, '✅ ' + message);
  } else {
    // Hitung persen dari progress log cache sebagai estimasi
    // (gunakan animasi — cukup update pesan saja)
    try {
      const sheet = _getTriggerSheet();
      if (sheet) {
        const current = String(sheet.getRange('D2').getValue() || '');
        const currentPct = parseInt(current.split('|')[0]) || 0;
        // Naikkan perlahan (max 95% sampai isDone=true)
        const newPct = Math.min(currentPct + 5, 95);
        _writeStatus('D', newPct, message);
      }
    } catch (e) {}
  }
}

// ── Core writer ──────────────────────────────────────────────
function _writeStatus(col, percent, message) {
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) return;
    const ts = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(col + '2').setValue(percent + '|' + message);
    sheet.getRange(col + '3').setValue(ts);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _writeStatus error: ' + e.message);
  }
}
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) return;
    const ts = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(col + '2').setValue(percent + '|' + message);
    sheet.getRange(col + '3').setValue(ts);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _writeStatus error: ' + e.message);
  }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Setup sheet Trigger — jalankan SEKALI
 * Mengisi A1:D3 dengan nilai awal yang benar
 */
function setupTriggerSheet() {
  const ss  = SpreadsheetApp.openById(SS_ID_TRIGGER);
  let sheet = ss.getSheetByName(SHEET_TRIGGER);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_TRIGGER);
    Logger.log('✅ Sheet "Trigger" dibuat');
  } else {
    Logger.log('ℹ️ Sheet "Trigger" sudah ada, direset...');
  }

  // Bersihkan A1:G3 dulu
  sheet.getRange('A1:G3').clearContent().clearFormat();

  // Isi nilai awal untuk semua kolom
  ['A', 'B', 'C', 'D', 'E'].forEach(col => {
    sheet.getRange(col + '1').setValue('IDLE');
    sheet.getRange(col + '2').setValue('0|Menunggu perintah...');
    sheet.getRange(col + '3').setValue('');
  });

  // Label di kolom F dan G
  sheet.getRange('F1').setValue('← A:Expedite B:BuyerRR C:MonitorSDHO');
  sheet.getRange('G1').setValue('D:ControlStuckFM E:BacklogLM →');

  // Format
  sheet.getRange('A1:E3').setFontFamily('Courier New').setFontWeight('bold').setFontSize(10);
  sheet.getRange('F1:G3').setFontColor('#888888').setFontStyle('italic').setFontWeight('normal');
  sheet.autoResizeColumns(1, 7);
  SpreadsheetApp.flush();

  Logger.log('✅ Setup selesai!');
  Logger.log('   A1/A2/A3 = Expedite        command / status / updated');
  Logger.log('   B1/B2/B3 = BuyerRR         command / status / updated');
  Logger.log('   C1/C2/C3 = MonitorSDHO     command / status / updated');
  Logger.log('   D1/D2/D3 = ControlStuckFM  command / status / updated');
  Logger.log('   E1/E2/E3 = BacklogLM       command / status / updated');
  Logger.log('');
  Logger.log('📋 Jika belum: Triggers → Add → onChangeTrigger → On change');
}

/**
 * Verifikasi setup lengkap
 */
function checkTriggerSetup() {
  Logger.log('🔍 Checking trigger setup...');

  const ss    = SpreadsheetApp.openById(SS_ID_TRIGGER);
  const sheet = ss.getSheetByName(SHEET_TRIGGER);

  if (!sheet) {
    Logger.log('❌ Sheet "Trigger" BELUM ADA → jalankan setupTriggerSheet()');
    return;
  }

  Logger.log('✅ Sheet "Trigger" ada');
  Logger.log('   [A] Expedite       : A1=' + sheet.getRange('A1').getValue() + ' | A2=' + sheet.getRange('A2').getValue());
  Logger.log('   [B] BuyerRR        : B1=' + sheet.getRange('B1').getValue() + ' | B2=' + sheet.getRange('B2').getValue());
  Logger.log('   [C] MonitorSDHO    : C1=' + sheet.getRange('C1').getValue() + ' | C2=' + sheet.getRange('C2').getValue());
  Logger.log('   [D] ControlStuckFM : D1=' + sheet.getRange('D1').getValue() + ' | D2=' + sheet.getRange('D2').getValue());
  Logger.log('   [E] BacklogLM      : E1=' + sheet.getRange('E1').getValue() + ' | E2=' + sheet.getRange('E2').getValue());

  const triggers      = ScriptApp.getProjectTriggers();
  const changeTrigger = triggers.find(t => t.getHandlerFunction() === 'onChangeTrigger');
  if (changeTrigger) {
    Logger.log('✅ onChangeTrigger terpasang — Event: ' + changeTrigger.getEventType());
  } else {
    Logger.log('❌ onChangeTrigger BELUM TERPASANG → Triggers → Add → onChangeTrigger → On change');
  }
}

/**
 * Test manual Expedite
 */
function testExpediteManually() {
  Logger.log('🧪 TEST Expedite...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'A';
  sheet.getRange('A1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}

/**
 * Test manual Buyer RR
 */
function testBuyerRRManually() {
  Logger.log('🧪 TEST BuyerRR...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'B';
  sheet.getRange('B1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}

/**
 * Test manual Monitor SDHO
 */
function testMonitorSDHOManually() {
  Logger.log('🧪 TEST Monitor SDHO...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'C';
  sheet.getRange('C1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}

/**
 * Test manual Backlog LM
 */
function testBacklogLMManually() {
  Logger.log('🧪 TEST Backlog LM...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'E';
  sheet.getRange('E1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}
function testControlStuckFMManually() {
  Logger.log('🧪 TEST Control Stuck FM...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'D';
  sheet.getRange('D1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}
