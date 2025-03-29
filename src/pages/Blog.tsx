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

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  image: string;
  slug: string;
  likes: number;
  comments: number;
  views: number;
  date: string;
  tags: string[];
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "How to Calculate Your GPA: A Complete Guide",
    excerpt: "Learn everything you need to know about calculating your GPA, including different grading systems and how to handle different credit hours.",
    category: "GPA Calculation",
    readTime: "5 min read",
    image: "/blog/gpa-guide.jpg",
    slug: "how-to-calculate-gpa",
    likes: 245,
    comments: 32,
    views: 1234,
    date: "2024-03-15",
    tags: ["GPA", "Grades", "Academic Success"]
  },
  {
    id: "2",
    title: "Understanding Different Grading Systems",
    excerpt: "Explore various grading systems used in universities and how they affect your GPA calculation.",
    category: "Grading Systems",
    readTime: "4 min read",
    image: "/blog/grading-systems.jpg",
    slug: "grading-systems-guide",
    likes: 189,
    comments: 24,
    views: 987,
    date: "2024-03-10",
    tags: ["Grading", "Education", "University"]
  },
  {
    id: "3",
    title: "Tips for Maintaining a High GPA",
    excerpt: "Discover proven strategies and tips to maintain a high GPA throughout your academic journey.",
    category: "Academic Success",
    readTime: "6 min read",
    image: "/blog/maintain-gpa.jpg",
    slug: "maintain-high-gpa",
    likes: 312,
    comments: 45,
    views: 1567,
    date: "2024-03-05",
    tags: ["Success", "Study Tips", "Academic Performance"]
  }
];

const Blog = () => {
  const location = useLocation();
  const [sortBy, setSortBy] = useState<"trending" | "latest" | "popular">("trending");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  // Scroll to top when component mounts or when search/sort changes
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({ 
        top: 0, 
        behavior: 'smooth'
      });
    };
    
    // Add a small delay to ensure smooth animation
    const timer = setTimeout(scrollToTop, 100);
    return () => clearTimeout(timer);
  }, [location, searchQuery, sortBy]);

  useEffect(() => {
    // Simulate content loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const sortedPosts = [...blogPosts]
    .filter(post => 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "trending":
          return (b.views + b.likes + b.comments) - (a.views + a.likes + a.comments);
        case "latest":
          return new Date(b.date).getTime() - new Date(a.date).getTime();
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
    
    // Smooth scroll to top first
    window.scrollTo({ 
      top: 0, 
      behavior: 'smooth'
    });
    
    // Then navigate after a short delay
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
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center gap-4 text-sm text-white/60 mb-4">
                        <span className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {new Date(post.date).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {post.readTime}
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
                            {post.comments}
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

          {!isLoading && sortedPosts.length === 0 && (
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