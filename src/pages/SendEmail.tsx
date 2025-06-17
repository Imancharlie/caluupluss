import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Mail, CheckCircle, XCircle, Clock, Users } from 'lucide-react';

interface EmailProgress {
  total: number;
  sent: number;
  failed: number;
  inProgress: boolean;
  completed: boolean;
  errors: string[];
}

const SendEmail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<EmailProgress>({
    total: 0,
    sent: 0,
    failed: 0,
    inProgress: false,
    completed: false,
    errors: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.is_staff) {
      toast.error('Unauthorized access');
      return;
    }

    setIsLoading(true);
    setProgress({
      total: 0,
      sent: 0,
      failed: 0,
      inProgress: true,
      completed: false,
      errors: []
    });

    try {
      // First, get the total number of users
      const userCountResponse = await fetch('https://caluu.pythonanywhere.com/api/admin/user-count/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      let totalUsers = 0;
      if (userCountResponse.ok) {
        const userCountData = await userCountResponse.json();
        totalUsers = userCountData.count || 0;
        setProgress(prev => ({ ...prev, total: totalUsers }));
      }

      // Start the email sending process
      const response = await fetch('https://caluu.pythonanywhere.com/api/admin/send-email/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ subject, message })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      const result = await response.json();
      
      setProgress({
        total: result.total_users || totalUsers,
        sent: result.successful_sends || 0,
        failed: result.failed_sends || 0,
        inProgress: false,
        completed: true,
        errors: result.errors || []
      });

      if (result.successful_sends > 0) {
        toast.success(`Email sent successfully to ${result.successful_sends} users`);
      }
      
      if (result.failed_sends > 0) {
        toast.error(`Failed to send to ${result.failed_sends} users`);
      }

      setSubject('');
      setMessage('');
    } catch (error) {
      setProgress(prev => ({
        ...prev,
        inProgress: false,
        completed: true,
        errors: [...prev.errors, error instanceof Error ? error.message : 'Unknown error']
      }));
      toast.error('Failed to send email');
      console.error('Error sending email:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetProgress = () => {
    setProgress({
      total: 0,
      sent: 0,
      failed: 0,
      inProgress: false,
      completed: false,
      errors: []
    });
  };

  return (
    <div className="min-h-screen bg-caluu-blue-dark p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-6 md:mb-8">
          <button
            onClick={() => navigate('/admin')}
            className="text-white hover:text-white/80 flex items-center"
          >
            ← Back to Admin Panel
          </button>
        </div>

        <h1 className="text-2xl md:text-3xl font-bold text-white mb-6 md:mb-8 flex items-center">
          <Mail className="mr-3" size={28} />
          Send Email to Users
        </h1>

        {/* Progress Section */}
        {(progress.inProgress || progress.completed) && (
          <div className="mb-6 p-4 bg-white/10 rounded-lg border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              {progress.inProgress ? (
                <Clock className="mr-2 animate-spin" size={20} />
              ) : (
                <CheckCircle className="mr-2" size={20} />
              )}
              Email Sending Progress
            </h3>
            
            <div className="space-y-4">
              {/* Progress Bar */}
              {progress.total > 0 && (
                <div>
                  <div className="flex justify-between text-sm text-white/70 mb-2">
                    <span>Progress</span>
                    <span>{progress.sent + progress.failed} / {progress.total} ({Math.round(((progress.sent + progress.failed) / progress.total) * 100)}%)</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((progress.sent + progress.failed) / progress.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-white/5 rounded-lg">
                  <div className="text-2xl font-bold text-white">{progress.total}</div>
                  <div className="text-sm text-white/70">Total Users</div>
                </div>
                <div className="text-center p-3 bg-green-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-400">{progress.sent}</div>
                  <div className="text-sm text-green-400/70">Successfully Sent</div>
                </div>
                <div className="text-center p-3 bg-red-500/20 rounded-lg">
                  <div className="text-2xl font-bold text-red-400">{progress.failed}</div>
                  <div className="text-sm text-red-400/70">Failed</div>
                </div>
              </div>

              {/* Status Message */}
              {progress.inProgress && (
                <div className="text-center p-3 bg-blue-500/20 rounded-lg">
                  <div className="text-blue-400 font-medium">
                    Sending emails... Please wait
                  </div>
                  <div className="text-sm text-blue-400/70 mt-1">
                    This may take a few minutes depending on the number of users
                  </div>
                </div>
              )}

              {progress.completed && (
                <div className="text-center p-3 bg-green-500/20 rounded-lg">
                  <div className="text-green-400 font-medium">
                    Email sending completed!
                  </div>
                  <div className="text-sm text-green-400/70 mt-1">
                    {progress.sent} emails sent successfully
                    {progress.failed > 0 && `, ${progress.failed} failed`}
                  </div>
                </div>
              )}

              {/* Error Details */}
              {progress.errors.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-white mb-2 flex items-center">
                    <XCircle className="mr-2" size={16} />
                    Errors ({progress.errors.length})
                  </h4>
                  <div className="max-h-32 overflow-y-auto space-y-1">
                    {progress.errors.map((error, index) => (
                      <div key={index} className="text-xs text-red-400 bg-red-500/10 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reset Button */}
              {progress.completed && (
                <button
                  onClick={resetProgress}
                  className="mt-4 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
                >
                  Clear Progress
                </button>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="subject" className="block text-sm font-medium text-white mb-2">
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter email subject"
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-white mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={8}
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-white/50"
              placeholder="Enter your message"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white text-caluu-blue-dark rounded-lg font-medium hover:bg-white/90 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Clock className="animate-spin mr-2" size={20} />
                Sending Emails...
              </>
            ) : (
              <>
                <Mail className="mr-2" size={20} />
                Send Email to All Users
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SendEmail; 