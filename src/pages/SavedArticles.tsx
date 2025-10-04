import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  BookOpen, 
  Heart, 
  Share2, 
  Eye, 
  Clock,
  User,
  Tag,
  ArrowLeft,
  Trash2,
  Wifi,
  WifiOff
} from 'lucide-react';
import { toast } from 'sonner';

// Tag type from backend: can be a string or an object with name/slug
type TagLike = string | { name?: string; slug?: string };

interface SavedArticle {
  id: string | number;
  title: string;
  excerpt: string;
  content?: string;
  cover_image?: string;
  author?: {
    name?: string;
    avatar?: string;
  };
  published_at?: string;
  read_time?: number;
  views?: number;
  likes?: number;
  share_count?: number;
  tags?: TagLike[];
  category?: {
    name?: string;
    icon?: string;
    color?: string;
  };
}

const SavedArticles: React.FC = () => {
  const navigate = useNavigate();
  const [savedArticles, setSavedArticles] = useState<SavedArticle[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Load saved articles from localStorage
  useEffect(() => {
    const loadSavedArticles = () => {
      try {
        const saved = localStorage.getItem('savedArticles');
        if (saved) {
          const articlesObj = JSON.parse(saved);
          const articlesArray = Object.values(articlesObj) as SavedArticle[];
          setSavedArticles(articlesArray);
        }
      } catch (error) {
        console.error('Error loading saved articles:', error);
        toast.error('Failed to load saved articles');
      }
    };

    loadSavedArticles();

    // Listen for online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Remove article from saved
  const handleRemoveArticle = (articleId: string | number) => {
    try {
      const saved = localStorage.getItem('savedArticles');
      if (saved) {
        const articlesObj = JSON.parse(saved);
        delete articlesObj[String(articleId)];
        localStorage.setItem('savedArticles', JSON.stringify(articlesObj));
        
        // Update local state
        setSavedArticles(prev => prev.filter(article => article.id !== articleId));
        toast.success('Article removed from saved');
      }
    } catch (error) {
      console.error('Error removing article:', error);
      toast.error('Failed to remove article');
    }
  };

  // Clear all saved articles
  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all saved articles?')) {
      try {
        localStorage.removeItem('savedArticles');
        setSavedArticles([]);
        toast.success('All saved articles cleared');
      } catch (error) {
        console.error('Error clearing articles:', error);
        toast.error('Failed to clear articles');
      }
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

  // Handle share
  const handleShare = async (article: SavedArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: `${window.location.origin}/articles/${article.id}`,
        });
      } else {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(`${window.location.origin}/articles/${article.id}`);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">
              Saved Articles
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Your offline reading collection
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="w-5 h-5 text-green-500" />
            ) : (
              <WifiOff className="w-5 h-5 text-orange-500" />
            )}
            <span className="text-sm text-gray-500">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-8 h-8 text-caluu-blue" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {savedArticles.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Saved Articles
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {savedArticles.reduce((total, article) => total + (article.read_time || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Read Time (min)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {savedArticles.reduce((total, article) => total + (article.views || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Total Views
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        {savedArticles.length > 0 && (
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600 dark:text-gray-300">
              {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''} saved for offline reading
            </p>
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          </div>
        )}

        {/* Articles Grid */}
        {savedArticles.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Saved Articles
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Save articles from the articles page to read them offline
              </p>
              <Button
                onClick={() => navigate('/articles')}
                className="bg-caluu-blue hover:bg-caluu-blue-light text-white"
              >
                Browse Articles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {savedArticles.map((article) => (
              <Card key={article.id} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-shadow duration-300 group">
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
                    <div className="w-full h-48 bg-gray-100 dark:bg-gray-700" />
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className={`${(article.category && article.category.color) ? article.category.color : 'bg-gray-500'} text-white`}>
                      {(article.category && article.category.icon) ? article.category.icon : ''} {(article.category && article.category.name) ? article.category.name : 'General'}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-gray-700">
                      Offline
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-6">
                  <button
                    className="text-left w-full"
                    onClick={() => navigate(`/articles/${article.id}`)}
                  >
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-caluu-blue transition-colors">
                      {article.title || 'Untitled'}
                    </h3>
                  </button>
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
                        onClick={() => handleShare(article)}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleRemoveArticle(article.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedArticles;

