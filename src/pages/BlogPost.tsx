import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Calendar, 
  Clock, 
  Tag, 
  MessageCircle, 
  Heart, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
  ArrowRight,
  Calculator
} from "lucide-react";
import SEO from "@/components/SEO";
import AnimatedBackground from "@/components/AnimatedBackground";
import SocialShare from "@/components/SocialShare";
import Footer from "@/components/Footer";

// Sample blog post data (in a real app, this would come from an API)
const blogPost = {
  id: "1",
  title: "How to Calculate Your GPA: A Complete Guide",
  content: `
    <p>Calculating your GPA (Grade Point Average) is an essential skill for any student. Whether you're in high school or university, understanding how to calculate your GPA can help you track your academic progress and set goals for improvement.</p>

    <h2>Understanding the Basics</h2>
    <p>Your GPA is a numerical representation of your academic performance. It's calculated by:</p>
    <ol>
      <li>Converting letter grades to grade points</li>
      <li>Multiplying each course's grade points by its credit hours</li>
      <li>Adding up all the grade points</li>
      <li>Dividing by the total number of credit hours</li>
    </ol>

    <h2>Common Grading Systems</h2>
    <p>Different institutions use different grading scales. Here are some common ones:</p>
    <ul>
      <li>A = 4.0</li>
      <li>B = 3.0</li>
      <li>C = 2.0</li>
      <li>D = 1.0</li>
      <li>F = 0.0</li>
    </ul>

    <h2>Tips for Success</h2>
    <p>Maintaining a high GPA requires dedication and effective study strategies. Here are some tips:</p>
    <ul>
      <li>Attend all classes regularly</li>
      <li>Take detailed notes</li>
      <li>Review material regularly</li>
      <li>Seek help when needed</li>
      <li>Stay organized</li>
    </ul>
  `,
  author: "John Doe",
  date: "2024-03-15",
  readTime: "5 min read",
  category: "GPA Calculation",
  tags: ["GPA", "Grades", "Academic Success", "Study Tips"],
  likes: 245,
  comments: 32,
  image: "/blog/gpa-guide.jpg",
  relatedPosts: [
    {
      id: "2",
      title: "Understanding Different Grading Systems",
      excerpt: "Explore various grading systems used in universities and how they affect your GPA calculation.",
      image: "/blog/grading-systems.jpg",
      date: "2024-03-10",
      readTime: "4 min read",
    },
    {
      id: "3",
      title: "Tips for Maintaining a High GPA",
      excerpt: "Discover proven strategies and tips to maintain a high GPA throughout your academic journey.",
      image: "/blog/maintain-gpa.jpg",
      date: "2024-03-05",
      readTime: "6 min read",
    }
  ]
};

const BlogPost = () => {
  const { slug } = useParams();
  const currentUrl = window.location.href;

  return (
    <>
      <SEO 
        title={`${blogPost.title} - GPA Calculator Blog`}
        description={blogPost.content.substring(0, 160)}
        type="article"
        publishedTime={blogPost.date}
        author={blogPost.author}
        image={blogPost.image}
        url={currentUrl}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-caluu-blue-dark to-caluu-blue-light">
        {/* Hero Section */}
        <div className="relative h-[50vh] sm:h-[60vh] min-h-[400px] sm:min-h-[500px] flex items-center justify-center overflow-hidden">
          <AnimatedBackground />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
          
          <motion.div 
            className="relative text-center px-4 z-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              to="/blog"
              className="inline-flex items-center text-white/80 hover:text-white mb-6 sm:mb-8 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>

            <div className="flex flex-wrap items-center justify-center gap-4 text-white/80 mb-4 sm:mb-6">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(blogPost.date).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {blogPost.readTime}
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
              {blogPost.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span className="bg-caluu-blue text-white px-3 py-1 rounded-full text-sm">
                {blogPost.category}
              </span>
              {blogPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="flex items-center text-sm text-white/80 bg-white/10 px-3 py-1 rounded-full"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Featured Image */}
          <motion.div 
            className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
              src={blogPost.image}
              alt={blogPost.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>

          {/* Content */}
          <motion.article 
            className="prose prose-lg prose-invert max-w-none mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            dangerouslySetInnerHTML={{ __html: blogPost.content }}
          />

          {/* Social Interaction */}
          <motion.div 
            className="flex items-center justify-between py-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <Heart className="w-5 h-5" />
                <span>{blogPost.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
                <MessageCircle className="w-5 h-5" />
                <span>{blogPost.comments}</span>
              </button>
            </div>
            
            <SocialShare
              title={blogPost.title}
              description={blogPost.content.substring(0, 160)}
              image={blogPost.image}
              url={currentUrl}
            />
          </motion.div>
          <motion.div 
          className="flex justify-center mb-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/calculator"
            className="bg-caluu-blue hover:bg-caluu-blue/90 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
          >
            <Calculator className="w-5 h-5" />
            GO GPA Calculator
          </Link>
        </motion.div> 

          {/* Related Posts */}
          <motion.div 
            className="mt-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-white mb-8">Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {blogPost.relatedPosts.map((post, index) => (
                <motion.article
                  key={post.id}
                  className="group bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-white/10"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
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

                    <h3 className="text-xl font-semibold mb-2 line-clamp-2 group-hover:text-caluu-blue transition-colors text-white">
                      {post.title}
                    </h3>

                    <p className="text-white/60 line-clamp-2">
                      {post.excerpt}
                    </p>
                  </div>
                </motion.article>
              ))}
            </div>
          </motion.div>

          {/* Navigation */}
          <motion.div 
            className="flex items-center justify-between py-6 sm:py-8 border-t border-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="hidden sm:inline">Previous Article</span>
            </button>
            <button className="flex items-center gap-2 text-white/80 hover:text-white transition-colors">
              <span className="hidden sm:inline">Next Article</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </motion.div>
          
        </div>

        <Footer />
      </div>
    </>
  );
};

export default BlogPost; 