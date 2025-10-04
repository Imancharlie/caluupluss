import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true
});

// Add request interceptor to handle token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle 401/403 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

interface User {
  id?: string | number;
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  is_staff?: boolean;
  profile_picture?: string;
  phone_number?: string;
  gender?: string;
}

interface UserBalance {
  available_tokens: number;
  total_tokens: number;
  used_tokens: number;
}

interface AppStore {
  // User state
  user: User | null;
  userBalance: UserBalance | null;
  balanceLoading: boolean;
  
  // UI state
  theme: 'orange' | 'purple' | 'green';
  darkMode: boolean;
  sidebarCollapsed: boolean;
  sidebarOpen: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setUserBalance: (balance: UserBalance | null) => void;
  setBalanceLoading: (loading: boolean) => void;
  fetchUserBalance: () => Promise<void>;
  fetchUserBasicDetails: () => Promise<void>;
  logout: () => void;
  fastLogout: () => void;
  setTheme: (theme: 'orange' | 'purple' | 'green') => void;
  setDarkMode: (darkMode: boolean) => void;
  toggleDarkMode: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      userBalance: null,
      balanceLoading: false,
      theme: 'orange',
      darkMode: false,
      sidebarCollapsed: false,
      sidebarOpen: false,

      // Actions
      setUser: (user) => set({ user }),
      
      setUserBalance: (userBalance) => set({ userBalance }),
      
      setBalanceLoading: (balanceLoading) => set({ balanceLoading }),
      
      fetchUserBalance: async () => {
        const { user } = get();
        if (!user) return;
        
        set({ balanceLoading: true });
        try {
          const response = await api.get('/api/user/balance/');
          set({ userBalance: response.data, balanceLoading: false });
        } catch (error) {
          console.error('Failed to fetch user balance:', error);
          set({ balanceLoading: false });
        }
      },

      fetchUserBasicDetails: async () => {
        try {
          const response = await api.get('/api/user/basic-details/');
          const data = response.data as Partial<User>;
          set({ user: { ...(get().user || {}), ...data } });
        } catch (error) {
          console.error('Failed to fetch basic details:', error);
        }
      },
      
      logout: async () => {
        try {
          const token = localStorage.getItem('token');
          if (token) {
            await api.post('/api/auth/logout/', {}, {
              headers: {
                'Authorization': `Token ${token}`
              }
            });
          }
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          set({ user: null, userBalance: null });
        }
      },
      
      fastLogout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        set({ user: null, userBalance: null });
      },
      
      setTheme: (theme) => set({ theme }),
      
      setDarkMode: (darkMode) => set({ darkMode }),
      
      toggleDarkMode: () => {
        const { darkMode } = get();
        set({ darkMode: !darkMode });
      },
      
      setSidebarCollapsed: (sidebarCollapsed) => set({ sidebarCollapsed }),
      
      setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
      
      toggleSidebar: () => {
        const { sidebarCollapsed } = get();
        set({ sidebarCollapsed: !sidebarCollapsed });
      },
    }),
    {
      name: 'app-store',
      partialize: (state) => ({
        user: state.user,
        theme: state.theme,
        darkMode: state.darkMode,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);



