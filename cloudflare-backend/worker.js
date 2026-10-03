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
 */
async function getAccessToken(env) {
  // Decode service account credentials from base64
  const credentialsJson = atob(env.GOOGLE_SERVICE_ACCOUNT);
  const credentials = JSON.parse(credentialsJson);
  
  // Create JWT
  const now = Math.floor(Date.now() / 1000);
  const header = {
    alg: 'RS256',
    typ: 'JWT'
  };
  
  const claimSet = {
    iss: credentials.client_email,
    scope: 'https://www.googleapis.com/auth/spreadsheets.readonly',
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
