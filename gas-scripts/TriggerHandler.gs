/**
 * ===============================================
 * TriggerHandler.gs — Unified Trigger via 1 Sheet
 * ===============================================
 * Satu sheet "Trigger" untuk semua scraper:
 *
 *      Kolom A           Kolom B
 * A1 = Command Expedite  B1 = Command BuyerRR
 * A2 = Status Expedite   B2 = Status BuyerRR
 * A3 = Updated Expedite  B3 = Updated BuyerRR
 *
 * onChange terpicu → cek A1 DAN B1 secara independen.
 * Keduanya tidak saling trigger.
 * ===============================================
 */

// Cell positions — Expedite (kolom A)
// TRIGGER_SPREADSHEET_ID, TRIGGER_SHEET_NAME,
// TRIGGER_COMMAND_CELL, TRIGGER_STATUS_CELL, TRIGGER_UPDATED_CELL
// sudah dideklarasikan di file lain — TIDAK diduplikasi di sini.

// Cell positions — Buyer RR (kolom B)
const BUYER_RR_COMMAND_CELL = 'B1';
const BUYER_RR_STATUS_CELL  = 'B2';
const BUYER_RR_UPDATED_CELL = 'B3';

// Cell positions — Monitor SDHO (kolom C)
const SDHO_COMMAND_CELL = 'C1';
const SDHO_STATUS_CELL  = 'C2';
const SDHO_UPDATED_CELL = 'C3';

// Sheet cache
let _activeTriggerCol = 'A'; // 'A' = Expedite, 'B' = BuyerRR

function _getTriggerSheet() {
  const ssId   = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const shName = typeof TRIGGER_SHEET_NAME !== 'undefined' ? TRIGGER_SHEET_NAME : 'Trigger';
  return SpreadsheetApp.openById(ssId).getSheetByName(shName);
}

/**
 * ============================================================
 * onChange TRIGGER — entry point utama
 * Cek kolom A (Expedite) dan kolom B (BuyerRR) secara independen
 * ============================================================
 */
function onChangeTrigger(e) {
  // Hardcode semua cell address agar tidak bergantung konstanta dari file lain
  const EXP_CMD = 'A1', EXP_STS = 'A2', EXP_UPD = 'A3';
  const BRR_CMD = 'B1', BRR_STS = 'B2', BRR_UPD = 'B3';

  try {
    const sheet = _getTriggerSheet();
    if (!sheet) { Logger.log('❌ Sheet "Trigger" tidak ditemukan'); return; }

    const a1 = String(sheet.getRange(EXP_CMD).getValue() || '').trim().toUpperCase();
    const b1 = String(sheet.getRange(BRR_CMD).getValue() || '').trim().toUpperCase();
    Logger.log('🔍 onChangeTrigger fired — A1: "' + a1 + '" | B1: "' + b1 + '"');

    if (a1 === 'RUN' || a1 === 'RESUME') {
      Logger.log('🎯 Expedite command: ' + a1);
      _activeTriggerCol = 'A';
      sheet.getRange(EXP_CMD).setValue('RUNNING');
      sheet.getRange(EXP_STS).setValue('0|Memulai...');
      sheet.getRange(EXP_UPD).setValue('');
      SpreadsheetApp.flush();
      try {
        if (a1 === 'RUN') fetchExpediteData();
        else resumeExpediteScenarios();
      } catch (err) {
        setProgressError_(err.message);
        Logger.log('❌ Expedite error: ' + err.message);
      } finally {
        sheet.getRange(EXP_CMD).setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    if (b1 === 'RUN' || b1 === 'RESUME') {
      Logger.log('🎯 BuyerRR command: ' + b1);
      _activeTriggerCol = 'B';
      sheet.getRange(BRR_CMD).setValue('RUNNING');
      sheet.getRange(BRR_STS).setValue('0|Memulai...');
      sheet.getRange(BRR_UPD).setValue('');
      SpreadsheetApp.flush();
      try {
        fetchBuyerRRData();
      } catch (err) {
        buyerRRSetProgressError_(err.message);
        Logger.log('❌ BuyerRR error: ' + err.message);
      } finally {
        sheet.getRange(BRR_CMD).setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    // Cek Monitor SDHO (kolom C)
    const c1 = String(sheet.getRange('C1').getValue() || '').trim().toUpperCase();
    if (c1 === 'RUN' || c1 === 'RESUME') {
      Logger.log('🎯 Monitor SDHO command: ' + c1);
      _activeTriggerCol = 'C';
      sheet.getRange('C1').setValue('RUNNING');
      sheet.getRange('C2').setValue('0|Memulai...');
      sheet.getRange('C3').setValue('');
      SpreadsheetApp.flush();
      try {
        fetchMonitorSDHOData();
      } catch (err) {
        sdhoSetProgressError_(err.message);
        Logger.log('❌ Monitor SDHO error: ' + err.message);
      } finally {
        sheet.getRange('C1').setValue('IDLE');
        SpreadsheetApp.flush();
      }
      return;
    }

    Logger.log('⏭️ Tidak ada command aktif — skip');

  } catch (outerErr) {
    Logger.log('❌ onChangeTrigger outer error: ' + outerErr.message);
  }
}

/**
 * ============================================================
 * OVERRIDE setProgress_ — Expedite (kolom A)
 * ============================================================
 */
function setProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent, message, done: false, error: null }), 600
    );
  } catch (e) {}
  _writeStatus('A', percent, message);
}

function setProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600
    );
  } catch (e) {}
  _writeStatus('A', 100, message);
}

function setProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600
    );
  } catch (e) {}
  _writeStatus('A', 0, '❌ ' + message);
}

/**
 * ============================================================
 * OVERRIDE buyerRRSetProgress_ — Buyer RR (kolom B)
 * ============================================================
 */
function buyerRRSetProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent, message, done: false, error: null }), 600
    );
  } catch (e) {}
  _writeStatus('B', percent, message);
}

function buyerRRSetProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600
    );
  } catch (e) {}
  _writeStatus('B', 100, message);
}

function buyerRRSetProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600
    );
  } catch (e) {}
  _writeStatus('B', 0, '❌ ' + message);
}

/**
 * Tulis status ke kolom A atau B di sheet Trigger
 */
/**
 * ============================================================
 * OVERRIDE sdhoSetProgress_ — Monitor SDHO (kolom C)
 * ============================================================
 */
function sdhoSetProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put('SDHO_PROGRESS',
      JSON.stringify({ percent, message, done: false, error: null }), 600);
  } catch (e) {}
  _writeStatus('C', percent, message);
}

function sdhoSetProgressDone_(message) {
  try {
    CacheService.getScriptCache().put('SDHO_PROGRESS',
      JSON.stringify({ percent: 100, message, done: true, error: null }), 600);
  } catch (e) {}
  _writeStatus('C', 100, message);
}

function sdhoSetProgressError_(message) {
  try {
    CacheService.getScriptCache().put('SDHO_PROGRESS',
      JSON.stringify({ percent: 0, message: '', done: true, error: message }), 600);
  } catch (e) {}
  _writeStatus('C', 0, '❌ ' + message);
}

function _writeStatus(col, percent, message) {
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) return;
    const ts          = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    const statusCell  = col === 'A' ? 'A2' : col === 'B' ? 'B2' : 'C2';
    const updatedCell = col === 'A' ? 'A3' : col === 'B' ? 'B3' : 'C3';
    sheet.getRange(statusCell).setValue(percent + '|' + message);
    sheet.getRange(updatedCell).setValue(ts);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _writeStatus error: ' + e.message);
  }
}
// ============================================================
// UTILITIES
// ============================================================

/**
 * Setup sheet Trigger untuk kedua scraper — jalankan SEKALI
 */
function setupTriggerSheet() {
  const ssId  = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const shName = typeof TRIGGER_SHEET_NAME !== 'undefined' ? TRIGGER_SHEET_NAME : 'Trigger';
  const ss = SpreadsheetApp.openById(ssId);
  let sheet = ss.getSheetByName(shName);
  if (!sheet) {
    sheet = ss.insertSheet(shName);
    Logger.log('✅ Sheet "Trigger" dibuat');
  } else {
    Logger.log('ℹ️ Sheet "Trigger" sudah ada, direset...');
  }

  // Kolom A — Expedite
  sheet.getRange('A1').setValue('IDLE');
  sheet.getRange('A2').setValue('0|Menunggu perintah...');
  sheet.getRange('A3').setValue('');

  // Kolom B — Buyer RR
  sheet.getRange('B1').setValue('IDLE');
  sheet.getRange('B2').setValue('0|Menunggu perintah...');
  sheet.getRange('B3').setValue('');

  // Kolom C — Monitor SDHO
  sheet.getRange('C1').setValue('IDLE');
  sheet.getRange('C2').setValue('0|Menunggu perintah...');
  sheet.getRange('C3').setValue('');

  // Label kolom D
  sheet.getRange('D1').setValue('← Expedite | BuyerRR | MonitorSDHO');
  sheet.getRange('D2').setValue('← Status masing-masing');
  sheet.getRange('D3').setValue('← Timestamp masing-masing');

  sheet.getRange('A1:B3').setFontFamily('Courier New').setFontWeight('bold');
  sheet.getRange('C1:C3').setFontColor('#888888').setFontStyle('italic');
  sheet.autoResizeColumns(1, 3);
  SpreadsheetApp.flush();

  Logger.log('✅ Setup selesai!');
  Logger.log('   A1/A2/A3 = Expedite command/status/updated');
  Logger.log('   B1/B2/B3 = BuyerRR command/status/updated');
}

/**
 * Verifikasi setup
 */
function checkTriggerSetup() {
  Logger.log('🔍 Checking trigger setup...');
  const ssId  = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const shName = typeof TRIGGER_SHEET_NAME !== 'undefined' ? TRIGGER_SHEET_NAME : 'Trigger';
  const ss    = SpreadsheetApp.openById(ssId);
  const sheet = ss.getSheetByName(shName);

  if (!sheet) {
    Logger.log('❌ Sheet "Trigger" BELUM ADA → jalankan setupTriggerSheet()');
  } else {
    Logger.log('✅ Sheet "Trigger" ada');
    Logger.log('   [Expedite] A1: ' + sheet.getRange('A1').getValue() + ' | A2: ' + sheet.getRange('A2').getValue());
    Logger.log('   [BuyerRR]  B1: ' + sheet.getRange('B1').getValue() + ' | B2: ' + sheet.getRange('B2').getValue());
  }

  const triggers = ScriptApp.getProjectTriggers();
  const changeTrigger = triggers.find(t => t.getHandlerFunction() === 'onChangeTrigger');
  if (changeTrigger) {
    Logger.log('✅ onChangeTrigger terpasang — Event: ' + changeTrigger.getEventType());
  } else {
    Logger.log('❌ onChangeTrigger BELUM TERPASANG');
  }
}

/**
 * Test manual Expedite
 */
function testExpediteManually() {
  const ssId  = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const shName = typeof TRIGGER_SHEET_NAME !== 'undefined' ? TRIGGER_SHEET_NAME : 'Trigger';
  const sheet = SpreadsheetApp.openById(ssId).getSheetByName(shName);
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'A';
  _triggerSheet = sheet;
  sheet.getRange('A1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}

/**
 * Test manual Buyer RR
 */
function testBuyerRRManually() {
  const ssId  = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const shName = typeof TRIGGER_SHEET_NAME !== 'undefined' ? TRIGGER_SHEET_NAME : 'Trigger';
  const sheet = SpreadsheetApp.openById(ssId).getSheetByName(shName);
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerCol = 'B';
  _triggerSheet = sheet;
  sheet.getRange('B1').setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}
