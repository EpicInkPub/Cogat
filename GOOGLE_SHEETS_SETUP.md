# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets as a fallback data capture mechanism for your CogAT Test Prep application.

## Overview

The application uses a waterfall approach for data capture:
1. **Primary**: Supabase Database (global, permanent storage)
2. **Fallback**: Google Sheets (backup if Supabase fails)
3. **Last Resort**: Browser localStorage (if both above fail)

## Step-by-Step Setup

### 1. Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com)
2. Create a new spreadsheet
3. Name it something like "CogAT Lead Capture"
4. Copy the Spreadsheet ID from the URL
   - URL format: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit`
   - Example: If URL is `https://docs.google.com/spreadsheets/d/1abc123xyz/edit`, the ID is `1abc123xyz`

### 2. Set Up Google Apps Script

1. In your Google Sheet, click **Extensions** → **Apps Script**
2. Delete any default code in the editor
3. Copy the entire contents of `google-apps-script-updated.js` from this project
4. Paste it into the Apps Script editor
5. **IMPORTANT**: Replace `YOUR_SPREADSHEET_ID_HERE` on line 2 with your actual Spreadsheet ID from step 1

### 3. Deploy the Web App

1. In the Apps Script editor, click **Deploy** → **New deployment**
2. Click the gear icon ⚙️ next to "Select type"
3. Choose **Web app**
4. Configure the deployment:
   - **Description**: "CogAT Data Capture API" (or any description)
   - **Execute as**: Me (your Google account)
   - **Who has access**: **Anyone** (this is required for the web app to receive data from your website)
5. Click **Deploy**
6. Review and authorize the permissions:
   - Click **Authorize access**
   - Choose your Google account
   - Click **Advanced** → **Go to [Your Project Name] (unsafe)** (this is safe - it's your own script)
   - Click **Allow**
7. Copy the **Web app URL** that appears (it will look like: `https://script.google.com/macros/s/SCRIPT_ID/exec`)

### 4. Configure Your Application

1. Open your `.env` file
2. Add or update the Google Sheets URL:
   ```
   VITE_GOOGLE_SHEETS_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
   ```
3. Replace `YOUR_SCRIPT_ID` with the actual script ID from the Web app URL

### 5. Test the Integration

1. Rebuild your application: `npm run build`
2. Test form submissions on your website
3. Check your Google Sheet - you should see a "Raw Data" tab with incoming data

## What Data is Captured

The Google Sheet will capture:

### Lead Data (Package Orders)
- Timestamp
- Type: "lead"
- Session ID
- Page URL
- User Agent
- First Name
- Last Name
- Email
- Phone
- Package Bought
- Grade Selected
- Source

### Bonus Signup Data
- Timestamp
- Type: "bonus_signup"
- Session ID
- Page URL
- User Agent
- Email
- Source

### Analytics Events
- Timestamp
- Type: "analytics_event"
- Session ID
- Event Name
- Properties
- Page URL
- User Agent

## Troubleshooting

### Data Not Appearing in Google Sheets

1. **Check Apps Script Logs**:
   - Open Apps Script editor
   - Click **Executions** on the left sidebar
   - Check for errors in recent executions

2. **Verify Deployment**:
   - Make sure deployment is set to "Anyone" for access
   - Confirm you copied the correct Web app URL

3. **Check Environment Variable**:
   - Verify `VITE_GOOGLE_SHEETS_URL` in `.env` is correct
   - Rebuild after changing `.env`: `npm run build`

4. **Test the Web App Directly**:
   - Visit the Web app URL in your browser
   - You should see: "Google Apps Script Web App is running. Send POST requests to submit data."

### CORS Issues

The Apps Script deployment settings "Anyone" should handle CORS automatically. If you still see CORS errors:
- Redeploy the web app
- Make sure you're using the latest deployment URL
- Clear your browser cache

## Data Flow

```
User Submits Form
    ↓
Try Supabase (Primary) ← CURRENTLY ACTIVE
    ↓ (if fails)
Try Google Sheets (Fallback) ← YOU'RE SETTING THIS UP
    ↓ (if fails)
Save to localStorage (Last Resort)
```

## Security Notes

- The Google Apps Script runs under your Google account credentials
- Only you can access the Google Sheet data (unless you explicitly share the sheet)
- The Web app URL is public, but it only accepts POST requests to add data
- No sensitive credentials are exposed in client-side code
- All data transmission uses HTTPS

## Updating the Script

If you need to modify the Apps Script later:
1. Edit the code in the Apps Script editor
2. Save the changes
3. Create a **New deployment** (or manage deployments to update existing one)
4. Update the URL in your `.env` file if the deployment URL changes

## Next Steps

After setting up Google Sheets:
1. Test both form types (Package Orders and Bonus Signups)
2. Verify data appears in both Supabase and Google Sheets
3. Set up alerts in Google Sheets if desired (Tools → Notification rules)
4. Consider creating additional sheets/tabs for data analysis
