import { supabase } from '../lib/supabase';

// Helper: Maps phone to a unique email alias for Supabase Auth
const phoneToEmail = (phone: string) => `${phone.replace(/\D/g, '')}@tanamao.auth.alias`;

export const authService = {
  async signInWithEmail(email: string, password: string) {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signInWithPhone(phone: string, password: string) {
    // Treat phone as ID by using the alias
    const email = phoneToEmail(phone);
    return await supabase.auth.signInWithPassword({ email, password });
  },

  async signInWithGoogle() {
    return await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin + '/dashboard' }
    });
  },

  async signUpWithEmail(email: string, password: string, userData: any) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: userData }
    });
    // Note: Inserting into 'usuarios' table should be handled by a DB trigger
    return { data, error };
  },

  async signUpWithPhone(phone: string, password: string, userData: any) {
    const email = phoneToEmail(phone);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { ...userData, phone } }
    });
    return { data, error };
  },

  async signOut() {
    return await supabase.auth.signOut();
  },

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
};
