
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// For development without Supabase
const isDevelopment = import.meta.env.DEV;
const useDummyData = isDevelopment && (!supabaseUrl || !supabaseAnonKey);

if (!useDummyData && (!supabaseUrl || !supabaseAnonKey)) {
  console.error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = useDummyData 
  ? createClient('https://example.supabase.co', 'dummy-key', {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    })
  : createClient(supabaseUrl || '', supabaseAnonKey || '');

// Mock user for development
let mockUser = null;

// User session helper
export const getCurrentUser = async () => {
  if (useDummyData) {
    return mockUser;
  }

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error fetching user:', error.message);
    return null;
  }
  return user;
};

// Authentication helpers
export const signIn = async (email: string, password: string) => {
  if (useDummyData) {
    // Simulate successful login
    mockUser = { 
      id: 'mock-user-id', 
      email, 
      user_metadata: { name: 'Mock User' } 
    };
    return { user: mockUser, session: { access_token: 'mock-token' } };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signUp = async (email: string, password: string) => {
  if (useDummyData) {
    // Simulate successful signup
    mockUser = { 
      id: 'mock-user-id', 
      email, 
      user_metadata: { name: 'Mock User' } 
    };
    return { user: mockUser, session: { access_token: 'mock-token' } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });
  
  if (error) throw error;
  return data;
};

export const signOut = async () => {
  if (useDummyData) {
    // Simulate logout
    mockUser = null;
    return;
  }

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Set up auth state change listener
export const setupAuthListener = (callback: (user: any) => void) => {
  if (useDummyData) {
    // Initial callback with mock user if exists
    if (mockUser) {
      callback(mockUser);
    }
    return () => {}; // Return dummy unsubscribe function
  }

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null);
  });
};
