import React, { createContext, useContext, useState, useEffect } from 'react';
import axiosInstance from '@/lib/axios';
import { toast } from 'sonner';
import { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';

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
      
      // Validate token with backend
      try {
        const response = await axiosInstance.get('/auth/check/');
        if (response.data && response.data.user) {
          setUser(response.data.user);
          console.log("AuthContext: Token validated, user restored", response.data.user);
        } else {
          throw new Error('Invalid user data');
        }
      } catch (error) {
        console.error("AuthContext: Token validation failed:", error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
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
      console.error("AuthContext: Login error:", error);
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
      
      // Even if we get a 500 error but the user was created, we can proceed with sign in
      try {
        // Try to sign in immediately after registration
        console.log("AuthContext: Attempting to sign in after registration");
        await signInWithEmail(email, password);
        console.log("AuthContext: Successfully signed in after registration");
        
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
        console.error("AuthContext: Error during post-registration sign in:", signInError);
        // If sign in fails, throw a more specific error
        throw new Error("Registration successful but automatic sign in failed. Please try signing in manually.");
      }
    } catch (error) {
      console.error("AuthContext: Registration error:", error);
      const axiosError = error as AxiosError<ApiError>;
      
      if (axiosError.code === 'ERR_NETWORK') {
        throw new Error('Network error: Cannot connect to the server. Please check your internet connection.');
      }

      // Handle 500 Internal Server Error
      if (axiosError.response?.status === 500) {
        // Check if the error response contains any specific information
        const errorMessage = axiosError.response.data?.error || 'Server error occurred';
        console.log("AuthContext: 500 error details:", errorMessage);
        
        // If we get a 500 but the user might have been created, try to sign in
        try {
          console.log("AuthContext: Attempting to sign in despite 500 error");
          await signInWithEmail(email, password);
          console.log("AuthContext: Successfully signed in despite 500 error");
          
          // Create a user object
          const user = {
            id: 0, // We don't have the ID from the 500 response
            username: email,
            email: email,
            first_name: name.split(' ')[0] || '',
            last_name: name.split(' ').slice(1).join(' ') || '',
            is_staff: false
          };

          return user;
        } catch (signInError) {
          console.error("AuthContext: Error during recovery sign in:", signInError);
          throw new Error("Registration might have succeeded. Please try signing in manually.");
        }
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
