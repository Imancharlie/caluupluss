import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
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
import BlogComments from "@/components/BlogComments";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-hot-toast";
import { User } from "@/types/auth";
import { db } from "@/lib/firebase";
import { ref, onValue, set, update, push, DatabaseReference } from 'firebase/database';

// Sample blog post data (in a real app, this would come from an API)
const blogPost = {
  id: "1",
  title: "How to Calculate Your GPA: A Complete Guide for UDSM Students",
  content: `
    <div class="space-y-8">
      <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 class="text-2xl font-bold text-white mb-4">Quick Summary</h2>
        <ul class="list-disc list-inside space-y-2 text-white/80">
          <li>Learn how to calculate your GPA at UDSM</li>
          <li>Understand the UDSM grading system</li>
          <li>Follow a step-by-step calculation example</li>
          <li>Get tips for maintaining a high GPA</li>
        </ul>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-white mb-4">Understanding the Basics</h2>
        <p class="text-white/80 mb-4">Your GPA (Grade Point Average) is a numerical representation of your academic performance. It's calculated by:</p>
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 space-y-4">
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-8 h-8 bg-caluu-blue rounded-full flex items-center justify-center text-white font-bold">1</div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Convert Letter Grades</h3>
              <p class="text-white/80">Transform your letter grades into grade points using UDSM's grading scale.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-8 h-8 bg-caluu-blue rounded-full flex items-center justify-center text-white font-bold">2</div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Multiply by Credit Hours</h3>
              <p class="text-white/80">Multiply each course's grade points by its credit hours to get quality points.</p>
            </div>
          </div>
          <div class="flex items-start gap-4">
            <div class="flex-shrink-0 w-8 h-8 bg-caluu-blue rounded-full flex items-center justify-center text-white font-bold">3</div>
            <div>
              <h3 class="text-lg font-semibold text-white mb-2">Calculate Total</h3>
              <p class="text-white/80">Add up all quality points and divide by total credit hours for your GPA.</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-white mb-4">UDSM Grading System</h2>
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <h3 class="text-xl font-semibold text-white mb-4">Letter Grades</h3>
              <ul class="space-y-2 text-white/80">
                <li class="flex justify-between"><span>A</span><span>5.0</span></li>
                <li class="flex justify-between"><span>B+</span><span>4.0</span></li>
                <li class="flex justify-between"><span>B</span><span>3.0</span></li>
                <li class="flex justify-between"><span>C</span><span>2.0</span></li>
                <li class="flex justify-between"><span>D</span><span>1.0</span></li>
                <li class="flex justify-between"><span>F</span><span>0.0</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-white mb-4">Example: GPA Calculation for BSc. Electrical Engineering</h2>
        <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 overflow-x-auto">
          <table class="w-full text-white/80">
            <thead>
              <tr class="border-b border-white/10">
                <th class="text-left py-3 px-4">Course Code</th>
                <th class="text-left py-3 px-4">Course Name</th>
                <th class="text-center py-3 px-4">Credit Hours</th>
                <th class="text-center py-3 px-4">Grade</th>
                <th class="text-center py-3 px-4">Grade Points</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-white/10">
              <tr>
                <td class="py-3 px-4">EE221</td>
                <td class="py-3 px-4">High Voltage</td>
                <td class="text-center py-3 px-4">12.0</td>
                <td class="text-center py-3 px-4">B</td>
                <td class="text-center py-3 px-4">3.0</td>
              </tr>
              <tr>
                <td class="py-3 px-4">EE241</td>
                <td class="py-3 px-4">Measurements</td>
                <td class="text-center py-3 px-4">12.0</td>
                <td class="text-center py-3 px-4">B+</td>
                <td class="text-center py-3 px-4">4.0</td>
              </tr>
              <tr>
                <td class="py-3 px-4">MT261</td>
                <td class="py-3 px-4">Matrices for Non-majors</td>
                <td class="text-center py-3 px-4">12.0</td>
                <td class="text-center py-3 px-4">A</td>
                <td class="text-center py-3 px-4">5.0</td>
              </tr>
              <tr>
                <td class="py-3 px-4">EE231</td>
                <td class="py-3 px-4">Electronics</td>
                <td class="text-center py-3 px-4">8.0</td>
                <td class="text-center py-3 px-4">A</td>
                <td class="text-center py-3 px-4">5.0</td>
              </tr>
              <tr>
                <td class="py-3 px-4">EE253</td>
                <td class="py-3 px-4">Electromagnetism</td>
                <td class="text-center py-3 px-4">8.0</td>
                <td class="text-center py-3 px-4">B+</td>
                <td class="text-center py-3 px-4">4.0</td>
              </tr>
              <tr>
                <td class="py-3 px-4">ME213</td>
                <td class="py-3 px-4">Material Science</td>
                <td class="text-center py-3 px-4">8.0</td>
                <td class="text-center py-3 px-4">A</td>
                <td class="text-center py-3 px-4">5.0</td>
              </tr>
              <tr>
                <td class="py-3 px-4">EE251</td>
                <td class="py-3 px-4">Network Analysis</td>
                <td class="text-center py-3 px-4">8.0</td>
                <td class="text-center py-3 px-4">B</td>
                <td class="text-center py-3 px-4">3.0</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="mt-6 space-y-4">
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 class="text-xl font-semibold text-white mb-4">Step 1: Calculate Weighted Grade Points</h3>
            <ul class="space-y-2 text-white/80">
              <li>EE221: 12.0 × 3.0 = 36.0</li>
              <li>EE241: 12.0 × 4.0 = 48.0</li>
              <li>MT261: 12.0 × 5.0 = 60.0</li>
              <li>EE231: 8.0 × 5.0 = 40.0</li>
              <li>EE253: 8.0 × 4.0 = 32.0</li>
              <li>ME213: 8.0 × 5.0 = 40.0</li>
              <li>EE251: 8.0 × 3.0 = 24.0</li>
    </ul>
          </div>

          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 class="text-xl font-semibold text-white mb-4">Step 2: Calculate Total</h3>
            <p class="text-white/80 mb-2">Total Weighted Grade Points = 36.0 + 48.0 + 60.0 + 40.0 + 32.0 + 24.0 + 40.0 = <span class="text-caluu-blue font-bold">280.0</span></p>
            <p class="text-white/80 mb-2">Total Credit Hours = 12.0 + 12.0 + 12.0 + 8.0 + 8.0 + 8.0 + 8.0 = <span class="text-caluu-blue font-bold">68.0</span></p>
            <p class="text-white/80">Final GPA = 280.0 ÷ 68.0 = <span class="text-caluu-blue font-bold">4.1 </span>  upper second</p>
          </div>
        </div>
      </div>

      <div>
        <h2 class="text-2xl font-bold text-white mb-4">Tips for Success at UDSM</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 class="text-xl font-semibold text-white mb-4">Study Strategies</h3>
            <ul class="space-y-3 text-white/80">
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Attend all lectures and practical sessions</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Take detailed notes during classes</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Review material regularly</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Practice with past papers</span>
              </li>
            </ul>
          </div>
          <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 class="text-xl font-semibold text-white mb-4">Time Management</h3>
            <ul class="space-y-3 text-white/80">
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Start assignments early</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Break down large tasks</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Use a planner or digital calendar</span>
              </li>
              <li class="flex items-start gap-2">
                <span class="text-caluu-blue">•</span>
                <span>Set realistic goals</span>
              </li>
    </ul>
          </div>
        </div>
      </div>

      <div class="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
        <h2 class="text-2xl font-bold text-white mb-4">Need Help Calculating Your GPA?</h2>
        <p class="text-white/80 mb-4">Use our GPA Calculator to easily calculate your GPA and track your academic progress at UDSM.</p>
        <a href="/calculator" class="inline-flex items-center gap-2 bg-caluu-blue hover:bg-caluu-blue/90 text-white px-6 py-3 rounded-full font-semibold transition-colors">
          Try GPA Calculator
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </a>
      </div>
    </div>
  `,
  author: "Iman charlie",
  date: "2024-03-15",
  readTime: "5 min read",
  category: "GPA Calculation",
  tags: ["GPA", "Grades", "Academic Success", "Study Tips"],
  likes: 45,
  comments: 3,
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

interface CommentData {
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
}

interface Comment extends CommentData {
  id: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const currentUrl = window.location.href;
  const { user } = useAuth();
  const [likes, setLikes] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [showComments, setShowComments] = useState(false);

  // Load comments and likes on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load comments
        const commentsRef = ref(db, `posts/${blogPost.id}/comments`);
        onValue(commentsRef, (snapshot) => {
          const commentsData = snapshot.val();
          if (commentsData) {
            const loadedComments = Object.entries(commentsData).map(([id, data]: [string, CommentData]) => ({
              id,
              ...data as CommentData
            }));
            setComments(loadedComments);
          } else {
            setComments([]);
          }
        });

        // Load likes and check if user has liked
        const postRef = ref(db, `posts/${blogPost.id}`);
        onValue(postRef, (snapshot) => {
          const postData = snapshot.val();
          if (postData) {
            setLikes(postData.likes || 0);
            // Check if user has liked this post
            const userId = user?.uid || 'anonymous';
            if (postData.likedBy && postData.likedBy[userId]) {
              setIsLiked(true);
            }
          } else {
            // Initialize post if it doesn't exist
            set(postRef, {
              title: blogPost.title,
              likes: 0,
              likedBy: {},
              createdAt: new Date().toISOString()
            });
          }
        });

      } catch (error) {
        console.error("Error loading data:", error);
        toast.error("Error loading data");
      }
    };
    loadData();
  }, [blogPost.id, user?.uid]);

  // Handle like functionality
  const handleLike = async () => {
    try {
      const postRef = ref(db, `posts/${blogPost.id}`);
      const userId = user?.uid || 'anonymous';
      
      if (isLiked) {
        // Unlike: Remove user from likedBy and decrease count
        const updates = {
          likes: likes - 1,
          [`likedBy/${userId}`]: null
        };
        await update(postRef, updates);
      } else {
        // Like: Add user to likedBy and increase count
        const updates = {
          likes: likes + 1,
          [`likedBy/${userId}`]: true
        };
        await update(postRef, updates);
      }
      
      setIsLiked(!isLiked);
      toast.success(isLiked ? "Post unliked" : "Post liked!");
    } catch (error) {
      console.error("Failed to update like:", error);
      toast.error("Failed to update like");
    }
  };

  // Handle comment submission
  const handleAddComment = async (content: string) => {
    try {
      const newComment = {
        content,
        author: "anonymous",
        authorName: "Anonymous",
        createdAt: new Date().toISOString(),
      };

      const commentsRef = ref(db, `posts/${blogPost.id}/comments`);
      const newCommentRef = push(commentsRef);
      await set(newCommentRef, newComment);
      
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Failed to add comment:", error);
      toast.error("Failed to add comment");
    }
  };

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
              <button 
                onClick={handleLike}
                className={`flex items-center gap-2 transition-colors ${
                  isLiked ? 'text-caluu-blue' : 'text-white/80 hover:text-white'
                }`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span>{likes}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span>{comments.length}</span>
              </button>
            </div>
            
            <SocialShare
              title={blogPost.title}
              description={blogPost.content.substring(0, 160)}
              image={blogPost.image}
              url={currentUrl}
            />
          </motion.div>

          {/* Comments Section */}
          {showComments && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8"
            >
              <BlogComments
                postId={blogPost.id}
                initialComments={comments}
                onAddComment={handleAddComment}
              />
            </motion.div>
          )}

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