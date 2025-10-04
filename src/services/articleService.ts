import { toast } from 'sonner';
import api from '@/lib/api';

export interface Article {
  id: string | number;
  title: string;
  content: string;
  excerpt: string;
  cover_image: string;
  category: ArticleCategory;
  tags: string[];
  author: {
    id: string | number;
    name: string;
    avatar?: string;
  };
  published_at: string;
  updated_at: string;
  read_time: number; // in minutes
  views: number;
  likes: number;
  is_liked: boolean;
  is_saved: boolean;
  is_shared: boolean;
  share_count: number;
  status: 'published' | 'draft' | 'archived';
}

export interface ArticleCategory {
  id: string | number;
  name: string;
  slug: string;
  description: string;
  color: string;
  icon: string;
}

export interface ArticleResponse {
  results: Article[];
  count: number;
  next?: string | null;
  previous?: string | null;
}

export interface ArticleFilters {
  category?: string;
  search?: string;
  tags?: string[];
  author?: string;
  sort_by?: 'newest' | 'oldest' | 'popular' | 'trending';
  page?: number;
  page_size?: number;
}

// Fetch articles with filters
export async function fetchArticles(filters?: ArticleFilters): Promise<ArticleResponse> {
  try {
    const { data } = await api.get('/articles/', { params: filters });
    // Normalize both array and paginated responses
    if (Array.isArray(data)) {
      return { results: data as Article[], count: (data as Article[]).length, next: null, previous: null };
    }
    return data;
  } catch (error) {
    // Propagate error to UI; no fallback/mocks
    throw error;
  }
}

// Fetch single article
export async function fetchArticle(id: string | number): Promise<Article> {
  try {
    const { data } = await api.get(`/articles/${id}/`);
    return data;
  } catch (error) {
    // Propagate error to UI; no fallback/mocks
    throw error;
  }
}

// Track a view for an article (increments view count)
export async function trackArticleView(id: string | number): Promise<{ views: number } | void> {
  try {
    const { data } = await api.post(`/articles/${id}/view/`);
    return data;
  } catch (error) {
    // Silently ignore if backend doesn't provide this endpoint
    return;
  }
}

// Fetch article categories
export async function fetchArticleCategories(): Promise<ArticleCategory[]> {
  try {
    const { data } = await api.get('/articles/categories/');
    return data.results || data;
  } catch (error) {
    console.warn('Failed to fetch categories, using mock data:', error);
    return getMockCategories();
  }
}

// Like/Unlike article
export async function toggleLike(articleId: string | number): Promise<{ is_liked: boolean; likes: number }> {
  try {
    const { data } = await api.post(`/articles/${articleId}/like/`);
    toast.success(data.is_liked ? 'Article liked!' : 'Article unliked');
    return data;
  } catch (error) {
    console.error('Failed to toggle like:', error);
    toast.error('Failed to update like status');
    throw error;
  }
}

// Save/Unsave article
export async function toggleSave(articleId: string | number): Promise<{ is_saved: boolean }> {
  try {
    const { data } = await api.post(`/articles/${articleId}/save/`);
    toast.success(data.is_saved ? 'Article saved!' : 'Article removed from saved');
    return data;
  } catch (error) {
    console.error('Failed to toggle save:', error);
    toast.error('Failed to update save status');
    throw error;
  }
}

// Share article
export async function shareArticle(articleId: string | number, platform: string): Promise<{ share_count: number }> {
  try {
    const { data } = await api.post(`/articles/${articleId}/share/`, { platform });
    toast.success('Article shared successfully!');
    return data;
  } catch (error) {
    console.error('Failed to share article:', error);
    toast.error('Failed to share article');
    throw error;
  }
}

// Get saved articles
export async function fetchSavedArticles(): Promise<ArticleResponse> {
  try {
    const { data } = await api.get('/articles/saved/');
    return data;
  } catch (error) {
    throw error;
  }
}

// Mock data for development
export function getMockCategories(): ArticleCategory[] {
  return [
    {
      id: 1,
      name: 'Life & General',
      slug: 'life-general',
      description: 'Articles about life experiences, personal growth, and general topics',
      color: 'bg-blue-500',
      icon: '🌱',
    },
    {
      id: 2,
      name: 'Academics',
      slug: 'academics',
      description: 'Study tips, academic success, and educational content',
      color: 'bg-green-500',
      icon: '📚',
    },
    {
      id: 3,
      name: 'Self Awareness',
      slug: 'self-awareness',
      description: 'Personal development, mindfulness, and self-improvement',
      color: 'bg-purple-500',
      icon: '🧘',
    },
    {
      id: 4,
      name: 'Relationships',
      slug: 'relationships',
      description: 'Building connections, communication, and social skills',
      color: 'bg-pink-500',
      icon: '💕',
    },
    {
      id: 5,
      name: 'Career',
      slug: 'career',
      description: 'Professional development and career guidance',
      color: 'bg-orange-500',
      icon: '💼',
    },
    {
      id: 6,
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Physical and mental health, fitness, and wellness',
      color: 'bg-red-500',
      icon: '🏃',
    },
  ];
}

export function getMockArticles(filters?: ArticleFilters): ArticleResponse {
  const mockArticles: Article[] = [
    {
      id: 1,
      title: 'The Art of Time Management: A Student\'s Guide',
      content: 'Time management is one of the most crucial skills for academic success...',
      excerpt: 'Learn effective time management strategies that will help you balance studies, social life, and personal growth.',
      cover_image: '/blog/time-management.jpg',
      category: {
        id: 2,
        name: 'Academics',
        slug: 'academics',
        description: 'Study tips and academic success',
        color: 'bg-green-500',
        icon: '📚',
      },
      tags: ['time-management', 'productivity', 'study-tips'],
      author: {
        id: 1,
        name: 'Dr. Sarah Johnson',
        avatar: '/blog/author1.jpg',
      },
      published_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read_time: 8,
      views: 1250,
      likes: 89,
      is_liked: false,
      is_saved: false,
      is_shared: false,
      share_count: 23,
      status: 'published',
    },
    {
      id: 2,
      title: 'Building Meaningful Relationships in College',
      content: 'College is not just about academics; it\'s also about building lasting relationships...',
      excerpt: 'Discover how to form genuine connections and maintain healthy relationships during your college years.',
      cover_image: '/blog/relationships.jpg',
      category: {
        id: 4,
        name: 'Relationships',
        slug: 'relationships',
        description: 'Building connections and communication',
        color: 'bg-pink-500',
        icon: '💕',
      },
      tags: ['relationships', 'social-skills', 'college-life'],
      author: {
        id: 2,
        name: 'Michael Chen',
        avatar: '/blog/author2.jpg',
      },
      published_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      read_time: 12,
      views: 2100,
      likes: 156,
      is_liked: true,
      is_saved: true,
      is_shared: false,
      share_count: 45,
      status: 'published',
    },
    {
      id: 3,
      title: 'Mindfulness and Mental Health for Students',
      content: 'Taking care of your mental health is as important as your academic performance...',
      excerpt: 'Explore mindfulness techniques and mental health practices specifically designed for students.',
      cover_image: '/blog/mindfulness.jpg',
      category: {
        id: 3,
        name: 'Self Awareness',
        slug: 'self-awareness',
        description: 'Personal development and mindfulness',
        color: 'bg-purple-500',
        icon: '🧘',
      },
      tags: ['mindfulness', 'mental-health', 'self-care'],
      author: {
        id: 3,
        name: 'Dr. Emily Rodriguez',
        avatar: '/blog/author3.jpg',
      },
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      read_time: 15,
      views: 3200,
      likes: 234,
      is_liked: false,
      is_saved: true,
      is_shared: false,
      share_count: 67,
      status: 'published',
    },
    {
      id: 4,
      title: 'Career Planning: From Student to Professional',
      content: 'Transitioning from student life to professional career requires careful planning...',
      excerpt: 'Get practical advice on career planning, internships, and building your professional network.',
      cover_image: '/blog/career-planning.jpg',
      category: {
        id: 5,
        name: 'Career',
        slug: 'career',
        description: 'Professional development and career guidance',
        color: 'bg-orange-500',
        icon: '💼',
      },
      tags: ['career', 'professional-development', 'networking'],
      author: {
        id: 4,
        name: 'James Wilson',
        avatar: '/blog/author4.jpg',
      },
      published_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      read_time: 10,
      views: 1800,
      likes: 112,
      is_liked: true,
      is_saved: false,
      is_shared: false,
      share_count: 34,
      status: 'published',
    },
    {
      id: 5,
      title: 'The Science of Learning: How to Study Effectively',
      content: 'Understanding how your brain learns can revolutionize your study approach...',
      excerpt: 'Discover evidence-based study techniques that will help you learn more efficiently and retain information longer.',
      cover_image: '/blog/study-science.jpg',
      category: {
        id: 2,
        name: 'Academics',
        slug: 'academics',
        description: 'Study tips and academic success',
        color: 'bg-green-500',
        icon: '📚',
      },
      tags: ['study-techniques', 'learning', 'memory'],
      author: {
        id: 5,
        name: 'Dr. Lisa Park',
        avatar: '/blog/author5.jpg',
      },
      published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
      read_time: 18,
      views: 4500,
      likes: 298,
      is_liked: false,
      is_saved: true,
      is_shared: false,
      share_count: 89,
      status: 'published',
    },
    {
      id: 6,
      title: 'Finding Your Purpose: A Journey of Self-Discovery',
      content: 'Many students struggle with finding their purpose and direction in life...',
      excerpt: 'Learn how to discover your passions, values, and purpose through self-reflection and exploration.',
      cover_image: '/blog/purpose.jpg',
      category: {
        id: 3,
        name: 'Self Awareness',
        slug: 'self-awareness',
        description: 'Personal development and mindfulness',
        color: 'bg-purple-500',
        icon: '🧘',
      },
      tags: ['purpose', 'self-discovery', 'personal-growth'],
      author: {
        id: 6,
        name: 'Alex Thompson',
        avatar: '/blog/author6.jpg',
      },
      published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
      read_time: 14,
      views: 2800,
      likes: 187,
      is_liked: true,
      is_saved: false,
      is_shared: false,
      share_count: 56,
      status: 'published',
    },
  ];

  // Apply filters
  let filteredArticles = mockArticles;

  if (filters?.category) {
    filteredArticles = filteredArticles.filter(article => 
      article.category.slug === filters.category
    );
  }

  if (filters?.search) {
    const searchTerm = filters.search.toLowerCase();
    filteredArticles = filteredArticles.filter(article =>
      article.title.toLowerCase().includes(searchTerm) ||
      article.excerpt.toLowerCase().includes(searchTerm) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchTerm))
    );
  }

  if (filters?.tags && filters.tags.length > 0) {
    filteredArticles = filteredArticles.filter(article =>
      filters.tags!.some(tag => article.tags.includes(tag))
    );
  }

  // Apply sorting
  if (filters?.sort_by) {
    switch (filters.sort_by) {
      case 'newest':
        filteredArticles.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime());
        break;
      case 'oldest':
        filteredArticles.sort((a, b) => new Date(a.published_at).getTime() - new Date(b.published_at).getTime());
        break;
      case 'popular':
        filteredArticles.sort((a, b) => b.views - a.views);
        break;
      case 'trending':
        filteredArticles.sort((a, b) => b.likes - a.likes);
        break;
    }
  }

  return {
    results: filteredArticles,
    count: filteredArticles.length,
    next: null,
    previous: null,
  };
}

export function getMockArticle(id: string | number): Article {
  const articles = getMockArticles().results;
  return articles.find(article => article.id === id) || articles[0];
}

export function getMockSavedArticles(): ArticleResponse {
  const allArticles = getMockArticles().results;
  const savedArticles = allArticles.filter(article => article.is_saved);
  
  return {
    results: savedArticles,
    count: savedArticles.length,
    next: null,
    previous: null,
  };
}




