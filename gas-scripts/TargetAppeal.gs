/**
 * TARGET APPEAL MANAGEMENT
 * Allows manual adjustment of weekly productivity targets after appeal approval.
 */

const TARGET_APPEAL_SHEET_NAME = 'TARGET_APPEAL';

/**
 * Get or create TARGET_APPEAL sheet
 */
function getTargetAppealSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(TARGET_APPEAL_SHEET_NAME);
  
  if (!sheet) {
    sheet = ss.insertSheet(TARGET_APPEAL_SHEET_NAME);
    
    // Setup headers
    const headers = ['Week Start', 'Contract', 'Vehicle', 'Appeal Target', 'Last Updated', 'Updated By'];
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4285F4')
      .setFontColor('#FFFFFF');
    
    sheet.setFrozenRows(1);
    sheet.autoResizeColumns(1, headers.length);
  }
  
  return sheet;
}

/**
 * Get all target appeals as array of objects
 */
function getAllTargetAppeals() {
  const sheet = getTargetAppealSheet();
  const data = sheet.getDataRange().getValues();
  
  if (data.length <= 1) return [];
  
  const headers = data[0];
  return data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, i) => {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Submit or update target appeal
 * @param {string} weekStart - Format: YYYY-MM-DD (Monday of the week)
 * @param {string} contract  - e.g., "Dedicated", "Kurir Plus"
 * @param {string} vehicle   - "2WH" | "4WH"
 * @param {number} appealTarget - New target value
 * @param {string} updatedBy - Username/email
 * @returns {Object} { success: boolean, message: string }
 */
function submitTargetAppeal(weekStart, contract, vehicle, appealTarget, updatedBy = 'Manual') {
  try {
    const sheet = getTargetAppealSheet();
    const data = sheet.getDataRange().getValues();
    
    // Validate inputs
    if (!weekStart || !contract || !vehicle || appealTarget === null || appealTarget === undefined) {
      return { success: false, message: 'Missing required fields' };
    }
    
    const targetNum = parseFloat(appealTarget);
    if (isNaN(targetNum) || targetNum < 0) {
      return { success: false, message: 'Invalid target value' };
    }
    
    // Check if entry exists (Week Start + Contract + Vehicle)
    let existingRow = -1;
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === weekStart && data[i][1] === contract && data[i][2] === vehicle) {
        existingRow = i + 1; // +1 because sheet rows are 1-indexed
        break;
      }
    }
    
    const timestamp = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
    
    if (existingRow > 0) {
      // Update existing entry
      sheet.getRange(existingRow, 4).setValue(targetNum);
      sheet.getRange(existingRow, 5).setValue(timestamp);
      sheet.getRange(existingRow, 6).setValue(updatedBy);
      return { 
        success: true, 
        message: `Updated appeal for ${contract} ${vehicle} week ${weekStart}`,
        action: 'updated'
      };
    } else {
      // Insert new entry
      sheet.appendRow([weekStart, contract, vehicle, targetNum, timestamp, updatedBy]);
      return { 
        success: true, 
        message: `Created appeal for ${contract} ${vehicle} week ${weekStart}`,
        action: 'created'
      };
    }
  } catch (e) {
    Logger.log('❌ submitTargetAppeal error: ' + e.message);
    return { success: false, message: e.message };
  }
}

/**
 * Get appeal target for specific week + contract + vehicle
 * @returns {number|null} Appeal target or null if not found
 */
function getAppealTarget(weekStart, contract, vehicle) {
  const sheet = getTargetAppealSheet();
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === weekStart && data[i][1] === contract && data[i][2] === vehicle) {
      return parseFloat(data[i][3]) || null;
    }
  }
  
  return null;
}

/**
 * Delete target appeal
 */
function deleteTargetAppeal(weekStart, contract, vehicle) {
  try {
    const sheet = getTargetAppealSheet();
    const data = sheet.getDataRange().getValues();
    
    for (let i = 1; i < data.length; i++) {
      if (data[i][0] === weekStart && data[i][1] === contract && data[i][2] === vehicle) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Appeal deleted' };
      }
    }
    
    return { success: false, message: 'Appeal not found' };
  } catch (e) {
    return { success: false, message: e.message };
  }
}

/**
 * Web endpoint: Get all appeals
 */
function doGetTargetAppeals() {
  try {
    const appeals = getAllTargetAppeals();
    return ContentService.createTextOutput(
      JSON.stringify({ success: true, data: appeals })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: e.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web endpoint: Submit/update appeal
 */
function doPostTargetAppeal(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const result = submitTargetAppeal(
      params.weekStart,
      params.contract,
      params.vehicle,
      params.appealTarget,
      params.updatedBy || 'Web'
    );
    
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Web endpoint: Delete appeal
 */
function doDeleteTargetAppeal(e) {
  try {
    const params = JSON.parse(e.postData.contents);
    const result = deleteTargetAppeal(params.weekStart, params.contract, params.vehicle);
    
    return ContentService.createTextOutput(
      JSON.stringify(result)
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, message: err.message })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
