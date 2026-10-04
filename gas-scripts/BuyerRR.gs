/**
 * ===============================================
 * BuyerRR.gs — Fetch Buyer RR Data
 * Salin script ini apa adanya dari yang Anda kirimkan.
 * Semua fungsi setProgress sudah di-override di TriggerHandler.gs
 * sehingga progress akan ditulis ke sheet Trigger_BuyerRR!A2.
 *
 * CATATAN: File ini harus diurutkan SEBELUM TriggerHandler.gs
 * di project GAS agar override di TriggerHandler.gs berlaku.
 * (Project Settings → file order, drag BuyerRR.gs ke atas TriggerHandler.gs)
 * ===============================================
 */

// ===== RETRY CONFIG =====
const BUYER_RR_RETRY_CONFIG = {
  MAX_FAST_RETRIES: 20,
  FAST_RETRY_MIN_MS: 300,
  FAST_RETRY_MAX_MS: 600,
  MAX_SLOW_RETRIES: 3,
  INITIAL_DELAY_MS: 2000,
  BACKOFF_MULTIPLIER: 1.5,
  MAX_NETWORK_RETRIES: 3,
  NETWORK_RETRY_DELAY_MS: 3000,
  PAGE_DELAY_MIN_MS: 800,
  PAGE_DELAY_MAX_MS: 1300
};

const BUYER_RR_PROGRESS_KEY = 'BUYER_RR_PROGRESS';

// Progress functions — akan di-override oleh TriggerHandler.gs
// Definisi di sini sebagai fallback jika dijalankan tanpa TriggerHandler
function buyerRRSetProgress_(percent, message) {
  CacheService.getScriptCache().put(
    BUYER_RR_PROGRESS_KEY,
    JSON.stringify({ percent, message, done: false, error: null }),
    300
  );
}

function buyerRRSetProgressDone_(message) {
  CacheService.getScriptCache().put(
    BUYER_RR_PROGRESS_KEY,
    JSON.stringify({ percent: 100, message, done: true, error: null }),
    300
  );
}

function buyerRRSetProgressError_(message) {
  CacheService.getScriptCache().put(
    BUYER_RR_PROGRESS_KEY,
    JSON.stringify({ percent: 0, message: '', done: true, error: message }),
    300
  );
}

function getBuyerRRProgress() {
  const cached = CacheService.getScriptCache().get(BUYER_RR_PROGRESS_KEY);
  if (!cached) return { percent: 0, message: 'Memulai...', done: false, error: null };
  return JSON.parse(cached);
}

function buyerRRShowProgressDialog_(title) {
  const html = HtmlService.createHtmlOutput(`
    <style>
      body { font-family: Arial, sans-serif; padding: 16px; }
      .bar-track { background: #e0e0e0; border-radius: 8px; height: 18px; overflow: hidden; }
      .bar-fill { background: #34a853; height: 100%; width: 0%; transition: width 0.4s ease; }
      .bar-fill.warn { background: #f9ab00; }
      .msg { margin-top: 10px; font-size: 13px; color: #333; word-wrap: break-word; }
      .err { color: #d93025; font-weight: bold; }
      .warn-msg { color: #b06000; font-weight: bold; }
    </style>
    <div class="bar-track"><div class="bar-fill" id="bar"></div></div>
    <div class="msg" id="msg">Memulai...</div>
    <script>
      function poll() {
        google.script.run.withSuccessHandler(function(state) {
          document.getElementById('bar').style.width = state.percent + '%';
          if (state.error) {
            document.getElementById('msg').innerHTML = '<span class="err">Gagal: ' + state.error + '</span>';
            return;
          }
          var isWarning = state.done && state.message.indexOf('⚠️') === 0;
          var bar = document.getElementById('bar');
          if (isWarning) {
            bar.classList.add('warn');
            document.getElementById('msg').innerHTML = '<span class="warn-msg">' + state.message + '</span>';
          } else {
            document.getElementById('msg').innerText = state.message + (state.done ? '' : ' (' + state.percent + '%)');
          }
          if (state.done) {
            setTimeout(function() { google.script.host.close(); }, isWarning ? 8000 : 2000);
            return;
          }
          setTimeout(poll, 800);
        }).getBuyerRRProgress();
      }
      poll();
    </script>
  `).setWidth(380).setHeight(150);
  SpreadsheetApp.getUi().showModelessDialog(html, title || 'Menjalankan script...');
}

function buyerRRPagePercent_(pageNo, start, end) {
  return Math.round(start + (end - start) * (1 - Math.exp(-pageNo / 12)));
}

// ============================================================
// 🚀 FUNGSI UTAMA — paste script fetchBuyerRRData() Anda di sini
// ============================================================

function fetchBuyerRRData() {
  var startedAt = Date.now();

  try {
    buyerRRSetProgress_(0, 'Memulai...');
    buyerRRShowProgressDialog_('Menjalankan Fetch Buyer RR Data...');
  } catch (e) {}

  try {
    Logger.log('========================================');
    Logger.log('🚀 FETCH BUYER RR DATA (v3) - START');
    Logger.log('========================================');

    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var buyerSheet = ss.getSheetByName('Buyer RR');
    if (!buyerSheet) throw new Error('Sheet "Buyer RR" tidak ditemukan!');

    buyerRRSetProgress_(3, 'Load config dari sheet...');
    var config = getConfigFromSheet(ss);
    if (!config) throw new Error('Gagal load config!');

    buyerRRSetProgress_(6, 'Menyiapkan cookie...');
    var configSheet = ss.getSheetByName('Config');
    if (!configSheet) throw new Error('Sheet "Config" tidak ditemukan!');

    var cookieData = configSheet.getRange('A2:B' + configSheet.getLastRow()).getValues();
    var cookieMap = {};
    var csrfToken = '';
    var deviceId = '';

    for (var i = 0; i < cookieData.length; i++) {
      var key = cookieData[i][0];
      var value = cookieData[i][1];
      if (key && value) {
        cookieMap[key] = value;
        if (key === 'csrftoken') csrfToken = value;
        if (key === 'spx-admin-device-id') deviceId = value;
      }
    }

    var cookieString = '';
    for (var k in cookieMap) { cookieString += k + '=' + cookieMap[k] + '; '; }
    if (!cookieString.trim()) throw new Error('Cookie tidak ditemukan di sheet Config!');

    var headers = {
      'accept': 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9,id;q=0.8',
      'app': 'FMS Portal',
      'cookie': cookieString.trim(),
      'device-id': deviceId,
      'x-csrftoken': csrfToken,
      'origin': 'https://spx.shopee.co.id',
      'referer': 'https://spx.shopee.co.id/',
      'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36'
    };

    buyerRRSetProgress_(10, 'Switching ke Soko Hub...');
    var switchResult = switchStation(16526, headers);
    if (!switchResult) throw new Error('Gagal switch station — kemungkinan cookie expired.');
    Utilities.sleep(2000);

    var jakartaTimezone = 'Asia/Jakarta';
    var jakartaFormatter = Utilities.formatDate(new Date(), jakartaTimezone, 'yyyy-MM-dd HH:mm:ss');
    var jakartaDate = new Date(jakartaFormatter.replace(
      /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/, '$1/$2/$3 $4:$5:$6'));
    var ninetyDaysAgo = new Date(jakartaDate.getTime() - (90 * 24 * 60 * 60 * 1000));
    var ctimeStart = Math.floor(ninetyDaysAgo.getTime() / 1000);
    var ctimeEnd   = Math.floor(jakartaDate.getTime() / 1000);

    buyerRRSetProgress_(18, 'Fetching status=0 (Created)...');
    var data = fetchPickupOrdersStatus0(ctimeStart, ctimeEnd, headers, 18, 60);
    if (data.failed) throw new Error('Fetch status=0 GAGAL. Sheet TIDAK diubah.');

    buyerRRSetProgress_(62, 'Fetching status=2 (Pickup Task)...');
    var result2 = fetchPickupTaskStatus2(headers, 62, 80);
    var dataStatus2 = result2.outputData;

    buyerRRSetProgress_(82, 'Filter data berdasarkan ETA...');
    var todayJakarta = new Date(Utilities.formatDate(jakartaDate, jakartaTimezone, 'yyyy/MM/dd'));
    var todayEnd = new Date(todayJakarta.getFullYear(), todayJakarta.getMonth(), todayJakarta.getDate(), 23, 59, 59, 999);

    var filteredData = [];
    var countRemoved = 0;
    for (var f = 0; f < data.outputData.length; f++) {
      var row = data.outputData[f];
      var etaValue = row[3];
      if (etaValue instanceof Date && etaValue <= todayEnd) {
        filteredData.push(row);
      } else { countRemoved++; }
    }

    buyerRRSetProgress_(85, 'Menulis ' + filteredData.length + ' baris ke sheet...');
    var outputHeaders = ['SPX Tracking Number', 'Pickup Point Name', 'Pickup Attempts',
                         'ETA', 'Status', 'Created Time', 'Last Update'];

    var existingLastRow = buyerSheet.getLastRow();
    if (existingLastRow > 1) {
      buyerSheet.getRange(2, 1, existingLastRow - 1, buyerSheet.getLastColumn() || 17).clearContent();
    }

    buyerSheet.getRange(1, 1, 1, 7).setValues([outputHeaders]).setFontWeight('bold');

    if (filteredData.length > 0) {
      ensureRows_(buyerSheet, filteredData.length + 1);
      buyerSheet.getRange(2, 1, filteredData.length, 7).setValues(filteredData);
      buyerSheet.getRange(2, 4, filteredData.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');
      buyerSheet.getRange(2, 6, filteredData.length, 1).setNumberFormat('yyyy-mm-dd hh:mm');
      buyerSheet.getRange(2, 7, filteredData.length, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
    }

    buyerRRSetProgress_(91, 'Menulis data status=2...');
    if (!result2.failed) {
      var status2Headers = ['Pickup Task ID', 'Pickup Point Name', 'Driver', 'Accepted Time', 'Status'];
      buyerSheet.getRange(1, 13, 1, 5).setValues([status2Headers]).setFontWeight('bold');
      if (dataStatus2.length > 0) {
        ensureRows_(buyerSheet, dataStatus2.length + 1);
        buyerSheet.getRange(2, 13, dataStatus2.length, 5).setValues(dataStatus2);
        buyerSheet.getRange(2, 16, dataStatus2.length, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
      }
    }

    buyerRRSetProgress_(95, 'Menulis summary...');
    var summaryRow = 1;
    var summaryCol = 12;
    buyerSheet.getRange(summaryRow, summaryCol).setValue('Summary').setFontWeight('bold').setBackground('#fce5cd');
    summaryRow++;
    buyerSheet.getRange(summaryRow, summaryCol).setValue('Total Orders: ' + filteredData.length).setBackground('#fce5cd');
    summaryRow += 2;

    var attemptCount = {};
    var maxAttempt = 0;
    for (var j = 0; j < filteredData.length; j++) {
      var attempts = filteredData[j][2];
      if (typeof attempts === 'number' && attempts > 0) {
        attemptCount[attempts] = (attemptCount[attempts] || 0) + 1;
        if (attempts > maxAttempt) maxAttempt = attempts;
      }
    }
    var maxDisplayAttempt = Math.max(maxAttempt, 6);
    ensureRows_(buyerSheet, summaryRow + maxDisplayAttempt);
    for (var a = 1; a <= maxDisplayAttempt; a++) {
      buyerSheet.getRange(summaryRow, summaryCol)
        .setValue('Pickup Attempts ' + a + 'x = ' + (attemptCount[a] || 0)).setBackground('#fce5cd');
      summaryRow++;
    }

    buyerRRSetProgress_(98, 'Merapikan lebar kolom...');
    buyerSheet.autoResizeColumns(1, 17);

    var elapsed = ((Date.now() - startedAt) / 1000).toFixed(0);
    Logger.log('🎉 SELESAI. Durasi: ' + elapsed + 's | Status=0: ' + filteredData.length + ' | Status=2: ' + dataStatus2.length);

    if (result2.failed) {
      buyerRRSetProgressDone_('⚠️ Selesai dengan warning (' + elapsed + 's). Status=2 GAGAL — kolom M-Q tidak diperbarui.');
    } else {
      buyerRRSetProgressDone_('Selesai! ' + filteredData.length + ' orders (status=0) & ' + dataStatus2.length + ' task (status=2). Durasi ' + elapsed + 's.');
    }

  } catch (err) {
    var errMsg = String((err && err.message) || err);
    buyerRRSetProgressError_(errMsg);
    Logger.log('❌ ERROR: ' + errMsg);
    try { SpreadsheetApp.getUi().alert('Gagal: ' + errMsg); } catch (e) {}
    throw err;
  }
}

// ============================================================
// HELPERS
// ============================================================

function ensureRows_(sheet, needed) {
  const max = sheet.getMaxRows();
  if (max < needed) sheet.insertRowsAfter(max, needed - max);
}

function randBetween_(min, max) {
  return min + Math.floor(Math.random() * Math.max(1, max - min));
}

function fetchSafe_(url, options) {
  try {
    const response = UrlFetchApp.fetch(url, options);
    return { ok: true, response, code: response.getResponseCode(), error: '', threw: false };
  } catch (e) {
    return { ok: false, response: null, code: 0, error: String(e.message || e), threw: true };
  }
}

function fetchWithRetry_(url, options, label, progressPercent) {
  let fastAttempt = 0, slowAttempt = 0, netAttempt = 0;
  while (true) {
    const r = fetchSafe_(url, options);
    if (r.threw) {
      netAttempt++;
      if (netAttempt > BUYER_RR_RETRY_CONFIG.MAX_NETWORK_RETRIES) return { ok: false, response: null, code: 0, error: 'network: ' + r.error };
      if (progressPercent !== undefined) buyerRRSetProgress_(progressPercent, '[' + label + '] Network error, retry ' + netAttempt + '...');
      Utilities.sleep(BUYER_RR_RETRY_CONFIG.NETWORK_RETRY_DELAY_MS);
      continue;
    }
    if (r.code === 200) return { ok: true, response: r.response, code: 200, error: '' };
    if (r.code === 403) {
      fastAttempt++;
      if (fastAttempt > BUYER_RR_RETRY_CONFIG.MAX_FAST_RETRIES) return { ok: false, response: r.response, code: 403, error: 'HTTP 403 persisten' };
      if (progressPercent !== undefined) buyerRRSetProgress_(progressPercent, '[' + label + '] HTTP 403, retry ' + fastAttempt + '...');
      Utilities.sleep(randBetween_(BUYER_RR_RETRY_CONFIG.FAST_RETRY_MIN_MS, BUYER_RR_RETRY_CONFIG.FAST_RETRY_MAX_MS));
      continue;
    }
    if (r.code === 429 || r.code >= 500) {
      slowAttempt++;
      if (slowAttempt > BUYER_RR_RETRY_CONFIG.MAX_SLOW_RETRIES) return { ok: false, response: r.response, code: r.code, error: 'HTTP ' + r.code };
      const delay = BUYER_RR_RETRY_CONFIG.INITIAL_DELAY_MS * Math.pow(BUYER_RR_RETRY_CONFIG.BACKOFF_MULTIPLIER, slowAttempt - 1);
      if (progressPercent !== undefined) buyerRRSetProgress_(progressPercent, '[' + label + '] HTTP ' + r.code + ', retry ' + slowAttempt + '...');
      Utilities.sleep(delay);
      continue;
    }
    return { ok: false, response: r.response, code: r.code, error: 'HTTP ' + r.code };
  }
}

function fetchPickupOrdersStatus0(ctimeStart, ctimeEnd, headers, pctStart, pctEnd) {
  const pStart = pctStart || 0, pEnd = pctEnd || 100;
  let allOrders = [], pageNo = 1, hasMoreData = true, totalPages = 0, fetchFailed = false;
  const options = { method: 'get', headers, muteHttpExceptions: true };

  while (hasMoreData) {
    const apiUrl = 'https://spx.shopee.co.id/api/admin/pickup/fm_hub/pickup_order/search'
      + '?ctime=' + ctimeStart + '%2C' + ctimeEnd
      + '&status=0&pageno=' + pageNo + '&count=50&fetch_total=0';
    const pagePct = buyerRRPagePercent_(pageNo, pStart, pEnd);
    buyerRRSetProgress_(pagePct, 'Status=0: halaman ' + pageNo + ' (' + allOrders.length + ' orders)...');
    const r = fetchWithRetry_(apiUrl, options, 'status0 p' + pageNo, pagePct);
    if (!r.ok) { fetchFailed = true; break; }
    try {
      const json = JSON.parse(r.response.getContentText());
      if (json.retcode !== 0) throw new Error('API Error ' + json.retcode);
      const list = json.data.list || [];
      if (list.length === 0) { hasMoreData = false; }
      else {
        allOrders = allOrders.concat(list);
        totalPages = pageNo;
        if (list.length < 50) { hasMoreData = false; }
        else { pageNo++; Utilities.sleep(randBetween_(800, 1300)); }
      }
    } catch (e) { fetchFailed = true; break; }
  }

  const outputData = allOrders.map(item => [
    item.pickup_order_id || '-',
    item.pickup_point_name || '-',
    item.pickup_attempts || 0,
    item.eta ? new Date(item.eta * 1000) : '-',
    item.status_desc || 'Created',
    item.ctime ? new Date(item.ctime * 1000) : '-',
    new Date()
  ]);
  return { allOrders, outputData, totalPages, failed: fetchFailed };
}

function fetchPickupTaskStatus2(headers, pctStart, pctEnd) {
  const pStart = pctStart || 0, pEnd = pctEnd || 100;
  let allTasks = [], pageNo = 1, hasMoreData = true, fetchFailed = false;
  const options = { method: 'get', headers, muteHttpExceptions: true };

  while (hasMoreData) {
    const apiUrl = 'https://spx.shopee.co.id/api/admin/pickup/fm_hub/pickup_task/search'
      + '?status=2&pageno=' + pageNo + '&count=50';
    const pagePct = buyerRRPagePercent_(pageNo, pStart, pEnd);
    buyerRRSetProgress_(pagePct, 'Status=2: halaman ' + pageNo + ' (' + allTasks.length + ' tasks)...');
    const r = fetchWithRetry_(apiUrl, options, 'status2 p' + pageNo, pagePct);
    if (!r.ok) { fetchFailed = true; break; }
    try {
      const json = JSON.parse(r.response.getContentText());
      if (json.retcode !== 0) throw new Error('API Error ' + json.retcode);
      const list = json.data.list || [];
      if (list.length === 0) { hasMoreData = false; }
      else {
        allTasks = allTasks.concat(list);
        if (list.length < 50) { hasMoreData = false; }
        else { pageNo++; Utilities.sleep(randBetween_(800, 1300)); }
      }
    } catch (e) { fetchFailed = true; break; }
  }

  const outputData = allTasks.map(item => [
    item.task_id || '-',
    item.pickup_point_name || '-',
    item.driver_name || '-',
    item.accepted_time ? new Date(item.accepted_time * 1000) : '-',
    item.task_status_str || item.task_status || '-'
  ]);
  return { outputData, failed: fetchFailed };
}
