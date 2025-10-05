import React from 'react';
import { useAppStore } from '@/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Home, 
  FileText, 
  Calendar, 
  BookOpen, 
  Award, 
  Activity, 
  CreditCard, 
  HelpCircle, 
  Settings, 
  Shield,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calculator,
  X,
  Newspaper
} from 'lucide-react';

interface SidebarProps {
  isMobile?: boolean;
  onClose?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobile = false, onClose }) => {
  const { 
    user, 
    sidebarCollapsed, 
    setSidebarCollapsed, 
    logout 
  } = useAppStore();
  const navigate = useNavigate();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Workplace', href: '/workplace', icon: Activity },
    { name: 'GPA Calculator', href: '/calculator', icon: Calculator },
    { name: 'Timetable', href: '/timetable', icon: Calendar },
    { name: 'Mr Caluu', href: '/chatbot', icon: BookOpen },
    { name: 'My Future', href: '/career', icon: Award },
    { name: 'Articles', href: '/articles', icon: Newspaper },
    { name: 'Help Center', href: '/help', icon: HelpCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
    ...(user?.is_staff ? [{ name: 'Admin Dashboard', href: '/admin', icon: Shield }] : []),
  ];

  const isActive = (href: string) => location.pathname === href;

  const handleNavigation = (href: string) => {
    navigate(href);
    if (isMobile && onClose) {
      onClose();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && (
          <div className="flex items-center gap-2">
            {isMobile ? (
              <img src="/logo-short.png" alt="Caluu" className="h-8 w-8 object-contain" />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">C</span>
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Caluu+</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Academic Best Friend</p>
            </div>
          </div>
        )}
        
        {/* Close button for mobile, collapse button for desktop */}
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {sidebarCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Button
                key={item.name}
                variant={active ? "default" : "ghost"}
                onClick={() => handleNavigation(item.href)}
                className={`w-full justify-start ${
                  active
                    ? 'bg-caluu-blue/10 text-caluu-blue hover:bg-caluu-blue/20 dark:bg-caluu-blue/20 dark:text-caluu-blue-light'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                } ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
              >
                <Icon className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                {!sidebarCollapsed && (
                  <span className="text-sm font-medium">{item.name}</span>
                )}
              </Button>
            );
          })}
        </div>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        {!sidebarCollapsed && user && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="relative">
                {user.profile_picture ? (
                  <img
                    src={user.profile_picture}
                    alt="Profile"
                    className="w-8 h-8 rounded-full object-cover shadow-md border border-white"
                  />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-full flex items-center justify-center shadow-md border border-white">
                      <span className="text-white font-bold text-sm">
                        {user.first_name?.[0] || ''}{user.last_name?.[0] || ''}
                      </span>
                    </div>
                  )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Online</p>
              </div>
            </div>
          </div>
        )}
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full justify-start text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 ${
            sidebarCollapsed ? 'px-2' : 'px-3'
          }`}
        >
          <LogOut className={`w-4 h-4 ${sidebarCollapsed ? '' : 'mr-3'}`} />
          {!sidebarCollapsed && (
            <span className="text-sm font-medium">Logout</span>
          )}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        <div 
          className="absolute inset-0 bg-black bg-opacity-50" 
          onClick={onClose}
        />
        <div className="absolute left-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg">
          {sidebarContent}
        </div>
      </div>
    );
  }

  return (
    <div className={`hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 ${
      sidebarCollapsed ? 'lg:w-16' : 'lg:w-64'
    }`}>
      {sidebarContent}
    </div>
  );
};

export default Sidebar;
