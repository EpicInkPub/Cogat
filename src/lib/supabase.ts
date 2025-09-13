import { createClient } from '@supabase/supabase-js';

// These environment variables will be available after connecting to Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Lead {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  package_selected: string;
  grade_selected: string;
  source: string;
  session_id?: string;
  created_at: string;
}

export interface BonusSignup {
  id: string;
  email: string;
  session_id?: string;
  created_at: string;
}

export interface AnalyticsEvent {
  id: string;
  event_name: string;
  properties: any;
  session_id?: string;
  user_id?: string;
  page_url?: string;
  user_agent?: string;
  created_at: string;
}

// Database functions
export const database = {
  // Insert a new lead
  async insertLead(lead: Omit<Lead, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('leads')
      .insert([lead])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting lead:', error);
      throw error;
    }
    
    return data;
  },

  // Insert a bonus signup
  async insertBonusSignup(signup: Omit<BonusSignup, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('bonus_signups')
      .insert([signup])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting bonus signup:', error);
      throw error;
    }
    
    return data;
  },

  // Insert analytics event
  async insertAnalyticsEvent(event: Omit<AnalyticsEvent, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('analytics_events')
      .insert([event])
      .select()
      .single();
    
    if (error) {
      console.error('Error inserting analytics event:', error);
      // Don't throw error for analytics to avoid breaking user experience
      return null;
    }
    
    return data;
  },

  // Get all leads (requires authentication)
  async getLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
    
    return data;
  },

  // Get all bonus signups (requires authentication)
  async getBonusSignups() {
    const { data, error } = await supabase
      .from('bonus_signups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching bonus signups:', error);
      throw error;
    }
    
    return data;
  },

  // Get analytics events (requires authentication)
  async getAnalyticsEvents(limit = 1000) {
    const { data, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('Error fetching analytics events:', error);
      throw error;
    }
    
    return data;
  },

  // Get analytics summary
  async getAnalyticsSummary() {
    const [leads, bonusSignups, events] = await Promise.all([
      this.getLeads(),
      this.getBonusSignups(),
      this.getAnalyticsEvents()
    ]);

    const packageSelections = events.filter(e => e.event_name === 'package_selected');
    const formSubmissions = events.filter(e => e.event_name === 'form_submitted');
    const pageViews = events.filter(e => e.event_name === 'page_view');

    return {
      totalLeads: leads.length,
      totalBonusSignups: bonusSignups.length,
      totalEvents: events.length,
      packageSelections: packageSelections.length,
      formSubmissions: formSubmissions.length,
      pageViews: pageViews.length,
      leadsByPackage: leads.reduce((acc, lead) => {
        acc[lead.package_selected] = (acc[lead.package_selected] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      recentLeads: leads.slice(0, 10),
      recentBonusSignups: bonusSignups.slice(0, 10),
      recentEvents: events.slice(0, 20)
    };
  }
};