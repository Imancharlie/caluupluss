import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/store';
import { useStudent } from '@/contexts/StudentContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calculator, 
  BookOpen, 
  Activity, 
  TrendingUp,
  Clock,
  Coins,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  BookMarked,
  Calendar,
  MessageSquareMore,
  Newspaper
} from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/carousel';
import { useQuery } from '@tanstack/react-query';
import { fetchSlides, Slide, getFallbackSlides } from '@/services/slideService';
import { useNotifications } from '@/hooks/useNotifications';
import { useQuotes } from '@/hooks/useQuotes';
import { QuotesDebug } from '@/components/QuotesDebug';

// Types for better type safety
interface ConnectionInfo {
  effectiveType?: string;
  downlink?: number;
  rtt?: number;
}

interface NavigatorWithConnection extends Navigator {
  connection?: ConnectionInfo;
}

const Dashboard: React.FC = () => {
  const { user, fetchUserBasicDetails } = useAppStore();
  const { 
    studentProfile, 
    studentCourses, 
    profileLoading, 
    gpaLoading 
  } = useStudent();
  const { refreshNotifications } = useNotifications();

  // State management
  const [mobileErrors, setMobileErrors] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [carouselApi, setCarouselApi] = useState<CarouselApi | null>(null);
  const [quotePaused, setQuotePaused] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(true);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  // Mobile detection with proper error handling
  const checkMobile = useCallback(() => {
    try {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      // Check for viewport meta tag
      const viewportMeta = document.querySelector('meta[name="viewport"]');
      if (!viewportMeta) {
        const error = 'Missing viewport meta tag - this can cause mobile display issues';
        console.warn(error);
        setMobileErrors(prev => [...new Set([...prev, error])]);
      }
      
      // Check for touch support and WebView detection
      const hasTouch = 'ontouchstart' in window;
      const hasPointerEvents = 'onpointerdown' in window;
      const isWebView = !hasTouch && !hasPointerEvents && mobile;
      
      if (isWebView) {
        // Only show WebView warning once per session
        const webViewWarningShown = sessionStorage.getItem('webview-warning-shown');
        if (!webViewWarningShown) {
          const error = 'Running in WebView - touch events may not work properly';
          console.warn(error);
          setMobileErrors(prev => [...new Set([...prev, error])]);
          sessionStorage.setItem('webview-warning-shown', 'true');
        }
        
        // Add WebView-specific fixes
        document.body.style.touchAction = 'manipulation';
        (document.body.style as CSSStyleDeclaration & { webkitTouchCallout?: string; webkitUserSelect?: string }).webkitTouchCallout = 'none';
        (document.body.style as CSSStyleDeclaration & { webkitTouchCallout?: string; webkitUserSelect?: string }).webkitUserSelect = 'none';
        document.body.style.userSelect = 'none';
      }
    } catch (error) {
      console.error('Error in mobile detection:', error);
    }
  }, []);

  // Handle browser extension errors
  useEffect(() => {
    const handleExtensionError = (event: ErrorEvent) => {
      if (event.message?.includes('disconnected port object') || 
          event.message?.includes('proxy.js')) {
        console.warn('Browser extension connection lost - this is normal during development');
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleExtensionError);
    return () => window.removeEventListener('error', handleExtensionError);
  }, []);

  // Mobile detection effect
  useEffect(() => {
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [checkMobile]);

  // Fetch user details
  useEffect(() => {
    // Note: fetchUserBasicDetails endpoint doesn't exist in backend
    // User data should be available from login response
    console.log('Dashboard - Current user data:', user);
    // if (user && !user.first_name) {
    //   fetchUserBasicDetails().catch(() => {});
    // }
  }, [user]);

  // Fetch slides from backend
  const { data: slidesData, isLoading: slidesLoading, error: slidesError } = useQuery({
    queryKey: ['slides'],
    queryFn: fetchSlides,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1, // Only retry once
  });

  // Use backend slides or fallback
  const slides = slidesData || getFallbackSlides();

  // Gradient fallbacks for cases where backend sends empty/white gradients
  const defaultGradients = useMemo(() => [
    'from-orange-400 to-pink-500',
    'from-red-400 to-yellow-500',
    'from-yellow-400 to-pink-500',
    'from-rose-400 to-orange-300',
    'from-gray-700 to-gray-900',
    'from-zinc-400 to-gray-600',
    'from-purple-500 to-indigo-600',
    'from-green-400 to-lime-500',
    'from-emerald-400 to-teal-500',
    'from-lime-400 to-yellow-300',
    'from-green-300 to-blue-400',
    'from-slate-600 to-slate-900'
  ], []);

  const displaySlides = useMemo(() => {
    return slides.map((slide, index) => {
      const raw = (slide.background_gradient || '').trim();
      const isInvalid = !raw || /white|gray-100/i.test(raw);
      const effective = isInvalid ? defaultGradients[index % defaultGradients.length] : raw;
      return { ...slide, background_gradient: effective };
    });
  }, [slides, defaultGradients]);

  // Refresh notifications when slides change
  useEffect(() => {
    if (slidesData) {
      refreshNotifications();
    }
  }, [slidesData, refreshNotifications]);

  // Carousel auto-scroll
  useEffect(() => {
    if (!carouselApi) return;
    const interval = setInterval(() => {
      carouselApi.scrollNext();
    }, 4500);
    return () => clearInterval(interval);
  }, [carouselApi]);

  // WebView-specific event handling
  useEffect(() => {
    const isWebView = window.innerWidth < 768 && !('ontouchstart' in window) && !('onpointerdown' in window);
    
    if (isWebView) {
      // Add passive event listeners for better performance
      const addWebViewClickHandlers = () => {
        // Handle carousel navigation with passive listeners
        const carouselButtons = document.querySelectorAll('[data-carousel-button]');
        carouselButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (button.getAttribute('data-carousel-button') === 'next') {
              carouselApi?.scrollNext();
            } else {
              carouselApi?.scrollPrev();
            }
          }, { passive: false });
        });

        // Handle action buttons with passive listeners
        const actionButtons = document.querySelectorAll('[data-action-button]');
        actionButtons.forEach(button => {
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const href = button.getAttribute('data-href');
            if (href) {
              window.location.href = href;
            }
          }, { passive: false });
        });
      };

      // Use requestAnimationFrame for better timing
      requestAnimationFrame(() => {
        addWebViewClickHandlers();
      });
    }
  }, [carouselApi, isMobile]);

  // Quotes system with API integration
  const { currentQuote, isLoading: quotesLoading, nextQuote } = useQuotes();

  // Auto-rotate quotes every 6.5 seconds
  useEffect(() => {
    if (quotePaused) return;
    const timer = setInterval(async () => {
      setQuoteVisible(false);
      setTimeout(async () => {
        try {
          await nextQuote();
          setQuoteVisible(true);
        } catch (error) {
          console.error('Error rotating quote:', error);
        setQuoteVisible(true);
        }
      }, 600);
    }, 6500);
    return () => clearInterval(timer);
  }, [quotePaused, nextQuote]);

  // Debug panel keyboard shortcut (Ctrl+Shift+D)
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        setShowDebugPanel(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Memoized computed values
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const displayName = useMemo(() => {
    if (!user) return 'Student';
    const dn = (user as unknown as { display_name?: string }).display_name || '';
    const fallback = dn ? dn.split(' ')[0] : undefined;
    return user.first_name || fallback || 'Student';
  }, [user]);

  const quickActions = useMemo(() => [
    {
      title: 'GPA Calculator',
      description: 'Compute and track your GPA',
      icon: Calculator,
      href: '/calculator',
      color: 'hover:bg-caluu-blue/5 hover:border-caluu-blue/20',
      iconColor: 'text-caluu-blue'
    },
    {
      title: 'My Timetable',
      description: 'View your classes schedule',
      icon: Calendar,
      href: '/timetable',
      color: 'hover:bg-green-50 hover:border-green-200',
      iconColor: 'text-green-600'
    },
    {
      title: 'Articles',
      description: 'Explore study tips and guides',
      icon: Newspaper,
      href: '/articles',
      color: 'hover:bg-purple-50 hover:border-purple-200',
      iconColor: 'text-purple-600'
    },
    {
      title: 'Mr Caluu',
      description: 'Ask the assistant for help',
      icon: MessageSquareMore,
      href: '/chatbot',
      color: 'hover:bg-orange-50 hover:border-orange-200',
      iconColor: 'text-orange-600'
    }
  ], []);

  const recentActivity = useMemo(() => [
    {
      id: 2,
      action: studentCourses.length > 0 ? 'Courses Enrolled' : 'No Courses',
      time: studentCourses.length > 0 ? 'Current semester' : 'Not enrolled',
      status: studentCourses.length > 0 ? 'completed' : 'pending',
      icon: BookOpen
    },
    {
      id: 3,
      action: studentProfile ? 'Profile Complete' : 'Profile Setup Required',
      time: studentProfile ? 'Recently updated' : 'Setup needed',
      status: studentProfile ? 'completed' : 'pending',
      icon: studentProfile ? CheckCircle : Clock
    },
    {
      id: 4,
      action: 'Academic Progress',
      time: 'fully tracked',
      status: 'completed',
      icon: TrendingUp
    }
  ], [studentCourses.length, studentProfile]);

  // Image error handler with proper typing
  const handleImageError = useCallback((e: React.SyntheticEvent<HTMLImageElement, Event>, slide: Slide) => {
    const target = e.target as HTMLImageElement;
    console.error(`Image failed to load: ${slide.image}`, {
      error: e,
      isMobile: window.innerWidth < 768,
      userAgent: navigator.userAgent,
      imageUrl: slide.image,
      imageElement: target,
      parentElement: target.parentElement,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio
      },
      networkInfo: 'connection' in navigator ? {
        effectiveType: (navigator as NavigatorWithConnection).connection?.effectiveType || 'unknown',
        downlink: (navigator as NavigatorWithConnection).connection?.downlink || 0,
        rtt: (navigator as NavigatorWithConnection).connection?.rtt || 0
      } : 'Not available'
    });
    
    // Enhanced fallback for mobile
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      // Remove any existing gradient classes
      parent.className = parent.className
        .replace(/bg-gradient-to-r/g, '')
        .replace(new RegExp(slide.background_gradient, 'g'), '')
        .trim();
      
      // Add gradient fallback
      parent.className += ` bg-gradient-to-r ${slide.background_gradient}`;
      
      // Ensure proper mobile styling
      parent.style.backgroundColor = 'transparent';
      parent.style.backgroundImage = `linear-gradient(to right, ${slide.background_gradient})`;
    }
  }, []);

  // Image load handler
  const handleImageLoad = useCallback((imageUrl: string) => {
    console.log(`Image loaded successfully: ${imageUrl}`, {
      isMobile: window.innerWidth < 768,
      userAgent: navigator.userAgent
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-gray-50">
      {/* Mobile Error Display */}
      {isMobile && mobileErrors.length > 0 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Mobile Issues Detected:</strong>
              </p>
              <ul className="mt-2 text-sm text-yellow-600 list-disc list-inside">
                {mobileErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
        {/* Welcome Section */}
        <div className="text-center mb-6 lg:mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-center mb-4 gap-4">
            <div className="p-3 bg-caluu-blue rounded-full shadow-lg">
              <Activity className="w-8 h-8 text-white" />
            </div>
            <div className="text-center sm:text-left">
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                {greeting}, {displayName}!
              </h1>
            </div>
          </div>
          
          {/* Hero Carousel */}
          <div className="relative mx-auto w-full max-w-5xl">
            <div className="px-6 sm:px-10 carousel-container webview-fix">
              <Carousel setApi={setCarouselApi} opts={{ loop: true }}>
                <CarouselContent>
                  {slidesLoading ? (
                    <CarouselItem>
                      <div className="relative overflow-hidden rounded-2xl shadow-lg bg-gray-200 animate-pulse h-48 md:h-64 lg:h-72">
                        <div className="p-8 md:p-12 h-full flex flex-col md:flex-row items-start md:items-center gap-6">
                          <div className="flex-1">
                            <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ) : (
                    displaySlides.map((slide, i) => {
                      const imageUrl = slide.image || slide.image_url || slide.display_image || slide.image_url_display;
                      const hasImage = imageUrl && imageUrl.trim() !== '';

                      return (
                      <CarouselItem key={slide.id || i}>
                          <div
                            className={`relative overflow-hidden rounded-2xl shadow-lg text-white h-48 md:h-64 lg:h-72 ${!hasImage ? `bg-gradient-to-br ${slide.background_gradient}` : ''}`}
                            style={{
                              backgroundColor: hasImage ? 'transparent' : undefined,
                              WebkitTransform: 'translateZ(0)',
                              transform: 'translateZ(0)',
                              backfaceVisibility: 'hidden',
                              perspective: '1000px'
                            }}
                          >
                            {hasImage && (
                              <img
                                src={imageUrl}
                                alt={slide.title}
                                className="absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-300"
                                style={{
                                  zIndex: 1,
                                  display: 'block',
                                  WebkitTransform: 'translateZ(0) scale(1.05)',
                                  transform: 'translateZ(0) scale(1.05)',
                                  backfaceVisibility: 'hidden',
                                  willChange: 'transform',
                                  maxWidth: 'none',
                                  maxHeight: 'none',
                                  minWidth: '100%',
                                  minHeight: '100%'
                                }}
                                onLoad={(e) => {
                                  console.log(`✅ Image loaded successfully: ${imageUrl}`);
                                  (e.target as HTMLImageElement).style.opacity = '1';
                                }}
                                onError={(e) => {
                                  console.error(`Failed to load image: ${imageUrl}`, e);
                                  // Hide the image and show gradient background
                                  const imgElement = e.target as HTMLImageElement;
                                  const parentElement = imgElement.parentElement!;

                                  // Hide the image
                                  imgElement.style.display = 'none';

                                  // Apply gradient background to parent
                                  parentElement.className = parentElement.className.replace(/bg-gradient-to-[a-z-]+/g, '') + ` bg-gradient-to-br ${slide.background_gradient}`;

                                  // Also update the overlay to be less dark since we're showing gradient
                                  const overlay = parentElement.querySelector('.absolute.inset-0.bg-gradient-to-t');
                                  if (overlay) {
                                    overlay.className = overlay.className.replace(/from-black\/\d+/g, 'from-transparent').replace(/via-black\/\d+/g, 'via-transparent');
                                  }
                                }}
                              />
                            )}
                            <div className={`absolute inset-0 bg-gradient-to-t transition-opacity duration-300 ${hasImage ? 'from-black/80 via-black/30 to-transparent' : 'from-transparent via-transparent to-transparent'}`}></div>
                            <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 md:p-10 lg:p-12 h-full flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6">
                              <div className="flex-1">
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold drop-shadow-sm leading-tight">{slide.title}</h3>
                                <p className="mt-1 sm:mt-2 text-sm sm:text-base md:text-lg opacity-95 max-w-3xl leading-relaxed">{slide.description}</p>
                              </div>
                              <div className="flex gap-2 sm:gap-3">
                                {slide.link_url && (
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    className="bg-white/90 text-gray-900 hover:bg-white shadow-lg backdrop-blur-sm"
                                    data-action-button="true"
                                    data-href={slide.link_url}
                                    onClick={() => { window.location.href = slide.link_url; }}
                                  >
                                    Open
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="bg-transparent border-white/70 text-white hover:bg-white/10 backdrop-blur-sm"
                                  onClick={() => window.scrollTo({ top: window.innerHeight, behavior: 'smooth' })}
                                >
                                  Learn more
                                </Button>
                              </div>
                            </div>
                          </div>
                      </CarouselItem>
                      );
                    })
                  )}
                </CarouselContent>
              </Carousel>
            </div>
          </div>
          
          {/* Quotes Ticker - reserve consistent height to prevent layout shift */}
          <div
            className="mt-4 select-none min-h-20 md:min-h-24"
            onMouseEnter={() => setQuotePaused(true)}
            onMouseLeave={() => setQuotePaused(false)}
          >
            <div className={`text-center italic text-gray-700 text-sm md:text-base transition-all duration-700 ease-out ${quoteVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-1'}`}>
              {quotesLoading ? (
                <div className="animate-pulse">Loading inspirational quote...</div>
              ) : (
                <>
                  <div className="mb-1">"{currentQuote.text}"</div>
                  <div className="text-xs text-gray-500">— {currentQuote.author}</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions and Recent Activity Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Quick Actions */}
          <div className="lg:col-span-2">
            <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                  <Activity className="w-4 h-4" />
                  Quick Actions
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs">
                  Access your academic tools and resources
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickActions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        className={`h-auto p-3 justify-start bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-caluu-blue transition-all rounded-lg`}
                        data-action-button="true"
                        data-href={action.href}
                        onClick={() => window.location.href = action.href}
                      >
                        <div className="flex items-start gap-3">
                          <Icon className={`w-4 h-4 mt-0.5 text-caluu-blue`} />
                          <div className="text-left">
                            <div className="font-medium text-sm">{action.title}</div>
                            <div className="text-xs text-gray-600">
                              {action.description}
                            </div>
                          </div>
                          <ArrowRight className="w-3 h-3 ml-auto text-gray-400" />
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div>
            <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardHeader className="py-3">
                <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                  <TrendingUp className="w-4 h-4" />
                  Recent Activity
                </CardTitle>
                <CardDescription className="text-gray-600 text-xs">
                  Your latest academic activities
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                <div className="space-y-3">
                  {recentActivity.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.id} className="flex items-start gap-2">
                        <div className={`p-1.5 rounded-full ${
                          activity.status === 'completed' 
                            ? 'bg-green-100 text-green-600' 
                            : 'bg-yellow-100 text-yellow-600'
                        }`}>
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-gray-900">
                            {activity.action}
                          </p>
                          <p className="text-[11px] text-gray-600">
                            {activity.time}
                          </p>
                        </div>
                        <Badge 
                          variant={activity.status === 'completed' ? 'default' : 'secondary'}
                          className="text-[10px] h-5"
                        >
                          {activity.status}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Student Information Card */}
        {studentProfile ? (
          <div className="mt-6">
            <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Academic Program</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">University</p>
                        <p className="text-sm font-semibold text-gray-900">{studentProfile.university?.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Program</p>
                        <p className="text-sm font-semibold text-gray-900">{studentProfile.program?.name || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Year {studentProfile.year}, Sem {studentProfile.semester}</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {studentCourses.length} courses enrolled
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <GraduationCap className="w-12 h-12 text-caluu-blue" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-caluu-blue hover:bg-caluu-blue-light text-white border-caluu-blue"
                      data-action-button="true"
                      data-href="/workplace"
                      onClick={() => window.location.href = '/workplace'}
                    >
                      Manage Program
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="mt-6">
            <Card className="bg-white border-gray-200 rounded-xl shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-gray-900">Academic Program Setup Required</h3>
                    <p className="text-gray-600">Complete your academic program setup to access all features</p>
                  </div>
                  <div className="text-right">
                    <GraduationCap className="w-12 h-12 text-gray-400" />
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 bg-caluu-blue hover:bg-caluu-blue-light text-white border-caluu-blue"
                      data-action-button="true"
                      data-href="/workplace"
                      onClick={() => window.location.href = '/workplace'}
                    >
                      Setup Program
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      </div>

      {/* Debug Panel - Press Ctrl+Shift+D to toggle */}
      {showDebugPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Quotes Debug Panel</h2>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowDebugPanel(false)}
              >
                Close
              </Button>
            </div>
            <div className="p-4">
              <QuotesDebug />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;