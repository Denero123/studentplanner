import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types';
import { supabase } from '../lib/supabase';
import { api, authStorage } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signup: (payload: { name: string; email: string; password: string; confirmPassword: string }) => Promise<void>;
  login: (payload: { email: string; password: string }) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (payload: { email: string; otp: string; newPassword: string; confirmPassword: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(authStorage.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isSupabaseConfigured = () => {
    const url = import.meta.env.VITE_SUPABASE_URL;
    return url && !url.includes('placeholder');
  };

  // Initialize session
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        if (isSupabaseConfigured()) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const sbUser: User = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || '',
              email_verified: true,
              created_at: session.user.created_at
            };
            setUser(sbUser);
            setToken(session.access_token);
            authStorage.setToken(session.access_token);
          } else {
            const storedToken = authStorage.getToken();
            if (storedToken) {
              const res = await api.getCurrentUser();
              if (res.data?.user) {
                setUser(res.data.user);
              } else {
                authStorage.removeToken();
                setToken(null);
              }
            }
          }
        } else {
          const storedToken = authStorage.getToken();
          if (storedToken) {
            const res = await api.getCurrentUser();
            if (res.data?.user) {
              setUser(res.data.user);
            } else {
              authStorage.removeToken();
              setToken(null);
            }
          }
        }
      } catch (err) {
        console.warn('Session initialization warning:', err);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const sbUser: User = {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            email_verified: true,
            created_at: session.user.created_at
          };
          setUser(sbUser);
          setToken(session.access_token);
          authStorage.setToken(session.access_token);
        } else {
          setUser(null);
          setToken(null);
          authStorage.removeToken();
        }
        setIsLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const signup = async (payload: { name: string; email: string; password: string; confirmPassword: string }) => {
    if (payload.password !== payload.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signUp({
        email: payload.email,
        password: payload.password,
        options: {
          data: { name: payload.name }
        }
      });
      if (error) throw error;
      if (data.session?.access_token) {
        authStorage.setToken(data.session.access_token);
        setToken(data.session.access_token);
        if (data.user) {
          setUser({
            id: data.user.id,
            name: payload.name,
            email: data.user.email || payload.email,
            email_verified: true,
            created_at: data.user.created_at
          });
        }
      }
    } else {
      const res = await api.signup(payload);
      if (res.data?.token && res.data?.user) {
        authStorage.setToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      }
    }
  };

  const login = async (payload: { email: string; password: string }) => {
    if (isSupabaseConfigured()) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: payload.email,
        password: payload.password
      });
      if (error) throw error;
      if (data.session) {
        authStorage.setToken(data.session.access_token);
        setToken(data.session.access_token);
        if (data.user) {
          setUser({
            id: data.user.id,
            name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || 'User',
            email: data.user.email || '',
            email_verified: true,
            created_at: data.user.created_at
          });
        }
      }
    } else {
      const res = await api.login(payload);
      if (res.data?.token && res.data?.user) {
        authStorage.setToken(res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
      }
    }
  };

  const forgotPassword = async (email: string) => {
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password'
      });
      if (error) throw error;
    } else {
      await api.forgotPassword(email);
    }
  };

  const resetPassword = async (payload: { email: string; otp: string; newPassword: string; confirmPassword: string }) => {
    if (payload.newPassword !== payload.confirmPassword) {
      throw new Error('New passwords do not match');
    }
    if (isSupabaseConfigured()) {
      const { error } = await supabase.auth.updateUser({ password: payload.newPassword });
      if (error) throw error;
    } else {
      await api.resetPassword(payload);
    }
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
      await api.logout();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      authStorage.removeToken();
      setUser(null);
      setToken(null);
    }
  };

  const refreshUser = async () => {
    try {
      if (isSupabaseConfigured()) {
        const { data: { user: sbUser } } = await supabase.auth.getUser();
        if (sbUser) {
          setUser({
            id: sbUser.id,
            name: sbUser.user_metadata?.name || sbUser.email?.split('@')[0] || 'User',
            email: sbUser.email || '',
            email_verified: true,
            created_at: sbUser.created_at
          });
          return;
        }
      }
      if (token) {
        const res = await api.getCurrentUser();
        if (res.data?.user) {
          setUser(res.data.user);
        }
      }
    } catch (err) {
      console.error('Error refreshing user:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        signup,
        login,
        forgotPassword,
        resetPassword,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
