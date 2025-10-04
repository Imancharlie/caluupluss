import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Bell, CheckCheck, Trash2, ExternalLink, Megaphone, BookOpen, Settings, Image, CheckCircle, AlertTriangle, XCircle, TrendingUp } from 'lucide-react';
import { fetchNotifications, markAllAsRead, markAsRead, deleteNotification, NotificationItem, fetchUnreadCount, NotificationResponse } from '@/services/notificationService';
import { Link, useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Get notification type icon
  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'info':
        return <Bell className="w-4 h-4 text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'course':
        return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'grade':
        return <TrendingUp className="w-4 h-4 text-purple-500" />;
      case 'system':
        return <Settings className="w-4 h-4 text-gray-500" />;
      case 'slide':
        return <Image className="w-4 h-4 text-purple-500" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-blue-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  // Get notification type color
  const getNotificationTypeColor = (type?: string) => {
    switch (type) {
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'course':
        return 'bg-green-100 text-green-800';
      case 'grade':
        return 'bg-purple-100 text-purple-800';
      case 'system':
        return 'bg-gray-100 text-gray-800';
      case 'slide':
        return 'bg-purple-100 text-purple-800';
      case 'announcement':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const { data, isLoading, isError, error } = useQuery<NotificationResponse>({
    queryKey: ['notifications', { page: 1 }],
    queryFn: () => fetchNotifications({ page: 1, page_size: 20 }),
    retry: 1,
    staleTime: 30000, // 30 seconds
  });

  const { data: unreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: fetchUnreadCount,
    staleTime: 15000,
  });

  const markAllMutation = useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const markOneMutation = useMutation({
    mutationFn: (id: string | number) => markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string | number) => deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    },
  });

  return (
    <div className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Notifications</h1>
          
        </div>
        <div className="flex items-center gap-2">
          
          <Button size="sm" onClick={() => markAllMutation.mutate()} disabled={markAllMutation.isPending || (unreadCount ?? 0) === 0}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all as read
          </Button>
        </div>
      </div>
      <Separator />

      {isLoading && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      )}

      {isError && (
        <div className="mt-6 text-center">
          <div className="text-sm text-red-600 mb-2">Failed to load notifications.</div>
          <div className="text-xs text-gray-500">
            {error?.message || 'The notification service may not be available yet.'}
          </div>
          <button 
            onClick={() => queryClient.invalidateQueries({ queryKey: ['notifications'] })}
            className="mt-2 text-xs text-blue-600 hover:underline"
          >
            Try again
          </button>
        </div>
      )}

      {!isLoading && !isError && (
        <div className="mt-4 space-y-3">
          {data?.notifications?.length ? data.notifications.map((n: NotificationItem) => (
            <Card key={n.id} className={`p-3 ${n.is_read ? '' : 'bg-orange-50 dark:bg-orange-950/20'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {!n.is_read && <span className="inline-block w-2 h-2 rounded-full bg-orange-500" />}
                    <div className="flex items-center gap-2">
                      {getNotificationIcon(n.type)}
                      <h3 className="font-medium">{n.title}</h3>
                    </div>
                    {n.type && (
                      <Badge className={`text-xs ${getNotificationTypeColor(n.type)}`}>
                        {n.type}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{n.body}</p>
                  <div className="text-xs text-gray-500 mt-1">{new Date(n.created_at).toLocaleString()}</div>
                  {n.link && (
                    <Link to={n.link} className="inline-flex items-center text-sm text-blue-600 hover:underline mt-1">
                      Open <ExternalLink className="w-3 h-3 ml-1" />
                    </Link>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!n.is_read && (
                    <Button size="sm" variant="secondary" onClick={() => markOneMutation.mutate(n.id)} disabled={markOneMutation.isPending}>Mark read</Button>
                  )}
                  <Button size="icon" variant="ghost" onClick={() => deleteMutation.mutate(n.id)} disabled={deleteMutation.isPending}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          )) : (
            <div className="text-center mt-6">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <div className="text-sm text-gray-500">No notifications yet.</div>
              <div className="text-xs text-gray-400 mt-1">You'll see important updates here when they arrive.</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Notifications;


