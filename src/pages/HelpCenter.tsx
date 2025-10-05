import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mail, MessageSquare, Phone, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useAppStore } from '@/store';
import api from '@/lib/api';

const faqs = [
  { q: 'How do I reset my password?', a: 'Go to Forgot Password from the login page, enter your email, and follow the instructions sent to your inbox.' },
  { q: 'How do I complete my profile?', a: 'After registration, you will be redirected to Complete Profile to pick university, college, program, year and semester.' },
  { q: 'Why can’t I see my courses?', a: 'Ensure your profile is completed and you have enrolled/confirmed courses for the current year and semester.' },
  { q: 'How do I build my timetable?', a: 'Open Timetable, click a time slot, choose a course, day and class type, then save. Repeat for each class.' },
  { q: 'How do I calculate my GPA?', a: 'Use the GPA Calculator page. Enter your courses with credits and grades, then view your GPA and insights.' },
];

const HelpCenter: React.FC = () => {
  const navigate = useNavigate();
  const { toastSuccess, toastError } = useToast();
  const { user } = useAppStore();
  const groupedFaqs = useMemo(() => [faqs.slice(0, Math.ceil(faqs.length / 2)), faqs.slice(Math.ceil(faqs.length / 2))], []);
  const [subject, setSubject] = useState('General Inquiry');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) {
      toastError({ title: 'Message Required', description: 'Please enter your message.' });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user email is valid, otherwise use fallback
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const userEmail = user?.email && emailRegex.test(user.email) ? user.email : 'anonymous@example.com';
      const userName = user?.first_name && user?.last_name 
        ? `${user.first_name} ${user.last_name}` 
        : user?.username || 'Anonymous User';

      const messageData = {
        subject,
        message,
        user_email: userEmail,
        user_name: userName
      };

      // Debug: Log what we're sending
      console.log('Sending message data:', messageData);
      console.log('User data:', { email: user?.email, display_name: user?.display_name, first_name: user?.first_name, last_name: user?.last_name, username: user?.username });

      const response = await api.post('/help-center/messages/', messageData);
      
      if (response.data.success) {
        toastSuccess({ 
          title: 'Message Sent!', 
          description: `Ticket #${response.data.ticket_number} - ${response.data.message}` 
        });
      } else {
        throw new Error(response.data.message || 'Failed to send message');
      }
      
      // Reset form
      setSubject('General Inquiry');
      setMessage('');
      
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      // Log the full error response for debugging
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
        
        // Log specific validation errors
        if (error.response.data.errors) {
          console.error('Validation errors:', error.response.data.errors);
        }
      }
      
      // Extract error message from response
      let errorMessage = 'Please try again or contact us directly.';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toastError({ 
        title: 'Failed to Send', 
        description: errorMessage
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Help Center</h1>
            <p className="text-gray-600 mt-1 text-sm">Send us a message or use the contacts below</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-caluu-blue hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <Card className="mb-6">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input placeholder="Search help topics (e.g., password, timetable, GPA)" className="flex-1 h-9 text-sm" />
              <Button variant="outline" className="gap-2 h-9 px-3 text-sm">
                Search
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Compact message form */}
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Send a message</CardTitle>
            <CardDescription className="text-gray-600 text-sm">Choose a subject and write your message. We’ll get back to you by email.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none bg-white text-sm"
              >
                <option value="General Inquiry">💬 General Question</option>
                <option value="Account & Login">🔐 Account & Login Issues</option>
                <option value="Timetable Help">📅 Timetable & Classes</option>
                <option value="GPA Calculator">📊 GPA Calculator Help</option>
                <option value="Bug Report">🐛 Bug Report</option>
                <option value="Feature Request">💡 Feature Request</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={5}
                placeholder="Type your message here..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-caluu-blue focus:border-transparent outline-none bg-white text-sm"
              />
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleSend} 
                disabled={isSubmitting}
                className="bg-caluu-blue hover:bg-caluu-blue-light text-white h-9 px-4 text-sm disabled:opacity-50"
              >
                {isSubmitting ? 'Sending...' : 'Send Message'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {groupedFaqs.map((group, idx) => (
            <div key={idx} className="space-y-3">
              {group.map((item, i) => (
                <Card key={i} className="bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base text-gray-900">{item.q}</CardTitle>
                    <CardDescription className="text-gray-600 text-sm">{item.a}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          ))}
        </div>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-gray-900 text-lg">Other ways to reach us</CardTitle>
            <CardDescription className="text-gray-600 text-sm">Use any of the options below.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <a href="mailto:kodinsoftwares@gmail.com" className="block">
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                <Mail className="w-5 h-5 text-caluu-blue" />
                <div>
                  <p className="text-gray-900 font-medium text-sm">Email</p>
                  <p className="text-gray-600 text-xs">kodinsoftwares@gmail.com</p>
                </div>
              </div>
            </a>
            <a href="https://wa.me/255792267622" target="_blank" rel="noreferrer" className="block">
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-caluu-blue" />
                <div>
                  <p className="text-gray-900 font-medium text-sm">WhatsApp Chat</p>
                  <p className="text-gray-600 text-xs">+255 792 267 622</p>
                </div>
              </div>
            </a>
            <a href="tel:0614021404" className="block">
              <div className="p-3 border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
                <Phone className="w-5 h-5 text-caluu-blue" />
                <div>
                  <p className="text-gray-900 font-medium text-sm">Call</p>
                  <p className="text-gray-600 text-xs">0614 021 404</p>
                </div>
              </div>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HelpCenter;
