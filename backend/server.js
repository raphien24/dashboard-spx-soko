const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for frontend
app.use(cors());
app.use(express.json());

// Initialize Google Sheets API with Service Account
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE, // Path to JSON file
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get range data from spreadsheet
app.get('/api/sheets/range/:range', async (req, res) => {
  try {
    const { range } = req.params;
    
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: decodeURIComponent(range),
    });

    res.json({
      success: true,
      data: response.data.values || [],
    });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Get multiple ranges (batch)
app.post('/api/sheets/batch', async (req, res) => {
  try {
    const { ranges } = req.body;
    
    const response = await sheets.spreadsheets.values.batchGet({
      spreadsheetId: SPREADSHEET_ID,
      ranges: ranges,
    });

    const result = {};
    response.data.valueRanges.forEach((valueRange, index) => {
      result[ranges[index]] = valueRange.values || [];
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error fetching batch data:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
