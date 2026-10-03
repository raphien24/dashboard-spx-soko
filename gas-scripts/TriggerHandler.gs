/**
 * ===============================================
 * TriggerHandler.gs — Message Queue via Spreadsheet
 * ===============================================
 * Cara kerja:
 * 1. Dashboard menulis "RUN" atau "RESUME" ke cell Trigger!A1
 *    via Cloudflare Worker (Google Sheets API)
 * 2. onEdit trigger mendeteksi perubahan → jalankan scraper
 * 3. Setelah selesai, tulis status ke Trigger!A2 (untuk polling)
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
const TRIGGER_STATUS_CELL    = 'A2';  // GAS tulis status progress di sini
const TRIGGER_UPDATED_CELL   = 'A3';  // Timestamp terakhir update status

/**
 * onEdit trigger — dipasang sebagai installable trigger
 * Deteksi perubahan cell A1 di sheet "Trigger"
 *
 * PENTING: Ini harus dipasang sebagai INSTALLABLE trigger (bukan simple trigger)
 * karena fetchExpediteData() memanggil UrlFetchApp yang butuh authorization.
 * Simple trigger tidak punya authorization untuk UrlFetchApp.
 */
function onEditTrigger(e) {
  // Guard: kalau dipanggil manual dari editor (tanpa event object), skip
  if (!e || !e.range) {
    Logger.log('⚠️ onEditTrigger dipanggil tanpa event object — skip (jangan dijalankan manual)');
    return;
  }

  try {
    const sheet = e.range.getSheet();

    // Hanya proses kalau yang diedit adalah sheet Trigger, cell A1
    if (sheet.getName() !== TRIGGER_SHEET_NAME) return;
    if (e.range.getA1Notation() !== TRIGGER_COMMAND_CELL) return;

    const command = String(e.value || '').trim().toUpperCase();

    // Hanya proses kalau command adalah RUN atau RESUME
    if (command !== 'RUN' && command !== 'RESUME') return;

    Logger.log('🎯 Trigger detected: ' + command);

    // Langsung reset command cell ke RUNNING agar tidak trigger ulang
    sheet.getRange(TRIGGER_COMMAND_CELL).setValue('RUNNING');

    // Update status cell
    _setTriggerStatus(sheet, 0, 'Dimulai dari dashboard (' + command + ')...');

    try {
      if (command === 'RUN') {
        fetchExpediteData();
      } else {
        resumeExpediteScenarios();
      }

      // Ambil final progress dari cache
      const progress = getProgress();
      const finalMsg = progress ? progress.message : 'Selesai';
      _setTriggerStatus(sheet, 100, '✅ ' + finalMsg);

    } catch (err) {
      _setTriggerStatus(sheet, 0, '❌ Error: ' + err.message);
      Logger.log('❌ onEditTrigger inner error: ' + err.message);
    } finally {
      // Reset command cell ke IDLE setelah selesai
      sheet.getRange(TRIGGER_COMMAND_CELL).setValue('IDLE');
      SpreadsheetApp.flush();
    }

  } catch (outerErr) {
    Logger.log('❌ onEditTrigger outer error: ' + outerErr.message);
  }
}

/**
 * Helper: tulis status ke sheet Trigger
 */
function _setTriggerStatus(sheet, percent, message) {
  try {
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    sheet.getRange(TRIGGER_STATUS_CELL).setValue(percent + '|' + message);
    sheet.getRange(TRIGGER_UPDATED_CELL).setValue(timestamp);
    SpreadsheetApp.flush();
  } catch (e) {
    Logger.log('⚠️ _setTriggerStatus error: ' + e.message);
  }
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
 * Jalankan ini untuk test tanpa harus edit cell dari dashboard
 */
function testTriggerManually() {
  Logger.log('🧪 TEST: Simulasi trigger RUN secara manual...');

  const ss = SpreadsheetApp.openById(TRIGGER_SPREADSHEET_ID);
  const sheet = ss.getSheetByName(TRIGGER_SHEET_NAME);

  if (!sheet) {
    Logger.log('❌ Sheet "Trigger" belum ada. Jalankan setupTriggerSheet() dulu!');
    return;
  }

  // Simulasi event object
  const fakeEvent = {
    range: sheet.getRange(TRIGGER_COMMAND_CELL),
    value: 'RUN',
  };

  // Panggil handler dengan fake event
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
