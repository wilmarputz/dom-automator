
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://jfroarlvzwnumcjqzfin.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impmcm9hcmx2endudW1janF6ZmluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQzNjI2NzQsImV4cCI6MjA1OTkzODY3NH0.B0miMk4ceC3LrEZMws4aKYjPZXw2tGAZzeBSOLp4YLw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});
