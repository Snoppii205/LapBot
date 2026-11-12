import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type {
  CustomerLoginInput,
  CustomerProfile,
  CustomerProfilePatchInput,
  CustomerRegisterInput,
  PasswordChangeInput
} from '@lapbot/contracts';
import { apiJson } from '../../lib/api-client.js';

interface AuthContextValue {
  customer: CustomerProfile | null;
  loading: boolean;
  login: (input: CustomerLoginInput) => Promise<CustomerProfile>;
  register: (input: CustomerRegisterInput) => Promise<CustomerProfile>;
  logout: () => Promise<void>;
  updateProfile: (input: CustomerProfilePatchInput) => Promise<CustomerProfile>;
  changePassword: (input: PasswordChangeInput) => Promise<void>;
  refresh: () => Promise<CustomerProfile | null>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [customer, setCustomer] = useState<CustomerProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async (): Promise<CustomerProfile | null> => {
    try {
      const data = await apiJson<CustomerProfile>('/auth/me');
      setCustomer(data);
      return data;
    } catch {
      setCustomer(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const login = async (input: CustomerLoginInput): Promise<CustomerProfile> => {
    const profile = await apiJson<CustomerProfile>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    setCustomer(profile);
    return profile;
  };

  const register = async (input: CustomerRegisterInput): Promise<CustomerProfile> => {
    const profile = await apiJson<CustomerProfile>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(input)
    });
    setCustomer(profile);
    return profile;
  };

  const logout = async (): Promise<void> => {
    try {
      await apiJson<{ ok: boolean }>('/auth/logout', {
        method: 'POST',
        body: JSON.stringify({})
      });
    } finally {
      setCustomer(null);
    }
  };

  const updateProfile = async (input: CustomerProfilePatchInput): Promise<CustomerProfile> => {
    const updated = await apiJson<CustomerProfile>('/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(input)
    });
    setCustomer(updated);
    return updated;
  };

  const changePassword = async (input: PasswordChangeInput): Promise<void> => {
    await apiJson<{ ok: boolean }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(input)
    });
  };

  return (
    <AuthContext.Provider
      value={{
        customer,
        loading,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        refresh
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
