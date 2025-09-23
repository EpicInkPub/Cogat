// Enhanced data storage utilities for leads, analytics, and form submissions
export interface Lead {
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
  userId?: string;
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
  userId?: string;
  pageUrl: string;
  userAgent: string;
}

export interface FormSubmission {
  id: string;
  type: 'package_order' | 'bonus_signup' | 'contact_form';
  formData: Record<string, any>;
  timestamp: number;
  sessionId: string;
  pageUrl: string;
  userAgent: string;
}

class EnhancedStorage {
  private leads: Lead[] = [];
  private bonusSignups: BonusSignup[] = [];
  private pageVisits: PageVisit[] = [];
  private analyticsEvents: AnalyticsEvent[] = [];
  private formSubmissions: FormSubmission[] = [];
  private sessionId: string;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.loadData();
    this.setupPageVisitTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageVisitTracking() {
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
    this.pageVisits.push(visit);
    this.saveData();
  }

  private endCurrentPageVisit() {
    if (this.currentPageVisit) {
      const timeSpent = Date.now() - this.currentPageVisit.timestamp;
      this.currentPageVisit.timeSpent = timeSpent;
      this.saveData();
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

  private loadData() {
    const storedLeads = localStorage.getItem('enhanced_leads');
    const storedBonusSignups = localStorage.getItem('enhanced_bonus_signups');
    const storedPageVisits = localStorage.getItem('enhanced_page_visits');
    const storedAnalyticsEvents = localStorage.getItem('enhanced_analytics_events');
    const storedFormSubmissions = localStorage.getItem('enhanced_form_submissions');
    
    if (storedLeads) {
      this.leads = JSON.parse(storedLeads);
    }
    if (storedBonusSignups) {
      this.bonusSignups = JSON.parse(storedBonusSignups);
    }
    if (storedPageVisits) {
      this.pageVisits = JSON.parse(storedPageVisits);
    }
    if (storedAnalyticsEvents) {
      this.analyticsEvents = JSON.parse(storedAnalyticsEvents);
    }
    if (storedFormSubmissions) {
      this.formSubmissions = JSON.parse(storedFormSubmissions);
    }
  }

  private saveData() {
    localStorage.setItem('enhanced_leads', JSON.stringify(this.leads));
    localStorage.setItem('enhanced_bonus_signups', JSON.stringify(this.bonusSignups));
    localStorage.setItem('enhanced_page_visits', JSON.stringify(this.pageVisits));
    localStorage.setItem('enhanced_analytics_events', JSON.stringify(this.analyticsEvents));
    localStorage.setItem('enhanced_form_submissions', JSON.stringify(this.formSubmissions));
  }

  // Lead Management
  async addLead(leadData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    packageBought: string;
    gradeSelected?: string;
    source?: 'test_package' | 'bonus_access' | 'direct';
  }) {
    const lead: Lead = {
      ...leadData,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      source: leadData.source || 'test_package',
      gradeSelected: leadData.gradeSelected || 'not_specified',
    };

    this.leads.push(lead);
    
    // Also save as form submission for detailed tracking
    this.addFormSubmission('package_order', leadData);
    
    this.saveData();
    return lead;
  }

  // Bonus Signup Management
  async addBonusSignup(email: string, source: string = 'bonus_page') {
    const signup: BonusSignup = {
      id: crypto.randomUUID(),
      email,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
      source,
    };

    this.bonusSignups.push(signup);
    
    // Also save as form submission for detailed tracking
    this.addFormSubmission('bonus_signup', { email, source });
    
    this.saveData();
    return signup;
  }

  // Analytics Event Tracking
  trackEvent(eventName: string, properties: Record<string, any> = {}, userId?: string) {
    const event: AnalyticsEvent = {
      id: crypto.randomUUID(),
      eventName,
      properties: {
        ...properties,
        sessionDuration: Date.now() - this.getSessionStartTime(),
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        screenResolution: `${screen.width}x${screen.height}`,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.analyticsEvents.push(event);
    this.saveData();
    return event;
  }

  // Form Submission Tracking
  addFormSubmission(type: FormSubmission['type'], formData: any) {
    const submission: FormSubmission = {
      id: crypto.randomUUID(),
      type,
      formData,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      pageUrl: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.formSubmissions.push(submission);
    this.saveData();
    return submission;
  }

  // Page Visit Tracking
  trackPageVisit(page: string, userId?: string) {
    if (this.currentPageVisit) {
      this.currentPageVisit.userId = userId;
      this.saveData();
    }
  }

  // Getters
  getLeads() {
    return this.leads;
  }

  getBonusSignups() {
    return this.bonusSignups;
  }

  getPageVisits() {
    return this.pageVisits;
  }

  getAnalyticsEvents() {
    return this.analyticsEvents;
  }

  getFormSubmissions() {
    return this.formSubmissions;
  }

  getSessionId() {
    return this.sessionId;
  }

  private getSessionStartTime(): number {
    const firstEvent = this.analyticsEvents.find(e => e.sessionId === this.sessionId);
    return firstEvent ? firstEvent.timestamp : Date.now();
  }

  // Analytics Summary
  getAnalyticsSummary() {
    const now = Date.now();
    const sessionStart = this.getSessionStartTime();
    
    return {
      totalLeads: this.leads.length,
      totalBonusSignups: this.bonusSignups.length,
      totalPageVisits: this.pageVisits.length,
      totalAnalyticsEvents: this.analyticsEvents.length,
      totalFormSubmissions: this.formSubmissions.length,
      sessionDuration: now - sessionStart,
      
      leadsBySource: this.leads.reduce((acc, lead) => {
        acc[lead.source] = (acc[lead.source] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      leadsByPackage: this.leads.reduce((acc, lead) => {
        acc[lead.packageBought] = (acc[lead.packageBought] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      pageVisitsByPage: this.pageVisits.reduce((acc, visit) => {
        acc[visit.page] = (acc[visit.page] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      eventsByType: this.analyticsEvents.reduce((acc, event) => {
        acc[event.eventName] = (acc[event.eventName] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      
      averageTimeOnPage: this.pageVisits
        .filter(v => v.timeSpent)
        .reduce((acc, v) => acc + (v.timeSpent || 0), 0) / 
        this.pageVisits.filter(v => v.timeSpent).length || 0,
      
      conversionFunnel: {
        visitedHome: this.pageVisits.some(v => v.page === 'home'),
        visitedPackages: this.pageVisits.some(v => v.page === 'test_packages'),
        visitedBonuses: this.pageVisits.some(v => v.page === 'bonuses'),
        selectedPackage: this.analyticsEvents.some(e => e.eventName === 'package_selected'),
        submittedForm: this.formSubmissions.length > 0,
        unlockedBonuses: this.bonusSignups.length > 0,
      },
      
      recentActivity: [
        ...this.leads.slice(-5).map(l => ({ type: 'lead', data: l, timestamp: l.timestamp })),
        ...this.bonusSignups.slice(-5).map(b => ({ type: 'bonus', data: b, timestamp: b.timestamp })),
        ...this.pageVisits.slice(-5).map(p => ({ type: 'page_visit', data: p, timestamp: p.timestamp })),
      ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 10)
    };
  }

  // Export Functions
  exportToCSV() {
    const headers = [
      'Type', 'ID', 'First Name', 'Last Name', 'Email', 'Phone', 
      'Package', 'Source', 'Page', 'Event Name', 'Session ID', 'Date'
    ];
    
    const rows = [
      ...this.leads.map(lead => [
        'Lead', lead.id, lead.firstName, lead.lastName, lead.email, 
        lead.phone, lead.packageBought, lead.source, '', '', 
        lead.sessionId, new Date(lead.timestamp).toLocaleString()
      ]),
      ...this.bonusSignups.map(signup => [
        'Bonus Signup', signup.id, '', '', signup.email, '', '', 
        signup.source, '', '', signup.sessionId, 
        new Date(signup.timestamp).toLocaleString()
      ]),
      ...this.pageVisits.map(visit => [
        'Page Visit', visit.id, '', '', '', '', '', '', visit.page, 
        '', visit.sessionId, new Date(visit.timestamp).toLocaleString()
      ]),
      ...this.analyticsEvents.map(event => [
        'Analytics Event', event.id, '', '', '', '', '', '', '', 
        event.eventName, event.sessionId, new Date(event.timestamp).toLocaleString()
      ])
    ];

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csv;
  }

  exportToJSON() {
    return JSON.stringify({
      leads: this.leads,
      bonusSignups: this.bonusSignups,
      pageVisits: this.pageVisits,
      analyticsEvents: this.analyticsEvents,
      formSubmissions: this.formSubmissions,
      summary: this.getAnalyticsSummary(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  downloadExport(format: 'csv' | 'json') {
    const data = format === 'csv' ? this.exportToCSV() : this.exportToJSON();
    const blob = new Blob([data], { type: format === 'csv' ? 'text/csv' : 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cogat-analytics-${Date.now()}.${format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Clear all data
  clearAllData() {
    this.leads = [];
    this.bonusSignups = [];
    this.pageVisits = [];
    this.analyticsEvents = [];
    this.formSubmissions = [];
    localStorage.removeItem('enhanced_leads');
    localStorage.removeItem('enhanced_bonus_signups');
    localStorage.removeItem('enhanced_page_visits');
    localStorage.removeItem('enhanced_analytics_events');
    localStorage.removeItem('enhanced_form_submissions');
  }
}

export const storage = new EnhancedStorage();