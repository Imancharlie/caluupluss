import { useEffect, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { NotificationSSE, NotificationItem, fetchUnreadCount, fetchNotifications } from '@/services/notificationService';
import { useAppStore } from '@/store';

export const useNotifications = () => {
  const { user } = useAppStore();
  const queryClient = useQueryClient();
  const sseRef = useRef<NotificationSSE | null>(null);

  // Fetch unread count
  const { data: unreadCount, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 15000,
    refetchInterval: 30000, // Refetch every 30 seconds
    enabled: !!user,
  });

  // Polling for real-time updates (since SSE is having issues)
  useEffect(() => {
    if (user) {
      // Set up polling for notifications every 30 seconds
      const notificationInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications'] });
      }, 30000); // 30 seconds

      // Set up polling for unread count every 10 seconds
      const unreadInterval = setInterval(() => {
        queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      }, 10000); // 10 seconds

      return () => {
        clearInterval(notificationInterval);
        clearInterval(unreadInterval);
      };
    }
  }, [user, queryClient]);

  // Manual refresh function
  const refreshNotifications = () => {
    queryClient.invalidateQueries({ queryKey: ['notifications'] });
    refetchUnreadCount();
  };

  return {
    unreadCount: unreadCount || 0,
    refreshNotifications,
  };
};
