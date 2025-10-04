import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { 
  Calendar, 
  Clock, 
  Tag, 
  MessageCircle, 
  Heart, 
  TrendingUp,
  ArrowRight,
  Search
} from "lucide-react";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import { blogService } from "@/services/blogService";
import { BlogPost } from "@/types/blog";

const Blog = () => {
  const location = useLocation();
  const [sortBy, setSortBy] = useState<"trending" | "latest" | "popular">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const apiPosts = await blogService.getAllPosts();
        // Transform API posts to match our UI structure
        const transformedPosts = apiPosts.map(post => ({
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt || post.content.substring(0, 150) + '...',
          image: post.image || '/blog/gpa-guide.jpg',
          slug: post.slug,
          likes: post.likes,
          comments: post.comments || [],
          views: 0,
          created_at: post.created_at,
          tags: post.tags || ['GPA', 'Grades', 'Academic Success'],
          is_liked: post.is_liked,
          category: post.category,
          readTime: post.readTime
        }));
        setPosts(transformedPosts);
      } catch (err) {
        setError('Failed to load blog posts');
        console.error('Error fetching blog posts:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Scroll to top when component mounts or when search/sort changes
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth'
      });
    };
    
    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [location, searchQuery, sortBy]);

  const sortedPosts = [...posts]
    .filter(post => {
      const matchesQuery = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase());
      const tagMatch = !activeTag || (post.tags || []).includes(activeTag);
      return matchesQuery && tagMatch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return ((b.views || 0) + b.likes + (b.comments?.length || 0)) - 
                 ((a.views || 0) + a.likes + (a.comments?.length || 0));
        case "latest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "popular":
          return b.likes - a.likes;
        default:
          return 0;
      }
    });

  // Add smooth scroll to post cards
  const handlePostClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const target = e.currentTarget;
    const href = target.getAttribute('href');
    
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth'
    });
    
    setTimeout(() => {
      if (href) {
        window.location.href = href;
      }
    }, 300);
  };

  return (
    <>
      <SEO 
        title="Blog - GPA Calculator"
        description="Explore articles about GPA calculation, academic success, and study tips."
        type="website"
        url="https://caluu.kodin.co.tz/blog"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-caluu-blue-dark to-caluu-blue-light">
        {/* Hero Section */}
        <div className="relative h-[40vh] sm:h-[50vh] min-h-[300px] sm:min-h-[400px] flex items-center justify-center overflow-hidden">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
          
          <motion.div 
            className="relative text-center px-4 z-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4 sm:mb-6">
              Blog
            </h1>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              Discover helpful articles about GPA calculation, academic success, and study strategies.
            </p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Search and Sort Section */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12 sticky top-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/10 text-white border border-white/20 rounded-lg pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50 backdrop-blur-sm"
              />
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "trending" | "latest" | "popular")}
              className="w-full md:w-auto bg-white/10 text-white border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-white/30 backdrop-blur-sm"
            >
              <option value="trending">
                <TrendingUp className="w-4 h-4 inline-block mr-2" />
                Trending
              </option>
              <option value="latest">
                <Calendar className="w-4 h-4 inline-block mr-2" />
                Latest
              </option>
              <option value="popular">
                <Heart className="w-4 h-4 inline-block mr-2" />
                Most Popular
              </option>
            </select>
            {/* Tag filters */}
            <div className="w-full flex flex-wrap gap-2">
              {Array.from(new Set(posts.flatMap(p => p.tags || []))).slice(0, 10).map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(prev => prev === tag ? null : tag)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${activeTag === tag ? 'bg-white text-caluu-blue border-white' : 'text-white/80 border-white/20 hover:bg-white/10'}`}
                  aria-pressed={activeTag === tag}
                >
                  <span className="inline-flex items-center"><Tag className="w-3 h-3 mr-1" /> {tag}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Blog Posts Grid */}
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <motion.div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10 animate-pulse"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="h-48 bg-white/5" />
                    <div className="p-6 space-y-4">
                      <div className="h-4 bg-white/5 rounded w-3/4" />
                      <div className="h-4 bg-white/5 rounded w-full" />
                      <div className="h-4 bg-white/5 rounded w-2/3" />
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : error ? (
              <motion.div 
                className="text-center py-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <p className="text-white/80 text-lg">{error}</p>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {sortedPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/10"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      delay: index * 0.1,
                      duration: 0.3,
                      ease: "easeOut"
                    }}
                    layout
                  >
                    <div className="relative h-48 overflow-hidden">
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
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          5 min read
                        </span>
                      </div>

                      <h2 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-caluu-blue transition-colors text-white">
                        {post.title}
                      </h2>

                      <p className="text-white/60 line-clamp-2 mb-4">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-white/60">
                          <span className="flex items-center">
                            <Heart className="w-4 h-4 mr-1" />
                            {post.likes}
                          </span>
                          <span className="flex items-center">
                            <MessageCircle className="w-4 h-4 mr-1" />
                            {post.comments.length}
                          </span>
                        </div>
                        <Link
                          to={`/blog/${post.slug}`}
                          onClick={handlePostClick}
                          className="text-caluu-blue hover:text-caluu-blue-light flex items-center group"
                        >
                          Read more
                          <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {!isLoading && !error && sortedPosts.length === 0 && (
            <motion.div 
              className="text-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <p className="text-white/80 text-lg">No articles found matching your search.</p>
            </motion.div>
          )}
        </div>
      </div>
    </>
  );
};

export default Blog; 