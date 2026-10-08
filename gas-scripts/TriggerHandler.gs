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

    Logger.log('⏭️ Tidak ada command aktif — skip');

  } catch (outerErr) {
    Logger.log('❌ onChangeTrigger outer error: ' + outerErr.message);
  }
}

// ============================================================
// OVERRIDE setProgress_ — Expedite (kolom A)
// ============================================================
function setProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent, message, done: false, error: null }), 600);
  } catch (e) {}
  _writeStatus('A', percent, message);
}

function setProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600);
  } catch (e) {}
  _writeStatus('A', 100, message);
}

function setProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600);
  } catch (e) {}
  _writeStatus('A', 0, '❌ ' + message);
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

  // Bersihkan A1:F3 dulu
  sheet.getRange('A1:F3').clearContent().clearFormat();

  // Isi nilai awal untuk semua kolom
  ['A', 'B', 'C', 'D'].forEach(col => {
    sheet.getRange(col + '1').setValue('IDLE');
    sheet.getRange(col + '2').setValue('0|Menunggu perintah...');
    sheet.getRange(col + '3').setValue('');
  });

  // Label di kolom E dan F (baris 1-4, tidak menimpa A-D)
  sheet.getRange('E1').setValue('← A: Expedite');
  sheet.getRange('E2').setValue('← B: BuyerRR');
  sheet.getRange('E3').setValue('← C: MonitorSDHO');
  sheet.getRange('F1').setValue('D: ControlStuckFM →');

  // Format
  sheet.getRange('A1:D3').setFontFamily('Courier New').setFontWeight('bold').setFontSize(10);
  sheet.getRange('E1:F3').setFontColor('#888888').setFontStyle('italic').setFontWeight('normal');
  sheet.autoResizeColumns(1, 6);
  SpreadsheetApp.flush();

  Logger.log('✅ Setup selesai!');
  Logger.log('   A1/A2/A3 = Expedite        command / status / updated');
  Logger.log('   B1/B2/B3 = BuyerRR         command / status / updated');
  Logger.log('   C1/C2/C3 = MonitorSDHO     command / status / updated');
  Logger.log('   D1/D2/D3 = ControlStuckFM  command / status / updated');
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
 * Test manual Control Stuck FM
 */
function testControlStuckFMManually() {
  Logger.log('🧪 TEST Control Stuck FM...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'D';
  sheet.getRange('D1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}
