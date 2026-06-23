'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase/client';

interface Merchant {
  id: string;
  email: string;
  business_name: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  merchant: Merchant | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshMerchant: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  merchant: null,
  loading: true,
  signOut: async () => {},
  refreshMerchant: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [merchant, setMerchant] = useState<Merchant | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMerchant = async (userId: string) => {
    const { data, error } = await supabase
      .from('merchants')
      .select('*')
      .eq('id', userId)
      .single();

    if (!error && data) {
      setMerchant(data);
    }
  };

  const refreshMerchant = async () => {
    if (user) {
      await fetchMerchant(user.id);
    }
  };

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchMerchant(session.user.id);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchMerchant(session.user.id);
        } else {
          setMerchant(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMerchant(null);
  };

  return (
    <AuthContext.Provider value={{ user, merchant, loading, signOut, refreshMerchant }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
