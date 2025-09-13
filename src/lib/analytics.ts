import { database } from './supabase';

// Analytics tracking utilities
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionStartTime: number;
  private pageViewTime: number;
  private clicks: Record<string, number> = {};
  private abandonedCarts: number = 0;
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionStartTime = Date.now();
    this.pageViewTime = Date.now();
    this.sessionId = this.generateSessionId();
    this.loadEvents();
    this.setupClickTracking();
    this.setupPageVisibilityTracking();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private setupPageVisibilityTracking() {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.track('page_hidden', { 
          timeOnPage: Date.now() - this.pageViewTime,
          url: window.location.pathname 
        });
      } else {
        this.pageViewTime = Date.now();
        this.track('page_visible', { url: window.location.pathname });
      }
    });
  }

  private setupClickTracking() {
    // Track all clicks on the page
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const identifier = target.id || target.className || target.tagName;
      this.trackClick(identifier);
    });
  }

  private loadEvents() {
    const stored = localStorage.getItem('analytics_events');
    if (stored) {
      this.events = JSON.parse(stored);
    }
  }

  private saveEvents() {
    localStorage.setItem('analytics_events', JSON.stringify(this.events));
  }

  track(event: string, properties?: Record<string, any>) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        sessionDuration: Date.now() - this.sessionStartTime,
        pageViewDuration: Date.now() - this.pageViewTime,
        url: window.location.pathname,
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
      },
      timestamp: Date.now(),
      sessionId: this.sessionId,
      userId: this.userId,
    };

    this.events.push(analyticsEvent);
    this.saveEvents();
    console.log('Analytics Event:', analyticsEvent);
    
    // Save to Supabase database
    this.saveToDatabase(analyticsEvent);
    
    // Also log to a separate detailed log for debugging
    this.logDetailedEvent(analyticsEvent);
  }

  private async saveToDatabase(event: AnalyticsEvent) {
    try {
      await database.insertAnalyticsEvent({
        event_name: event.event,
        properties: event.properties || {},
        session_id: event.sessionId,
        user_id: event.userId,
        page_url: event.properties?.url,
        user_agent: event.properties?.userAgent
      });
    } catch (error) {
      console.error('Failed to save analytics to database:', error);
      // Continue without throwing to avoid breaking user experience
    }
  }

  private logDetailedEvent(event: AnalyticsEvent) {
    const detailedLogs = JSON.parse(localStorage.getItem('detailed_analytics_log') || '[]');
    detailedLogs.push({
      ...event,
      readableTime: new Date(event.timestamp).toLocaleString(),
      sessionDuration: this.formatDuration(Date.now() - this.sessionStartTime)
    });
    
    // Keep only last 1000 events to prevent storage overflow
    if (detailedLogs.length > 1000) {
      detailedLogs.splice(0, detailedLogs.length - 1000);
    }
    
    localStorage.setItem('detailed_analytics_log', JSON.stringify(detailedLogs));
  }

  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  pageView(page: string) {
    this.pageViewTime = Date.now();
    this.track('page_view', { page });
  }

  trackTimeOnPage(page: string) {
    const timeSpent = Date.now() - this.pageViewTime;
    this.track('time_on_page', { page, timeSpent });
  }

  trackClick(identifier: string) {
    this.clicks[identifier] = (this.clicks[identifier] || 0) + 1;
    this.track('element_clicked', { element: identifier, count: this.clicks[identifier] });
  }

  trackAbandonedCart(packageId: string, stage: string) {
    this.abandonedCarts++;
    this.track('cart_abandoned', { 
      packageId, 
      stage, 
      totalAbandoned: this.abandonedCarts 
    });
  }

  trackPackageView(packageId: string, price: string) {
    this.track('package_viewed', { packageId, price });
  }

  trackBonusInteraction(bonusId: string, action: string) {
    this.track('bonus_interaction', { bonusId, action });
  }

  trackFormSubmission(formType: string, formData: any) {
    this.track('form_submitted', { 
      formType, 
      formData: {
        ...formData,
        // Remove sensitive data but keep structure
        email: formData.email ? 'provided' : 'not_provided',
        phone: formData.phone ? 'provided' : 'not_provided',
        firstName: formData.firstName ? 'provided' : 'not_provided',
        lastName: formData.lastName ? 'provided' : 'not_provided',
      }
    });
  }

  trackUserJourney(step: string, data?: any) {
    this.track('user_journey', { step, ...data });
  }

  getEvents() {
    return this.events;
  }

  getDetailedLog() {
    return JSON.parse(localStorage.getItem('detailed_analytics_log') || '[]');
  }

  getAnalyticsSummary() {
    const events = this.events;
    const formSubmissions = events.filter(e => e.event === 'form_submitted');
    const packageSelections = events.filter(e => e.event === 'package_selected');
    const bonusUnlocks = events.filter(e => e.event === 'bonuses_unlocked');
    
    const summary = {
      totalEvents: events.length,
      totalClicks: Object.values(this.clicks).reduce((a, b) => a + b, 0),
      clicksByElement: this.clicks,
      abandonedCarts: this.abandonedCarts,
      pageViews: events.filter(e => e.event === 'page_view').length,
      packageSelections: packageSelections,
      bonusDownloads: events.filter(e => e.event === 'bonus_downloaded'),
      emailsCollected: bonusUnlocks.length,
      formSubmissions: formSubmissions.length,
      sessionDuration: this.formatDuration(Date.now() - this.sessionStartTime),
      sessionId: this.sessionId,
      userId: this.userId,
      conversionFunnel: {
        visitedHome: events.some(e => e.event === 'page_view' && e.properties?.page === 'home'),
        visitedPackages: events.some(e => e.event === 'page_view' && e.properties?.page === 'test_packages'),
        visitedBonuses: events.some(e => e.event === 'page_view' && e.properties?.page === 'bonuses'),
        selectedPackage: packageSelections.length > 0,
        submittedForm: formSubmissions.length > 0,
        unlockedBonuses: bonusUnlocks.length > 0,
      }
    };
    return summary;
  }

  exportEvents() {
    return JSON.stringify({
      events: this.events,
      summary: this.getAnalyticsSummary(),
      detailedLog: this.getDetailedLog(),
      exportedAt: new Date().toISOString(),
    }, null, 2);
  }

  exportCSV() {
    const events = this.events;
    const headers = ['Timestamp', 'Event', 'Page', 'Session ID', 'User ID', 'Properties'];
    const rows = events.map(event => [
      new Date(event.timestamp).toLocaleString(),
      event.event,
      event.properties?.url || '',
      event.sessionId || '',
      event.userId || '',
      JSON.stringify(event.properties || {})
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    return csv;
  }

  clearEvents() {
    this.events = [];
    this.clicks = {};
    this.abandonedCarts = 0;
    localStorage.removeItem('analytics_events');
    localStorage.removeItem('detailed_analytics_log');
  }
}

export const analytics = new Analytics();