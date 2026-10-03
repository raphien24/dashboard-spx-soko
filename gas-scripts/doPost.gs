/**
 * ===============================================
 * 🌐 WEB APP HANDLER - UNIFIED VERSION
 * ===============================================
 * File: doPost.gs
 *
 * MENGGANTIKAN WebApp.gs sepenuhnya. Semua fungsi dari
 * WebApp.gs sudah dipindah ke sini:
 *   - createHtmlResponse()   (dari WebApp.gs)
 *   - updateConfigFromD2()   (dari WebApp.gs)
 *   - doGet()                (dari WebApp.gs, diperluas)
 *
 * Ditambahkan baru:
 *   - doPost()               → trigger scraper dari dashboard
 *
 * KEGUNAAN doGet:
 *   ?cookie=...      → update cookie dari bookmarklet (TIDAK BERUBAH)
 *   ?action=status   → return progress JSON untuk polling dashboard
 *   (no params)      → health check
 *
 * KEGUNAAN doPost:
 *   { action: "run" }    → jalankan fetchExpediteData()
 *   { action: "resume" } → jalankan resumeExpediteScenarios()
 *
 * CARA DEPLOY (update deployment yang sudah ada agar URL tidak berubah):
 *   1. Hapus WebApp.gs dari project
 *   2. Tambah file ini (doPost.gs)
 *   3. Deploy → Manage deployments → Edit (pensil) → New version → Save
 *   4. URL tetap sama → bookmarklet tidak perlu diupdate
 *   5. Copy URL → set GAS_EXPEDITE_URL di Cloudflare Worker secrets
 * ===============================================
 */


// ============================================================
// HELPER: Tampilan UI popup (dipindah dari WebApp.gs)
// ============================================================

function createHtmlResponse(success, title, data) {
  const bgColor = success
    ? 'linear-gradient(135deg, #667eea, #764ba2)'
    : 'linear-gradient(135deg, #f093fb, #f5576c)';
  const icon = success ? '✅' : '❌';
  const statusText = success ? 'SUCCESS' : 'FAILED';

  let dataHtml = '';
  if (data) {
    dataHtml = '<div style="margin-top:20px;text-align:left;background:rgba(255,255,255,0.1);padding:15px;border-radius:8px;font-size:13px;">';
    Object.keys(data).forEach(key => {
      dataHtml += `<div style="margin-bottom:8px;"><strong>${key.toUpperCase()}:</strong> ${data[key]}</div>`;
    });
    dataHtml += '</div>';
  }

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${statusText}</title>
      <style>
        body { display:flex; align-items:center; justify-content:center; font-family:sans-serif; background:${bgColor}; color:white; height:100vh; margin:0; }
        .container { text-align:center; max-width:500px; padding:20px; }
        h1 { margin:10px 0; }
        #timer { font-weight:bold; font-size:18px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div style="font-size:50px;">${icon}</div>
        <h1>${statusText}</h1>
        <h2>${title}</h2>
        ${dataHtml}
        <p style="margin-top:20px;">Window ini menutup otomatis dalam <span id="timer">3</span> detik...</p>
      </div>
      <script>
        let count = 3;
        setInterval(() => {
          count--;
          document.getElementById('timer').innerText = count;
          if (count <= 0) window.close();
        }, 1000);
      </script>
    </body>
    </html>
  `;

  return HtmlService.createHtmlOutput(html)
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}


// ============================================================
// AUTO-UPDATE: parse cookie dari D2, update kolom B
// (dipindah dari WebApp.gs — logic identik)
// ============================================================

function updateConfigFromD2(spreadsheet) {
  Logger.log('');
  Logger.log('========================================');
  Logger.log('🔄 UPDATE CONFIG FROM D2');
  Logger.log('========================================');
  Logger.log('');

  const ss = spreadsheet || SpreadsheetApp.getActiveSpreadsheet();
  Logger.log('✅ Spreadsheet: ' + ss.getName());
  Logger.log('   ID: ' + ss.getId());
  Logger.log('');

  const configSheet = ss.getSheetByName(CONFIG_SHEET);
  if (!configSheet) {
    Logger.log('❌ Sheet Config ga ketemu!');
    Logger.log('   Nama sheet yang dicari: "' + CONFIG_SHEET + '"');
    const allSheets = ss.getSheets();
    Logger.log('📋 Sheet yang tersedia:');
    allSheets.forEach((sheet, i) => Logger.log('   ' + (i + 1) + '. "' + sheet.getName() + '"'));
    return;
  }

  Logger.log('✅ Sheet Config ditemukan!');
  Logger.log('');
  Logger.log('📍 Reading cell D2...');

  const fullCookieString = configSheet.getRange('D2').getValue();
  if (!fullCookieString || fullCookieString === '') {
    Logger.log('❌ Cell D2 kosong! Paste cookie string dulu di D2.');
    return;
  }

  Logger.log('✅ Cookie string ditemukan di D2!');
  Logger.log('   Panjang: ' + fullCookieString.length + ' karakter');
  Logger.log('');
  Logger.log('🔄 Parsing cookie string...');

  const cookieMap = {};
  fullCookieString.split(';').map(c => c.trim()).forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts[0];
    const value = parts.slice(1).join('=');
    if (key && value) cookieMap[key.trim()] = value.trim();
  });

  Logger.log('✅ Cookie berhasil di-parse!');
  Logger.log('   Total cookies: ' + Object.keys(cookieMap).length);
  Logger.log('');
  Logger.log('📝 Mulai update kolom B...');
  Logger.log('');

  const data = configSheet.getRange('A2:B20').getValues();
  let updateCount = 0, unchangedCount = 0, notFoundCount = 0;

  data.forEach((row, index) => {
    const key = row[0];
    if (!key || key === '') return;

    if (cookieMap[key]) {
      const newValue = cookieMap[key];
      const oldValue = row[1];
      configSheet.getRange(index + 2, 2).setValue(newValue);
      if (oldValue !== newValue) { Logger.log('✅ Updated: ' + key); updateCount++; }
      else { Logger.log('⚪ Unchanged: ' + key); unchangedCount++; }
    } else {
      Logger.log('⚠️ Not found in cookie: ' + key);
      notFoundCount++;
    }
  });

  Logger.log('');
  Logger.log('========================================');
  Logger.log('✅ SELESAI!');
  Logger.log('========================================');
  Logger.log('📊 Summary:');
  Logger.log('   ✅ Updated (berubah): ' + updateCount + ' parameter');
  Logger.log('   ⚪ Unchanged (sama): ' + unchangedCount + ' parameter');
  Logger.log('   ⚠️ Not found: ' + notFoundCount + ' parameter');
  Logger.log('   📝 Total processed: ' + (updateCount + unchangedCount + notFoundCount));
  Logger.log('========================================');
  Logger.log('');

  Logger.log('🕒 Updating timestamp di H2...');
  const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
  configSheet.getRange('H2').setValue(timestamp);
  SpreadsheetApp.flush();
  Logger.log('✅ Timestamp updated: ' + timestamp);
  Logger.log('');
}


// ============================================================
// doGet — bookmarklet + status polling
// ============================================================

function doGet(e) {
  // ── 1. BOOKMARKLET: update cookie ────────────────────────
  // Logic persis sama seperti WebApp.gs — tidak ada perubahan
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

      const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'dd/MM/yyyy HH:mm:ss');
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
  if (e && e.parameter && e.parameter.action === 'status') {
    const progress = getProgress();
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, progress: progress }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // ── 3. HEALTH CHECK ──────────────────────────────────────
  return ContentService
    .createTextOutput(JSON.stringify({
      success: true,
      message: 'SPX Expedite Scraper Web App is running',
      version: 'v4-unified'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


// ============================================================
// doPost — trigger scraper dari dashboard
// ============================================================

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
      // showProgressDialog_ akan throw "no UI context" di web app
      // → ditangkap di dalam fetchExpediteData → proses jalan tanpa popup
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
