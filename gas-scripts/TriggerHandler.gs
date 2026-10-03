/**
 * ===============================================
 * TriggerHandler.gs — Message Queue via Spreadsheet
 * ===============================================
 * Cara kerja:
 * 1. Dashboard menulis "RUN" atau "RESUME" ke cell Trigger!A1
 *    via Cloudflare Worker (Google Sheets API)
 * 2. onEdit trigger mendeteksi perubahan → jalankan scraper
 * 3. Progress ditulis ke Trigger!A2 setiap update (untuk polling)
 *
 * SETUP (wajib dilakukan SEKALI):
 * 1. Tambah sheet baru bernama "Trigger" di spreadsheet Expedite
 * 2. Di GAS editor: Triggers (ikon jam) → Add Trigger:
 *    - Function: onEditTrigger
 *    - Event source: From spreadsheet
 *    - Event type: On edit
 *    - Save
 * ===============================================
 */

const TRIGGER_SPREADSHEET_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
const TRIGGER_SHEET_NAME     = 'Trigger';
const TRIGGER_COMMAND_CELL   = 'A1';  // Dashboard tulis "RUN" / "RESUME" / "IDLE" di sini
const TRIGGER_STATUS_CELL    = 'A2';  // Progress ditulis di sini (format: "percent|message")
const TRIGGER_UPDATED_CELL   = 'A3';  // Timestamp terakhir update status

// Cache sheet Trigger supaya tidak buka spreadsheet berulang kali
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
 * OVERRIDE setProgress_ / setProgressDone_ / setProgressError_
 * 
 * Fungsi-fungsi ini didefinisikan di doPost.gs (WebApp.gs)
 * untuk CacheService. Di sini kita OVERRIDE agar JUGA menulis
 * ke sheet Trigger!A2 — sehingga polling dari dashboard bisa
 * membaca progress secara real-time lintas eksekusi.
 * 
 * GAS menggunakan fungsi yang terdefinisi TERAKHIR dalam project,
 * jadi file ini harus diurutkan SETELAH doPost.gs/WebApp.gs.
 * (Atau bisa diatur dari Project Settings → file order)
 * ============================================================
 */
function setProgress_(percent, message) {
  // 1. Tulis ke CacheService (untuk popup GAS jika ada)
  try {
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({ percent, message, done: false, error: null }),
      600
    );
  } catch (e) {}

  // 2. Tulis ke sheet Trigger!A2 (untuk polling dashboard)
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

/**
 * Tulis progress ke sheet Trigger!A2 dan timestamp ke A3
 * Format A2: "percent|message"
 */
function _writeTriggerStatus(percent, message) {
  try {
    const sheet = _getTriggerSheet();
    if (!sheet) return;
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(TRIGGER_STATUS_CELL).setValue(percent + '|' + message);
    sheet.getRange(TRIGGER_UPDATED_CELL).setValue(timestamp);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _writeTriggerStatus error: ' + e.message);
  }
}

/**
 * onEdit trigger — dipasang sebagai installable trigger
 */
function onEditTrigger(e) {
  if (!e || !e.range) {
    Logger.log('⚠️ onEditTrigger dipanggil tanpa event object — skip');
    return;
  }

  try {
    const sheet = e.range.getSheet();
    if (sheet.getName() !== TRIGGER_SHEET_NAME) return;
    if (e.range.getA1Notation() !== TRIGGER_COMMAND_CELL) return;

    const command = String(e.value || '').trim().toUpperCase();
    if (command !== 'RUN' && command !== 'RESUME') return;

    Logger.log('🎯 Trigger detected: ' + command);

    // Reset command ke RUNNING agar tidak trigger ulang
    sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUNNING');
    SpreadsheetApp.flush();

    // Reset cache sheet reference (fresh open untuk eksekusi baru)
    _triggerSheet = sheet;

    // Tulis status awal ke sheet (langsung, tanpa lewat setProgress_ dulu)
    _writeTriggerStatus(0, 'Dimulai dari dashboard (' + command + ')...');

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
    }

  } catch (outerErr) {
    Logger.log('❌ onEditTrigger outer error: ' + outerErr.message);
  }
}

/**
 * Helper: tulis status ke sheet Trigger (DEPRECATED — diganti _writeTriggerStatus)
 * Dibiarkan untuk backward compatibility
 */
function _setTriggerStatus(sheet, percent, message) {
  _writeTriggerStatus(percent, message);
}

/**
 * Setup: buat sheet Trigger jika belum ada
 * Jalankan SEKALI secara manual dari GAS editor
 */
function setupTriggerSheet() {
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  let sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(TRIGGER_SHEET_NAME);
    Logger.log('✅ Sheet "Trigger" berhasil dibuat');
  } else {
    Logger.log('ℹ️ Sheet "Trigger" sudah ada');
  }

  // Setup header dan initial values
  sheet.getRange('A1').setValue('IDLE');
  sheet.getRange('A2').setValue('0|Menunggu perintah...');
  sheet.getRange('A3').setValue('');

  // Label di kolom B untuk keterbacaan
  sheet.getRange('B1').setValue('Command (RUN / RESUME / IDLE)');
  sheet.getRange('B2').setValue('Status (percent|message)');
  sheet.getRange('B3').setValue('Last Updated');

  // Format
  sheet.getRange('A1:B3').setFontFamily('Courier New');
  sheet.getRange('B1:B3').setFontColor('#888888').setFontStyle('italic');
  sheet.autoResizeColumn(1);
  sheet.autoResizeColumn(2);

  SpreadsheetApp.flush();
  Logger.log('✅ Trigger sheet setup selesai!');
  Logger.log('');
  Logger.log('📋 LANGKAH SELANJUTNYA:');
  Logger.log('   1. Di GAS editor: klik ikon Triggers (jam)');
  Logger.log('   2. Add Trigger:');
  Logger.log('      - Function: onEditTrigger');
  Logger.log('      - Event source: From spreadsheet');
  Logger.log('      - Event type: On edit');
  Logger.log('   3. Authorize → Save');
}

/**
 * TEST: Simulasi trigger secara manual dari editor
 */
function testTriggerManually() {
  Logger.log('🧪 TEST: Simulasi trigger RUN secara manual...');

  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);

  if (!sheet) {
    Logger.log('❌ Sheet "Trigger" belum ada. Jalankan setupTriggerSheet() dulu!');
    return;
  }

  // Set _triggerSheet agar override setProgress_ bisa menulis ke sheet
  _triggerSheet = sheet;

  // Simulasi event object
  const fakeEvent = {
    range: sheet.getRange(TRIGGER_COMMAND_CELL),
    value: 'RUN',
  };

  onEditTrigger(fakeEvent);
  Logger.log('✅ Test selesai. Cek sheet Trigger dan execution log.');
}

/**
 * CHECK: Verifikasi trigger sudah terpasang dengan benar
 */
function checkTriggerSetup() {
  Logger.log('🔍 Checking trigger setup...');

  // Cek sheet Trigger
  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);
  if (!sheet) {
    Logger.log('❌ Sheet "Trigger" BELUM ADA → jalankan setupTriggerSheet()');
  } else {
    const command = sheet.getRange('A1').getValue();
    const status  = sheet.getRange('A2').getValue();
    Logger.log('✅ Sheet "Trigger" ada');
    Logger.log('   A1 (command): ' + command);
    Logger.log('   A2 (status):  ' + status);
  }

  // Cek installable triggers
  const triggers = ScriptApp.getProjectTriggers();
  const editTrigger = triggers.find(t => t.getHandlerFunction() === 'onEditTrigger');
  if (!editTrigger) {
    Logger.log('❌ Installable trigger "onEditTrigger" BELUM TERPASANG');
    Logger.log('   → Pergi ke Triggers (ikon jam) → Add Trigger → onEditTrigger → On edit');
  } else {
    Logger.log('✅ Installable trigger "onEditTrigger" sudah terpasang');
    Logger.log('   Event type: ' + editTrigger.getEventType());
  }
}
