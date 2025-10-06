import { supabase, isSupabaseConfigured, type LeadRecord, type BonusSignupRecord, type AnalyticsEventRecord } from './supabase';

export interface LeadData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageBought: string;
  gradeSelected: string;
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

export interface DataCaptureErrorContext {
  type: string;
  source?: string;
  servicesAttempted: string[];
  errors: Array<{ service: string; message: string }>;
}

export class DataCaptureSubmissionError extends Error {
  context: DataCaptureErrorContext;

  constructor(message: string, context: DataCaptureErrorContext) {
    super(message);
    this.name = 'DataCaptureSubmissionError';
    this.context = context;
  }
}

export class OnlineDataCapture {
  private sessionId: string;
  private apiEndpoint: string;
  private fallbackStorage: any[] = [];
  private trackingEnabled: boolean;

  constructor(options: { enableTracking?: boolean } = {}) {
    this.sessionId = this.generateSessionId();
    const endpoint = import.meta.env.VITE_DATA_CAPTURE_ENDPOINT;
    this.apiEndpoint = typeof endpoint === 'string' ? endpoint.trim() : '';
    this.trackingEnabled = options.enableTracking ?? true;
    if (this.trackingEnabled) {
      this.setupPageTracking();
    }
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

  private async sendData(type: string, data: any) {
    const payload = {
      type,
      data,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    console.log(`🚀 Preparing to send data of type: ${type} with payload data:`, payload.data);

    console.log('🚀 sendData called with type:', type);
    console.log('🚀 sendData payload:', JSON.stringify(payload, null, 2));
    console.log('🚀 sendData payload.data:', JSON.stringify(payload.data, null, 2));

    const services: Array<(payload: any) => Promise<any>> = [];

    services.push(this.sendToGoogleSheets.bind(this));

    if (this.apiEndpoint) {
      services.push(this.sendToBackend.bind(this));
    }

    if (isSupabaseConfigured && supabase) {
      services.push(this.sendToSupabase.bind(this));
    }

    services.push(
      this.sendToWebhook.bind(this),
      this.sendToFormspree.bind(this),
      this.sendToNetlifyForms.bind(this)
    );

    const formatServiceName = (serviceFn: (payload: any) => Promise<void>) =>
      serviceFn.name?.replace(/^bound\s+/, '') || 'unknown';

    const errors: Array<{ service: string; error: unknown }> = [];

    let success = false;
    let serviceResult: unknown = null;

    // Try Google Sheets and Supabase BOTH (don't stop after first success)
    for (const service of services) {
      const serviceName = formatServiceName(service);
      try {
        console.log('🚀 Trying service:', serviceName);
        serviceResult = await service(payload);
        console.log('✅ Service succeeded:', serviceName);
        success = true;

        // Only break after Google Sheets AND Supabase have both been tried
        if (serviceName === 'sendToSupabase' && services.length >= 2) {
          break;
        }
      } catch (error) {
        console.warn(`❌ Service failed (${serviceName}):`, error);
        errors.push({ service: serviceName, error });
        continue;
      }
    }

    // Fallback to local storage if all services fail
    if (!success) {
      this.fallbackStorage.push(payload);
      try {
        localStorage.setItem('fallback_data', JSON.stringify(this.fallbackStorage));
        console.warn('⚠️ All online services unavailable. Data saved locally and will be available for export.', payload);
      } catch (storageError) {
        console.warn('⚠️ Failed to persist fallback data to localStorage:', storageError);

        const context: DataCaptureErrorContext = {
          type,
          source:
            typeof data === 'object' && data !== null && 'source' in data
              ? String((data as { source?: unknown }).source)
              : undefined,
          servicesAttempted: services.map((serviceFn) => formatServiceName(serviceFn)),
          errors: errors.map(({ service, error }) => ({
            service,
            message: error instanceof Error ? error.message : String(error),
          })),
        };

        const baseMessage = context.source
          ? `All data capture services failed for type "${type}" (source "${context.source}").`
          : `All data capture services failed for type "${type}".`;
        const reasonDetails = context.errors.length
          ? ` Reasons: ${context.errors
              .map(({ service, message }) => `${service}: ${message}`)
              .join('; ')}.`
          : '';

        throw new DataCaptureSubmissionError(`${baseMessage}${reasonDetails}`, context);
      }
    }

    return serviceResult ?? payload;
  }

  private extractSupabaseMetadata(payload: any) {
    const rawTimestamp =
      (payload?.data && typeof payload.data === 'object' && 'timestamp' in payload.data)
        ? Number((payload.data as { timestamp?: number | string }).timestamp)
        : undefined;

    const fallbackTimestamp = typeof rawTimestamp === 'number' && !Number.isNaN(rawTimestamp)
      ? rawTimestamp
      : typeof rawTimestamp === 'string' && rawTimestamp
        ? Date.parse(rawTimestamp)
        : undefined;

    const timestampToUse = fallbackTimestamp ?? (typeof payload?.timestamp === 'number' ? payload.timestamp : Date.now());

    const toIsoString = (value?: number) => {
      if (!value || Number.isNaN(value)) return undefined;
      try {
        return new Date(value).toISOString();
      } catch (error) {
        console.warn('⚠️ Failed to convert timestamp to ISO string:', error);
        return undefined;
      }
    };

    const metadata = {
      session_id: payload?.sessionId ?? payload?.data?.sessionId,
      page_url: payload?.data?.pageUrl ?? payload?.url,
      user_agent: payload?.data?.userAgent ?? payload?.userAgent,
      created_at: toIsoString(timestampToUse),
    };

    return metadata;
  }

  private async sendToSupabase(payload: any) {
    console.log('💾 Sending to Supabase...');

    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Supabase is not configured');
    }

    try {
      const metadata = this.extractSupabaseMetadata(payload);

      if (payload.type === 'lead') {
        const leadData: LeadRecord = {
          first_name: payload.data.firstName,
          last_name: payload.data.lastName,
          email: payload.data.email,
          phone: payload.data.phone,
          package_selected: payload.data.packageBought,
          grade_selected: payload.data.gradeSelected || 'not_specified',
          source: payload.data.source || 'website',
          ...(metadata.session_id ? { session_id: metadata.session_id } : {}),
          ...(metadata.page_url ? { page_url: metadata.page_url } : {}),
          ...(metadata.user_agent ? { user_agent: metadata.user_agent } : {}),
          ...(metadata.created_at ? { created_at: metadata.created_at } : {}),
        };

        const { data: insertedLead, error } = await supabase
          .from('leads')
          .insert([leadData])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Lead saved to Supabase');
        return insertedLead;
      } else if (payload.type === 'bonus_signup') {
        const signupData: BonusSignupRecord = {
          email: payload.data.email,
          source: payload.data.source || 'bonus_page',
          ...(metadata.session_id ? { session_id: metadata.session_id } : {}),
          ...(metadata.page_url ? { page_url: metadata.page_url } : {}),
          ...(metadata.user_agent ? { user_agent: metadata.user_agent } : {}),
          ...(metadata.created_at ? { created_at: metadata.created_at } : {}),
        };

        const { data: insertedSignup, error } = await supabase
          .from('bonus_signups')
          .insert([signupData])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Bonus signup saved to Supabase');
        return insertedSignup;
      } else if (payload.type === 'analytics_event') {
        const eventData: AnalyticsEventRecord = {
          event_name: payload.data.eventName,
          properties: payload.data.properties || {},
          session_id: payload.sessionId,
          user_id: payload.data.userId,
          page_url: payload.url,
          user_agent: payload.userAgent,
          ...(metadata.created_at ? { created_at: metadata.created_at } : {}),
        };

        const { data: insertedEvent, error } = await supabase
          .from('analytics_events')
          .insert([eventData])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Analytics event saved to Supabase');
        return insertedEvent;
      } else if (payload.type === 'page_view' || payload.type === 'page_visit' || payload.type === 'page_visit_end') {
        const eventData: AnalyticsEventRecord = {
          event_name: payload.type,
          properties: payload.data || {},
          session_id: payload.sessionId,
          page_url: payload.url,
          user_agent: payload.userAgent,
          ...(metadata.created_at ? { created_at: metadata.created_at } : {}),
        };

        const { data: insertedPageEvent, error } = await supabase
          .from('analytics_events')
          .insert([eventData])
          .select()
          .single();

        if (error) throw error;
        console.log('✅ Page visit saved to Supabase');
        return insertedPageEvent;
      }
    } catch (error) {
      console.error('❌ Supabase error:', error);
      throw new Error(`Supabase failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  private async sendToBackend(payload: any) {
    if (!this.apiEndpoint) {
      throw new Error('No data capture endpoint configured');
    }

    console.log('🌐 Sending payload to backend endpoint:', this.apiEndpoint);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      let parsed: any = null;
      let fallbackText: string | null = null;

      try {
        parsed = await response.clone().json();
      } catch (parseError) {
        console.warn('⚠️ Backend response was not JSON, falling back to text parse:', parseError);
        fallbackText = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          (parsed && typeof parsed === 'object' && 'error' in parsed && typeof parsed.error === 'string'
            ? parsed.error
            : null) || fallbackText || `HTTP ${response.status}`;
        throw new Error(`Backend endpoint failed: ${errorMessage}`);
      }

      if (parsed && typeof parsed === 'object') {
        const normalized =
          'record' in parsed && parsed.record
            ? parsed.record
            : 'data' in parsed && parsed.data
              ? parsed.data
              : parsed;
        return normalized;
      }

      return fallbackText ?? null;
    } catch (error) {
      console.error('❌ Backend endpoint error:', error);
      throw error;
    }
  }

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
    console.log('📊 Full payload being sent:', JSON.stringify(payload, null, 2));
    console.log('📊 Payload type:', payload.type);
    console.log('📊 Payload data:', JSON.stringify(payload.data, null, 2));

    try {
      const response = await fetch(sheetsUrl, {
        method: 'POST',
        // Use a simple request so Apps Script receives the POST directly without a preflight.
        headers: {
          'Content-Type': 'text/plain;charset=UTF-8',
        },
        body: JSON.stringify(payload)
      });

      console.log('📊 Google Sheets response status:', response.status);
      console.log('📊 Google Sheets response headers:', Object.fromEntries(response.headers.entries()));

      let parsedResponse: any = null;
      let fallbackText: string | null = null;

      try {
        parsedResponse = await response.clone().json();
        console.log('📊 Google Sheets response JSON:', JSON.stringify(parsedResponse, null, 2));
      } catch (parseError) {
        console.warn('⚠️ Google Sheets response was not valid JSON, falling back to text parse:', parseError);
        fallbackText = await response.text();
        console.log('📊 Google Sheets response text:', fallbackText);
      }

      const responseStatus = parsedResponse?.status;
      console.log('📊 Google Sheets parsed status:', responseStatus ?? 'unknown');

      if (!response.ok) {
        const errorMessage = parsedResponse?.message || parsedResponse?.error || fallbackText || `HTTP ${response.status}`;
        console.error('❌ Google Sheets request failed:', response.status, errorMessage);
        throw new Error(`Google Sheets failed: ${response.status} - ${errorMessage}`);
      }

      if (responseStatus === 'error') {
        const errorMessage = parsedResponse?.message || parsedResponse?.error || fallbackText || 'Unknown error response from Google Sheets';
        console.error('❌ Google Sheets reported error status:', errorMessage);
        throw new Error(`Google Sheets reported error: ${errorMessage}`);
      }

      console.log('✅ Google Sheets request successful with status:', responseStatus ?? 'success');
      return parsedResponse ?? fallbackText ?? '';
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
    gradeSelected?: string;
    source?: 'test_package' | 'bonus_access' | 'direct';
  }) {
    console.log('🔥 captureLead called with:', leadData);
    
    const lead: LeadData = {
      ...leadData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      source: leadData.source || 'test_package',
      gradeSelected: leadData.gradeSelected || 'not_specified',
    };

    console.log('🔥 Prepared lead object:', lead);
    const supabaseLead = await this.sendData('lead', lead);
    if (supabaseLead && typeof supabaseLead === 'object') {
      const record = supabaseLead as Partial<LeadRecord>;
      if (record.id) {
        lead.id = record.id;
      }
      if (record.session_id) {
        lead.sessionId = record.session_id;
      }
      if (record.page_url) {
        lead.pageUrl = record.page_url;
      }
      if (record.user_agent) {
        lead.userAgent = record.user_agent;
      }
    }
    console.log('🔥 Lead sent to sendData');
    return lead;
  }

  async captureBonusSignup(email: string, source: string = 'bonus_page') {
    console.log('🔥 captureBonusSignup called with:', { email, source });
    
    const signup: BonusSignup = {
      id: crypto.randomUUID(),
      email,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      source,
    };

    console.log('🔥 Prepared bonus signup object:', signup);
    const supabaseSignup = await this.sendData('bonus_signup', signup);
    if (supabaseSignup && typeof supabaseSignup === 'object') {
      const record = supabaseSignup as Partial<BonusSignupRecord>;
      if (record.id) {
        signup.id = record.id;
      }
      if (record.session_id) {
        signup.sessionId = record.session_id;
      }
      if (record.page_url) {
        signup.pageUrl = record.page_url;
      }
      if (record.user_agent) {
        signup.userAgent = record.user_agent;
      }
    }
    console.log('🔥 Bonus signup sent to sendData');
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

const isJsdomEnvironment =
  typeof navigator !== 'undefined' && typeof navigator.userAgent === 'string' && /jsdom/i.test(navigator.userAgent);
const trackingAvailable =
  typeof window !== 'undefined' && typeof document !== 'undefined' && !isJsdomEnvironment;
export const dataCapture = new OnlineDataCapture({ enableTracking: trackingAvailable });