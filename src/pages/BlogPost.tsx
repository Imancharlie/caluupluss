import { useParams, Link } from "react-router-dom";
import { motion, LazyMotion, domAnimation } from "framer-motion";
import { useState, useEffect, lazy, Suspense } from "react";
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
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { User } from "@/types/auth";
import { blogService } from "@/services/blogService";
import type { BlogPost } from "@/types/blog";

// Lazy load components
const AnimatedBackground = lazy(() => import("@/components/AnimatedBackground"));
const SocialShare = lazy(() => import("@/components/SocialShare"));
const Footer = lazy(() => import("@/components/Footer"));
const BlogComments = lazy(() => import("@/components/BlogComments"));

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setIsLoading(true);
        const postData = await blogService.getPost(slug || '') as BlogPost;
        if (postData) {
          setPost(postData);
          setLikes(postData.likes || 0);
          setIsLiked(postData.is_liked || false);
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
  }, [slug]);

  const handleLike = async () => {
    if (!user) {
      toast.error('Please login to like posts');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!post) return;
      const response = await blogService.likePost(post.id);
      setLikes(response.likes);
      setIsLiked(response.is_liked);
      toast.success('Post liked successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to like post');
      console.error('Error liking post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlike = async () => {
    if (!user) {
      toast.error('Please login to unlike posts');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!post) return;
      const response = await blogService.unlikePost(post.id);
      setLikes(response.likes);
      setIsLiked(response.is_liked);
      toast.success('Post unliked successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to unlike post');
      console.error('Error unliking post:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddComment = async (content: string) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      if (!post) return;
      const newComment = await blogService.addComment(post.id, content);
      setPost(prev => prev ? {
        ...prev,
        comments: [...prev.comments, newComment]
      } : null);
      toast.success('Comment added successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add comment');
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
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
    <LazyMotion features={domAnimation}>
      <SEO
        title={post.title}
        description="Learn how to calculate your GPA at UDSM"
        image="/images/blog/gpa-guide.jpg"
      />
      <div className="min-h-screen bg-gradient-to-b from-caluu-blue-dark to-caluu-blue-light">
        {/* Hero Section */}
        <div className="relative h-[50vh] sm:h-[60vh] min-h-[400px] sm:min-h-[500px] flex items-center justify-center overflow-hidden">
          <Suspense fallback={<div className="animate-pulse bg-caluu-blue-dark/50 w-full h-full" />}>
          <AnimatedBackground />
          </Suspense>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-transparent" />
          
          <LazyMotion features={domAnimation}>
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
                  {new Date(post.created_at).toLocaleDateString()}
              </span>
              <span className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                  5 min read
              </span>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 sm:mb-6 leading-tight">
                {post.title}
            </h1>
            
            <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4">
              <span className="bg-caluu-blue text-white px-3 py-1 rounded-full text-sm">
                  GPA Calculation
              </span>
                {post.tags?.map((tag: string) => (
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
          </LazyMotion>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
          {/* Featured Image with loading optimization */}
          <LazyMotion features={domAnimation}>
          <motion.div 
            className="relative h-[300px] sm:h-[400px] rounded-xl overflow-hidden mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <img
                src={post.image || "/blog/gpa-guide.jpg"}
                alt={post.title}
              className="w-full h-full object-cover"
                loading="lazy"
                decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          </motion.div>
          </LazyMotion>

          {/* Content with optimized rendering */}
          <LazyMotion features={domAnimation}>
          <motion.article 
            className="prose prose-lg prose-invert max-w-none mb-8 sm:mb-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
              dangerouslySetInnerHTML={{ __html: post.content }}
          />
          </LazyMotion>

          {/* Social Interaction */}
          <Suspense fallback={<div className="h-16 animate-pulse bg-white/5 rounded-lg" />}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button
                  onClick={isLiked ? handleUnlike : handleLike}
                  disabled={isSubmitting || !user}
                  className={`flex items-center gap-2 transition-colors ${
                    isLiked ? 'text-red-500' : 'text-white/80 hover:text-white'
                  } ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''} ${
                    !user ? 'cursor-not-allowed opacity-50' : ''
                  }`}
                  title={!user ? 'Please login to like posts' : ''}
                >
                  <Heart className={`w-5 h-5 ${isSubmitting ? 'animate-pulse' : ''}`} />
                  <span>{likes}</span>
                </button>
                <div className="flex items-center gap-2 text-white/80">
                  <MessageCircle className="w-5 h-5" />
                  <span>{post.comments?.length || 0}</span>
                </div>
              </div>
            <SocialShare
                title={post.title}
                description="Learn how to calculate your GPA at UDSM"
                image={post.image || "/blog/gpa-guide.jpg"}
                url={window.location.href}
              />
            </div>
          </Suspense>

          {/* Comments Section */}
            <Suspense fallback={<div className="h-32 animate-pulse bg-white/5 rounded-lg mt-8" />}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8"
              >
              <BlogComments
                postId={post.id}
                initialComments={post.comments || []}
                onAddComment={handleAddComment}
                isAuthenticated={!!user}
              />
              </motion.div>
            </Suspense>

          <motion.div 
          className="flex justify-center mb-8"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/"
            className="bg-caluu-blue hover:bg-caluu-blue/90 text-white px-8 py-3 rounded-full font-semibold flex items-center gap-2 transition-colors"
          >
            <Calculator className="w-5 h-5" />
            GO GPA Calculator
          </Link>
          </motion.div>
        </div>

        <Suspense fallback={<div className="h-32 animate-pulse bg-white/5" />}>
        <Footer />
        </Suspense>
      </div>
    </LazyMotion>
  );
};

export default BlogPostPage; 