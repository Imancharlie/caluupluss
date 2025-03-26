
import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<User>;
  signOut: () => void;
  checkAuth: () => Promise<void>;
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

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');
      
      console.log("AuthContext: Checking auth with token:", token ? "exists" : "none");
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // First try to use the saved user data
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUser(parsedUser);
          console.log("AuthContext: Restored user from localStorage", parsedUser);
        } catch (e) {
          console.error("Error parsing saved user data:", e);
          localStorage.removeItem('user');
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Starting signInWithEmail process");
      const response = await axiosInstance.post('/auth/login/', {
        username: email,
        password,
      });
      
      console.log("AuthContext: Login response received:", response.data);
      
      const { token, user } = response.data;
      
      // Create a user object from the response data
      const userData = {
        id: user.id,
        username: user.username,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        is_staff: user.is_staff
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error("AuthContext: Login error:", error);
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to sign in';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      console.log("AuthContext: Starting signUp process");
      console.log("AuthContext: Making registration request with:", {
        email,
        password,
        name
      });

      const response = await axiosInstance.post('/auth/register/', {
        email,
        password,
        name
      });
      
      console.log("AuthContext: Registration response received:", response.data);
      
      const { id, email: userEmail, name: userName, isAdmin } = response.data;
      
      // Create a user object from the response data
      const user = {
        id,
        username: userEmail,
        email: userEmail,
        first_name: userName.split(' ')[0] || '',
        last_name: userName.split(' ').slice(1).join(' ') || '',
        is_staff: isAdmin
      };

      // For registration, we need to sign in separately as our backend doesn't return a token
      await signInWithEmail(email, password);
      
      toast.success('Successfully registered!');
      return user;
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to register';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await axiosInstance.post('/auth/logout/');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to sign out';
      toast.error(errorMessage);
      
      // Even if the server request fails, clear the local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUp, signOut, checkAuth }}>
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
