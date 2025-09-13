// Analytics tracking utilities
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionStartTime: number;
  private pageViewTime: number;
  private clicks: Record<string, number> = {};
  private abandonedCarts: number = 0;

  constructor() {
    this.sessionStartTime = Date.now();
    this.pageViewTime = Date.now();
    this.loadEvents();
    this.setupClickTracking();
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
      },
      timestamp: Date.now(),
    };

    this.events.push(analyticsEvent);
    this.saveEvents();
    console.log('Analytics Event:', analyticsEvent);
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

  getEvents() {
    return this.events;
  }

  getAnalyticsSummary() {
    const summary = {
      totalEvents: this.events.length,
      totalClicks: Object.values(this.clicks).reduce((a, b) => a + b, 0),
      clicksByElement: this.clicks,
      abandonedCarts: this.abandonedCarts,
      pageViews: this.events.filter(e => e.event === 'page_view').length,
      packageSelections: this.events.filter(e => e.event === 'package_selected'),
      bonusDownloads: this.events.filter(e => e.event === 'bonus_downloaded'),
      emailsCollected: this.events.filter(e => e.event === 'bonuses_unlocked').length,
      sessionDuration: Date.now() - this.sessionStartTime
    };
    return summary;
  }

  exportEvents() {
    return JSON.stringify({
      events: this.events,
      summary: this.getAnalyticsSummary()
    }, null, 2);
  }

  clearEvents() {
    this.events = [];
    this.clicks = {};
    this.abandonedCarts = 0;
    localStorage.removeItem('analytics_events');
  }
}

export const analytics = new Analytics();