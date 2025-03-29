import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';

// Create axios instance with base URL and CORS settings
const api = axios.create({
  baseURL: 'https://caluu.pythonanywhere.com',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true // This is important for CORS
});

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
      
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      
      // Validate token with backend
      try {
        const response = await api.get('/api/auth/check/', {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
        
        if (response.data && response.data.user) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Token validation failed:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const response = await api.post('/api/auth/login/', {
        username: email,
        password,
      });
      
      const { token, user_id, username, is_staff } = response.data;
      
      // Create a user object from the response data
      const userData = {
        id: user_id,
        username: username,
        email: username, // Django uses email as username
        first_name: '', // These will be populated from the user profile endpoint
        last_name: '',
        is_staff: is_staff
      };

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      toast.success('Successfully signed in!');
    } catch (error) {
      console.error("Login error:", error);
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.code === 'ERR_NETWORK') {
        toast.error('Network error: Cannot connect to the server. Please check your internet connection.');
      } else {
        const errorMessage = axiosError.response?.data?.error || 'Failed to sign in';
        toast.error(errorMessage);
      }
      
      throw error;
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const response = await api.post('/api/auth/register/', {
        email,
        password,
        name
      });
      
      // Try to sign in immediately after registration
      try {
        await signInWithEmail(email, password);
        
        // Create a user object from the registration data
        const user = {
          id: response.data?.id || 0,
          username: email,
          email: email,
          first_name: name.split(' ')[0] || '',
          last_name: name.split(' ').slice(1).join(' ') || '',
          is_staff: false
        };

        return user;
      } catch (signInError) {
        console.error("Error during post-registration sign in:", signInError);
        throw new Error("Registration successful but automatic sign in failed. Please try signing in manually.");
      }
    } catch (error) {
      console.error("Registration error:", error);
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error('Network error: Cannot connect to the server. Please check your internet connection.');
      }

      // Handle specific backend error messages
      if (axiosError.response?.data?.error) {
        const errorMessage = axiosError.response.data.error;
        
        // Map specific error messages
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
  };

  const signOut = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await api.post('/api/auth/logout/', {}, {
          headers: {
            'Authorization': `Token ${token}`
          }
        });
      }
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
