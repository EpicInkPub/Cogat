import { dataCapture } from './dataCapture';

class Analytics {
  private userId?: string;

  async track(eventName: string, properties: Record<string, any> = {}) {
    return await dataCapture.trackEvent(eventName, {
      ...properties,
      userId: this.userId,
    });
  }

  pageView(page: string) {
    this.track('page_view', {
      page,
      title: document.title,
      url: window.location.href,
      referrer: document.referrer
    });
  }

  setUserId(userId: string) {
    this.userId = userId;
    this.track('user_identified', { userId });
  }

  trackPackageView(packageId: string, packageName: string, price: string) {
    this.track('package_viewed', { packageId, packageName, price });
  }

  trackPackageSelection(packageId: string, packageName: string, price: string) {
    this.track('package_selected', { packageId, packageName, price });
  }

  trackPurchaseIntent(packageId: string, packageName: string, price: string) {
    this.track('purchase_intent', { packageId, packageName, price });
  }

  trackPurchaseComplete(leadData: any) {
    this.track('purchase_complete', {
      packageId: leadData.packageBought,
      value: leadData.price || 'unknown'
    });
  }

  trackFormSubmission(formType: string, formData: any, success: boolean = true) {
    this.track('form_submitted', { formType, success });
  }

  trackBonusUnlock(email: string) {
    this.track('bonus_unlocked', { email: 'provided' });
  }

  trackUserJourney(milestone: string, data?: any) {
    this.track('user_journey', { milestone, ...data });
  }

  trackCTAClick(ctaText: string, location: string) {
    this.track('cta_clicked', { ctaText, location });
  }
}

export const analytics = new Analytics();
