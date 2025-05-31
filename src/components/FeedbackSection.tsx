import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageSquare, Bug, HelpCircle, Send, CheckCircle, XCircle } from 'lucide-react';
import { feedbackService } from '@/services/feedbackService';
import { toast } from 'react-hot-toast';

interface FeedbackSectionProps {
  postId?: string;
  programId?: string;
  academicYear?: string;
}

const FeedbackSection = ({ postId, programId, academicYear }: FeedbackSectionProps) => {
  const [feedbackType, setFeedbackType] = useState<'general' | 'bug' | 'help'>('general');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    // Validate title length
    if (title.length < 5) {
      toast.error('Title must be at least 5 characters long');
      return;
    }

    // Validate description length
    if (description.length < 20) {
      toast.error('Description must be at least 20 characters long');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // Modified to match backend expected format
      const feedbackData = {
        program_id: programId || postId, // Use programId if available, fallback to postId
        academic_year: academicYear,     // Changed from academic_year_id
        issue: feedbackType,             // Changed from type to issue
        description: description.trim(), // Keep as description
        // Keeping additional fields that might be useful
        title: title.trim(),
        createdAt: new Date().toISOString(),
      };
      
      console.log('Submitting feedback data:', feedbackData);
      
      await feedbackService.submitFeedback(feedbackData);
      setSubmitStatus('success');
      setTitle('');
      setDescription('');
      toast.success('Thank you for your feedback!');
    } catch (error: any) {
      setSubmitStatus('error');
      toast.error('Failed to submit feedback. Please try again.');
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const feedbackTypes = [
    {
      type: 'general' as const,
      icon: MessageSquare,
      label: 'General Feedback',
      description: 'Share your thoughts about the content'
    },
    {
      type: 'bug' as const,
      icon: Bug,
      label: 'Report Bug',
      description: 'Report any issues you encountered'
    },
    {
      type: 'help' as const,
      icon: HelpCircle,
      label: 'Get Help',
      description: 'Ask questions or request assistance'
    }
  ];

  return (
    <motion.div 
      className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h3 className="text-2xl font-semibold text-white mb-2">Feedback & Support</h3>
      <p className="text-white/80 mb-6">Help us improve by sharing your thoughts or getting assistance.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {feedbackTypes.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            type="button"
            onClick={() => setFeedbackType(type)}
            className={`flex flex-col items-center p-4 rounded-lg transition-all ${
              feedbackType === type
                ? 'bg-caluu-blue text-white shadow-lg scale-105'
                : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            <Icon className="w-6 h-6 mb-2" />
            <span className="font-medium">{label}</span>
            <span className="text-sm text-center mt-1 opacity-80">{description}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-white/90 mb-2 font-medium">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50"
            placeholder="Enter a descriptive title"
            required
            minLength={5}
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-white/90 mb-2 font-medium">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-white/10 text-white border border-white/20 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 placeholder-white/50 min-h-[120px] resize-y"
            placeholder="Describe your feedback, bug report, or question in detail"
            required
            minLength={20}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            isSubmitting
              ? 'bg-white/20 text-white/50 cursor-not-allowed'
              : 'bg-caluu-blue hover:bg-caluu-blue-light text-white hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Submit Feedback
            </>
          )}
        </button>

        {submitStatus === 'success' && (
          <motion.div 
            className="flex items-center gap-2 text-white bg-green-500 p-4 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <CheckCircle className="w-5 h-5 text-white" />
            <span className="font-medium">Thank you for your feedback! We'll review it shortly.</span>
          </motion.div>
        )}
        {submitStatus === 'error' && (
          <motion.div 
            className="flex items-center gap-2 text-white bg-red-500 p-4 rounded-lg shadow-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <XCircle className="w-5 h-5 text-white" />
            <span className="font-medium">Failed to submit feedback. Please try again.</span>
          </motion.div>
        )}
      </form>
    </motion.div>
  );
};

export default FeedbackSection;