import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, safeStorage } from './supabase';

export interface CitizenUser {
  id: string;
  fullName: string;
  firstName: string;
  ward: string;
  primaryPhoneNumber: { phoneNumber: string } | null;
  primaryEmailAddress: { emailAddress: string } | null;
  imageUrl: string;
}

const GUEST_CITIZEN: CitizenUser = {
  id: 'guest_citizen',
  fullName: 'Guest Citizen',
  firstName: 'Citizen',
  ward: 'Ward K-West (Andheri West)',
  primaryPhoneNumber: { phoneNumber: '+91 98201 12345' },
  primaryEmailAddress: { emailAddress: 'citizen.mumbai@gov.in' },
  imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

interface AuthContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  userId: string | null;
  sessionId: string | null;
  signOut: () => Promise<void>;
  signIn: (emailOrPhone: string, password?: string) => Promise<{ error: any; user?: any }>;
  signUp: (
    email: string,
    password: string,
    metadata?: { fullName?: string; ward?: string; phone?: string }
  ) => Promise<{ error: any; user?: any }>;
  updateWard: (newWard: string) => Promise<boolean>;
}

interface UserContextType {
  isLoaded: boolean;
  isSignedIn: boolean;
  user: CitizenUser | null;
  updateWard: (newWard: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  isLoaded: true,
  isSignedIn: false,
  userId: null,
  sessionId: null,
  signOut: async () => {},
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  updateWard: async () => false,
});

const UserContext = createContext<UserContextType>({
  isLoaded: true,
  isSignedIn: false,
  user: null,
  updateWard: async () => false,
});

export function useAuth() {
  return useContext(AuthContext);
}

export function useUser() {
  return useContext(UserContext);
}

export function SignedIn({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return isSignedIn ? <>{children}</> : null;
}

export function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn } = useAuth();
  return !isSignedIn ? <>{children}</> : null;
}

/**
 * CivicCare Supabase Native Authentication Provider
 * 
 * WHY SUPABASE AUTH INSTEAD OF CLERK?
 * 1. ZERO WEBSITE DOMAIN REQUIRED: Talks directly to your Supabase PostgreSQL cloud instance via REST.
 * 2. INTEGRATED WITH CIVICCARE DATABASE: Users created here land in your `auth.users` table, allowing
 *    direct foreign keys to reports, comments, and upvotes with full Row Level Security (RLS).
 * 3. NO PRODUCTION DOMAIN HOOPS: Clerk requires configuring custom web domains and deep links.
 *    Supabase Auth works out of the box on iPhone (Expo Go), Android, and Web.
 */
export function CivicCareAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CitizenUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    // 1. Restore active session on app mount
    initAuthSession();

    // 2. Subscribe to Supabase auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        mapSupabaseUser(session.user);
        setIsSignedIn(true);
        setSessionId(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setIsSignedIn(false);
        setSessionId(null);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const initAuthSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (!error && data?.session?.user) {
        mapSupabaseUser(data.session.user);
        setIsSignedIn(true);
        setSessionId(data.session.access_token);
      } else {
        // Check if citizen previously selected Guest mode
        const isGuest = await safeStorage.getItem('@civiccare_guest_mode');
        if (isGuest === 'true') {
          const savedGuestWard = await safeStorage.getItem('@civiccare_guest_ward');
          setUser({
            ...GUEST_CITIZEN,
            ward: savedGuestWard || GUEST_CITIZEN.ward,
          });
          setIsSignedIn(true);
        }
      }
    } catch (e) {
      console.warn('Session init check failed:', e);
    } finally {
      setIsLoaded(true);
    }
  };

  const mapSupabaseUser = (sbUser: any) => {
    const meta = sbUser.user_metadata || {};
    const fullName = meta.full_name || meta.fullName || sbUser.email?.split('@')[0] || 'Citizen';
    const wardName = meta.ward || 'Ward K-West (Andheri West)';
    const phoneNum = meta.phone_number || meta.phone || sbUser.phone || '';

    setUser({
      id: sbUser.id,
      fullName: fullName,
      firstName: fullName.split(' ')[0] || 'Citizen',
      ward: wardName,
      primaryPhoneNumber: phoneNum ? { phoneNumber: phoneNum } : null,
      primaryEmailAddress: { emailAddress: sbUser.email || 'citizen@civiccare.org' },
      imageUrl:
        meta.avatar_url ||
        'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    });
  };

  const signIn = async (
    emailOrPhone: string,
    password?: string
  ): Promise<{ error: any; user?: any }> => {
    try {
      if (password && emailOrPhone.includes('@')) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailOrPhone.trim(),
          password: password,
        });

        if (error) {
          return { error };
        }

        if (data.user) {
          mapSupabaseUser(data.user);
          setIsSignedIn(true);
          setSessionId(data.session?.access_token || null);
          await safeStorage.removeItem('@civiccare_guest_mode');
          return { error: null, user: data.user };
        }
      }

      const guestUser: CitizenUser = {
        ...GUEST_CITIZEN,
        id: `usr_${Date.now()}`,
        primaryPhoneNumber: emailOrPhone.startsWith('+') || /^\d+$/.test(emailOrPhone)
          ? { phoneNumber: emailOrPhone }
          : GUEST_CITIZEN.primaryPhoneNumber,
        primaryEmailAddress: emailOrPhone.includes('@')
          ? { emailAddress: emailOrPhone }
          : GUEST_CITIZEN.primaryEmailAddress,
      };

      setUser(guestUser);
      setIsSignedIn(true);
      await safeStorage.setItem('@civiccare_guest_mode', 'true');
      return { error: null, user: guestUser };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (
    email: string,
    password: string,
    metadata?: { fullName?: string; ward?: string; phone?: string }
  ): Promise<{ error: any; user?: any }> => {
    try {
      const phoneNumber = metadata?.phone?.trim() || '';
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: metadata?.fullName || 'Citizen',
            phone_number: phoneNumber,
            phone: phoneNumber,
            ward: metadata?.ward || 'Ward K-West (Andheri West)',
          },
        },
      });

      if (error) {
        return { error };
      }

      if (data.user) {
        // Also sync to public.profiles table if present in Supabase
        try {
          await supabase.from('profiles').upsert({
            id: data.user.id,
            full_name: metadata?.fullName || 'Citizen',
            phone_number: phoneNumber || null,
            email: email.trim(),
            role: 'CITIZEN',
          });
        } catch {
          // Non-blocking if table is not yet migrated
        }

        mapSupabaseUser(data.user);
        setIsSignedIn(true);
        setSessionId(data.session?.access_token || null);
        await safeStorage.removeItem('@civiccare_guest_mode');
        return { error: null, user: data.user };
      }

      return { error: null, user: data.user };
    } catch (err: any) {
      return { error: err };
    }
  };

  const updateWard = async (newWard: string): Promise<boolean> => {
    const trimmedWard = newWard.trim();
    if (!trimmedWard) return false;

    setUser(prev => (prev ? { ...prev, ward: trimmedWard } : null));

    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (currentUser) {
        await supabase.auth.updateUser({
          data: { ward: trimmedWard },
        });
        await supabase.from('profiles').update({ ward: trimmedWard }).eq('id', currentUser.id);
      } else {
        await safeStorage.setItem('@civiccare_guest_ward', trimmedWard);
      }
      return true;
    } catch (e) {
      console.warn('Failed to persist ward update:', e);
      return true;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      await safeStorage.removeItem('@civiccare_guest_mode');
    } catch (e) {
      // Ignore
    }
    setUser(null);
    setIsSignedIn(false);
    setSessionId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoaded,
        isSignedIn,
        userId: user ? user.id : null,
        sessionId,
        signOut,
        signIn,
        signUp,
        updateWard,
      }}>
      <UserContext.Provider
        value={{
          isLoaded,
          isSignedIn,
          user,
          updateWard,
        }}>
        {children}
      </UserContext.Provider>
    </AuthContext.Provider>
  );
}
