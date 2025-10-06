// Replace with your actual Google Sheet ID
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // PASTE YOUR SPREADSHEET ID HERE
const SHEET_NAME = "Raw Data";

function doGet(e) {
  console.log("=== doGet called ===");

  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({
          status: "error",
          message: "Sheet not found"
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);

    const leads = [];
    const bonusSignups = [];
    const analyticsEvents = [];

    rows.forEach(row => {
      const rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row[index];
      });

      if (rowData.Type === "lead") {
        leads.push({
          firstName: rowData["First Name"] || "",
          lastName: rowData["Last Name"] || "",
          email: rowData["Email"] || "",
          phone: rowData["Phone"] || "",
          packageBought: rowData["Package Bought"] || "",
          gradeSelected: rowData["Grade Selected"] || "",
          source: rowData["Source"] || "",
          timestamp: rowData["Timestamp"] || ""
        });
      } else if (rowData.Type === "bonus_signup") {
        bonusSignups.push({
          email: rowData["Email"] || "",
          source: rowData["Source"] || "",
          timestamp: rowData["Timestamp"] || ""
        });
      } else if (rowData.Type === "analytics_event" || rowData.Type === "page_visit" || rowData.Type === "page_visit_end") {
        analyticsEvents.push({
          eventName: rowData["Event Name"] || rowData.Type || "",
          page: rowData["Event Name"] || "",
          timestamp: rowData["Timestamp"] || "",
          properties: rowData["Properties"] ? JSON.parse(rowData["Properties"]) : {}
        });
      }
    });

    const result = {
      leads,
      bonusSignups,
      analyticsEvents
    };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.log('Error in doGet:', error.message);
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: error.message
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  console.log("=== doPost function started ===");
  console.log("Full request object:", JSON.stringify(e, null, 2));

  let result = {};
  try {
    console.log("POST request received");

    if (!e.postData) {
      console.log("ERROR: No postData received");
      console.log("Available properties:", Object.keys(e));
      throw new Error("No postData received");
    }

    if (!e.postData.contents) {
      console.log("ERROR: No postData.contents received");
      console.log("postData properties:", Object.keys(e.postData));
      throw new Error("No postData.contents received");
    }

    console.log('Raw incoming data length:', e.postData.contents.length);
    console.log('Raw incoming data:', e.postData.contents);

    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
      console.log('Successfully parsed JSON');
      console.log('Parsed data keys:', Object.keys(requestData));
    } catch (parseError) {
      console.log('JSON parse error:', parseError.message);
      console.log('Raw data that failed to parse:', e.postData.contents);
      throw new Error('Failed to parse JSON: ' + parseError.message);
    }

    console.log('Full parsed requestData:', JSON.stringify(requestData, null, 2));
    console.log('Request type:', requestData.type);
    console.log('Request data:', JSON.stringify(requestData.data, null, 2));

    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('Successfully opened spreadsheet');
    } catch (ssError) {
      console.log('Spreadsheet error:', ssError.message);
      console.log('Spreadsheet ID used:', SPREADSHEET_ID);
      throw new Error('Failed to open spreadsheet: ' + ssError.message);
    }

    let sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      console.log('Sheet does not exist, creating it');
      sheet = ss.insertSheet(SHEET_NAME);
    } else {
      console.log('Sheet found successfully');
    }

    const headers = [
      "Timestamp",
      "Type",
      "Session ID",
      "Page URL",
      "User Agent",
      "Event Name",
      "Properties",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Package Bought",
      "Grade Selected",
      "Source",
      "Time Spent",
      "Referrer",
      "Error",
      "Context",
    ];

    if (sheet.getLastRow() === 0) {
      console.log('Adding headers to empty sheet');
      sheet.appendRow(headers);
    }

    const row = [];
    row.push(new Date(requestData.timestamp || Date.now()).toLocaleString());
    row.push(requestData.type || "unknown");
    row.push(requestData.sessionId || "");
    row.push(requestData.url || "");
    row.push(requestData.userAgent || "");

    console.log('Processing data type:', requestData.type);

    if (requestData.type === "lead") {
      console.log('=== PROCESSING LEAD DATA ===');
      console.log('Lead data received:', JSON.stringify(requestData.data, null, 2));

      row.push("LEAD_SUBMISSION");
      row.push(JSON.stringify(requestData.data) || "");
      row.push(requestData.data.firstName || "");
      row.push(requestData.data.lastName || "");
      row.push(requestData.data.email || "");
      row.push(requestData.data.phone || "");
      row.push(requestData.data.packageBought || "");
      row.push(requestData.data.gradeSelected || "");
      row.push(requestData.data.source || "");
      row.push("");
      row.push("");
      row.push("");
      row.push("");

      console.log('Lead row prepared:', JSON.stringify(row));
    }
    else if (requestData.type === "bonus_signup") {
      console.log('=== PROCESSING BONUS SIGNUP DATA ===');
      console.log('Bonus signup data received:', JSON.stringify(requestData.data, null, 2));

      row.push("BONUS_SIGNUP");
      row.push(JSON.stringify(requestData.data) || "");
      row.push("");
      row.push("");
      row.push(requestData.data.email || "");
      row.push("");
      row.push("");
      row.push("");
      row.push(requestData.data.source || "");
      row.push("");
      row.push("");
      row.push("");
      row.push("");

      console.log('Bonus signup row prepared:', JSON.stringify(row));
    }
    else if (requestData.type === "analytics_event") {
      console.log('=== PROCESSING ANALYTICS EVENT ===');
      row.push(requestData.data.eventName || "");
      row.push(JSON.stringify(requestData.data.properties || {}) || "");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push(requestData.data.source || "");
      row.push("");
      row.push(requestData.data.referrer || "");
      row.push("");
      row.push("");
    }
    else if (requestData.type === "page_visit" || requestData.type === "page_visit_end") {
      console.log('=== PROCESSING PAGE VISIT ===');
      row.push(requestData.data.page || "");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push(requestData.data.timeSpent || "");
      row.push(requestData.data.referrer || "");
      row.push("");
      row.push("");
    }
    else {
      console.log('=== PROCESSING UNKNOWN TYPE ===');
      console.log('Unknown type data:', JSON.stringify(requestData));
      row.push(requestData.type || "UNKNOWN");
      row.push(JSON.stringify(requestData.data || requestData) || "");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
      row.push("");
    }

    console.log('Final row to append:', JSON.stringify(row));
    console.log('Row length:', row.length);
    console.log('Expected headers length:', headers.length);

    try {
      sheet.appendRow(row);
      console.log('✅ Successfully appended row to sheet');
    } catch (appendError) {
      console.log('❌ Error appending row:', appendError.message);
      console.log('Row data:', JSON.stringify(row));
      throw new Error('Failed to append row: ' + appendError.message);
    }

    result = { status: "success", message: "Data logged successfully", type: requestData.type };
    console.log('✅ Operation completed successfully');

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    console.log('=== ERROR in doPost ===');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);

    result = { status: "error", message: error.message, stack: error.stack };

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doOptions(e) {
  console.log("=== OPTIONS request received ===");
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
