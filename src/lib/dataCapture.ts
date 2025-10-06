import { supabase } from './supabase';

export interface LeadData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  packageBought: string;
  gradeSelected: string;
  source: 'test_package' | 'bonus_access' | 'direct';
}

export interface BonusSignup {
  email: string;
}

class DataCapture {
  private sessionId: string;

  constructor() {
    this.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async captureLead(data: LeadData) {
    console.log('📝 Capturing lead...', data);

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const leadData = {
      first_name: data.firstName,
      last_name: data.lastName,
      email: data.email,
      phone: data.phone,
      package_selected: data.packageBought,
      grade_selected: data.gradeSelected,
      source: data.source,
      session_id: this.sessionId,
    };

    const { data: result, error } = await supabase
      .from('leads')
      .insert([leadData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving lead:', error);
      throw error;
    }

    console.log('✅ Lead saved successfully:', result);
    return result;
  }

  async captureBonusSignup(data: BonusSignup) {
    console.log('📝 Capturing bonus signup...', data);

    if (!supabase) {
      throw new Error('Supabase is not configured');
    }

    const signupData = {
      email: data.email,
      session_id: this.sessionId,
    };

    const { data: result, error } = await supabase
      .from('bonus_signups')
      .insert([signupData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error saving bonus signup:', error);
      throw error;
    }

    console.log('✅ Bonus signup saved successfully:', result);
    return result;
  }

  async trackEvent(eventName: string, properties: Record<string, any> = {}) {
    console.log('📊 Tracking event...', eventName, properties);

    if (!supabase) {
      console.warn('Supabase not configured, skipping event tracking');
      return null;
    }

    const eventData = {
      event_name: eventName,
      properties,
      session_id: this.sessionId,
      page_url: window.location.href,
      user_agent: navigator.userAgent,
    };

    const { data: result, error } = await supabase
      .from('analytics_events')
      .insert([eventData])
      .select()
      .single();

    if (error) {
      console.error('❌ Error tracking event:', error);
      return null;
    }

    console.log('✅ Event tracked successfully:', result);
    return result;
  }
}

export const dataCapture = new DataCapture();
