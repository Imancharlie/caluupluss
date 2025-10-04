import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '@/components/SEO';
import AnimatedBackground from '@/components/AnimatedBackground';
import { blogService } from '@/services/blogService';
import type { BlogPost } from '@/types/blog';
import { Search, Tag, Sparkles, Calendar, Clock, Heart, MessageCircle, ArrowRight } from 'lucide-react';

const PAGE_SIZE = 9;

const BlogExplore = () => {
  const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const apiPosts = await blogService.getAllPosts();
        const transformed = apiPosts.map(post => ({
          ...post,
          excerpt: post.excerpt || post.content?.slice(0, 160) + '...',
          image: post.image || '/blog/gpa-guide.jpg',
          tags: post.tags || ['Academics'],
          readTime: post.readTime || 5,
        }));
        setAllPosts(transformed);
      } catch (e) {
        console.error('Failed to load posts', e);
        setError('Failed to load articles');
      } finally {
        setIsLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const tags = useMemo(() => Array.from(new Set(allPosts.flatMap(p => p.tags || []))).slice(0, 12), [allPosts]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return allPosts.filter(p => {
      const matchesQuery = p.title.toLowerCase().includes(q) || (p.excerpt || '').toLowerCase().includes(q);
      const matchesTag = !activeTag || (p.tags || []).includes(activeTag);
      return matchesQuery && matchesTag;
    });
  }, [allPosts, query, activeTag]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <>
      <SEO 
        title="Explore Articles - Caluu"
        description="Discover modern, helpful articles and guides for your academic journey."
        type="website"
        url="https://caluu.kodin.co.tz/blog"
      />

      <div className="min-h-screen bg-gradient-to-b from-caluu-blue-dark to-caluu-blue-light">
        {/* Hero */}
        <div className="relative h-[38vh] sm:h-[46vh] min-h-[260px] sm:min-h-[360px] flex items-center justify-center overflow-hidden">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
          <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3 flex items-center justify-center gap-3">
              <Sparkles className="w-7 h-7 text-white/90" /> Explore Articles
            </h1>
            <p className="text-white/80 text-lg">Fresh insights, study strategies, and guidance — all in one place.</p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Controls */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-8">
            <div className="relative w-full lg:w-[420px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/60 w-5 h-5" />
              <input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setVisibleCount(PAGE_SIZE); }}
                placeholder="Search articles..."
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50 backdrop-blur-sm"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${!activeTag ? 'bg-white text-caluu-blue border-white' : 'text-white/80 border-white/20 hover:bg-white/10'}`}
              >
                All
              </button>
              {tags.map(tag => (
                <button
                  key={tag}
                  onClick={() => { setActiveTag(prev => prev === tag ? null : tag); setVisibleCount(PAGE_SIZE); }}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${activeTag === tag ? 'bg-white text-caluu-blue border-white' : 'text-white/80 border-white/20 hover:bg-white/10'}`}
                >
                  <span className="inline-flex items-center"><Tag className="w-3 h-3 mr-1" /> {tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: PAGE_SIZE }).map((_, i) => (
                <div key={i} className="bg-white/10 rounded-xl overflow-hidden border border-white/10 animate-pulse">
                  <div className="h-44 bg-white/5" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-white/5 rounded w-3/4" />
                    <div className="h-4 bg-white/5 rounded w-full" />
                    <div className="h-4 bg-white/5 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-white/90 text-center py-16">{error}</div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visible.map(post => (
                  <article key={post.id} className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/10">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                        decoding="async"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 33vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    <div className="p-5">
                      <div className="flex items-center gap-4 text-sm text-white/70 mb-3">
                        <span className="flex items-center"><Calendar className="w-4 h-4 mr-1" /> {new Date(post.created_at).toLocaleDateString()}</span>
                        <span className="flex items-center"><Clock className="w-4 h-4 mr-1" /> {post.readTime || 5} min</span>
                      </div>
                      <h2 className="text-lg font-semibold mb-2 line-clamp-2 text-white group-hover:text-caluu-blue transition-colors">{post.title}</h2>
                      <p className="text-white/70 line-clamp-2 mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-white/70">
                          <span className="flex items-center"><Heart className="w-4 h-4 mr-1" /> {post.likes}</span>
                          <span className="flex items-center"><MessageCircle className="w-4 h-4 mr-1" /> {(post.comments || []).length}</span>
                        </div>
                        <Link to={`/blog/${post.slug}`} className="text-caluu-blue hover:text-caluu-blue-light inline-flex items-center">
                          Read more <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              {visible.length < filtered.length && (
                <div className="flex justify-center mt-10">
                  <button
                    onClick={() => setVisibleCount(v => v + PAGE_SIZE)}
                    className="px-6 py-3 rounded-lg bg-white text-caluu-blue font-medium hover:opacity-90 transition"
                  >
                    Load more
                  </button>
                </div>
              )}
              {!isLoading && filtered.length === 0 && (
                <div className="text-white/90 text-center py-16">No articles found.</div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default BlogExplore;






