import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Download, 
  Clock, 
  BookOpen, 
  Brain, 
  Coffee, 
  Target,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Shield,
  Award,
  AlertTriangle,
  Calculator,
  GraduationCap,
  ChevronRight,
  Users,
  Star,
  Sparkles,
  Share2,
  Heart,
  MessageCircle,
  Copy,
  Send
} from 'lucide-react';
import { toast } from 'sonner';

const ExamPreparation = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showGPAPrompt, setShowGPAPrompt] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showCareModal, setShowCareModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0
  });
  const [userCount, setUserCount] = useState(0);

  // Sharing message template
  const shareMessage = `Hello friend! Official UDSM UE timetable for semester 2 2024-2025 is out exams will start 2 July 2025. I hope you have it already and you have checked if there is no collisions of exams if not yet, download it through ${window.location.origin}/exam-preparation Caluu is an academic best friend tool for us UDSM students it also helps with GPA planning, tracking and supervision. Your Academics needs you and your friends needs you more kindly share with your friends to show real love and care to their future #NomoreAris3suprises`;
  const careMessage = "📚 Hey! I found this amazing tool with our UDSM timetable and GPA planning features. Since I care about your success too, I thought you should have access to it! 💪📚";

  // Fetch user count
  useEffect(() => {
    const fetchUserCount = async () => {
      try {
        const response = await fetch('https://caluu.pythonanywhere.com/api/admin/dashboard/');
        const data = await response.json();
        setUserCount(data.counts.user_count);
      } catch (error) {
        console.error('Error fetching user count:', error);
      }
    };
    fetchUserCount();
  }, []);

  // Calculate time until July 2nd, 2025
  useEffect(() => {
    const calculateTimeLeft = () => {
      const examDate = new Date(2025, 6, 2);
      const now = new Date();
      const difference = examDate.getTime() - now.getTime();
      
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setTimeLeft({ days, hours });
      } else {
        setTimeLeft({ days: 0, hours: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleDownloadTimetable = async () => {
    setIsDownloading(true);
    
    try {
      // Simulate a small delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      window.open('https://caluu.pythonanywhere.com/api/timetable/', '_blank');
      toast.success('Timetable downloaded successfully!');
      
      // Show GPA prompt after 3 seconds
      setTimeout(() => {
        setShowGPAPrompt(true);
      }, 3000);
    } catch (error) {
      toast.error('Failed to download timetable. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShare = async (platform, message = shareMessage) => {
    const url = window.location.href;
    const fullMessage = message + ' ' + url;
    
    switch (platform) {
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(fullMessage)}`, '_blank');
        toast.success('Shared on WhatsApp! 💚');
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(fullMessage);
          toast.success('Message copied to clipboard! 📋');
        } catch (err) {
          const textArea = document.createElement('textarea');
          textArea.value = fullMessage;
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          toast.success('Message copied to clipboard! 📋');
        }
        break;
      case 'sms':
        window.open(`sms:?body=${encodeURIComponent(fullMessage)}`, '_blank');
        toast.success('SMS app opened! 📱');
        break;
      default:
        break;
    }
  };

  const motivationalSlides = [
    {
      icon: <Sparkles className="w-12 h-12 text-yellow-400" />,
      title: "Your Academic Success Story Starts Now",
      description: "Every successful student started exactly where you are. The difference? They took action.",
      cta: "Start Your Journey",
      action: () => navigate('/register')
    },
    {
      icon: <TrendingUp className="w-12 h-12 text-green-400" />,
      title: "It's Not Too Late to Excel",
      description: "With the right tools and strategy, you can still achieve your academic goals.",
      cta: "See How It Works",
      action: () => navigate('/login')
    },
    {
      icon: <Target className="w-12 h-12 text-blue-400" />,
      title: "Join the Success Movement",
      description: `You'll be user #${userCount + 1} to join Caluu's community of achievers.`,
      cta: "Join Now",
      action: () => navigate('/register')
    }
  ];

  useEffect(() => {
    const slideTimer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % motivationalSlides.length);
    }, 5000);
    return () => clearInterval(slideTimer);
  }, [motivationalSlides.length]);

  return (
    <div className="min-h-screen bg-[#1a365d]">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-[#1a365d]">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0ibTM2IDM0di00aC0ydjRoLTR2Mmg0djRoMnYtNGg0di0ySDZ6TTYgNFYwSDR2NEgwdjJoNHY0aDJWNmg0VjRINnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 lg:py-24 relative">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm md:text-base mb-6">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              Exams Start July 2nd
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 leading-tight">
              Your Exam Timetable is
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 mt-2">
                Ready for Download
              </span>
            </h1>
         
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-6">
              <button
                onClick={handleDownloadTimetable}
                disabled={isDownloading}
                className={`px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-2xl transform hover:scale-105 ${
                  isDownloading 
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                    : 'bg-white text-[#1a365d] hover:bg-white/90 hover:shadow-white/20'
                }`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                    Downloading...
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    Download UDSM Timetable
                  </>
                )}
              </button>
              
              <button
                onClick={() => setShowCareModal(true)}
                className="bg-blue-500/20 text-blue-200 border border-blue-300/30 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-blue-500/30 transition-all duration-300 flex items-center justify-center gap-2 backdrop-blur-sm"
              >
                <Share2 className="w-5 h-5" />
                Share Timetable
              </button>
            </div>

            <p className="text-white/60 text-xs sm:text-sm">Free • No registration required • Instant download</p>
          </div>
        </div>
      </div>
{/* Countdown Timer */}
      <div className="bg-white/5 backdrop-blur-sm py-6 sm:py-8 border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6">Time Until Exams</h2>
            <div className="flex justify-center gap-4 sm:gap-8 text-white">
              <div className="bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20 min-w-[100px] sm:min-w-[120px]">
                <span className="text-3xl sm:text-4xl font-bold block">{timeLeft.days}</span>
                <p className="text-xs sm:text-sm text-white/70">Days</p>
              </div>
              <div className="bg-white/10 p-4 sm:p-6 rounded-xl border border-white/20 min-w-[100px] sm:min-w-[120px]">
                <span className="text-3xl sm:text-4xl font-bold block">{timeLeft.hours}</span>
                <p className="text-xs sm:text-sm text-white/70">Hours</p>
              </div>
            </div>
            <p className="text-white/60 mt-4 text-xs sm:text-sm">Time updates automatically</p>
          </div>
        </div>
      </div>

      {/* Tagline */}
      <div className="py-6 sm:py-8 bg-[#1a365d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 
  className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200 hover:from-blue-100 hover:to-cyan-100 transition-all duration-300 cursor-pointer"
  onClick={() => navigate('/')} // or window.location.href = '/' for vanilla JS
>
  Caluu - Your Academic Best Friend
</h2>
        </div>
      </div>
      {/* Care & Share Section */}
      <div className="py-8 sm:py-12 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-y border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-white/20">
            <Share2 className="w-12 h-12 text-blue-300 mx-auto mb-4" />
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Your Friends Need This Timetable Too! 📚
            </h2>
            <p className="text-base sm:text-lg text-white/90 mb-6">
              Don't let your friends miss out on the official UDSM exam schedule. Share this timetable with them so they can plan their studies properly and succeed together!
            </p>
            <button
              onClick={() => setShowCareModal(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-full font-semibold text-lg hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 flex items-center justify-center mx-auto gap-2 transform hover:scale-105 shadow-lg"
            >
              <Share2 className="w-5 h-5" />
              Share Timetable with Friends
            </button>
          </div>
        </div>
      </div>

      

      {/* Motivational Message */}
      <div className="py-8 sm:py-12 bg-white/5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Don't Worry, You've Got This!</h2>
          <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8">
            Success is closer than you think. With the right tools and mindset, you can achieve anything.
          </p>
        </div>
      </div>

      {/* Motivational Slideshow */}
      <div className="py-12 sm:py-16 bg-[#1a365d]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/20">
            <div className="text-center min-h-[250px] sm:min-h-[300px] flex flex-col justify-center">
              <div className="mb-4 sm:mb-6">{motivationalSlides[currentSlide].icon}</div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 sm:mb-6">
                {motivationalSlides[currentSlide].title}
              </h2>
              <p className="text-base sm:text-xl text-white/80 mb-6 sm:mb-8 max-w-2xl mx-auto">
                {motivationalSlides[currentSlide].description}
              </p>
              <button
                onClick={motivationalSlides[currentSlide].action}
                className="bg-white text-[#1a365d] px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-base sm:text-lg hover:bg-white/90 transition-all duration-300 flex items-center justify-center mx-auto gap-2 transform hover:scale-105"
              >
                {motivationalSlides[currentSlide].cta}
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex justify-center gap-2 mt-6 sm:mt-8">
              {motivationalSlides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* GPA Prompt Modal */}
      {showGPAPrompt && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <div className="text-center">
              <Calculator className="w-12 h-12 sm:w-16 sm:h-16 text-[#1a365d] mx-auto mb-4" />
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Quick Question...
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Have you planned your GPA strategy? Do you know your current academic status? Don't tell me you are waiting to be surprised by ARIS 3😮?
              </p>
              <div className="flex gap-3 sm:gap-4">
                <button
                  onClick={() => {
                    setShowGPAPrompt(false);
                    navigate('/login');
                  }}
                  className="flex-1 bg-[#1a365d] text-white px-4 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-[#2d4a68] transition-colors text-sm sm:text-base"
                >
                  Plan My GPA
                </button>
                <button
                  onClick={() => {
                    setShowGPAPrompt(false);
                    setShowShareModal(true);
                  }}
                  className="flex-1 bg-gray-200 text-gray-700 px-4 py-2.5 sm:py-3 rounded-xl font-semibold hover:bg-gray-300 transition-colors text-sm sm:text-base"
                >
                  Already planned
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal (After GPA Planning) */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Amazing! You're Prepared! 🎉
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Since you're already on top of your GPA planning, why not help your friends who might be struggling? Show them you care by sharing this life-changing tool!
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 text-left">
                <p className="text-xs text-gray-500 mb-2">Share this caring message:</p>
                <p className="text-sm text-gray-700 italic">
                  "{careMessage}"
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => handleShare('whatsapp', careMessage)}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share on WhatsApp
                </button>
                
                <button
                  onClick={() => handleShare('copy', careMessage)}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Message
                </button>

                <button
                  onClick={() => handleShare('sms', careMessage)}
                  className="w-full bg-purple-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send SMS
                </button>
              </div>
              
              <button
                onClick={() => setShowShareModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Care & Share Modal */}
      {showCareModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl sm:rounded-2xl p-6 sm:p-8 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                Share the Timetable! 📚
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-6">
                Your friends need this official UDSM timetable too. Help them stay organized and prepared for exams by sharing this tool with them!
              </p>
              
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg mb-6 text-left border border-blue-200">
                <p className="text-xs text-gray-500 mb-2">Share this message:</p>
                <p className="text-sm text-gray-700 italic">
                  "{shareMessage}"
                </p>
              </div>
              
              <div className="space-y-3 mb-6">
                <button
                  onClick={() => {
                    handleShare('whatsapp');
                    setShowCareModal(false);
                  }}
                  className="w-full bg-green-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  Share on WhatsApp
                </button>
                
                <button
                  onClick={() => {
                    handleShare('copy');
                    setShowCareModal(false);
                  }}
                  className="w-full bg-blue-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Copy className="w-5 h-5" />
                  Copy Message
                </button>

                <button
                  onClick={() => {
                    handleShare('sms');
                    setShowCareModal(false);
                  }}
                  className="w-full bg-purple-500 text-white px-4 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  <Send className="w-5 h-5" />
                  Send SMS
                </button>
              </div>
              
              <button
                onClick={() => setShowCareModal(false)}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-[#1a365d] border-t border-white/10 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center space-y-4 sm:space-y-6">
            <div className="flex space-x-4 sm:space-x-6">
              <a
                href="mailto:gpacaluu@gmail.com"
                className="text-white/70 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/0614021404"
                className="text-white/70 hover:text-white transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </a>
            </div>

            <div className="text-center text-white/60 text-xs sm:text-sm">
              <p>© {new Date().getFullYear()} Kodin. All rights reserved.</p>
              <p className="mt-2">Empowering students to achieve academic excellence</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ExamPreparation;