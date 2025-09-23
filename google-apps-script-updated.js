// Replace with your actual Google Sheet ID
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // PASTE YOUR SPREADSHEET ID HERE
const SHEET_NAME = "Raw Data";

function doGet(e) {
  // This function handles GET requests.
  console.log("doGet called");
  return ContentService.createTextOutput("Google Apps Script Web App is running. Send POST requests to submit data.");
}

function doPost(e) {
  console.log("=== doPost function started ===");
  
  let result = {};
  try {
    // First, let's log that we received a POST request
    console.log("POST request received");
    
    // Check if we have postData
    if (!e.postData) {
      console.log("ERROR: No postData received");
      throw new Error("No postData received");
    }
    
    // Check if we have contents
    if (!e.postData.contents) {
      console.log("ERROR: No postData.contents received");
      throw new Error("No postData.contents received");
    }
    
    // Debug logging - log the raw incoming data
    console.log('Raw incoming data: ' + e.postData.contents);
    
    // Try to parse the JSON
    let requestData;
    try {
      requestData = JSON.parse(e.postData.contents);
      console.log('Successfully parsed JSON');
    } catch (parseError) {
      console.log('JSON parse error: ' + parseError.message);
      throw new Error('Failed to parse JSON: ' + parseError.message);
    }
    
    // Debug logging - log the parsed data and type
    console.log('Parsed requestData: ' + JSON.stringify(requestData));
    console.log('Received type: ' + requestData.type);

    // Try to open the spreadsheet
    let ss;
    try {
      ss = SpreadsheetApp.openById(SPREADSHEET_ID);
      console.log('Successfully opened spreadsheet');
    } catch (ssError) {
      console.log('Spreadsheet error: ' + ssError.message);
      throw new Error('Failed to open spreadsheet: ' + ssError.message);
    }
    
    let sheet = ss.getSheetByName(SHEET_NAME);

    // If the sheet doesn't exist, create it
    if (!sheet) {
      console.log('Sheet does not exist, creating it');
      sheet = ss.insertSheet(SHEET_NAME);
    } else {
      console.log('Sheet found successfully');
    }

    // Define a fixed set of headers
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

    // Write headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      console.log('Adding headers to empty sheet');
      sheet.appendRow(headers);
    }

    // Prepare the row data based on the requestData structure
    const row = [];
    row.push(new Date(requestData.timestamp || Date.now()).toLocaleString()); // Timestamp
    row.push(requestData.type || "unknown"); // Type of event (lead, analytics_event, etc.)
    row.push(requestData.sessionId || ""); // Session ID
    row.push(requestData.url || ""); // Page URL
    row.push(requestData.userAgent || ""); // User Agent

    console.log('Processing data type: ' + requestData.type);

    // Specific fields for analytics_event
    if (requestData.type === "analytics_event") {
      console.log('Processing analytics_event');
      row.push(requestData.data.eventName || ""); // Event Name
      row.push(JSON.stringify(requestData.data.properties || {}) || ""); // Properties
      row.push(""); // First Name
      row.push(""); // Last Name
      row.push(""); // Email
      row.push(""); // Phone
      row.push(""); // Package Bought
      row.push(""); // Grade Selected
      row.push(requestData.data.source || ""); // Source
      row.push(""); // Time Spent
      row.push(requestData.data.referrer || ""); // Referrer
      row.push(""); // Error
      row.push(""); // Context
    }
    // Specific fields for lead
    else if (requestData.type === "lead") {
      console.log('Processing lead data: ' + JSON.stringify(requestData.data));
      row.push("LEAD"); // Event Name
      row.push(""); // Properties
      row.push(requestData.data.firstName || ""); // First Name
      row.push(requestData.data.lastName || ""); // Last Name
      row.push(requestData.data.email || ""); // Email
      row.push(requestData.data.phone || ""); // Phone
      row.push(requestData.data.packageBought || ""); // Package Bought
      row.push(requestData.data.gradeSelected || ""); // Grade Selected
      row.push(requestData.data.source || ""); // Source
      row.push(""); // Time Spent
      row.push(""); // Referrer
      row.push(""); // Error
      row.push(""); // Context
    }
    // Specific fields for bonus_signup
    else if (requestData.type === "bonus_signup") {
      console.log('Processing bonus signup data: ' + JSON.stringify(requestData.data));
      row.push("BONUS_SIGNUP"); // Event Name
      row.push(""); // Properties
      row.push(""); // First Name
      row.push(""); // Last Name
      row.push(requestData.data.email || ""); // Email
      row.push(""); // Phone
      row.push(""); // Package Bought
      row.push(""); // Grade Selected
      row.push(requestData.data.source || ""); // Source
      row.push(""); // Time Spent
      row.push(""); // Referrer
      row.push(""); // Error
      row.push(""); // Context
    }
    // Specific fields for page_visit and page_visit_end
    else if (requestData.type === "page_visit" || requestData.type === "page_visit_end") {
      console.log('Processing page visit');
      row.push(requestData.data.page || ""); // Event Name (using page name as event)
      row.push(""); // Properties
      row.push(""); // First Name
      row.push(""); // Last Name
      row.push(""); // Email
      row.push(""); // Phone
      row.push(""); // Package Bought
      row.push(""); // Grade Selected
      row.push(""); // Source
      row.push(requestData.data.timeSpent || ""); // Time Spent
      row.push(requestData.data.referrer || ""); // Referrer
      row.push(""); // Error
      row.push(""); // Context
    }
    // For any other type, just log the raw data in properties
    else {
      console.log('Unknown type, logging raw data: ' + JSON.stringify(requestData));
      row.push(requestData.type || "UNKNOWN"); // Event Name
      row.push(JSON.stringify(requestData.data || requestData) || ""); // Properties
      row.push(""); // First Name
      row.push(""); // Last Name
      row.push(""); // Email
      row.push(""); // Phone
      row.push(""); // Package Bought
      row.push(""); // Grade Selected
      row.push(""); // Source
      row.push(""); // Time Spent
      row.push(""); // Referrer
      row.push(""); // Error
      row.push(""); // Context
    }

    console.log('About to append row: ' + JSON.stringify(row));
    
    // Try to append the row
    try {
      sheet.appendRow(row);
      console.log('Successfully appended row to sheet');
    } catch (appendError) {
      console.log('Error appending row: ' + appendError.message);
      throw new Error('Failed to append row: ' + appendError.message);
    }

    result = { status: "success", message: "Data logged successfully" };
    console.log('Operation completed successfully');
    
    // Return response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.log('=== ERROR in doPost ===');
    console.log('Error message: ' + error.message);
    console.log('Error stack: ' + error.stack);
    
    result = { status: "error", message: error.message, stack: error.stack };
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight OPTIONS requests
function doOptions(e) {
  console.log("OPTIONS request received");
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}