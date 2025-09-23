```javascript
// Replace with your actual Google Sheet ID
const SPREADSHEHEET_ID = "YOUR_SPREADSHEET_ID_HERE"; 
const SHEET_NAME = "Raw Data";

function doPost(e) {
  let result = {};
  try {
    // Debug logging - log the raw incoming data
    Logger.log('Raw incoming data: ' + JSON.stringify(e.postData.contents));
    
    // Parse the incoming JSON data
    const requestData = JSON.parse(e.postData.contents);
    
    // Debug logging - log the parsed data and type
    Logger.log('Parsed requestData: ' + JSON.stringify(requestData));
    Logger.log('Received type: ' + requestData.type);

    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = ss.getSheetByName(SHEET_NAME);

    // If the sheet doesn't exist, create it
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
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
      "Grade Selected", // Added Grade Selected
      "Source",
      "Time Spent",
      "Referrer",
      "Error",
      "Context",
    ];

    // Write headers if the sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
    }

    // Prepare the row data based on the requestData structure
    const row = [];
    row.push(new Date(requestData.timestamp).toLocaleString()); // Timestamp
    row.push(requestData.type || ""); // Type of event (lead, analytics_event, etc.)
    row.push(requestData.sessionId || ""); // Session ID
    row.push(requestData.url || ""); // Page URL
    row.push(requestData.userAgent || ""); // User Agent

    // Specific fields for analytics_event
    if (requestData.type === "analytics_event") {
      row.push(requestData.data.eventName || ""); // Event Name
      row.push(JSON.stringify(requestData.data.properties) || ""); // Properties
      row.push(""); // First Name
      row.push(""); // Last Name
      row.push(""); // Email
      row.push(""); // Phone
      row.push(""); // Package Bought
      row.push(""); // Grade Selected
      row.push(""); // Source
      row.push(""); // Time Spent
      row.push(requestData.data.referrer || ""); // Referrer
      row.push(""); // Error
      row.push(""); // Context
    }
    // Specific fields for lead
    else if (requestData.type === "lead") {
      row.push(""); // Event Name
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
      row.push(""); // Event Name
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
    // Specific fields for error_occurred (from analytics.ts)
    else if (requestData.type === "error_occurred") {
      row.push(requestData.data.error || ""); // Event Name (using error message)
      row.push(""); // Properties
      row.push(""); // First Name
      row.push(""); // Last Name
      row.push(""); // Email
      row.push(""); // Phone
      row.push(""); // Package Bought
      row.push(""); // Grade Selected
      row.push(""); // Source
      row.push(""); // Time Spent
      row.push(""); // Referrer
      row.push(requestData.data.error || ""); // Error
      row.push(requestData.data.context || ""); // Context
    }
    // For any other type, just log the raw data in properties
    else {
      row.push(requestData.type || ""); // Event Name
      row.push(JSON.stringify(requestData.data) || ""); // Properties
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

    sheet.appendRow(row);

    result = { status: "success", message: "Data logged successfully" };
    
    // Return response with CORS headers.
    // Access-Control-Allow-Origin is handled by deployment setting "Anyone".
    // Other CORS headers are not directly settable on ContentService.TextOutput.
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    result = { status: "error", message: error.message, stack: error.stack };
    
    // Return error response with CORS headers.
    // Access-Control-Allow-Origin is handled by deployment setting "Anyone".
    // Other CORS headers are not directly settable on ContentService.TextOutput.
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle preflight OPTIONS requests
function doOptions(e) {
  // For OPTIONS requests, we need to return a successful response with CORS headers.
  // Access-Control-Allow-Origin is handled by deployment setting "Anyone".
  // Access-Control-Allow-Methods and Access-Control-Allow-Headers are not directly
  // settable on ContentService.TextOutput. We rely on the browser being lenient
  // or the deployment implicitly handling these for simple cases.
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}
```