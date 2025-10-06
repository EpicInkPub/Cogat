export interface GoogleSheetsData {
  leads: Array<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    packageBought: string;
    gradeSelected: string;
    source: string;
    timestamp: string;
  }>;
  bonusSignups: Array<{
    email: string;
    source: string;
    timestamp: string;
  }>;
  analyticsEvents: Array<{
    eventName: string;
    page: string;
    timestamp: string;
    properties?: Record<string, any>;
  }>;
}

export async function fetchGoogleSheetsData(): Promise<GoogleSheetsData | null> {
  const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;

  if (!sheetsUrl) {
    console.warn('Google Sheets URL not configured');
    return null;
  }

  try {
    const response = await fetch(`${sheetsUrl}?action=fetch`, {
      method: 'GET',
      headers: {
        'Content-Type': 'text/plain',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status}`);
    }

    const data = await response.json();
    return data as GoogleSheetsData;
  } catch (error) {
    console.error('Failed to fetch Google Sheets data:', error);
    return null;
  }
}
