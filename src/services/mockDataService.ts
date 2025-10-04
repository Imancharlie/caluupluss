import { NotificationItem } from './notificationService';
import { Slide } from './slideService';

// Mock notification data for testing
export const mockNotifications: NotificationItem[] = [
  {
    id: 1,
    title: 'Welcome to Caluu!',
    body: 'Get started with your academic journey by setting up your profile and adding your courses.',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    is_read: false,
    type: 'system',
    link: '/workplace',
  },
  {
    id: 2,
    title: 'New Slide Added',
    body: 'Check out our latest slide about study tips and academic success strategies.',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // 1 hour ago
    is_read: false,
    type: 'slide',
    link: '/dashboard',
  },
  {
    id: 3,
    title: 'GPA Calculator Updated',
    body: 'We\'ve improved the GPA calculator with new features and better accuracy.',
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
    is_read: true,
    type: 'academic',
    link: '/calculator',
  },
  {
    id: 4,
    title: 'Academic Announcement',
    body: 'Important updates about your academic program and upcoming deadlines.',
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
    is_read: false,
    type: 'announcement',
    link: '/timetable',
  },
];

// Mock slide data for testing - matches backend format
export const mockSlides: Slide[] = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Welcome to CaluuPlus',
    description: 'Your comprehensive academic management platform',
    image: '/media/slides/123e4567-e89b-12d3-a456-426614174000/slide-image.jpg',
    image_url: null,
    image_url_display: 'http://localhost:8000/media/slides/123e4567-e89b-12d3-a456-426614174000/slide-image.jpg',
    display_image: 'http://localhost:8000/media/slides/123e4567-e89b-12d3-a456-426614174000/slide-image.jpg',
    background_gradient: 'from-blue-500 to-purple-500',
    link_url: 'https://caluuplus.com',
    order: 1,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '456e7890-e89b-12d3-a456-426614174001',
    title: 'New Features Available',
    description: 'Check out our latest GPA calculator and course management tools',
    image: null,
    image_url: 'https://example.com/slide-image.jpg',
    image_url_display: 'https://example.com/slide-image.jpg',
    display_image: 'https://example.com/slide-image.jpg',
    background_gradient: 'from-green-500 to-teal-500',
    link_url: 'https://caluuplus.com/features',
    order: 2,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '789e0123-e89b-12d3-a456-426614174002',
    title: 'Learn Smarter',
    description: 'Read curated articles tailored to your academic journey',
    image: null,
    image_url: null,
    image_url_display: null,
    display_image: null,
    background_gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
    link_url: '/articles',
    order: 3,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '012e3456-e89b-12d3-a456-426614174003',
    title: 'Your AI Study Buddy',
    description: 'Chat with Mr Caluu for quick answers and guidance',
    image: null,
    image_url: null,
    image_url_display: null,
    display_image: null,
    background_gradient: 'from-amber-500 via-orange-500 to-red-500',
    link_url: '/chatbot',
    order: 4,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
];

// Mock API responses - updated to match backend format
export const mockApiResponses = {
  notifications: {
    notifications: mockNotifications,
    page: 1,
    page_size: 20,
    total_count: mockNotifications.length,
    has_next: false,
    has_previous: false,
  },
  unreadCount: {
    unread: mockNotifications.filter(n => !n.is_read).length,
  },
  slides: {
    results: mockSlides,
    count: mockSlides.length,
    next: null,
    previous: null,
  },
};
