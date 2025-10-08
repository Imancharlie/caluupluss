import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Heart, 
  Bookmark, 
  Share2, 
  Eye, 
  Clock,
  Calendar,
  User,
  Tag,
  ChevronDown,
  Grid,
  List,
  SortAsc,
  SortDesc
} from 'lucide-react';
import { 
  fetchArticles, 
  toggleLike, 
  toggleSave, 
  shareArticle,
  Article, 
  ArticleFilters 
} from '@/services/articleService';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Tag type from backend: can be a string or an object with name/slug
type TagLike = string | { name?: string; slug?: string };

const Articles: React.FC = () => {
  const navigate = useNavigate();
  const { toast, toastSuccess, toastError } = useToast();
  const [filters, setFilters] = useState<ArticleFilters>({
    page: 1,
    page_size: 12,
    sort_by: 'newest',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch articles
  const { data: articlesData, isLoading, error, refetch } = useQuery({
    queryKey: ['articles', filters],
    queryFn: () => fetchArticles(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // No categories endpoint in backend; omit fetching categories

  const articles = articlesData?.results || [];
  const totalCount = articlesData?.count || 0;
  const likedLocal: Record<string, boolean> = (() => {
    try {
      return JSON.parse(localStorage.getItem('likedArticles') || '{}');
    } catch { return {}; }
  })();

  // Handle search
  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters(prev => ({ ...prev, search: value, page: 1 }));
  };

  // Handle category filter
  const handleCategoryFilter = (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setFilters(prev => ({ 
      ...prev, 
      category: categorySlug || undefined, 
      page: 1 
    }));
  };

  // Handle sort
  const handleSort = (sortBy: ArticleFilters['sort_by']) => {
    setFilters(prev => ({ ...prev, sort_by: sortBy }));
  };

  // Handle like
  const handleLike = async (articleId: string | number) => {
    try {
      // Update localStorage immediately for instant UI feedback
      const key = 'likedArticles';
      const raw = localStorage.getItem(key);
      const likedArticles: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      const articleKey = String(articleId);
      const isCurrentlyLiked = likedArticles[articleKey] || false;
      
      // Toggle the like status
      likedArticles[articleKey] = !isCurrentlyLiked;
      localStorage.setItem(key, JSON.stringify(likedArticles));
      
      // Update the UI immediately by refetching
      refetch();
      
      // Call the backend API
      await toggleLike(articleId);
    } catch (error) {
      console.error('Failed to toggle like:', error);
      // Revert localStorage change on error
      const key = 'likedArticles';
      const raw = localStorage.getItem(key);
      const likedArticles: Record<string, boolean> = raw ? JSON.parse(raw) : {};
      const articleKey = String(articleId);
      const isCurrentlyLiked = likedArticles[articleKey] || false;
      likedArticles[articleKey] = !isCurrentlyLiked;
      localStorage.setItem(key, JSON.stringify(likedArticles));
      refetch();
    }
  };

  // Handle save
  const handleSave = async (articleId: string | number) => {
    try {
      // Save minimal article data for offline reading
      const key = 'savedArticles';
      const raw = localStorage.getItem(key);
      const obj: Record<string, unknown> = raw ? JSON.parse(raw) : {};
      const a = articles.find(a => String(a.id) === String(articleId));
      if (a) obj[String(articleId)] = a;
      localStorage.setItem(key, JSON.stringify(obj));
      toastSuccess({ title: 'Saved successfully' });
      // Optionally still inform backend if you want a server-side saved list
      // await toggleSave(articleId);
      // refetch();
    } catch (error) {
      console.error('Failed to save offline:', error);
      toastError({ title: 'Failed to save' });
    }
  };

  // Handle share
  const handleShare = async (article: Article) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        toastSuccess({ title: 'Link copied to clipboard!' });
      }
      await shareArticle(article.id, 'web');
      refetch();
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Format read time
  const formatReadTime = (minutes: number) => {
    return `${minutes} min read`;
  };

  return (
    <>
      <Helmet>
        <title>Articles - Caluu Academic Assistant</title>
        <meta name="description" content="Discover insights, tips, and stories to enhance your academic journey. Read articles on study techniques, career guidance, and university life across Tanzanian universities." />
        <meta name="keywords" content="academic articles, study tips, university life, career guidance, Tanzanian universities, student resources, education insights" />
        <meta property="og:title" content="Articles - Caluu Academic Assistant" />
        <meta property="og:description" content="Discover insights, tips, and stories to enhance your academic journey. Read articles on study techniques, career guidance, and university life." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/articles`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Articles - Caluu Academic Assistant" />
        <meta name="twitter:description" content="Discover insights, tips, and stories to enhance your academic journey." />
        <link rel="canonical" href={`${window.location.origin}/articles`} />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Articles
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Discover insights, tips, and stories to enhance your academic journey
            </p>
          </div>
        </div>

        {/* Search and simple filters */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search articles, topics, or authors..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600"
              />
            </div>

        
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Sort Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sort_by}
                    onChange={(e) => handleSort(e.target.value as ArticleFilters['sort_by'])}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-caluu-blue focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="popular">Most Popular</option>
                    <option value="trending">Trending</option>
                  </select>
                </div>

                {/* Results Count */}
                <div className="flex items-end">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    {totalCount} articles found
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* No categories palette (backend has no categories endpoint) */}

        {/* Articles Grid/List */}
        {isLoading ? (
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg">
                <CardContent className="p-6">
                  <Skeleton className="h-48 w-full mb-4" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">No articles available.</div>
        ) : articles.length === 0 ? (
          <div className="text-center py-12">No articles available.</div>
        ) : (
          <div className={`grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3`}>
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                viewMode={'grid'}
                onLike={() => handleLike(article.id)}
                onSave={() => handleSave(article.id)}
                onShare={() => handleShare(article)}
                onOpen={() => navigate(`/articles/${article.id}`)}
                formatDate={formatDate}
                formatReadTime={formatReadTime}
              />
            ))}
          </div>
        )}
        </div>
      </div>
    </>
  );
};

// Article Card Component
interface ArticleCardProps {
  article: Article;
  viewMode: 'grid' | 'list';
  onLike: () => void;
  onSave: () => void;
  onShare: () => void;
  onOpen: () => void;
  formatDate: (date: string) => string;
  formatReadTime: (minutes: number) => string;
}

const ArticleCardComponent: React.FC<ArticleCardProps> = ({
  article,
  viewMode,
  onLike,
  onSave,
  onShare,
  onOpen,
  formatDate,
  formatReadTime,
}) => {
  const likedLocal: Record<string, boolean> = (() => {
    try {
      return JSON.parse(localStorage.getItem('likedArticles') || '{}');
    } catch {
      return {} as Record<string, boolean>;
    }
  })();
  return (
    <Card 
      className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
      onClick={onOpen}
    >
      {viewMode === 'grid' ? (
        <>
          <div className="relative overflow-hidden rounded-t-xl">
            {article.cover_image ? (
              <img
                src={article.cover_image}
                alt={article.title || 'Article'}
                className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-full h-48 bg-gray-100" />
            )}
            <div className="absolute top-4 left-4">
              <Badge className={`${(article.category && article.category.color) ? article.category.color : 'bg-gray-500'} text-white`}>
                {(article.category && article.category.icon) ? article.category.icon : ''} {(article.category && article.category.name) ? article.category.name : 'General'}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8 bg-white/90 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  onSave();
                }}
              >
                <Bookmark className={`w-4 h-4 ${article.is_saved ? 'fill-current text-caluu-blue' : ''}`} />
              </Button>
            </div>
          </div>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-caluu-blue transition-colors">
              {article.title || 'Untitled'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4 line-clamp-3">
              {article.excerpt || ''}
            </p>
            
            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-4">
              {(article.tags as TagLike[] | undefined || [])
                .map((t: TagLike) => typeof t === 'string' ? t : (t.name || t.slug || ''))
                .filter((t: string) => Boolean(t))
                .slice(0, 3)
                .map((tag: string) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    <Tag className="w-3 h-3 mr-1" />
                    {tag}
                  </Badge>
                ))}
            </div>

            {/* Author and Meta */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={article.author?.avatar} />
                  <AvatarFallback className="bg-caluu-blue text-white text-xs">
                    {(article.author?.name?.[0] || 'A').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {article.author?.name || 'Author'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {article.published_at ? formatDate(article.published_at) : ''}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                {formatReadTime(typeof article.read_time === 'number' ? article.read_time : 0)}
              </div>
            </div>

            {/* Stats and Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {typeof article.views === 'number' ? article.views : 0}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-caluu-blue fill-current" />
                  {typeof article.likes === 'number' ? article.likes : 0}
                </div>
                <div className="flex items-center gap-1">
                  <Share2 className="w-4 h-4" />
                  {typeof article.share_count === 'number' ? article.share_count : 0}
                </div>
              </div>
              <div className="flex gap-1">
              
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare();
                  }}
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </>
      ) : null}
    </Card>
  );
};

const ArticleCard = React.memo(ArticleCardComponent);

export default Articles;




