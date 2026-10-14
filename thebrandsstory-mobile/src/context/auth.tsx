import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, apiRequest, getAuthToken, setAuthToken } from '@/config/api';

export type AppUser = {
  id: string;
  name: string;
  email: string;
  role: 'CREATOR' | 'BRAND' | 'ADMIN' | 'SALES' | 'GUEST';
  companyName?: string;
  avatar?: string;
  creatorProfile?: { id?: string; username?: string; [key: string]: unknown };
};

export type SignupData = {
  name: string;
  email: string;
  password: string;
  role: 'CREATOR' | 'BRAND';
  phone?: string;
  companyName?: string;
  category?: string;
  city?: string;
  username?: string;
};

type AuthContextValue = {
  user: AppUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: React.PropsWithChildren) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const token = await getAuthToken();
    if (!token) return null;
    try {
      const data = await apiRequest<{ success: boolean; user: AppUser }>('/api/auth/me');
      return data.user;
    } catch (error) {
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
        await setAuthToken(null);
        return null;
      }
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    setUser(await loadUser());
  }, [loadUser]);

  useEffect(() => {
    let active = true;
    loadUser()
      .then((restoredUser) => { if (active) setUser(restoredUser); })
      .catch((error) => console.warn('Unable to restore saved session:', error))
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const result = await apiRequest<{ success: boolean; token: string; user: AppUser }>('/api/auth/login', {
      method: 'POST',
      data: { email: email.trim(), password },
    });
    if (!result.token || !result.user) throw new Error('The server did not return a valid sign-in session.');
    await setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const signup = useCallback(async (data: SignupData) => {
    const result = await apiRequest<{ success: boolean; token: string; user: AppUser }>('/api/auth/signup', {
      method: 'POST',
      data: {
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        role: data.role,
        phone: data.phone || '9876543210',
        companyName: data.companyName,
        category: data.category,
        city: data.city,
        username: data.username,
      },
    });
    if (!result.token || !result.user) throw new Error('Registration failed. Please check your details.');
    await setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const logout = useCallback(async () => {
    await setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, signup, logout, refreshUser }),
    [user, loading, login, signup, logout, refreshUser]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
