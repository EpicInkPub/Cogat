// Online data capture system
export interface LeadData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageBought: string;
  source: 'test_package' | 'bonus_access' | 'direct';
  timestamp: number;
  sessionId: string;
  pageUrl: string;
  userAgent: string;
}

export interface BonusSignup {
  id: string;
  email: string;
  timestamp: number;
  source: string;
  sessionId: string;
  pageUrl: string;
  userAgent: string;
}

export interface PageVisit {
  id: string;
  page: string;
  url: string;
  timestamp: number;
  sessionId: string;
  timeSpent?: number;
  referrer: string;
  userAgent: string;
}

export interface AnalyticsEvent {
  id: string;
  eventName: string;
  properties: Record<string, any>;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
  userAgent: string;
}

class OnlineDataCapture {
  private sessionId: string;
  private apiEndpoint: string;
  private fallbackStorage: any[] = [];

  constructor() {
    this.sessionId = this.generateSessionId();
    // You can configure this to point to your preferred service
    this.apiEndpoint = import.meta.env.VITE_DATA_CAPTURE_ENDPOINT || 'https://api.example.com/capture';
    this.setupPageTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageTracking() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.endCurrentPageVisit();
      } else {
        this.startPageVisit();
      }
    });

    // Track initial page visit
    this.startPageVisit();

    // Track page unload
    window.addEventListener('beforeunload', () => {
      this.endCurrentPageVisit();
    });
  }

  private currentPageVisit: PageVisit | null = null;

  private startPageVisit() {
    const visit: PageVisit = {
      id: crypto.randomUUID(),
      page: this.getCurrentPageName(),
      url: window.location.href,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    };

    this.currentPageVisit = visit;
    this.sendData('page_visit', visit);
  }

  private endCurrentPageVisit() {
    if (this.currentPageVisit) {
      const timeSpent = Date.now() - this.currentPageVisit.timestamp;
      this.currentPageVisit.timeSpent = timeSpent;
      this.sendData('page_visit_end', this.currentPageVisit);
      this.currentPageVisit = null;
    }
  }

  private getCurrentPageName(): string {
    const path = window.location.pathname;
    if (path === '/') return 'home';
    if (path === '/packages') return 'test_packages';
    if (path === '/bonuses') return 'bonuses';
    if (path === '/thank-you') return 'thank_you';
    if (path === '/data-export') return 'data_export';
    return path.replace('/', '');
  }

  // Send data to multiple services for redundancy
  private async sendData(type: string, data: any) {
    const payload = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Debug logging to console
    console.log('🚀 Sending data to services:', {
      type: payload.type,
      dataKeys: Object.keys(payload.data),
      url: payload.url,
      timestamp: new Date(payload.timestamp).toLocaleString()
    });

    // Try multiple services for better reliability
    const services = [
      this.sendToWebhook.bind(this),
      this.sendToGoogleSheets.bind(this),
      this.sendToFormspree.bind(this),
      this.sendToNetlifyForms.bind(this)
    ];

    let success = false;
    for (const service of services) {
      try {
        await service(payload);
        console.log('✅ Service succeeded:', service.name);
        success = true;
        break; // If one succeeds, we're good
      } catch (error) {
        console.warn(`❌ Service failed (${service.name}):`, error);
        continue;
      }
    }

    // Fallback to local storage if all services fail
    if (!success) {
      this.fallbackStorage.push(payload);
      localStorage.setItem('fallback_data', JSON.stringify(this.fallbackStorage));
      console.warn('❌ All services failed, data stored locally as fallback:', payload);
    }
  }

  // Method 1: Generic webhook endpoint
  private async sendToWebhook(payload: any) {
    const webhookUrl = import.meta.env.VITE_WEBHOOK_URL;
    if (!webhookUrl) throw new Error('No webhook URL configured');

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Webhook failed: ${response.status}`);
    }
  }

  // Method 2: Google Sheets via Google Apps Script
  private async sendToGoogleSheets(payload: any) {
    const sheetsUrl = import.meta.env.VITE_GOOGLE_SHEETS_URL;
    if (!sheetsUrl) {
      console.error('❌ VITE_GOOGLE_SHEETS_URL not configured in environment variables');
      throw new Error('No Google Sheets URL configured');
    }

    console.log('📊 Sending to Google Sheets URL:', sheetsUrl);
    console.log('📊 Payload:', JSON.stringify(payload, null, 2));

    try {
      const response = await fetch(sheetsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      console.log('📊 Google Sheets response status:', response.status);
      console.log('📊 Google Sheets response headers:', Object.fromEntries(response.headers.entries()));
      
      const responseText = await response.text();
      console.log('📊 Google Sheets response body:', responseText);

      if (!response.ok) {
        console.error('❌ Google Sheets request failed:', response.status, responseText);
        throw new Error(`Google Sheets failed: ${response.status} - ${responseText}`);
      }
      
      console.log('✅ Google Sheets request successful');
      return responseText;
    } catch (error) {
      console.error('❌ Google Sheets request error:', error);
      throw error;
    }
  }

  // Method 3: Formspree
  private async sendToFormspree(payload: any) {
    const formspreeUrl = import.meta.env.VITE_FORMSPREE_URL;
    if (!formspreeUrl) throw new Error('No Formspree URL configured');

    const response = await fetch(formspreeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Formspree failed: ${response.status}`);
    }
  }

  // Method 4: Netlify Forms
  private async sendToNetlifyForms(payload: any) {
    const netlifyUrl = import.meta.env.VITE_NETLIFY_FORM_URL;
    if (!netlifyUrl) throw new Error('No Netlify form URL configured');

    const formData = new FormData();
    formData.append('form-name', 'data-capture');
    formData.append('data', JSON.stringify(payload));

    const response = await fetch(netlifyUrl, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Netlify Forms failed: ${response.status}`);
    }
  }

  // Public methods for capturing different types of data
  async captureLead(leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    packageBought: string;
    source?: 'test_package' | 'bonus_access' | 'direct';
  }) {
    const lead: LeadData = {
      ...leadData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      source: leadData.source || 'test_package',
    };

    await this.sendData('lead', lead);
    return lead;
  }

  async captureBonusSignup(email: string, source: string = 'bonus_page') {
    const signup: BonusSignup = {
      id: crypto.randomUUID(),
      email,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      source,
    };

    await this.sendData('bonus_signup', signup);
    return signup;
  }

  async captureAnalyticsEvent(eventName: string, properties: Record<string, any> = {}) {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      eventName,
      properties: {
        ...properties,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        screenResolution: `${screen.width}x${screen.height}`,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    };

    await this.sendData('analytics_event', event);
    return event;
  }

  // Get session info
  getSessionId() {
    return this.sessionId;
  }

  // Get fallback data (for debugging)
  getFallbackData() {
    return this.fallbackStorage;
  }

  // Retry failed submissions
  async retryFailedSubmissions() {
    const fallbackData = localStorage.getItem('fallback_data');
    if (fallbackData) {
      const data = JSON.parse(fallbackData);
      for (const item of data) {
        try {
          await this.sendData(item.type, item.data);
        } catch (error) {
          console.warn('Retry failed:', error);
        }
      }
      // Clear fallback data after successful retry
      localStorage.removeItem('fallback_data');
      this.fallbackStorage = [];
    }
  }
}

export const dataCapture = new OnlineDataCapture();