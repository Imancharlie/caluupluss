import { useState, useEffect } from 'react';
import {
  Calculator,
  Calendar,
  MessageSquare,
  Newspaper,
  Shield,
  TrendingUp,
  Users,
  Target,
  Sparkles,
  BookOpen,
  Bell,
  Award,
  ChevronRight,
  Play,
  X,
  Menu,
  Zap,
  Brain,
  Rocket,
  Heart,
  Star,
  Link
} from 'lucide-react';

function App() {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const slides = [
    {
      title: 'Achieve Academic Excellence',
      description: 'Track progress, predict grades, and unlock your potential with AI-powered insights',
      gradient: 'from-caluu-blue via-caluu-blue-light to-caluu-blue',
      image: '/blog/online-learning.jpg'
    },
    {
      title: 'Smart Study Companion',
      description: 'Get personalized study plans, course recommendations, and 24/7 academic support',
      gradient: 'from-caluu-blue to-caluu-blue-light',
      image: '/blog/scholarships.jpg'
    },
    {
      title: 'All University Students in Tanzania',
      description: 'Join thousands of Tanzanian students already excelling with Caluu+ across all universities',
      gradient: 'from-caluu-blue via-caluu-blue-light to-caluu-blue',
      image: '/blog/Chec_me.jpg'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah M.',
      role: 'Computer Science, Year 3',
      text: 'From 3.2 to 3.8 GPA in two semesters! Mr. Caluu guided my every step and predicted exactly what grades I needed.',
      rating: 5,
      highlight: 'GPA Boost'
    },
    {
      name: 'James K.',
      role: 'Business Administration, Year 2',
      text: 'The internship I landed through Caluu+ connections changed everything. This app actually delivers real opportunities.',
      rating: 5,
      highlight: 'Career Launch'
    },
    {
      name: 'Amara T.',
      role: 'Engineering, Year 4',
      text: 'Final year perfection! Mr. Caluu helped me map out every course and deadline. Graduating with honors was never in doubt.',
      rating: 5,
      highlight: 'Perfect Planning'
    }
  ];

  const faqs = [
    {
      question: 'What makes Caluu+ different from other student apps?',
      answer: 'Caluu+ is an AI-powered academic companion that goes beyond basic tracking. We combine GPA calculation, smart scheduling, personalized AI guidance, opportunity discovery, and a purpose-driven community all in one platform.'
    },
    {
      question: 'How does Mr. Caluu help with academic planning?',
      answer: 'Mr. Caluu is our AI chatbot trained specifically for academic excellence. It provides personalized course recommendations, study strategies, performance forecasting, and answers university-specific questions. It learns your goals and helps you create actionable plans to achieve them.'
    },
    {
      question: 'Is Caluu+ available for my university?',
      answer: 'Yes! Caluu+ supports students across all universities. Our platform is designed to work with any academic system, and Mr. Caluu has comprehensive knowledge about various university structures and requirements.'
    },
    {
      question: 'How does the community feature work?',
      answer: 'Caluu+ connects you with ambitious, purpose-driven students who share your passion for excellence. Discover opportunities, join study groups, attend events, and build meaningful connections that support your academic and career goals.'
    },
    {
      question: 'Can Caluu+ help me discover my purpose?',
      answer: 'Absolutely. Many students feel they\'re capable of more but don\'t know where to start. Mr. Caluu guides you through self-discovery with personalized insights, helps you explore your strengths, and suggests paths aligned with your potential.'
    },
    {
      question: 'Is my data safe and private?',
      answer: 'Yes. We use enterprise-grade security with modern authentication. Your academic data, conversations with Mr. Caluu, and personal information are encrypted and never shared without your explicit permission.'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 relative overflow-hidden">
      {/* Modern Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-96 right-20 w-80 h-80 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-40 left-1/4 w-64 h-64 bg-gradient-to-r from-orange-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-2000"></div>

        {/* Floating geometric shapes */}
        <div className="absolute top-1/4 right-1/4 w-2 h-2 bg-blue-400/60 rounded-full animate-bounce delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400/60 rounded-full animate-bounce delay-700"></div>
        <div className="absolute bottom-1/3 left-1/3 w-3 h-3 bg-emerald-400/40 rounded-full animate-bounce delay-300"></div>
      </div>

      {/* Modern Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/90 border-b border-white/20 shadow-lg">
        <div className="container mx-auto px-4 lg:px-8 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2" onClick={() => window.location.href = '/splash'}>
                <img
                  src="/logo.png"
                  alt="Caluu+"
                  className="h-10 w-auto object-contain"
                />
              </button>
            </div>

            {/* Modern Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-8 text-sm font-medium">
              <a href="#features" className="text-slate-600 hover:text-caluu-blue transition-all duration-200 hover:scale-105">Features</a>
              <a href="#how-it-works" className="text-slate-600 hover:text-caluu-blue transition-all duration-200 hover:scale-105">How It Works</a>
              <a href="#testimonials" className="text-slate-600 hover:text-caluu-blue transition-all duration-200 hover:scale-105">Success Stories</a>
              <a href="#faq" className="text-slate-600 hover:text-caluu-blue transition-all duration-200 hover:scale-105">FAQ</a>
            </nav>

            <div className="flex items-center gap-3">
              <button
                className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-caluu-blue to-caluu-blue-light rounded-xl hover:from-caluu-blue-light hover:to-caluu-blue transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                onClick={() => window.location.href = '/login'}
              >
                Login
              </button>
            </div>
          </div>

        </div>
      </header>

      {/* Modern Hero Section */}
      <section className="relative pt-8 pb-16 lg:pt-12 lg:pb-24">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-3 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-full text-sm font-semibold text-emerald-700 mb-4 sm:mb-6 border border-emerald-200">
                <Zap className="w-4 h-4" />
                <span className="text-sm sm:text-base">AI-Powered Academic Excellence</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-6">
                <span className="text-slate-900">Your AI</span>
                <br />
                <span className="bg-gradient-to-r from-caluu-blue via-caluu-blue-light to-caluu-blue bg-clip-text text-transparent">
                  Academic Best Friend
                </span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 leading-relaxed max-w-2xl">
                Unlock your potential with personalized AI guidance, smart GPA tracking, and a community of ambitious students. From course planning to career opportunities— we've got your back.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
                <button
                  className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-caluu-blue via-caluu-blue-light to-caluu-blue rounded-xl sm:rounded-2xl hover:from-caluu-blue-light hover:via-caluu-blue hover:to-caluu-blue-dark transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-2 sm:gap-3 relative overflow-hidden group"
                  onClick={() => window.location.href = '/register'}
                >
                  <Rocket className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="relative z-10">Start Free Today</span>
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 text-base sm:text-lg font-semibold text-slate-700 bg-white/80 backdrop-blur-sm border-2 border-slate-200 rounded-xl sm:rounded-2xl hover:border-caluu-blue hover:bg-caluu-blue/5 transition-all duration-300 flex items-center justify-center gap-2 sm:gap-3 hover:scale-105"
                >
                  <Play className="w-5 h-5 sm:w-6 sm:h-6" />
                  See How It Works
                </button>
              </div>

              {/* Modern Stats */}
              <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-6 sm:pt-8">
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-110 transition-transform">500+</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-600">Active Students</div>
                  <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-caluu-blue to-caluu-blue-light rounded-full mx-auto mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-110 transition-transform">7,949+</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-600">Usage</div>
                  <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-caluu-blue to-caluu-blue-light rounded-full mx-auto mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent mb-1 sm:mb-2 group-hover:scale-110 transition-transform">4.8★</div>
                  <div className="text-xs sm:text-sm font-medium text-slate-600">User Rating</div>
                  <div className="w-8 sm:w-12 h-1 bg-gradient-to-r from-caluu-blue to-caluu-blue-light rounded-full mx-auto mt-1 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
              </div>
            </div>

            {/* Modern Slideshow */}
            <div className="relative">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/20 bg-white/10 backdrop-blur-sm">
                <div className="aspect-[4/3] relative">
                  {slides.map((slide, index) => (
                    <div
                      key={index}
                      className={`absolute inset-0 transition-all duration-1000 ${
                        index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    >
                      <div className={`w-full h-full bg-gradient-to-br ${slide.gradient} relative overflow-hidden`}>
                        {/* Background Image */}
                        <div className="absolute inset-0">
                          <img
                            src={slide.image}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                          {/* Light blue transparency overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/60 via-blue-500/50 to-blue-600/60"></div>
                        </div>

                        {/* Animated background pattern */}
                        <div className="absolute inset-0 opacity-10">
                          <div className="absolute top-10 left-10 w-20 h-20 border border-white/20 rounded-full animate-pulse"></div>
                          <div className="absolute bottom-20 right-15 w-16 h-16 border border-white/20 rounded-full animate-pulse delay-1000"></div>
                          <div className="absolute top-1/2 left-1/4 w-12 h-12 border border-white/20 rounded-full animate-pulse delay-500"></div>
                        </div>

                        {/* Floating icons */}
                        <div className="absolute top-8 right-8 opacity-20">
                          <Brain className="w-12 h-12 text-white animate-bounce" />
                        </div>
                        <div className="absolute bottom-12 left-12 opacity-20">
                          <Target className="w-8 h-8 text-white animate-pulse delay-700" />
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 lg:p-10 text-white">
                          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-4 leading-tight">{slide.title}</h3>
                          <p className="text-sm sm:text-base lg:text-lg opacity-90 leading-relaxed max-w-lg">{slide.description}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Modern slide indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-3">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`relative transition-all duration-300 ${
                        index === currentSlide
                          ? 'w-12 h-3 bg-white rounded-full'
                          : 'w-3 h-3 bg-white/40 rounded-full hover:bg-white/60'
                      }`}
                    >
                      {index === currentSlide && (
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Features Section */}
      <section id="features" className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-900">Everything You Need</span>
              <br />
              <span className="bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent">
                to Excel Academically
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive AI-powered tools designed for ambitious students who refuse to settle for average results
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GPA Calculator */}
            <div className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-caluu-blue hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-caluu-blue/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Calculator className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Smart GPA Calculator</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Simulate outcomes, track progress in real-time, and get AI-powered predictions for your academic performance
                </p>
              </div>
            </div>

            {/* Smart Timetable */}
            <div className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-caluu-blue hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-caluu-blue/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Calendar className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Intelligent Timetable</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  AI-optimized scheduling with smart reminders and conflict detection—never miss a deadline again
                </p>
              </div>
            </div>

            {/* Mr. Caluu AI */}
            <div className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-emerald-200 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Mr. Caluu AI Assistant</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Your 24/7 academic mentor powered by advanced AI—get personalized guidance, study strategies, and instant answers
                </p>
              </div>
            </div>

            {/* Important Links */}
            <div className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-caluu-blue hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-caluu-blue/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Link className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Important Links</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Quick access to essential university resources including ARIS, loan board portals, academic calendars, and other important institutional websites
                </p>
              </div>
            </div>

            {/* Opportunities Hub */}
            <div className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-caluu-blue hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-caluu-blue/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Opportunity Discovery</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  AI-curated scholarships, internships, competitions, and events perfectly matched to your profile and interests
                </p>
              </div>
            </div>

            {/* Articles */}
            <div className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:border-caluu-blue hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-2">
              <div className="absolute inset-0 bg-gradient-to-br from-caluu-blue/5 to-transparent rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Newspaper className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-3 sm:mb-4">Articles</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Access expert-written articles on purpose discovery, relationships, inspirational stories, scholarships, and career guidance from professional experts sharing their experience
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern How It Works */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-gradient-to-br from-slate-50 to-white relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-900">How Caluu+ Transforms</span>
              <br />
              <span className="bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent">
                Your Academic Journey
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Four powerful AI-driven pathways that guide you from where you are to where you want to be
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="group flex gap-6 sm:gap-8 p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-1">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                1
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Target Achievement Engine</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Set your dream GPA and watch AI create a personalized roadmap. Our algorithms analyze your current performance and prescribe exactly what grades you need in each upcoming course to hit your target.
                </p>
              </div>
            </div>

            <div className="group flex gap-6 sm:gap-8 p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 hover:-translate-y-1">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                2
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">24/7 AI Academic Mentor</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Mr. Caluu never sleeps. Get instant, contextual answers about university policies, course selection strategies, study techniques, and personalized guidance tailored to your unique academic profile.
                </p>
              </div>
            </div>

            <div className="group flex gap-6 sm:gap-8 p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-1">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                3
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Opportunity Intelligence Network</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  AI-curated opportunities land in your inbox. From scholarships and internships to competitions and events—every recommendation is personalized to your interests, skills, and career trajectory.
                </p>
              </div>
            </div>

            <div className="group flex gap-6 sm:gap-8 p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-1">
              <div className="flex-shrink-0 w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light text-white rounded-xl sm:rounded-2xl flex items-center justify-center font-bold text-xl sm:text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                4
              </div>
              <div className="flex-1">
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3 sm:mb-4">Purpose Discovery Journey</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  Feel like you're capable of more? Our AI guides you through structured self-discovery, revealing hidden strengths and passions. Transform from "good student" to "purpose-driven achiever."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Testimonials */}
      <section id="testimonials" className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
              <span className="text-slate-900">Real Students.</span>
              <br />
              <span className="bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent">
                Real Results.
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Join 10,000+ students who've transformed their academic journey with AI-powered excellence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group relative p-6 sm:p-8 bg-white/80 backdrop-blur-sm rounded-2xl sm:rounded-3xl border border-white/50 hover:shadow-2xl hover:shadow-caluu-blue/10 transition-all duration-500 hover:-translate-y-2">
                {/* Highlight Badge */}
                <div className="absolute -top-3 sm:-top-4 left-4 sm:left-6 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-caluu-blue to-caluu-blue-light text-white text-xs sm:text-sm font-bold rounded-full shadow-lg">
                  {testimonial.highlight}
                </div>

                {/* Profile Section */}
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6 mt-3 sm:mt-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                    <span className="text-lg sm:text-2xl font-bold text-white">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-bold text-lg sm:text-xl text-slate-900">{testimonial.name}</div>
                    <div className="text-xs sm:text-sm text-slate-600">{testimonial.role}</div>
                  </div>
                </div>

                {/* Rating Stars */}
                <div className="flex gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                {/* Testimonial Text */}
                <p className="text-slate-700 leading-relaxed text-lg italic">"{testimonial.text}"</p>

                {/* Decorative Elements */}
                <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                  <Heart className="w-8 h-8 text-blue-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-12 lg:py-20 bg-gradient-to-b from-gray-50 to-white relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-3">
              Frequently Asked Questions
            </h2>
            <p className="text-sm sm:text-base text-gray-600">
              Everything you need to know about Caluu+
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-semibold text-gray-900 pr-8">{faq.question}</span>
                  <ChevronRight
                    className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform ${
                      activeFaq === index ? 'rotate-90' : ''
                    }`}
                  />
                </button>
                {activeFaq === index && (
                  <div className="px-6 pb-4 text-gray-600 leading-relaxed text-sm">
                    {faq.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modern CTA Section */}
      <section className="py-16 lg:py-24 relative">
        <div className="container mx-auto px-4 lg:px-8 max-w-6xl">
          <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 rounded-3xl p-16 lg:p-20 text-center shadow-2xl border border-white/10">
            {/* Background decorations */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full -mr-36 -mt-36 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            {/* Floating icons */}
            <div className="absolute top-8 left-8 opacity-20">
              <Rocket className="w-12 h-12 text-blue-400 animate-bounce" />
            </div>
            <div className="absolute bottom-8 right-8 opacity-20">
              <Brain className="w-10 h-10 text-purple-400 animate-pulse" />
            </div>

            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 sm:mb-8 leading-tight">
                Ready to Unlock Your
                <br />
                <span className="bg-gradient-to-r from-caluu-blue to-caluu-blue-light bg-clip-text text-transparent">
                  Academic Potential?
                </span>
              </h2>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed">
                Join us to reach our goal of reaching 10,000+ ambitious students in Tanzania and help them in transforming their academic journey with AI-powered excellence
              </p>

              <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                <button
                  className="px-8 sm:px-10 lg:px-12 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl font-bold text-white bg-gradient-to-r from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl hover:from-caluu-blue-light hover:to-caluu-blue transition-all duration-300 shadow-2xl hover:shadow-3xl hover:scale-105 flex items-center gap-2 sm:gap-3 group"
                  onClick={() => window.location.href = '/register'}
                >
                  <Rocket className="w-6 h-6 sm:w-7 sm:h-7" />
                  <span className="relative z-10">Start Your Journey Today</span>
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 relative z-10 group-hover:translate-x-1 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl sm:rounded-2xl"></div>
                </button>

                <div className="text-slate-400 text-sm">
                  <span className="opacity-75">✓ Free forever</span>
                  <span className="mx-2">•</span>
                  <span className="opacity-75">✓ No credit card required</span>
                  <span className="mx-2">•</span>
                  <span className="opacity-75">✓ Setup in 2 minutes</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Casual Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-400 rounded-full blur-3xl"></div>
                </div>

        <div className="container mx-auto px-4 lg:px-8 py-16 max-w-7xl relative">
          <div className="text-center">
            {/* Logo and tagline */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <span className="font-bold text-3xl bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Caluu+</span>
            </div>

            <p className="text-slate-300 text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
              Your AI-powered academic best friend. Built for students who dream big and study smart.
            </p>

            {/* Simple navigation */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8 sm:mb-12 text-sm">
              <a href="#features" className="text-slate-400 hover:text-caluu-blue transition-colors hover:scale-105">Features</a>
              <a href="#how-it-works" className="text-slate-400 hover:text-caluu-blue transition-colors hover:scale-105">How It Works</a>
              <a href="#testimonials" className="text-slate-400 hover:text-caluu-blue transition-colors hover:scale-105">Success Stories</a>
              <a href="#faq" className="text-slate-400 hover:text-caluu-blue transition-colors hover:scale-105">FAQ</a>
            </div>

            {/* CTA */}
            <div className="mb-6 sm:mb-8">
              <button
                className="px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-caluu-blue to-caluu-blue-light rounded-xl sm:rounded-2xl hover:from-caluu-blue-light hover:to-caluu-blue transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105"
                onClick={() => window.location.href = 'tel:0614021404'}
              >
                Ready to partner with us?
              </button>
            </div>

            {/* Simple copyright */}
            <div className="pt-8 border-t border-slate-700/50">
              <p className="text-slate-400 text-sm">
                © {new Date().getFullYear()} Caluu+. Made with ❤️ by Kodin Softwares.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-4xl">
            <button
              onClick={() => setIsVideoOpen(false)}
              className="absolute -top-12 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6 text-gray-900" />
            </button>
            <div className="relative pt-[56.25%] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
              <iframe
                className="absolute inset-0 w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Caluu+ Demo Video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
