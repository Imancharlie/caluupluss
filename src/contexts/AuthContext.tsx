import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from 'react-hot-toast';
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
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
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
      if (token) {
        const response = await axiosInstance.get('/auth/check/');
        setUser(response.data.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log("AuthContext: Starting signInWithEmail process");
      const response = await axiosInstance.post('/login/', {
        username: email,
        password,
      });
      
      console.log("AuthContext: Login response received:", response.data);
      
      const { token, user_id, username, is_staff } = response.data;
      
      // Create a user object from the response data
      const user = {
        id: user_id,
        username: username,
        email: username, // Since we're using email as username
        first_name: '', // These will be populated when we fetch user details
        last_name: '',
        is_staff: is_staff
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
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
      const [firstName, ...lastNameParts] = name.split(' ');
      const lastName = lastNameParts.join(' ');
      
      console.log("AuthContext: Making registration request with:", {
        username: email,
        email,
        first_name: firstName,
        last_name: lastName
      });

      const response = await axiosInstance.post('/auth/register/', {
        username: email,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      });

      console.log("AuthContext: Registration response received:", response.data);

      const { token, user } = response.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      toast.success('Successfully signed up!');
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to sign up';
      toast.error(errorMessage);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await axiosInstance.post('/logout/');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Successfully signed out!');
    } catch (error) {
      const axiosError = error as AxiosError<ApiError>;
      const errorMessage = axiosError.response?.data?.error || 'Failed to sign out';
      toast.error(errorMessage);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInWithEmail, signUp, signOut }}>
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