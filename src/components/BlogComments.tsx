import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, ChevronDown, ChevronUp, LogIn } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';

interface Comment {
  id: string;
  content: string;
  author: string;
  authorName: string;
  createdAt: string;
}

interface BlogCommentsProps {
  postId: string;
  initialComments: Comment[];
  onAddComment: (content: string) => Promise<void>;
  isAuthenticated: boolean;
}

const BlogComments = ({ postId, initialComments, onAddComment, isAuthenticated }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleComments = () => {
    if (!isAuthenticated) {
      setIsExpanded(true); // Show the login prompt
      return;
    }
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6">
      <button
        onClick={toggleComments}
        className="w-full flex items-center justify-between text-white/80 hover:text-white transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          <span className="font-semibold">Comments ({comments.length})</span>
        </div>
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </motion.div>
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            {!isAuthenticated ? (
              <div className="mt-6 text-center py-8">
                <div className="bg-white/5 rounded-lg p-6">
                  <LogIn className="w-12 h-12 text-white/60 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Login to View Comments</h3>
                  <p className="text-white/60 mb-6">Please login to view and add comments to this post.</p>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 bg-caluu-blue hover:bg-caluu-blue/90 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    <LogIn className="w-4 h-4" />
                    Login Now
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Comment Form */}
                <form onSubmit={handleSubmit} className="mt-6 mb-8">
                  <div className="flex gap-4">
                    <input
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-2 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                    />
                    <button
                      type="submit"
                      disabled={isSubmitting || !newComment.trim()}
                      className={`bg-caluu-blue text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                        isSubmitting || !newComment.trim()
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-caluu-blue/90'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      {isSubmitting ? 'Posting...' : 'Post'}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-white/5 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">{comment.authorName}</span>
                        <span className="text-white/60 text-sm">
                          {new Date(comment.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-white/80">{comment.content}</p>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogComments; 