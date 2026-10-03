/**
 * ===============================================
 * 🌐 WEB APP HANDLER - UNIFIED VERSION
 * ===============================================
 * File: doPost.gs
 *
 * Menggabungkan dua kegunaan dalam satu file:
 * 1. doGet(?cookie=...)     → update cookie dari bookmarklet (TIDAK BERUBAH)
 * 2. doGet(?action=status)  → return progress scraper untuk polling dashboard
 * 3. doPost({action:...})   → trigger run/resume scraper dari dashboard
 *
 * CARA DEPLOY (satu deployment untuk semua):
 * 1. Di GAS editor: Deploy → New deployment
 * 2. Type: Web app
 * 3. Execute as: Me
 * 4. Who has access: Anyone
 * 5. Copy URL → set sebagai GAS_EXPEDITE_URL di Cloudflare Worker secrets
 * ===============================================
 */

/**
 * Handle GET request
 * - ?cookie=...      → update cookie dari bookmarklet (logic TIDAK BERUBAH)
 * - ?action=status   → return progress JSON untuk dashboard polling
 * - (no params)      → health check
 */
function doGet(e) {
  // ── 1. BOOKMARKLET: update cookie ────────────────────────
  // Logic persis sama seperti WebApp.gs sebelumnya — tidak ada perubahan
  if (e && e.parameter && e.parameter.cookie) {
    const startTime = new Date().getTime();
    try {
      const cookieString = e.parameter.cookie;
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      const configSheet = ss.getSheetByName(CONFIG_SHEET);

      if (!configSheet) {
        return createHtmlResponse(false, 'Sheet "' + CONFIG_SHEET + '" ga ketemu!');
      }

      configSheet.getRange('G2').setValue(cookieString);
      SpreadsheetApp.flush();

      if (typeof updateConfigFromD2 === 'function') {
        updateConfigFromD2(ss);
      }

      const now = new Date();
      const timestamp = Utilities.formatDate(now, 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
      configSheet.getRange('H2').setValue(timestamp);
      SpreadsheetApp.flush();

      const duration = new Date().getTime() - startTime;

      return createHtmlResponse(true, 'Cookie berhasil di-update! 🎉', {
        timestamp: timestamp,
        waktu_proses: duration + ' ms',
        karakter_cookie: cookieString.length,
        lokasi_update: 'Kolom G2 dan Timestamp di H2'
      });
    } catch (error) {
      return createHtmlResponse(false, 'Error: ' + error.message);
    }
  }

  // ── 2. STATUS POLLING: untuk dashboard ───────────────────
  // Return JSON progress dari CacheService
  if (e && e.parameter && e.parameter.action === 'status') {
    const progress = getProgress();
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, progress: progress }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── 3. HEALTH CHECK ───────────────────────────────────────
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'SPX Expedite Scraper Web App is running',
      version: 'v4-unified'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Handle POST request — trigger scraper dari dashboard
 * Body JSON: { "action": "run" | "resume" }
 */
function doPost(e) {
  try {
    let body = {};
    try {
      body = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Invalid JSON body' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const action = body.action || 'run';

    // Reset progress cache sebelum mulai
    CacheService.getScriptCache().put(
      PROGRESS_CACHE_KEY,
      JSON.stringify({
        percent: 0,
        message: 'Dimulai dari dashboard...',
        done: false,
        error: null
      }),
      600
    );

    if (action === 'run') {
      // showProgressDialog_ akan throw "no UI context" → ditangkap di dalam
      // fetchExpediteData → proses tetap jalan tanpa popup
      fetchExpediteData();
    } else if (action === 'resume') {
      resumeExpediteScenarios();
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Unknown action: ' + action }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const progress = getProgress();
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        message: action + ' selesai',
        progress: progress
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('❌ doPost ERROR: ' + err.message);
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
