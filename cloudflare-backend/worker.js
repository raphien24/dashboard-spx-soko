/**
 * Cloudflare Worker for SPX SOKO Dashboard Backend
 * Handles Google Sheets API requests with Service Account
 */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle OPTIONS request (CORS preflight)
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Health check
    if (url.pathname === '/health' || url.pathname === '/api/health') {
      return new Response(JSON.stringify({ 
        status: 'ok', 
        timestamp: new Date().toISOString() 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Route: Get single range
    const rangeMatch = url.pathname.match(/^\/api\/sheets\/range\/(.+)$/);
    if (rangeMatch && request.method === 'GET') {
      const range = decodeURIComponent(rangeMatch[1]);
      return handleGetRange(range, env, corsHeaders);
    }

    // Route: Get batch ranges
    if (url.pathname === '/api/sheets/batch' && request.method === 'POST') {
      const body = await request.json();
      return handleBatchRanges(body.ranges, env, corsHeaders);
    }

    // Route: Get SP Record data (separate spreadsheet)
    if (url.pathname === '/api/sp-record' && request.method === 'GET') {
      return handleSPRecord(env, corsHeaders);
    }

    // Route: Get Expedite scraper data (separate spreadsheet)
    if (url.pathname === '/api/expedite' && request.method === 'GET') {
      return handleExpeditData(env, corsHeaders);
    }

    // Route: Get Config sheet data (Cookie Manager)
    if (url.pathname === '/api/config' && request.method === 'GET') {
      return handleConfigSheet(env, corsHeaders);
    }

    // Route: Get HSE Daily Briefing data (A2:I4)
    if (url.pathname === '/api/hse-daily' && request.method === 'GET') {
      return handleHSERange(env, corsHeaders, 'HSE!A2:I4');
    }

    // Route: Get HSE Weekly 5S data (A7:Z9)
    if (url.pathname === '/api/hse-weekly' && request.method === 'GET') {
      return handleHSERange(env, corsHeaders, 'HSE!A7:Z9');
    }

    // Route: Get Backlog LM data
    if (url.pathname === '/api/backlog-lm' && request.method === 'GET') {
      return handleSheetData(env, corsHeaders, '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Backlog LM');
    }

    // Route: Trigger Backlog LM scraper (kolom E di sheet Trigger)
    if (url.pathname === '/api/trigger-backlog-lm' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return handleTriggerSheetCol(body, env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'E1');
    }

    // Route: Poll Backlog LM scraper status (kolom E)
    if (url.pathname === '/api/backlog-lm-status' && request.method === 'GET') {
      return handleSheetStatusCol(env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'E1', 'E2', 'E3');
    }

    // Route: Get Control Stuck FM data (A1:P3)
    if (url.pathname === '/api/control-stuck-fm' && request.method === 'GET') {
      return handleControlStuckFM(env, corsHeaders);
    }

    // Route: Trigger Control Stuck FM scraper (kolom D di sheet Trigger)
    if (url.pathname === '/api/trigger-control-stuck-fm' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return handleTriggerSheetCol(body, env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'D1');
    }

    // Route: Poll Control Stuck FM scraper status (kolom D)
    if (url.pathname === '/api/control-stuck-fm-status' && request.method === 'GET') {
      return handleSheetStatusCol(env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'D1', 'D2', 'D3');
    }

    // Route: Get Monitor SDHO data
    if (url.pathname === '/api/monitor-sdho' && request.method === 'GET') {
      return handleMonitorSDHO(env, corsHeaders);
    }

    // Route: Trigger Monitor SDHO scraper (kolom C di sheet Trigger)
    if (url.pathname === '/api/trigger-monitor-sdho' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return handleTriggerSheetCol(body, env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'C1');
    }

    // Route: Poll Monitor SDHO scraper status (kolom C)
    if (url.pathname === '/api/monitor-sdho-status' && request.method === 'GET') {
      return handleSheetStatusCol(env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'C1', 'C2', 'C3');
    }
    // Route: Get Buyer RR data
    if (url.pathname === '/api/buyer-rr' && request.method === 'GET') {
      return handleSheetData(env, corsHeaders, '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Buyer RR');
    }

    // Route: Trigger Buyer RR scraper (kolom B di sheet Trigger)
    if (url.pathname === '/api/trigger-buyer-rr' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return handleTriggerSheetCol(body, env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'B1');
    }

    // Route: Poll Buyer RR scraper status (kolom B)
    if (url.pathname === '/api/buyer-rr-status' && request.method === 'GET') {
      return handleSheetStatusCol(env, corsHeaders,
        '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0', 'Trigger', 'B1', 'B2', 'B3');
    }

    // Route: Trigger expedite scraper via spreadsheet cell (message queue)
    if (url.pathname === '/api/trigger-expedite' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return handleTriggerExpedite(body, env, corsHeaders);
    }

    // Route: Poll expedite scraper status from trigger sheet
    if (url.pathname === '/api/expedite-status' && request.method === 'GET') {
      return handleExpediteStatusFromSheet(env, corsHeaders);
    }

    // Route: Trigger GAS Expedite scraper (run / resume)
    if (url.pathname === '/api/run-expedite' && request.method === 'POST') {
      const body = await request.json().catch(() => ({}));
      return handleRunExpedite(body, env, corsHeaders);
    }

    // Route: Poll GAS scraper status
    if (url.pathname === '/api/expedite-status' && request.method === 'GET') {
      return handleExpediteStatus(env, corsHeaders);
    }
    // 404
    return new Response('Not Found', { 
      status: 404, 
      headers: corsHeaders 
    });
  }
};

/**
 * Handle single range request
 */
async function handleGetRange(range, env, corsHeaders) {
  try {
    const accessToken = await getAccessToken(env);
    const spreadsheetId = env.SPREADSHEET_ID;
    
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.error?.message || 'Failed to fetch data' 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    
    return new Response(JSON.stringify({
      success: true,
      data: data.values || []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle batch ranges request
 */
async function handleBatchRanges(ranges, env, corsHeaders) {
  try {
    const accessToken = await getAccessToken(env);
    const spreadsheetId = env.SPREADSHEET_ID;
    
    const rangesParam = ranges.map(r => `ranges=${encodeURIComponent(r)}`).join('&');
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?${rangesParam}`;
    
    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({ 
        success: false, 
        error: error.error?.message || 'Failed to fetch data' 
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    
    // Convert to our format
    const result = {};
    data.valueRanges.forEach((valueRange, index) => {
      result[ranges[index]] = valueRange.values || [];
    });
    
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Trigger expedite scraper by writing command to Trigger sheet cell A1
 * Uses existing service account — no GAS web app URL needed
 */
async function handleTriggerExpedite(body, env, corsHeaders) {
  const EXPEDITE_SS_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const TRIGGER_RANGE  = 'Trigger!A1';
  const command        = (body.action === 'resume') ? 'RESUME' : 'RUN';

  try {
    // Write scope needed to update trigger cell
    const accessToken = await getAccessToken(env, true);
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${EXPEDITE_SS_ID}/values/${encodeURIComponent(TRIGGER_RANGE)}?valueInputOption=RAW`;

    const writeRes = await fetch(writeUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ values: [[command]] }),
    });

    if (!writeRes.ok) {
      const err = await writeRes.json();
      return new Response(JSON.stringify({
        success: false,
        error: err.error?.message || 'Failed to write trigger cell'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      success: true,
      message: `Command "${command}" sent to GAS trigger cell`,
      command,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Poll expedite scraper status from Trigger sheet cell A1:A3
 */
async function handleExpediteStatusFromSheet(env, corsHeaders) {
  const EXPEDITE_SS_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const STATUS_RANGE   = 'Trigger!A1:A3';

  try {
    const accessToken = await getAccessToken(env);
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${EXPEDITE_SS_ID}/values/${encodeURIComponent(STATUS_RANGE)}`;
    const readRes = await fetch(readUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!readRes.ok) {
      const err = await readRes.json();
      return new Response(JSON.stringify({
        success: false,
        error: err.error?.message || 'Failed to read status cell'
      }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data      = await readRes.json();
    const values    = data.values || [];
    const command   = values[0]?.[0] || 'IDLE';
    const rawStatus = values[1]?.[0] || '0|Menunggu...';
    const updatedAt = values[2]?.[0] || '';

    // Parse "percent|message" format
    const pipeIdx = rawStatus.indexOf('|');
    const percent = pipeIdx > -1 ? parseInt(rawStatus.substring(0, pipeIdx)) || 0 : 0;
    const message = pipeIdx > -1 ? rawStatus.substring(pipeIdx + 1) : rawStatus;

    const isRunning = command === 'RUNNING' || command === 'RUN' || command === 'RESUME';
    const isDone    = !isRunning && (
      message.startsWith('✅') ||
      message.startsWith('❌') ||
      message.startsWith('Selesai') ||
      message.startsWith('⚠️') ||
      percent === 100
    );

    return new Response(JSON.stringify({
      success: true,
      command,
      isRunning,
      isDone,
      status: { percent, message, updatedAt },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generic: write RUN/RESUME to specific cell in a sheet
 */
async function handleTriggerSheetCol(body, env, corsHeaders, spreadsheetId, sheetName, commandCell) {
  const command = (body.action === 'resume') ? 'RESUME' : 'RUN';
  const range   = `${sheetName}!${commandCell}`;
  try {
    const accessToken = await getAccessToken(env, true);
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
    const writeRes = await fetch(writeUrl, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[command]] }),
    });
    if (!writeRes.ok) {
      const err = await writeRes.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message || 'Failed to write trigger' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true, message: `Command "${command}" sent`, command }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generic: read status from specific cells in a sheet
 */
async function handleSheetStatusCol(env, corsHeaders, spreadsheetId, sheetName, commandCell, statusCell, updatedCell) {
  const range = `${sheetName}!${commandCell}:${updatedCell}`;
  try {
    const accessToken = await getAccessToken(env);
    // Fetch each cell individually to handle non-contiguous cols (A vs B)
    const colLetter = commandCell.charAt(0);
    const batchRange = `${sheetName}!${colLetter}1:${colLetter}3`;
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(batchRange)}`;
    const readRes = await fetch(readUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!readRes.ok) {
      const err = await readRes.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const data      = await readRes.json();
    const values    = data.values || [];
    const command   = values[0]?.[0] || 'IDLE';
    const rawStatus = values[1]?.[0] || '0|Menunggu...';
    const updatedAt = values[2]?.[0] || '';
    const pipeIdx   = rawStatus.indexOf('|');
    const percent   = pipeIdx > -1 ? parseInt(rawStatus.substring(0, pipeIdx)) || 0 : 0;
    const message   = pipeIdx > -1 ? rawStatus.substring(pipeIdx + 1) : rawStatus;
    const isRunning = command === 'RUNNING' || command === 'RUN' || command === 'RESUME';
    const isDone    = !isRunning && (
      message.startsWith('✅') || message.startsWith('❌') ||
      message.startsWith('Selesai') || message.startsWith('⚠️') || percent === 100
    );
    return new Response(JSON.stringify({
      success: true, command, isRunning, isDone,
      status: { percent, message, updatedAt },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Control Stuck FM — fetch A1:P (header row 1, data rows 2-3)
 * Returns structured rows with headers as keys
 */
async function handleControlStuckFM(env, corsHeaders) {
  const SS_ID  = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const SHEET  = 'Control Stuck FM';
  try {
    const accessToken = await getAccessToken(env);
    const range   = `${encodeURIComponent(SHEET)}!A1:P3`;
    const apiUrl  = `https://sheets.googleapis.com/v4/spreadsheets/${SS_ID}/values/${range}`;
    const res     = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const json    = await res.json();
    const rows    = json.values || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, headers: [], data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Row 1 = headers (category: Forward/Reverse/etc)
    // Row 2 = sub-headers (status names)
    // Row 3 = data values
    // Return semua rows mentah agar frontend bisa layout sendiri
    const raw = rows.map(row => {
      // Pad to 16 cols
      while (row.length < 16) row.push('');
      return row;
    });

    return new Response(JSON.stringify({
      success: true,
      raw,        // raw[0]=headers row1, raw[1]=sub-headers row2, raw[2]=data row3
      headers: raw[0] || [],
      subHeaders: raw[1] || [],
      data: raw[2] || [],
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Config sheet — fetch A:H, parse cookie rows + G1 (valid) + H2 (last update)
 */
async function handleConfigSheet(env, corsHeaders) {
  const SS_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  try {
    const accessToken = await getAccessToken(env);
    const range       = encodeURIComponent('Config!A1:H30');
    const apiUrl      = `https://sheets.googleapis.com/v4/spreadsheets/${SS_ID}/values/${range}`;
    const res         = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const json = await res.json();
    const rows  = json.values || [];
    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, cookies: [], validStatus: '', lastUpdate: '' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Row 1 = header: col G (index 6) = valid status
    const headerRow   = rows[0] || [];
    const validStatus = headerRow[6] || '';   // G1
    const codeInfo    = headerRow[7] || '';   // H1

    // Row 2 (index 1): col H (index 7) = last update timestamp
    const row2       = rows[1] || [];
    const lastUpdate = row2[7] || '';         // H2

    // Cookie rows: col A = nama, col B = value, col C = keterangan
    const cookies = rows.slice(1)
      .filter(r => r[0] && String(r[0]).trim() !== '' && r[1] && String(r[1]).trim() !== '')
      .map(r => ({
        nama:       String(r[0] || '').trim(),
        value:      String(r[1] || '').trim(),
        keterangan: String(r[2] || '').trim(),
      }));

    return new Response(JSON.stringify({
      success: true,
      cookies,
      validStatus,
      codeInfo,
      lastUpdate,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Monitor SDHO — fetch A:G (detail) + I:L (summary cards) separately
 */
async function handleMonitorSDHO(env, corsHeaders) {
  const SS_ID    = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  const SHEET    = 'MONITOR SDHO';
  try {
    const accessToken = await getAccessToken(env);

    // Fetch full sheet A1:L
    const range   = encodeURIComponent(`${SHEET}!A1:L`);
    const apiUrl  = `https://sheets.googleapis.com/v4/spreadsheets/${SS_ID}/values/${range}`;
    const res     = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const json = await res.json();
    const rows  = json.values || [];
    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, detail: [], summary: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const headerRow = rows[0];

    // Kolom A:G (index 0-6) — detail data
    const detailHeaders = headerRow.slice(0, 7).map(h => String(h).trim());
    const detailRows = rows.slice(1)
      .filter(row => row[0] && String(row[0]).trim() !== '') // hanya baris yang ada SPX TN
      .map(row => {
        const record = {};
        detailHeaders.forEach((h, i) => { record[h] = row[i] !== undefined ? row[i] : ''; });
        return record;
      });

    // Kolom I:L (index 8-11) — summary cards
    const summaryHeaders = headerRow.slice(8, 12).map(h => String(h).trim());
    const summaryRows = rows.slice(1)
      .filter(row => row[8] && String(row[8]).trim() !== '')
      .map(row => {
        const record = {};
        summaryHeaders.forEach((h, i) => { record[h] = row[8 + i] !== undefined ? row[8 + i] : ''; });
        return record;
      });

    return new Response(JSON.stringify({
      success: true,
      detailHeaders,
      detail: detailRows,
      summaryHeaders,
      summary: summaryRows,
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle HSE sheet — fetch specific range and return raw rows
 */
async function handleHSERange(env, corsHeaders, range) {
  const SS_ID = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
  try {
    const accessToken = await getAccessToken(env);
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${SS_ID}/values/${encodeURIComponent(range)}`;
    const res = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    if (!res.ok) {
      const err = await res.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message }), {
        status: res.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const json = await res.json();
    return new Response(JSON.stringify({ success: true, rows: json.values || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generic: fetch any sheet from any spreadsheet
 */
async function handleSheetData(env, corsHeaders, spreadsheetId, sheetName) {
  try {
    const accessToken = await getAccessToken(env);
    const range = `${sheetName}!A1:Z`;
    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const response = await fetch(apiUrl, {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({
        success: false, error: error.error?.message || 'Failed to fetch data'
      }), { status: response.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const data = await response.json();
    const rows = data.values || [];
    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [], headers: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const headers = rows[0].map(h => String(h).trim());
    const records = rows.slice(1)
      .filter(row => row.some(cell => cell !== '' && cell !== undefined))
      .map(row => {
        const record = {};
        headers.forEach((header, i) => { record[header] = row[i] !== undefined ? row[i] : ''; });
        return record;
      });

    return new Response(JSON.stringify({ success: true, headers, data: records }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generic: write RUN/RESUME command to any trigger sheet
 */
async function handleTriggerSheet(body, env, corsHeaders, spreadsheetId, triggerSheetName) {
  const command = (body.action === 'resume') ? 'RESUME' : 'RUN';
  const range   = `${triggerSheetName}!A1`;
  try {
    const accessToken = await getAccessToken(env, true);
    const writeUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}?valueInputOption=RAW`;
    const writeRes = await fetch(writeUrl, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ values: [[command]] }),
    });
    if (!writeRes.ok) {
      const err = await writeRes.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message || 'Failed to write trigger' }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    return new Response(JSON.stringify({ success: true, message: `Command "${command}" sent`, command }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Generic: read status from any trigger sheet A1:A3
 */
async function handleSheetStatus(env, corsHeaders, spreadsheetId, triggerSheetName) {
  const range = `${triggerSheetName}!A1:A3`;
  try {
    const accessToken = await getAccessToken(env);
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(range)}`;
    const readRes = await fetch(readUrl, { headers: { 'Authorization': `Bearer ${accessToken}` } });
    if (!readRes.ok) {
      const err = await readRes.json();
      return new Response(JSON.stringify({ success: false, error: err.error?.message }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    const data      = await readRes.json();
    const values    = data.values || [];
    const command   = values[0]?.[0] || 'IDLE';
    const rawStatus = values[1]?.[0] || '0|Menunggu...';
    const updatedAt = values[2]?.[0] || '';
    const pipeIdx   = rawStatus.indexOf('|');
    const percent   = pipeIdx > -1 ? parseInt(rawStatus.substring(0, pipeIdx)) || 0 : 0;
    const message   = pipeIdx > -1 ? rawStatus.substring(pipeIdx + 1) : rawStatus;
    const isRunning = command === 'RUNNING' || command === 'RUN' || command === 'RESUME';
    const isDone    = !isRunning && (
      message.startsWith('✅') || message.startsWith('❌') ||
      message.startsWith('Selesai') || message.startsWith('⚠️') || percent === 100
    );
    return new Response(JSON.stringify({
      success: true, command, isRunning, isDone,
      status: { percent, message, updatedAt },
    }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle Expedite scraper data from separate spreadsheet
 * Spreadsheet ID: 1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0
 * Sheet: Expedite
 */
async function handleExpeditData(env, corsHeaders) {
  try {
    const accessToken = await getAccessToken(env);
    const spreadsheetId = '1NJEjuV9Wnol2MWZp3Wvo_1p7AjD7zZzc8kyjLydvWX0';
    const range = 'Expedite!A1:Z';

    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({
        success: false,
        error: error.error?.message || 'Failed to fetch Expedite data'
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [], headers: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // First row = headers
    const headers = rows[0].map(h => String(h).trim());
    const records = rows.slice(1)
      .filter(row => row.some(cell => cell !== '' && cell !== undefined))
      .map(row => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index] !== undefined ? row[index] : '';
        });
        return record;
      });

    return new Response(JSON.stringify({
      success: true,
      headers,
      data: records
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Handle SP Record data from separate spreadsheet
 * Spreadsheet ID: 1sTSltnZ68zxkvqV6_IldXaW9XhddyribC6ne5jKMJFE
 * Sheet: Database
 */
async function handleSPRecord(env, corsHeaders) {
  try {
    const accessToken = await getAccessToken(env);
    const spreadsheetId = '1sTSltnZ68zxkvqV6_IldXaW9XhddyribC6ne5jKMJFE';
    const range = 'Database!A1:Z';

    const apiUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      const error = await response.json();
      return new Response(JSON.stringify({
        success: false,
        error: error.error?.message || 'Failed to fetch SP Record data'
      }), {
        status: response.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const rows = data.values || [];

    if (rows.length === 0) {
      return new Response(JSON.stringify({ success: true, data: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Convert rows to array of objects using first row as headers
    const headers = rows[0].map(h => String(h).trim());
    const records = rows.slice(1)
      .filter(row => row.some(cell => cell !== '' && cell !== undefined))
      .map(row => {
        const record = {};
        headers.forEach((header, index) => {
          record[header] = row[index] !== undefined ? row[index] : '';
        });
        return record;
      });

    return new Response(JSON.stringify({
      success: true,
      data: records
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Get Google OAuth Access Token from Service Account
 * @param {object} env - Worker env
 * @param {boolean} writeAccess - true = read+write scope, false = readonly (default)
 */
async function getAccessToken(env, writeAccess = false) {
  // Decode service account credentials from base64
  const credentialsJson = atob(env.GOOGLE_SERVICE_ACCOUNT);
  const credentials = JSON.parse(credentialsJson);
  
  // Create JWT
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  
  const claimSet = {
    iss: credentials.client_email,
    // Use read+write scope when writing to trigger cell, readonly otherwise
    scope: writeAccess
      ? 'https://www.googleapis.com/auth/spreadsheets'
      : 'https://www.googleapis.com/auth/spreadsheets.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now
  };
  
  // Sign JWT (simplified - in production use a proper JWT library)
  const jwtHeader = base64url(JSON.stringify(header));
  const jwtClaim = base64url(JSON.stringify(claimSet));
  const jwtData = `${jwtHeader}.${jwtClaim}`;
  
  // Import private key
  const privateKey = await crypto.subtle.importKey(
    'pkcs8',
    str2ab(atob(credentials.private_key.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\n/g, ''))),
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  );
  
  // Sign
  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    privateKey,
    str2ab(jwtData)
  );
  
  const jwt = `${jwtData}.${base64url(ab2str(signature))}`;
  
  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`
  });
  
  if (!tokenResponse.ok) {
    throw new Error('Failed to get access token');
  }
  
  const tokenData = await tokenResponse.json();
  return tokenData.access_token;
}

// Helper functions
function base64url(str) {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

function ab2str(buf) {
  return String.fromCharCode.apply(null, new Uint8Array(buf));
}
