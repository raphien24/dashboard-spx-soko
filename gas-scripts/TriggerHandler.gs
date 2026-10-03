/**
 * ===============================================
 * TriggerHandler.gs — Message Queue via Spreadsheet
 * ===============================================
 * Cara kerja (onChange trigger):
 * 1. Dashboard menulis "RUN" ke cell Trigger!A1 via Cloudflare Worker
 * 2. onChange trigger terpicu — termasuk perubahan via API ✅
 * 3. onChangeTrigger() cek A1 → jalankan scraper
 * 4. Progress ditulis ke Trigger!A2 setiap update (real-time polling)
 *
 * SETUP:
 * 1. HAPUS trigger onEditTrigger yang lama
 * 2. Tambah trigger baru:
 *    - Function: onChangeTrigger
 *    - Event source: From spreadsheet
 *    - Event type: On change
 *    - Save
 * ===============================================
 */

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
