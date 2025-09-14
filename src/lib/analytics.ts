// Enhanced analytics tracking system
import { storage } from './storage';

export interface AnalyticsConfig {
  trackPageViews: boolean;
  trackClicks: boolean;
  trackFormSubmissions: boolean;
  trackUserInteractions: boolean;
}

class EnhancedAnalytics {
  private config: AnalyticsConfig;
  private userId?: string;
  private clickCounts: Record<string, number> = {};
  private pageStartTime: number = Date.now();
  private isInitialized: boolean = false;

  constructor(config: Partial<AnalyticsConfig> = {}) {
    this.config = {
      trackPageViews: true,
      trackClicks: true,
      trackFormSubmissions: true,
      trackUserInteractions: true,
      ...config
    };

    this.initialize();
  }

  private initialize() {
    if (this.isInitialized) return;
    
    if (this.config.trackClicks) {
      this.setupClickTracking();
    }
    
    if (this.config.trackUserInteractions) {
      this.setupUserInteractionTracking();
    }

    this.isInitialized = true;
  }

  private setupClickTracking() {
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const identifier = this.getElementIdentifier(target);
      
      this.clickCounts[identifier] = (this.clickCounts[identifier] || 0) + 1;
      
      this.track('element_clicked', {
        element: identifier,
        tagName: target.tagName,
        className: target.className,
        id: target.id,
        text: target.textContent?.substring(0, 100),
        clickCount: this.clickCounts[identifier],
        coordinates: { x: e.clientX, y: e.clientY }
      });
    });
  }

  private setupUserInteractionTracking() {
    // Track scroll depth
    let maxScrollDepth = 0;
    window.addEventListener('scroll', () => {
      const scrollDepth = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        this.track('scroll_depth', { depth: scrollDepth });
      }
    });

    // Track time on page
    setInterval(() => {
      const timeOnPage = Date.now() - this.pageStartTime;
      this.track('time_milestone', { 
        timeOnPage: timeOnPage,
        milestone: this.getTimeMilestone(timeOnPage)
      });
    }, 30000); // Every 30 seconds

    // Track window focus/blur
    window.addEventListener('focus', () => {
      this.track('window_focus', { timestamp: Date.now() });
    });

    window.addEventListener('blur', () => {
      this.track('window_blur', { 
        timestamp: Date.now(),
        timeOnPage: Date.now() - this.pageStartTime
      });
    });
  }

  private getElementIdentifier(element: HTMLElement): string {
    if (element.id) return `#${element.id}`;
    if (element.className) return `.${element.className.split(' ')[0]}`;
    return element.tagName.toLowerCase();
  }

  private getTimeMilestone(timeMs: number): string {
    const seconds = Math.floor(timeMs / 1000);
    if (seconds < 30) return '0-30s';
    if (seconds < 60) return '30-60s';
    if (seconds < 120) return '1-2min';
    if (seconds < 300) return '2-5min';
    if (seconds < 600) return '5-10min';
    return '10min+';
  }

  // Core tracking methods
  track(eventName: string, properties: Record<string, any> = {}) {
    return storage.trackEvent(eventName, {
      ...properties,
      userId: this.userId,
      timestamp: Date.now(),
      url: window.location.href,
      referrer: document.referrer,
      userAgent: navigator.userAgent,
    }, this.userId);
  }

  // Page tracking
  pageView(page: string) {
    this.pageStartTime = Date.now();
    
    if (this.config.trackPageViews) {
      this.track('page_view', { 
        page,
        title: document.title,
        url: window.location.href,
        referrer: document.referrer
      });
      
      storage.trackPageVisit(page, this.userId);
    }
  }

  trackTimeOnPage(page: string) {
    const timeSpent = Date.now() - this.pageStartTime;
    this.track('time_on_page', { 
      page, 
      timeSpent,
      formattedTime: this.formatDuration(timeSpent)
    });
  }

  // User identification
  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  // E-commerce tracking
  trackPackageView(packageId: string, packageName: string, price: string) {
    this.track('package_viewed', { 
      packageId, 
      packageName, 
      price,
      category: 'test_package'
    });
  }

  trackPackageSelection(packageId: string, packageName: string, price: string) {
    this.track('package_selected', { 
      packageId, 
      packageName, 
      price,
      category: 'test_package'
    });
  }

  trackPurchaseIntent(packageId: string, packageName: string, price: string) {
    this.track('purchase_intent', { 
      packageId, 
      packageName, 
      price,
      step: 'form_opened'
    });
  }

  trackPurchaseComplete(leadData: any) {
    this.track('purchase_complete', {
      packageId: leadData.packageBought,
      email: 'provided',
      phone: 'provided',
      value: leadData.price || 'unknown'
    });
  }

  // Form tracking
  trackFormStart(formType: string, formId?: string) {
    if (this.config.trackFormSubmissions) {
      this.track('form_started', { formType, formId });
    }
  }

  trackFormSubmission(formType: string, formData: any, success: boolean = true) {
    if (this.config.trackFormSubmissions) {
      this.track('form_submitted', { 
        formType, 
        success,
        fieldCount: Object.keys(formData).length,
        hasEmail: !!formData.email,
        hasPhone: !!formData.phone,
        hasName: !!(formData.firstName || formData.name)
      });
    }
  }

  trackFormFieldInteraction(fieldName: string, action: 'focus' | 'blur' | 'change') {
    this.track('form_field_interaction', { fieldName, action });
  }

  // Bonus tracking
  trackBonusInteraction(action: string, bonusId?: string) {
    this.track('bonus_interaction', { action, bonusId });
  }

  trackBonusUnlock(email: string) {
    this.track('bonus_unlocked', { 
      email: 'provided',
      timestamp: Date.now()
    });
  }

  trackBonusDownload(bonusId: string, bonusName: string) {
    this.track('bonus_downloaded', { bonusId, bonusName });
  }

  // Conversion funnel tracking
  trackFunnelStep(step: string, data?: any) {
    this.track('funnel_step', { step, ...data });
  }

  trackUserJourney(milestone: string, data?: any) {
    this.track('user_journey', { milestone, ...data });
  }

  // Cart abandonment
  trackCartAbandonment(packageId: string, stage: string, reason?: string) {
    this.track('cart_abandoned', { 
      packageId, 
      stage, 
      reason,
      timeToAbandon: Date.now() - this.pageStartTime
    });
  }

  // CTA tracking
  trackCTAClick(ctaText: string, location: string, destination?: string) {
    this.track('cta_clicked', { 
      ctaText, 
      location, 
      destination 
    });
  }

  // Error tracking
  trackError(error: string, context?: string) {
    this.track('error_occurred', { 
      error: error.substring(0, 200), 
      context,
      url: window.location.href
    });
  }

  // Utility methods
  private formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  // Get analytics data
  getEvents() {
    return storage.getAnalyticsEvents();
  }

  getClickCounts() {
    return this.clickCounts;
  }

  getSummary() {
    return storage.getAnalyticsSummary();
  }

  // Export methods
  exportEvents() {
    return storage.exportToJSON();
  }

  exportCSV() {
    return storage.exportToCSV();
  }

  // Clear data
  clearEvents() {
    storage.clearAllData();
    this.clickCounts = {};
  }
}

export const analytics = new EnhancedAnalytics();