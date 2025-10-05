import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { AxiosError } from 'axios';
import academicApi from '@/services/academicApi';

interface User {
  id: string;
  email: string;
  display_name: string;
  gender?: string;
  phone_number?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    password_confirm: string,
    display_name: string,
    gender?: string,
    phone_number?: string
  ) => Promise<{ id: string; email: string; display_name: string; gender?: string; phone_number?: string }>;
  signOut: () => void;
  checkAuth: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  resetPassword: (token: string, newPassword: string) => Promise<void>;
}

interface ApiError {
  error?: string;
  detail?: string;
  non_field_errors?: string[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { setUser: setStoreUser } = useAppStore();
  const { toast, toastSuccess, toastError } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      if (token && savedUser) {
        try {
          // Try to validate the token by getting user profile
          const profile = await academicApi.getStudentProfile();
          
          if (profile) {
            // Use the saved user data from localStorage, not profile data
            // Profile data contains academic info, not user personal info
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setStoreUser(userData);
            // Don't overwrite user data with profile data
          }
        } catch (error: any) {
          // If profile doesn't exist (404), that's okay for new users
          if (error.response?.status === 404) {
            console.log("No student profile found - user needs to complete setup");
            // Keep the user logged in but without profile data
            const userData = JSON.parse(savedUser);
            setUser(userData);
            setStoreUser(userData);
          } else {
            // For other errors, clear auth data
            console.error("Token validation failed:", error);
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setUser(null);
          }
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const checkAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setUser(null);
        return;
      }
      
      // Get user profile to validate token
      const profile = await academicApi.getStudentProfile();
        
      if (profile) {
        const userData = {
          id: profile.id,
          email: profile.university?.name || 'User',
          display_name: profile.program?.name || 'Student'
        };
        
        setUser(userData);
        setStoreUser(userData as any);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('Auth check failed:', error);
      // If profile doesn't exist (404), that's okay for new users
      if (error.response?.status === 404) {
        console.log("No student profile found - user needs to complete setup");
        // Keep the user logged in but without profile data
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string) => {
    try {
      console.log('[Auth] signInWithEmail payload', { email, passwordMasked: password ? '***' : '' });
      const response = await academicApi.login(email, password);
      
      const { user, token } = response;
      
      // Store auth data
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      setUser(user);
      setStoreUser(user as any);
      setLoading(false);
      toastSuccess({ title: 'Successfully signed in!' });
    } catch (error) {
      const axiosError = error as AxiosError<any>;
      console.error('[Auth] Login error details', {
        status: axiosError.response?.status,
        data: axiosError.response?.data,
        headers: axiosError.response?.headers,
      });
      if (axiosError.code === 'ERR_NETWORK') {
        toastError({ title: 'Network error: Cannot connect to the server.' });
      } else {
        const data = axiosError.response?.data as any;
        const messages: string[] = [];
        if (typeof data === 'string') messages.push(data);
        if (data?.detail) messages.push(data.detail);
        if (data?.error) messages.push(data.error);
        if (Array.isArray(data?.non_field_errors)) messages.push(...data.non_field_errors);
        if (data?.email) messages.push(`email: ${Array.isArray(data.email) ? data.email.join(', ') : String(data.email)}`);
        if (data?.password) messages.push(`password: ${Array.isArray(data.password) ? data.password.join(', ') : String(data.password)}`);
        toastError({ title: messages.filter(Boolean).join(' | ') || 'Failed to sign in' });
      }
      throw error;
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string, password_confirm: string, display_name: string, gender?: string, phone_number?: string) => {
    try {
      const response = await academicApi.register(email, password, password_confirm, display_name, gender, phone_number);
      // Backend returns { user, token }
      const { user: newUser, token } = response;
      if (token && newUser) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
        setStoreUser(newUser as any);
        setLoading(false);
        toastSuccess({ title: 'Account created! You are now signed in.' });
      }
      return newUser;
    } catch (error) {
      console.error("Registration error:", error);
      const axiosError = error as AxiosError<ApiError>;

      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error('Network error: Cannot connect to the server. Please check your internet connection.');
      }

      // Handle 400 status specifically for email already exists
      if (axiosError.response?.status === 400) {
        const errorData = axiosError.response.data;
        
        // Check for email field specific errors (like the pattern you mentioned)
        if (errorData?.email && Array.isArray(errorData.email)) {
          const emailErrors = errorData.email;
          if (emailErrors.some((error: string) => error.includes('already exists'))) {
            throw new Error("This email is already registered. Please use a different email or sign in.");
          }
        }
        
        // Check for general error message
        if (errorData?.error) {
          const errorMessage = errorData.error         
          if (errorMessage.includes("already exists") || 
              errorMessage.includes("A user with this email already exists") ||
              errorMessage.includes("email already registered")) {
            throw new Error("This email is already registered. Please use a different email or sign in.");
          } else if (errorMessage.includes("Please provide email and password")) {
            throw new Error("Please provide both email and password.");
          } else if (errorMessage.includes("invalid")) {
            throw new Error("Invalid registration data. Please check your information and try again.");
          } else if (errorMessage.includes("password")) {
            throw new Error("Invalid password format. Please ensure it meets the requirements.");
          } else if (errorMessage.includes("email")) {
            throw new Error("Invalid email format. Please enter a valid email address.");
          } else {
            throw new Error(errorMessage);
          }
        }
      }

      // Handle other error cases
      if (axiosError.response?.data?.error) {
        const errorMessage = axiosError.response.data.error;

        if (errorMessage.includes("already exists")) {
          throw new Error("This email is already registered. Please use a different email or sign in.");
        } else if (errorMessage.includes("invalid")) {
          throw new Error("Invalid registration data. Please check your information and try again.");
        } else if (errorMessage.includes("password")) {
          throw new Error("Invalid password format. Please ensure it meets the requirements.");
        } else if (errorMessage.includes("email")) {
          throw new Error("Invalid email format. Please enter a valid email address.");
        } else if (errorMessage.includes("IntegrityError")) {
          throw new Error("This email is already registered. Please use a different email or sign in.");
        } else {
          throw new Error(errorMessage);
        }
      }

      throw new Error('Failed to register. Please try again later.');
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toastSuccess({ title: 'Successfully signed out!' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to sign out';
      toastError({ title: errorMessage });
      
      // Even if the server request fails, clear the local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      // Note: Password reset endpoints not implemented in your backend yet
      // This is a placeholder for future implementation
      toastSuccess({ title: 'Password reset feature coming soon' });
    } catch (error) {
      console.error("Password reset request error:", error);
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.code === 'ERR_NETWORK') {
        toastError({ title: 'Network error: Cannot connect to the server. Please check your internet connection.' });
      } else {
        const errorMessage = axiosError.response?.data?.error || 'Failed to request password reset';
        toastError({ title: errorMessage });
      }
      throw error;
    }
  }, []);

  const resetPassword = useCallback(async (token: string, newPassword: string) => {
    try {
      // Note: Password reset endpoints not implemented in your backend yet
      // This is a placeholder for future implementation
      toastSuccess({ title: 'Password reset feature coming soon' });
    } catch (error) {
      console.error("Password reset error:", error);
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.code === 'ERR_NETWORK') {
        toastError({ title: 'Network error: Cannot connect to the server. Please check your internet connection.' });
      } else {
        const errorMessage = axiosError.response?.data?.error || 'Failed to reset password';
        toastError({ title: errorMessage });
      }
      throw error;
    }
  }, []);

  const contextValue = useMemo(() => ({
    user,
    loading,
    signInWithEmail,
    signUp,
    signOut,
    checkAuth,
    requestPasswordReset,
    resetPassword
  }), [user, loading, signInWithEmail, signUp, signOut, checkAuth, requestPasswordReset, resetPassword]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
