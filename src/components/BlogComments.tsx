import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User } from 'lucide-react';

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
}

const BlogComments = ({ postId, initialComments, onAddComment }: BlogCommentsProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsSubmitting(true);
    try {
      await onAddComment(newComment);
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-white/80">
        <MessageCircle className="w-5 h-5" />
        <h3 className="text-xl font-semibold">Comments ({comments.length})</h3>
      </div>

      {/* Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white/60" />
          </div>
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white/80 placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-caluu-blue"
              rows={3}
            />
            <div className="flex justify-end mt-2">
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="inline-flex items-center gap-2 bg-caluu-blue hover:bg-caluu-blue/90 text-white px-4 py-2 rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-6">
        {comments.map((comment, index) => (
          <motion.div
            key={comment.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-start gap-4"
          >
            <div className="flex-shrink-0 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white/60" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-medium text-white">
                  {comment.authorName}
                </span>
                <span className="text-sm text-white/40">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-white/80">{comment.content}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default BlogComments; 