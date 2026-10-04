/**
 * ===============================================
 * TriggerHandler.gs — Message Queue via Spreadsheet
 * ===============================================
 * onChange trigger terpicu oleh semua perubahan spreadsheet,
 * TERMASUK perubahan via API.
 *
 * Handles:
 * - Sheet "Trigger"         → fetchExpediteData / resumeExpediteScenarios
 * - Sheet "Trigger_BuyerRR" → fetchBuyerRRData
 *
 * SETUP:
 * 1. Jalankan setupAllTriggerSheets() sekali
 * 2. Triggers → Add Trigger → onChangeTrigger → On change
 * ===============================================
 */

const TRIGGER_SPREADSHEET_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';

// Sheet names
const TRIGGER_SHEET_NAME        = 'Trigger';           // Expedite
const TRIGGER_BUYER_RR_NAME     = 'Trigger_BuyerRR';   // Buyer RR

// Cell positions (sama untuk semua trigger sheet)
const TRIGGER_COMMAND_CELL   = 'A1';
const TRIGGER_STATUS_CELL    = 'A2';
const TRIGGER_UPDATED_CELL   = 'A3';

// Cache referensi sheet agar tidak buka ulang setiap kali
let _triggerSheet      = null;  // Expedite
let _triggerBuyerRR    = null;  // Buyer RR
let _activeTriggerSheet = null; // sheet yang sedang aktif digunakan scraper

function _getTriggerSheet(sheetName) {
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  return ss.getSheetByName(sheetName);
}

/**
 * ============================================================
 * onChange TRIGGER — entry point utama
 * Cek semua trigger sheet, jalankan yang ada command-nya
 * ============================================================
 */
function onChangeTrigger(e) {
  try {
    const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);

    // Cek Expedite trigger
    const expediteSheet = ss.getSheetByName(TRIGGER_SHEET_NAME);
    if (expediteSheet) {
      const cmd = String(expediteSheet.getRange(TRIGGER_COMMAND_CELL).getValue() || '').trim().toUpperCase();
      if (cmd === 'RUN' || cmd === 'RESUME') {
        Logger.log('🎯 Expedite command detected: ' + cmd);
        _activeTriggerSheet = expediteSheet;
        _triggerSheet       = expediteSheet;
        _runScraper(expediteSheet, cmd, 'expedite');
        return;
      }
    }

    // Cek Buyer RR trigger
    const buyerRRSheet = ss.getSheetByName(TRIGGER_BUYER_RR_NAME);
    if (buyerRRSheet) {
      const cmd = String(buyerRRSheet.getRange(TRIGGER_COMMAND_CELL).getValue() || '').trim().toUpperCase();
      if (cmd === 'RUN' || cmd === 'RESUME') {
        Logger.log('🎯 Buyer RR command detected: ' + cmd);
        _activeTriggerSheet = buyerRRSheet;
        _triggerBuyerRR     = buyerRRSheet;
        _runScraper(buyerRRSheet, cmd, 'buyerrr');
        return;
      }
    }

  } catch (outerErr) {
    Logger.log('❌ onChangeTrigger outer error: ' + outerErr.message);
  }
}

/**
 * Generic runner — set RUNNING, jalankan scraper, set IDLE
 */
function _runScraper(sheet, command, type) {
  // Segera set RUNNING agar tidak dobel
  sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUNNING');
  sheet.getRange(TRIGGER_STATUS_CELL).setValue('0|Memulai...');
  sheet.getRange(TRIGGER_UPDATED_CELL).setValue('');
  SpreadsheetApp.flush();

  try {
    if (type === 'expedite') {
      if (command === 'RUN') {
        fetchExpediteData();
      } else {
        resumeExpediteScenarios();
      }
    } else if (type === 'buyerrr') {
      fetchBuyerRRData();
    }
  } catch (err) {
    setProgressError_(err.message);
    Logger.log('❌ Scraper error (' + type + '): ' + err.message);
  } finally {
    sheet.getRange(TRIGGER_COMMAND_CELL).setValue('IDLE');
    SpreadsheetApp.flush();
    Logger.log('✅ Scraper selesai: ' + type);
  }
}

/**
 * ============================================================
 * OVERRIDE setProgress_ / setProgressDone_ / setProgressError_
 *
 * Untuk Expedite: menulis ke Trigger!A2
 * Untuk Buyer RR: menulis ke Trigger_BuyerRR!A2
 * Keduanya pakai _activeTriggerSheet yang di-set di onChangeTrigger
 * ============================================================
 */
function setProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent, message, done: false, error: null }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(_activeTriggerSheet || _triggerSheet, percent, message);
}

function setProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(_activeTriggerSheet || _triggerSheet, 100, message);
}

function setProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(_activeTriggerSheet || _triggerSheet, 0, '❌ ' + message);
}

/**
 * Override buyerRR progress functions juga agar tulis ke sheet
 * (BuyerRR.gs punya buyerRRSetProgress_ sendiri — di sini kita override)
 */
function buyerRRSetProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent, message, done: false, error: null }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(_activeTriggerSheet || _triggerBuyerRR, percent, message);
}

function buyerRRSetProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(_activeTriggerSheet || _triggerBuyerRR, 100, message);
}

function buyerRRSetProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      BUYER_RR_PROGRESS_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(_activeTriggerSheet || _triggerBuyerRR, 0, '❌ ' + message);
}

/**
 * Tulis progress ke sheet A2 dan timestamp ke A3
 */
function _writeTriggerStatus(sheet, percent, message) {
  try {
    if (!sheet) return;
    const ts = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(TRIGGER_STATUS_CELL).setValue(percent + '|' + message);
    sheet.getRange(TRIGGER_UPDATED_CELL).setValue(ts);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _writeTriggerStatus error: ' + e.message);
  }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Setup SEMUA trigger sheets sekaligus — jalankan SEKALI
 */
function setupAllTriggerSheets() {
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheetsToSetup = [TRIGGER_SHEET_NAME, TRIGGER_BUYER_RR_NAME];

  sheetsToSetup.forEach(name => {
    let sheet = ss.getSheetByName(name);
    if (!sheet) {
      sheet = ss.insertSheet(name);
      Logger.log('✅ Sheet "' + name + '" dibuat');
    } else {
      Logger.log('ℹ️ Sheet "' + name + '" sudah ada');
    }
    sheet.getRange('A1').setValue('IDLE');
    sheet.getRange('A2').setValue('0|Menunggu perintah...');
    sheet.getRange('A3').setValue('');
    sheet.getRange('B1').setValue('Command (RUN/RESUME/IDLE/RUNNING)');
    sheet.getRange('B2').setValue('Status (percent|message)');
    sheet.getRange('B3').setValue('Last Updated');
    SpreadsheetApp.flush();
  });

  Logger.log('✅ Semua trigger sheet siap');
  Logger.log('');
  Logger.log('📋 LANGKAH SELANJUTNYA (jika belum):');
  Logger.log('   Triggers → Add Trigger → onChangeTrigger → On change → Save');
}

/**
 * Verifikasi setup
 */
function checkTriggerSetup() {
  Logger.log('🔍 Checking trigger setup...');
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);

  [TRIGGER_SHEET_NAME, TRIGGER_BUYER_RR_NAME].forEach(name => {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      Logger.log('❌ Sheet "' + name + '" BELUM ADA → jalankan setupAllTriggerSheets()');
    } else {
      Logger.log('✅ Sheet "' + name + '"');
      Logger.log('   A1: ' + sheet.getRange('A1').getValue());
      Logger.log('   A2: ' + sheet.getRange('A2').getValue());
    }
  });

  const triggers = ScriptApp.getProjectTriggers();
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
  const ss  = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }
  _activeTriggerSheet = sheet;
  _triggerSheet       = sheet;
  sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}

/**
 * Test manual Buyer RR
 */
function testBuyerRRManually() {
  const ss    = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TRIGGER_BUYER_RR_NAME);
  if (!sheet) { Logger.log('❌ Sheet Trigger_BuyerRR tidak ada → jalankan setupAllTriggerSheets()'); return; }
  _activeTriggerSheet = sheet;
  _triggerBuyerRR     = sheet;
  sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUN');
  SpreadsheetApp.flush();
  onChangeTrigger({});
}

const TRIGGER_SPREADSHEET_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
const TRIGGER_SHEET_NAME     = 'Trigger';
const TRIGGER_COMMAND_CELL   = 'A1';
const TRIGGER_STATUS_CELL    = 'A2';
const TRIGGER_UPDATED_CELL   = 'A3';

// Cache referensi sheet agar tidak buka ulang setiap kali
let _triggerSheet = null;

function _getTriggerSheet() {
  if (!_triggerSheet) {
    _triggerSheet = SpreadsheetApp
      .openById(TRIGGER_SPREADSHEET_ID)
      .getSheetByName(TRIGGER_SHEET_NAME);
  }
  return _triggerSheet;
}

/**
 * ============================================================
 * onChange TRIGGER — terpicu oleh semua perubahan spreadsheet,
 * TERMASUK perubahan via API (berbeda dengan onEdit).
 *
 * PENTING: Dipasang sebagai installable trigger:
 *   Triggers → Add Trigger → onChangeTrigger → On change
 * ============================================================
 */
function onChangeTrigger(e) {
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) {
      Logger.log('❌ Sheet "Trigger" tidak ditemukan');
      return;
    }

    // Baca command dari cell A1
    const command = String(sheet.getRange(TRIGGER_COMMAND_CELL).getValue() || '').trim().toUpperCase();

    // Hanya proses RUN atau RESUME
    if (command !== 'RUN' && command !== 'RESUME') {
      return;
    }

    Logger.log('🎯 onChange detected: command = ' + command);

    // Segera set RUNNING agar tidak dobel jika onChange terpicu lagi
    sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUNNING');
    sheet.getRange(TRIGGER_STATUS_CELL).setValue('0|Memulai...');
    sheet.getRange(TRIGGER_UPDATED_CELL).setValue('');
    SpreadsheetApp.flush();

    try {
      if (command === 'RUN') {
        fetchExpediteData();
      } else {
        resumeExpediteScenarios();
      }
    } catch (err) {
      setProgressError_(err.message);
      Logger.log('❌ Scraper error: ' + err.message);
    } finally {
      sheet.getRange(TRIGGER_COMMAND_CELL).setValue('IDLE');
      SpreadsheetApp.flush();
      Logger.log('✅ onChangeTrigger selesai');
    }

  } catch (outerErr) {
    Logger.log('❌ onChangeTrigger outer error: ' + outerErr.message);
  }
}

/**
 * ============================================================
 * OVERRIDE setProgress_ / setProgressDone_ / setProgressError_
 *
 * Didefinisikan ulang di sini agar JUGA menulis ke sheet Trigger!A2,
 * sehingga dashboard bisa polling progress secara real-time.
 * File ini harus diurutkan SETELAH WebApp.gs di project GAS.
 * ============================================================
 */
function setProgress_(percent, message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent, message, done: false, error: null }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(percent, message);
}

function setProgressDone_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 100, message, done: true, error: null }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(100, message);
}

function setProgressError_(message) {
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent: 0, message: '', done: true, error: message }),
      600
    );
  } catch (e) {}
  _writeTriggerStatus(0, '❌ ' + message);
}

function _writeTriggerStatus(percent, message) {
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) return;
    const ts = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(TRIGGER_STATUS_CELL).setValue(percent + '|' + message);
    sheet.getRange(TRIGGER_UPDATED_CELL).setValue(ts);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _writeTriggerStatus error: ' + e.message);
  }
}

// ============================================================
// UTILITIES
// ============================================================

/**
 * Setup sheet Trigger — jalankan SEKALI dari GAS editor
 */
function setupTriggerSheet() {
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(TRIGGER_SHEET_NAME);
    Logger.log('✅ Sheet "Trigger" dibuat');
  } else {
    Logger.log('ℹ️ Sheet "Trigger" sudah ada');
  }
  sheet.getRange('A1').setValue('IDLE');
  sheet.getRange('A2').setValue('0|Menunggu perintah...');
  sheet.getRange('A3').setValue('');
  sheet.getRange('B1').setValue('Command (RUN/RESUME/IDLE/RUNNING)');
  sheet.getRange('B2').setValue('Status (percent|message)');
  sheet.getRange('B3').setValue('Last Updated');
  SpreadsheetApp.flush();
  Logger.log('✅ Setup selesai');
  Logger.log('');
  Logger.log('📋 LANGKAH SELANJUTNYA:');
  Logger.log('   1. Hapus trigger onEditTrigger (jika masih ada)');
  Logger.log('   2. Triggers → Add Trigger → onChangeTrigger → On change → Save');
}

/**
 * Test manual dari editor (tanpa klik tombol di dashboard)
 */
function testTriggerManually() {
  Logger.log('🧪 TEST: simulasi RUN...');
  const sheet = _getTriggerSheet();
  if (!sheet) { Logger.log('❌ Sheet Trigger tidak ada'); return; }

  _triggerSheet = sheet;
  sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUN');
  SpreadsheetApp.flush();

  // Simulasi onChange event
  onChangeTrigger({});
  Logger.log('✅ Test selesai');
}

/**
 * Verifikasi setup
 */
function checkTriggerSetup() {
  Logger.log('🔍 Checking trigger setup...');
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);
  if (!sheet) {
    Logger.log('❌ Sheet "Trigger" BELUM ADA → jalankan setupTriggerSheet()');
  } else {
    Logger.log('✅ Sheet "Trigger" ada');
    Logger.log('   A1: ' + sheet.getRange('A1').getValue());
    Logger.log('   A2: ' + sheet.getRange('A2').getValue());
  }

  const triggers = ScriptApp.getProjectTriggers();
  const changeTrigger = triggers.find(t => t.getHandlerFunction() === 'onChangeTrigger');
  const editTrigger   = triggers.find(t => t.getHandlerFunction() === 'onEditTrigger');

  if (changeTrigger) {
    Logger.log('✅ onChangeTrigger sudah terpasang — Event: ' + changeTrigger.getEventType());
  } else {
    Logger.log('❌ onChangeTrigger BELUM TERPASANG → Triggers → Add → onChangeTrigger → On change');
  }

  if (editTrigger) {
    Logger.log('⚠️ onEditTrigger masih terpasang — sebaiknya dihapus (tidak berguna untuk API writes)');
  }
}
