"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { trpc } from '../app/utils/trpc';
import { authClient } from '../app/utils/auth-client';

interface User {
  id: string;
  email: string;
  fullName: string;
  avatar?: string;
  createdAt: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requireOtp?: boolean; error?: string }>;
  loginWithGoogle: () => Promise<void>;
  register: (userData: RegisterData) => Promise<{ success: boolean; requireOtp?: boolean; error?: string }>;
  verifyOtp: (email: string, otp: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
}

interface RegisterData {
  fullName: string;
  email: string;
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  // Supports two auth flows:
  // 1. Manual login (tRPC) → user data stored in localStorage
  // 2. Google OAuth (better-auth) → session stored in httpOnly cookies
  useEffect(() => {
    const checkAuthSession = async () => {
      try {
        // First: check localStorage for manual login session
        const storedUser = localStorage.getItem('userData');
        const authToken = localStorage.getItem('authToken');
        if (storedUser && authToken) {
          try {
            const parsed = JSON.parse(storedUser);
            if (parsed?.id && parsed?.email) {
              setUser(parsed);
              setIsLoading(false);
              return;
            }
          } catch {
            // Invalid JSON, clear stale data
            localStorage.removeItem('userData');
            localStorage.removeItem('authToken');
            localStorage.removeItem('loginTime');
          }
        }

        // Second: check better-auth session (Google OAuth)
        try {
          const session = await authClient.getSession();
          if (session?.data) {
            const { user: oauthUser } = session.data;
            try {
              const fullProfile = await trpc.getUserProfile({ id: oauthUser.id });
              const userData: User = {
                id: fullProfile.id,
                email: fullProfile.email,
                fullName: fullProfile.fullName,
                avatar: fullProfile.avatar || undefined,
                createdAt: new Date().toISOString(),
                role: (fullProfile.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || 'USER',
              };
              setUser(userData);
            } catch (profileErr) {
              console.error('Failed to load user profile via tRPC:', profileErr);
              const userData: User = {
                id: oauthUser.id,
                email: oauthUser.email,
                fullName: oauthUser.name || '',
                avatar: oauthUser.image || undefined,
                createdAt: new Date().toISOString(),
                role: 'USER',
              };
              setUser(userData);
            }
          } else {
            setUser(null);
          }
        } catch {
          // Backend may be down, just set user to null
          setUser(null);
        }
      } catch (error) {
        console.error('Auth session check failed:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthSession();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('Attempting login with:', email);
      const result = await trpc.login({ email, password });
      console.log('Login result:', result);

      if (!result || !result.user) {
        return { success: false, error: 'Invalid response from server' };
      }

      const userData: User = {
        id: result.user.id.toString(),
        email: result.user.email,
        fullName: result.user.fullName,
        avatar: result.user.avatar,
        createdAt: new Date().toISOString(),
        role: (result.user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || 'USER',
      };

      setUser(userData);
      localStorage.setItem('authToken', 'auth-token');
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('loginTime', Date.now().toString());
      return { success: true };
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Invalid email or password. Please try again.';
      console.log('Login failed:', message);
      const requireOtp = message.includes("verify your account") || message.includes("OTP");
      return { success: false, requireOtp, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.origin + "/account",
      });
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setIsLoading(true);
    try {
      const registerInput = {
        email: userData.email,
        fullName: userData.fullName,
        password: userData.password
      };
      const result = await trpc.register(registerInput);

      if (result.requireOtp) {
        return { success: true, requireOtp: true };
      }

      // Fallback in case OTP isn't required (e.g., if we disable it later)
      const newUser: User = {
        id: result.user.id.toString(),
        email: result.user.email,
        fullName: result.user.fullName,
        avatar: result.user.avatar,
        createdAt: new Date().toISOString(),
        role: (result.user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || 'USER',
      };

      setUser(newUser);
      localStorage.setItem('authToken', 'auth-token');
      localStorage.setItem('userData', JSON.stringify(newUser));
      localStorage.setItem('loginTime', Date.now().toString());
      return { success: true, requireOtp: false };
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Registration failed. Please try again.';
      console.log('Registration failed:', message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string) => {
    setIsLoading(true);
    try {
      const result = await trpc.verifyRegistrationOtp({ email, otp });
      
      const newUser: User = {
        id: result.user.id.toString(),
        email: result.user.email,
        fullName: result.user.fullName,
        avatar: result.user.avatar,
        createdAt: new Date().toISOString(),
        role: (result.user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN') || 'USER',
      };

      setUser(newUser);
      localStorage.setItem('authToken', 'auth-token');
      localStorage.setItem('userData', JSON.stringify(newUser));
      localStorage.setItem('loginTime', Date.now().toString());
      return { success: true };
    } catch (error: unknown) {
      const message = (error as { message?: string })?.message || 'Invalid OTP. Please try again.';
      console.log('OTP verification failed:', message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // Clear better-auth session (Google OAuth)
    try {
      await authClient.signOut();
    } catch {
      // Session may not exist for manual login users, that's fine
    }
    // Clear localStorage (manual login)
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    localStorage.removeItem('loginTime');
    localStorage.removeItem('cartSessionId');
  };

  const updateProfile = async (userData: Partial<User>) => {
    setIsLoading(true);
    try {
      if (user) {
        // If updating avatar, use the backend endpoint
        if (userData.avatar) {
          const result = await trpc.updateAvatar({
            id: user.id,
            avatar: userData.avatar
          });
          const updatedUser = { ...user, avatar: result.user.avatar };
          setUser(updatedUser);
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        } else {
          const updatedUser = { ...user, ...userData };
          setUser(updatedUser);
          localStorage.setItem('userData', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    loginWithGoogle,
    register,
    verifyOtp,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
