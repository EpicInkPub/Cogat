// Replace with your actual Google Sheet ID
const SPREADSHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; // PASTE YOUR SPREADSHEET ID HERE
const SHEET_NAME = "Raw Data";

function doGet(e) {
  console.log("=== doGet called ===");
  return ContentService.createTextOutput("Google Apps Script Web App is running. Send POST requests to submit data.");
}

function doPost(e) {
  console.log("=== doPost function started ===");
  console.log("Full request object:", JSON.stringify(e, null, 2));
  
  let result = {};
  try {
    // First, let's log that we received a POST request
    console.log("POST request received");
    
    // Check if we have postData
    if (!e.postData) {
      console.log("ERROR: No postData received");
      console.log("Available properties:", Object.keys(e));
      throw new Error("No postData received");
    }
    
    // Check if we have contents
    if (!e.postData.contents) {
      console.log("ERROR: No postData.contents received");
      console.log("postData properties:", Object.keys(e.postData));
      throw new Error("No postData.contents received");
    }
    
    // Debug logging - log the raw incoming data
    console.log('Raw incoming data length:', e.postData.contents.length);
    console.log('Raw incoming data:', e.postData.contents);
    
    // Try to parse the JSON
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
    
    // Debug logging - log the parsed data and type
    console.log('Full parsed requestData:', JSON.stringify(requestData, null, 2));
    console.log('Request type:', requestData.type);
    console.log('Request data:', JSON.stringify(requestData.data, null, 2));

    // Try to open the spreadsheet
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

    console.log('Processing data type:', requestData.type);

    // Specific fields for LEAD data
    if (requestData.type === "lead") {
      console.log('=== PROCESSING LEAD DATA ===');
      console.log('Lead data received:', JSON.stringify(requestData.data, null, 2));
      
      row.push("LEAD_SUBMISSION"); // Event Name
      row.push(JSON.stringify(requestData.data) || ""); // Properties (full data as backup)
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
      
      console.log('Lead row prepared:', JSON.stringify(row));
    }
    // Specific fields for BONUS SIGNUP data
    else if (requestData.type === "bonus_signup") {
      console.log('=== PROCESSING BONUS SIGNUP DATA ===');
      console.log('Bonus signup data received:', JSON.stringify(requestData.data, null, 2));
      
      row.push("BONUS_SIGNUP"); // Event Name
      row.push(JSON.stringify(requestData.data) || ""); // Properties (full data as backup)
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
      
      console.log('Bonus signup row prepared:', JSON.stringify(row));
    }
    // Specific fields for analytics_event
    else if (requestData.type === "analytics_event") {
      console.log('=== PROCESSING ANALYTICS EVENT ===');
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
    // Specific fields for page_visit and page_visit_end
    else if (requestData.type === "page_visit" || requestData.type === "page_visit_end") {
      console.log('=== PROCESSING PAGE VISIT ===');
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
      console.log('=== PROCESSING UNKNOWN TYPE ===');
      console.log('Unknown type data:', JSON.stringify(requestData));
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

    console.log('Final row to append:', JSON.stringify(row));
    console.log('Row length:', row.length);
    console.log('Expected headers length:', headers.length);
    
    // Try to append the row
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
    
    // Return response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.log('=== ERROR in doPost ===');
    console.log('Error message:', error.message);
    console.log('Error stack:', error.stack);
    
    result = { status: "error", message: error.message, stack: error.stack };
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight OPTIONS requests
function doOptions(e) {
  console.log("=== OPTIONS request received ===");
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}