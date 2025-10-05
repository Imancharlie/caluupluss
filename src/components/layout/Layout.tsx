import React, { useState, useEffect } from 'react';
import { useAppStore } from '@/store';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import Footer from './Footer';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { MessageSquareMore, Sparkles } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, sidebarCollapsed, darkMode } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  // User balance fetching removed - not needed

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [location.pathname, isMobile]);

  // Listen for custom event to toggle mobile sidebar
  useEffect(() => {
    const handleToggleSidebar = () => {
      if (isMobile) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('toggleMobileSidebar', handleToggleSidebar);
    return () => {
      window.removeEventListener('toggleMobileSidebar', handleToggleSidebar);
    };
  }, [isMobile]);

  // Dispatch events when sidebar state changes
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebarStateChanged', { 
      detail: { isOpen: sidebarOpen, isMobile } 
    }));
  }, [sidebarOpen, isMobile]);

  // Show/hide floating button based on route and auth
  useEffect(() => {
    const shouldShow = user && location.pathname !== '/chatbot' && !noLayoutPages.includes(location.pathname);
    setShowFloatingButton(shouldShow);
  }, [user, location.pathname]);

  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      // For desktop, this could toggle sidebar collapsed state
      // Currently handled by the sidebar itself
    }
  };

  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  // Don't show layout for certain pages
  const noLayoutPages = ['/login', '/register', '/forgot-password', '/activate'];
  const shouldShowLayout = !noLayoutPages.includes(location.pathname);
  
  // Don't show navbar for chatbot page
  const shouldShowNavbar = location.pathname !== '/chatbot';

  if (!shouldShowLayout) {
    return <>{children}</>;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-caluu-blue-dark' : 'bg-white'
    }`}>
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <Sidebar isMobile={true} onClose={handleSidebarClose} />
      )}

      {/* Desktop Sidebar */}
      {!isMobile && <Sidebar isMobile={false} />}

      {/* Main Content Area */}
      <div className={`flex flex-col min-h-screen transition-all duration-300 ${
        !isMobile ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''
      }`}>
        {/* Navbar */}
        {shouldShowNavbar && <Navbar onMenuClick={handleMenuClick} isMobile={isMobile} />}

                {/* Main Content */}
                <main id="main-content" className={`flex-1 transition-colors duration-300 ${
                  darkMode ? 'bg-caluu-blue-dark' : 'bg-white'
                }`}>
                  {children}
                </main>

        {/* Footer */}
        {location.pathname !== '/chatbot' && (
          <Footer />
        )}

        {/* Floating Mr Caluu Button */}
        {showFloatingButton && (
          <div className="fixed bottom-6 right-6 z-50">
            <div className="relative group">
              {/* Tooltip */}
              <div className="absolute bottom-full right-0 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                Ask Mr Caluu
                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
              </div>
              
              {/* Floating Button */}
              <Button
                onClick={() => navigate('/chatbot')}
                className="relative w-14 h-14 rounded-full bg-gradient-to-r from-caluu-blue to-caluu-blue-light hover:from-caluu-blue-light hover:to-caluu-blue shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 group"
                size="lg"
              >
                <div className="relative">
                  <MessageSquareMore className="w-6 h-6 text-white" />
                  {/* Pulse animation */}
                  <div className="absolute inset-0 rounded-full bg-caluu-blue animate-ping opacity-20"></div>
                  {/* Sparkle effect */}
                  <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
                </div>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Layout;
