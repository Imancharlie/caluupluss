import axios from 'axios';
import { toast } from 'sonner';
import { mockApiResponses } from './mockDataService';
import { createSSEWithToken, isSSESupported } from '@/utils/sseAuth';

const api = axios.create({
  baseURL: '/api', // Use proxy from vite.config.ts
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export interface NotificationItem {
  id: string | number;
  title: string;
  body: string;
  created_at: string;
  is_read: boolean;
  type?: 'info' | 'success' | 'warning' | 'error' | 'course' | 'grade' | 'system' | 'slide' | 'announcement';
  link?: string;
  slide?: {
    id: string | number;
    title: string;
    description: string;
    image_url?: string;
    link_url?: string;
  }; // Associated slide data if notification is about a slide
  read_at?: string | null;
}

export interface NotificationResponse {
  notifications: NotificationItem[];
  page: number;
  page_size: number;
  total_count: number;
  has_next: boolean;
  has_previous: boolean;
}

export async function fetchUnreadCount(): Promise<number> {
  try {
    const { data } = await api.get('/notifications/unread-count/');
    return data?.unread || 0;
  } catch (error) {
    console.warn('Failed to fetch unread count, using mock data:', error);
    // Return mock data if backend is not ready
    return mockApiResponses.unreadCount.unread;
  }
}

// Fetch only unread notifications
export async function fetchUnreadNotifications(params?: { page?: number; page_size?: number }): Promise<NotificationResponse> {
  try {
    const queryParams = {
      ...params,
      is_read: false, // Only unread notifications
    };
    
    const { data } = await api.get('/notifications/', { params: queryParams });
    
    return {
      notifications: data.notifications || [],
      page: data.page || 1,
      page_size: data.page_size || 20,
      total_count: data.total_count || 0,
      has_next: data.has_next || false,
      has_previous: data.has_previous || false,
    };
  } catch (error) {
    console.warn('Failed to fetch unread notifications, using mock data:', error);
    return mockApiResponses.notifications;
  }
}

export async function fetchNotifications(params?: { page?: number; page_size?: number; include_read?: boolean }): Promise<NotificationResponse> {
  try {
    // Always include both read and unread notifications
    // Try multiple common parameter names that backends might use
    const queryParams = {
      ...params,
      include_read: true, // Explicitly request all notifications
      show_all: true, // Alternative parameter name
      all: true, // Another alternative
      read_status: 'all', // Another common pattern
    };
    
    const { data } = await api.get('/notifications/', { params: queryParams });
    
    // Handle the exact backend response format
    const notifications = data.notifications || [];
    
    // Sort notifications: unread first, then read
    const sortedNotifications = notifications.sort((a: NotificationItem, b: NotificationItem) => {
      // Unread notifications first (is_read: false)
      if (a.is_read !== b.is_read) {
        return a.is_read ? 1 : -1;
      }
      // Then sort by created_at (newest first)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
    
    return {
      notifications: sortedNotifications,
      page: data.page || 1,
      page_size: data.page_size || 20,
      total_count: data.total_count || 0,
      has_next: data.has_next || false,
      has_previous: data.has_previous || false,
    };
  } catch (error) {
    console.warn('Failed to fetch notifications, using mock data:', error);
    // Return mock data if backend is not ready
    return mockApiResponses.notifications;
  }
}

export async function markAsRead(id: string | number): Promise<void> {
  try {
    await api.post(`/notifications/${id}/read/`);
    toast.success('Notification marked as read');
  } catch (error) {
    console.warn('Failed to mark notification as read:', error);
    toast.error('Failed to mark notification as read');
    throw error; // Re-throw to show error in UI
  }
}

export async function markAllAsRead(): Promise<void> {
  try {
    await api.post('/notifications/mark-all-read/');
    toast.success('All notifications marked as read');
  } catch (error) {
    console.warn('Failed to mark all notifications as read:', error);
    toast.error('Failed to mark all notifications as read');
    throw error; // Re-throw to show error in UI
  }
}

export async function deleteNotification(id: string | number): Promise<void> {
  try {
    await api.delete(`/notifications/${id}/`);
    toast.success('Notification deleted');
  } catch (error) {
    console.warn('Failed to delete notification:', error);
    toast.error('Failed to delete notification');
    throw error; // Re-throw to show error in UI
  }
}


// Real-time notification updates using Server-Sent Events (SSE)
export class NotificationSSE {
  private eventSource: EventSource | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private token: string | null = null;
  private isConnecting = false;

  constructor(private onNotification: (notification: NotificationItem) => void) {
    this.token = localStorage.getItem('token');
  }

  connect() {
    if (this.isConnecting || this.eventSource) {
      return; // Prevent multiple connections
    }

    if (!this.token) {
      console.warn('No authentication token available for SSE connection');
      return;
    }

    if (!isSSESupported()) {
      console.warn('Server-Sent Events are not supported in this browser');
      return;
    }

    this.isConnecting = true;
    const sseUrl = `http://localhost:8000/api/notifications/stream/`;
    
    try {
      // Create EventSource with authentication token
      this.eventSource = createSSEWithToken(sseUrl, this.token);

      this.eventSource.onopen = () => {
        console.log('SSE connected successfully');
        this.reconnectAttempts = 0;
        this.isConnecting = false;
      };

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('Received SSE notification:', data);
          
          // Process the notification data according to your backend format
          const notification: NotificationItem = {
            id: data.id,
            title: data.title,
            body: data.body,
            created_at: data.created_at,
            is_read: data.is_read,
            type: data.type,
            link: data.link,
          };
          
          this.onNotification(notification);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnecting = false;
        this.reconnect();
      };

      // Handle specific event types
      this.eventSource.addEventListener('notification', (event) => {
        try {
          const data = JSON.parse(event.data);
          const notification: NotificationItem = {
            id: data.id,
            title: data.title,
            body: data.body,
            created_at: data.created_at,
            is_read: data.is_read,
            type: data.type,
            link: data.link,
          };
          this.onNotification(notification);
        } catch (error) {
          console.error('Failed to parse notification event:', error);
        }
      });

      // Handle connection close
      this.eventSource.addEventListener('close', () => {
        console.log('SSE connection closed by server');
        this.isConnecting = false;
        this.reconnect();
      });

    } catch (error) {
      console.error('Failed to create SSE connection:', error);
      this.isConnecting = false;
      this.reconnect();
    }
  }

  private reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
      
      setTimeout(() => {
        console.log(`Reconnecting SSE... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.disconnect();
        this.connect();
      }, delay);
    } else {
      console.error('Max reconnection attempts reached for SSE');
      this.isConnecting = false;
    }
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.isConnecting = false;
  }

  // Update token when user logs in/out
  updateToken(newToken: string | null) {
    this.token = newToken;
    if (this.eventSource) {
      this.disconnect();
      if (newToken) {
        // Small delay to ensure clean disconnection
        setTimeout(() => {
          this.connect();
        }, 100);
      }
    }
  }

  // Check if connected
  get isConnected() {
    return this.eventSource?.readyState === EventSource.OPEN;
  }

  // Get connection state
  get connectionState() {
    if (!this.eventSource) return 'disconnected';
    switch (this.eventSource.readyState) {
      case EventSource.CONNECTING: return 'connecting';
      case EventSource.OPEN: return 'open';
      case EventSource.CLOSED: return 'closed';
      default: return 'unknown';
    }
  }
}