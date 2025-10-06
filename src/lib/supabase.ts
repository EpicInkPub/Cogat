import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface LeadRecord {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  package_selected: string;
  grade_selected: string;
  source?: string;
  session_id?: string;
  created_at?: string;
}

export interface BonusSignupRecord {
  id?: string;
  email: string;
  session_id?: string;
  created_at?: string;
}

export interface AnalyticsEventRecord {
  id?: string;
  event_name: string;
  properties?: Record<string, any>;
  session_id?: string;
  user_id?: string;
  page_url?: string;
  user_agent?: string;
  created_at?: string;
}
