import React, { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchArticle, trackArticleView, toggleLike, shareArticle } from '@/services/articleService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calendar, Clock, Eye, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const ArticleDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: article, isLoading, error } = useQuery({
    queryKey: ['article', id],
    queryFn: () => fetchArticle(id as string),
    enabled: Boolean(id)
  });

  useEffect(() => {
    if (!id) return;
    try {
      const key = `article_view_${id}`;
      const last = localStorage.getItem(key);
      const now = Date.now();
      if (last) {
        const lastMs = parseInt(last, 10);
        // 1 hour = 3600000 ms
        if (now - lastMs < 3600000) return;
      }
      trackArticleView(id);
      localStorage.setItem(key, String(now));
    } catch {}
  }, [id]);

  const [liked, setLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);

  useEffect(() => {
    if (!article) return;
    try {
      const likedKey = 'likedArticles';
      const raw = localStorage.getItem(likedKey);
      const store = raw ? JSON.parse(raw) : {};
      const locallyLiked = Boolean(store && store[article.id]);
      setLiked(Boolean(article.is_liked) || locallyLiked);
    } catch {
      setLiked(Boolean(article.is_liked));
    }
    setLikesCount(typeof article.likes === 'number' ? article.likes : 0);
  }, [article]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
          <div className="text-gray-600 dark:text-gray-300">Loading article...</div>
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
          <button className="text-caluu-blue mb-4" onClick={() => navigate(-1)}>
            <ArrowLeft className="inline w-4 h-4 mr-1" /> Back
          </button>
          <div className="text-red-600">Failed to load article</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-3xl">
        <button className="text-caluu-blue mb-4" onClick={() => navigate(-1)}>
          <ArrowLeft className="inline w-4 h-4 mr-1" /> Back
        </button>

        <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-lg overflow-hidden">
          <img src={article.cover_image} alt={article.title} className="w-full h-40 object-cover" loading="lazy" decoding="async" />
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {new Date(article.published_at).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {article.read_time} min read
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {article.views}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      const res = await toggleLike(article.id);
                      if (res) {
                        setLiked(Boolean(res.is_liked));
                        if (typeof res.likes === 'number') setLikesCount(res.likes);
                        try {
                          const key = 'likedArticles';
                          const raw = localStorage.getItem(key);
                          const obj = raw ? JSON.parse(raw) : {};
                          if (res.is_liked) {
                            obj[article.id] = true;
                          } else {
                            delete obj[article.id];
                          }
                          localStorage.setItem(key, JSON.stringify(obj));
                        } catch {}
                      }
                    } catch {}
                  }}
                  title="Like"
                >
                  <Heart className={`w-4 h-4 ${liked ? 'fill-current text-caluu-blue' : ''}`} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    try {
                      if (navigator.share) {
                        await navigator.share({ title: article.title, text: article.excerpt, url: window.location.href });
                      }
                      await shareArticle(article.id, 'web');
                    } catch {}
                  }}
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="mb-3">
              <Badge className={`${article.category.color} text-white`}>
                {article.category.icon} {article.category.name}
              </Badge>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-3">
              {article.title}
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(article.published_at).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {article.read_time} min read
              </div>
              <div className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {article.views}
              </div>
            </div>

            <div className="prose prose-zinc max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ArticleDetail;


