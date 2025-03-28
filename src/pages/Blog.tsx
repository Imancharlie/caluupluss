import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
  const [sortBy, setSortBy] = useState<"trending" | "latest" | "popular">("trending");
  const [searchQuery, setSearchQuery] = useState("");

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

  return (
    <>
      <SEO 
        title="Blog - GPA Calculator"
        description="Read informative articles about GPA calculation, academic success, and university grading systems."
        type="blog"
      />
      
      <div className="min-h-screen bg-gradient-to-b from-caluu-blue-dark to-caluu-blue-light">
        {/* Hero Section */}
        <div className="relative h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden">
          <AnimatedBackground />
          
          <motion.div 
            className="relative text-center px-4 z-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Academic Insights
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Discover helpful articles about GPA calculation, academic success, scholarships, online courses, and university life.
              <span className="block mt-4 text-white/90 font-medium text-xl md:text-2xl">
                Let's discover our life's purpose together.
              </span>
            </p>
          </motion.div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Search and Sort Section */}
          <motion.div 
            className="flex flex-col md:flex-row justify-between items-center gap-4 mb-12"
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedPosts.map((post, index) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white/10 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/10"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-4 left-4">
                    <span className="bg-caluu-blue text-white px-3 py-1 rounded-full text-sm">
                      {post.category}
                    </span>
                  </div>
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

                  <p className="text-white/60 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center text-sm text-white/40 bg-white/5 px-2 py-1 rounded-full"
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>

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
                      className="text-caluu-blue hover:text-caluu-blue-light flex items-center group"
                    >
                      Read more
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>

          {sortedPosts.length === 0 && (
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