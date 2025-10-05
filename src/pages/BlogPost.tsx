import { useParams, Link } from "react-router-dom";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useState, useEffect, lazy, Suspense } from "react";
import { 
  Calendar, 
  Clock, 
  Tag, 
  Share2,
  Facebook,
  Twitter,
  Linkedin,
  ArrowLeft,
  ArrowRight,
  Calculator
} from "lucide-react";
import SEO from "@/components/SEO";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { User } from "@/types/auth";
import { blogService } from "@/services/blogService";
import type { BlogPost } from "@/types/blog";
// import FeedbackSection from "@/components/FeedbackSection";
// import { feedbackService } from "@/services/feedbackService";
// import StaticBackground from "@/components/StaticBackground";

// Lazy load components
const SocialShare = lazy(() => import("@/components/SocialShare"));
const Footer = lazy(() => import("@/components/Footer"));

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const postData = await blogService.getPost(slug || '') as BlogPost;
        console.log('Fetched post data:', postData); // Debug log
        if (postData) {
          setPost(postData);
        }
      } catch (err) {
        setError('Failed to load blog post');
        console.error('Error fetching blog post:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
    
    // Test function to check if feedback service is working
    const testFeedbackService = async () => {
      try {
        console.log('Testing feedback service connection...');
        console.log('API URL:', import.meta.env.VITE_API_URL);
        
        // Simple health check
        const response = await fetch(`${import.meta.env.VITE_API_URL}/health/`);
        console.log('Health check response:', response.status);
        
        // Test feedback submission
        const testFeedback = {
          post_id: post?.id || 1,
          content: 'Test feedback submission',
          rating: 5,
          type: 'general' as const,
          title: 'Test Feedback',
          description: 'This is a test feedback submission',
          createdAt: new Date().toISOString()
        };
        
        console.log('Submitting test feedback:', testFeedback);
        const result = await feedbackService.submitFeedback(testFeedback);
        console.log('Feedback submission result:', result);
        
        toastSuccess({ title: 'Feedback service is working correctly!' });
      } catch (error) {
        console.error('Feedback service test failed:', error);
        toast.error('Feedback service test failed. Check console for details.');
      }
    };
    
    // Uncomment the line below to test the feedback service connection
    // testFeedbackService();
  }, [slug]);

  // Helper function to render content section
  const renderContentSection = (content: string | undefined, className: string = '') => {
    if (!content) return null;
    return (
      <div 
        className={`prose prose-lg prose-invert max-w-none ${className} prose-headings:text-white prose-p:text-white/90 prose-strong:text-white prose-a:text-caluu-blue hover:prose-a:text-caluu-blue-light prose-img:rounded-xl prose-pre:bg-white/10 prose-code:text-white/90 prose-code:bg-white/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded`}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    );
  };

  // Helper function to render section with title
  const renderSection = (title: string | undefined, content: string | undefined) => {
    if (!content) return null;
    return (
      <div className="mb-12">
        {title && (
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
            {title}
          </h2>
        )}
        {renderContentSection(content)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-caluu-blue-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-white/20"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Error</h1>
          <p className="text-white/80">{error || 'Post not found'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-caluu-blue-dark">
      <SEO 
        title={post?.title || "Blog Post | Academic Journey Simplified"}
        description={post?.excerpt || "Read our detailed article about academic success and GPA calculation."}
      />
      <StaticBackground />
      
      <div className="max-w-[1200px] mx-auto">
        {/* Back to Blog Button */}
        <div className="px-4 py-6">
            <Link
              to="/blog"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
        </div>
        
        <article className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden border border-white/10">
          {/* Title Section */}
          <header className="px-6 py-8 md:px-8 md:py-12 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 text-sm text-white/80 mb-6">
              <span className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                  {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                {post.readTime || '5 min read'}
              </span>
              {post.category && (
                <span className="flex items-center">
                  <Tag className="w-4 h-4 mr-2" />
                  {post.category}
                </span>
              )}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2">
                {post.tags.map((tag, index) => (
                <span
                    key={index}
                    className="px-3 py-1 bg-white/10 text-white/90 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
            )}
          </header>

          {/* Featured Image */}
          {post.image && (
            <div className="w-full mb-8">
              <img 
                src={post.image} 
                alt={post.title}
                className="w-full h-[50vh] object-cover"
              />
                </div>
          )}

          {/* Content */}
          <div className="px-6 md:px-8 lg:px-12 pb-12">
            {/* Introduction */}
            {post.intro && renderContentSection(post.intro, 'mb-12')}

            {/* Section One */}
            {renderSection(post.section_one_title, post.section_one_content)}

            {/* Section Two */}
            {renderSection(post.section_two_title, post.section_two_content)}

            {/* Conclusion */}
            {post.conclusion && renderContentSection(post.conclusion, 'mb-12')}

            {/* Legacy Content (fallback) */}
            {!post.intro && !post.section_one_content && !post.section_two_content && post.content && (
              renderContentSection(post.content, 'mb-12')
            )}

            {/* Social Share */}
            <div className="border-t border-white/10 pt-8 mb-12">
              <Suspense fallback={<div className="h-10"></div>}>
            <SocialShare
                title={post.title}
                url={window.location.href}
                  description={post.excerpt || ''}
                  image={post.image || '/blog/gpa-guide.jpg'}
              />
              </Suspense>
            </div>

            {/* Feedback Section */}
            <div className="mb-8">
              <FeedbackSection postId={post.id} />
            </div>
          </div>
        </article>
        </div>

      <Suspense fallback={<div className="h-20"></div>}>
        <Footer />
        </Suspense>
      </div>
  );
};

export default BlogPostPage; 
