import { createClient } from '@supabase/supabase-js';

const sanitizeEnvValue = (value?: string): string => {
  if (typeof value !== 'string') return '';

  let trimmed = value.trim();
  if (!trimmed) return '';
  if (trimmed === 'undefined' || trimmed === 'null') return '';

  const firstChar = trimmed.charAt(0);
  const lastChar = trimmed.charAt(trimmed.length - 1);
  const matchingQuotes =
    (firstChar === lastChar && ['"', "'", '`'].includes(firstChar)) ||
    (firstChar === '“' && lastChar === '”') ||
    (firstChar === '”' && lastChar === '“');

  if (matchingQuotes) {
    trimmed = trimmed.slice(1, -1).trim();
  }

  return trimmed;
};

const validateSupabaseUrl = (value: string): string => {
  if (!value) return '';

  try {
    const parsed = new URL(value);

    if (!/^https?:$/.test(parsed.protocol)) {
      throw new Error(`Unsupported protocol: ${parsed.protocol}`);
    }

    return parsed.origin;
  } catch (error) {
    console.error(
      'Supabase URL environment variable is invalid and will be ignored. Received value:',
      value,
      error
    );
    return '';
  }
};

const rawSupabaseUrl =
  sanitizeEnvValue(import.meta.env.VITE_SUPABASE_URL) ||
  sanitizeEnvValue(import.meta.env.SUPABASE_URL);

const supabaseUrl = validateSupabaseUrl(rawSupabaseUrl);

const supabaseAnonKey =
  sanitizeEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY) ||
  sanitizeEnvValue(import.meta.env.SUPABASE_ANON_KEY);

if (rawSupabaseUrl && !supabaseUrl) {
  console.warn(
    'Supabase URL was provided but is not a valid https URL. Check for extra quotes or typos in your environment configuration.'
  );
}

const hasSupabaseConfig = supabaseUrl !== '' && supabaseAnonKey !== '';

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
  page_url?: string;
  user_agent?: string;
  created_at?: string;
}

export interface BonusSignupRecord {
  id?: string;
  email: string;
  session_id?: string;
  source?: string;
  page_url?: string;
  user_agent?: string;
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
