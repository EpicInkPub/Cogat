import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config';

const supabaseUrl = SUPABASE_CONFIG.url;
const supabaseAnonKey = SUPABASE_CONFIG.anonKey;

const hasSupabaseConfig = supabaseUrl && supabaseAnonKey;

console.log('🔧 Supabase Configuration Check:');
console.log('  URL:', supabaseUrl ? '✅ SET' : '❌ MISSING');
console.log('  Key:', supabaseAnonKey ? '✅ SET' : '❌ MISSING');
console.log('  Configured:', hasSupabaseConfig);

if (!hasSupabaseConfig) {
  console.warn('Supabase environment variables not configured. Database features will be disabled.');
}

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const isSupabaseConfigured = hasSupabaseConfig;

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
