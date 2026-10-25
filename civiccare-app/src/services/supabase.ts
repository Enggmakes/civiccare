import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xyzcompany.supabase.co';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export const isRealSupabaseConfigured = Boolean(
  process.env.EXPO_PUBLIC_SUPABASE_URL &&
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.EXPO_PUBLIC_SUPABASE_URL.includes('xyzcompany')
);

// SSR-safe storage adapter for React Native, Web, and Expo Router static builds
export const safeStorage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // Ignore storage write errors during SSR
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // Ignore
    }
  },
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: safeStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export interface CivicReportItem {
  id: string;
  ticket_number: string;
  title: string;
  description: string;
  category: 'Pothole' | 'Garbage' | 'Streetlight' | 'Water Leak' | 'Broken Road' | 'Others';
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Submitted' | 'AI Classification' | 'Sent to Department' | 'In Progress' | 'Resolved';
  location_address: string;
  latitude: number;
  longitude: number;
  image_url: string;
  created_at: string;
  department_name: string;
  department_id?: string;
  user_id?: string;
  time_ago: string;
  distance_km: string;
  subscriber_count?: number;
  timeline: Array<{
    step: number;
    title: string;
    timestamp: string;
    description: string;
    is_completed: boolean;
    is_active?: boolean;
  }>;
}

// Initial reports empty by default (zero dummy records; loads live from Supabase)
export const INITIAL_SAMPLE_REPORTS: CivicReportItem[] = [];

