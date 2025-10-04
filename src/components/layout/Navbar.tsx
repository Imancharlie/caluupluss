import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/store';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Menu, 
  Bell, 
  Search, 
  User,
  Settings,
  LogOut,
  FileText,
  HelpCircle,
  Calendar,
  Calculator,
  GraduationCap,
  BookOpen,
  MessageSquareMore,
  Bookmark,
  Newspaper,
  Megaphone
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useNotifications } from '@/hooks/useNotifications';

interface NavbarProps {
  onMenuClick: () => void;
  isMobile?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isMobile = false }) => {
  const { user, logout, darkMode } = useAppStore();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openSearch, setOpenSearch] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLDivElement | null>(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  type CommandItem = {
    label: string;
    route: string;
    icon: React.ComponentType<{ className?: string }>;
    keywords: string[];
  };

  const items: CommandItem[] = useMemo(() => ([
    { label: 'Dashboard', route: '/dashboard', icon: BookOpen, keywords: ['home', 'dashboard', 'main'] },
    { label: 'Articles', route: '/articles', icon: Newspaper, keywords: ['article', 'blog', 'posts', 'news', 'reading'] },
    { label: 'Blog', route: '/blog', icon: FileText, keywords: ['blog', 'news', 'updates'] },
    { label: 'Explore Articles', route: '/blog-explore', icon: Newspaper, keywords: ['explore', 'discover', 'articles', 'blog'] },
    { label: 'Saved Articles', route: '/saved-articles', icon: Bookmark, keywords: ['saved', 'bookmarks', 'favorites', 'articles'] },
    { label: 'Career Guidance', route: '/career-guidance', icon: FileText, keywords: ['career', 'guidance', 'jobs', 'advice'] },
    { label: 'Chatbot (Mr Caluu)', route: '/chatbot', icon: MessageSquareMore, keywords: ['chatbot', 'assistant', 'help', 'ask', 'mr caluu', 'ai'] },
    { label: 'GPA Calculator', route: '/calculator', icon: Calculator, keywords: ['gpa', 'calculator', 'grades', 'score'] },
    { label: 'Timetable (Classes)', route: '/timetable', icon: Calendar, keywords: ['timetable', 'classes', 'schedule', 'class', 'calendar'] },
    { label: 'Workplace (Courses)', route: '/workplace', icon: GraduationCap, keywords: ['workplace', 'courses', 'program', 'enroll', 'course', 'study plan'] },
    { label: 'Notifications', route: '/notifications', icon: Bell, keywords: ['notifications', 'alerts', 'messages'] },
    { label: 'Help Center', route: '/help-center', icon: HelpCircle, keywords: ['help', 'support', 'faq', 'docs', 'contact', 'guide'] },
    { label: 'Settings', route: '/settings', icon: Settings, keywords: ['settings', 'preferences', 'account'] },
    { label: 'Change Password', route: '/settings', icon: Settings, keywords: ['change password', 'password', 'security', 'reset password'] },
    { label: 'Profile', route: '/profile', icon: User, keywords: ['profile', 'account', 'user'] },
    { label: 'Admin Panel', route: '/admin', icon: Megaphone, keywords: ['admin', 'panel', 'management', 'backoffice'] },
  ]), []);

  const normalize = (s: string) => s.toLowerCase().trim();

  const isSubsequence = (needle: string, hay: string) => {
    let i = 0, j = 0;
    while (i < needle.length && j < hay.length) {
      if (needle[i] === hay[j]) i++;
      j++;
    }
    return i === needle.length;
  };

  const scoreItem = React.useCallback((q: string, item: CommandItem): number => {
    if (!q) return 0;
    const label = normalize(item.label);
    const route = normalize(item.route);
    const keys = item.keywords.map(normalize);
    let best = 0;
    const candidates = [label, route, ...keys];
    for (const c of candidates) {
      if (c === q) best = Math.max(best, 100);
      else if (c.startsWith(q)) best = Math.max(best, 85);
      else if (c.includes(q)) best = Math.max(best, 70);
      else if (isSubsequence(q, c)) best = Math.max(best, 55);
    }
    // small boost for exact word matches
    const words = cWords(candidates.join(' '));
    if (words.has(q)) best = Math.max(best, 90);
    return best;
  }, []);

  const cWords = (s: string) => new Set(s.split(/[^a-z0-9]+/g).filter(Boolean));

  const filtered: CommandItem[] = useMemo(() => {
    const raw = query.trim().toLowerCase();
    if (!raw) return [];
    const terms = raw.split(/\s+/g).filter(Boolean);

    const scored = items
      .map(item => {
        // require all terms to have at least a minimal match
        const perTerm = terms.map(t => scoreItem(t, item));
        const meets = perTerm.every(s => s >= 55);
        const sum = perTerm.reduce((a, b) => a + b, 0);
        const maxTerm = perTerm.reduce((a, b) => Math.max(a, b), 0);
        return { item, meets, score: sum + maxTerm * 0.25 };
      })
      .filter(x => x.meets)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(x => x.item);
    return scored;
  }, [items, query, scoreItem]);

  useEffect(() => {
    setActiveIndex(0);
    setOpenSearch(!isMobile && query.trim().length > 0 && filtered.length > 0);
  }, [query, filtered, isMobile]);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (!openSearch) return;
      const target = e.target as Node;
      if (resultsRef.current && !resultsRef.current.contains(target) && inputRef.current && !inputRef.current.contains(target)) {
        setOpenSearch(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, [openSearch]);

  // Keyboard shortcuts to focus search: Ctrl+K or '/'
  useEffect(() => {
    if (isMobile) return;
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = (target?.tagName || '').toLowerCase();
      const typing = tag === 'input' || tag === 'textarea' || target?.isContentEditable;
      const ctrlK = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k';
      const slash = e.key === '/';
      if ((ctrlK || slash) && !typing) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isMobile]);

  const onSelect = (item: CommandItem) => {
    setQuery('');
    setOpenSearch(false);
    navigate(item.route);
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (!openSearch || filtered.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => (prev + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filtered[activeIndex] || filtered[0];
      if (item) onSelect(item);
    } else if (e.key === 'Escape') {
      setOpenSearch(false);
    }
  };

  return (
    <header className={`shadow-sm border-b sticky top-0 z-40 transition-colors duration-300 ${
      darkMode 
        ? 'bg-caluu-blue-dark border-caluu-blue/30' 
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-between px-4 py-3">
        {/* Left side - Menu button (mobile only) and Logo */}
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className={`p-2 transition-colors duration-200 ${
                darkMode 
                  ? 'hover:bg-caluu-blue/20' 
                  : 'hover:bg-gray-100'
              }`}
            >
              <Menu className="w-5 h-5" />
            </Button>
          )}
          <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Caluu"
              className="h-8 w-auto object-contain"
            />
          </button>
        </div>

        {/* Center - Search (Desktop only) */}
        {!isMobile && (
          <div className="flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${
                darkMode ? 'text-caluu-blue/60' : 'text-gray-400'
              }`} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search pages and tools… (e.g., articles, change password, timetable)"
                className={`w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-caluu-blue focus:border-transparent transition-colors duration-200 ${
                  darkMode 
                    ? 'border-caluu-blue/30 bg-caluu-blue/20 text-white placeholder-caluu-blue/60' 
                    : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                }`}
              />

              {openSearch && filtered.length > 0 && (
                <div
                  ref={resultsRef}
                  className={`absolute mt-2 w-full rounded-lg border shadow-lg overflow-hidden ${
                    darkMode ? 'bg-caluu-blue/95 border-caluu-blue/40' : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="max-h-72 overflow-y-auto py-1">
                    {filtered.map((item, idx) => {
                      const Icon = item.icon;
                      const isActive = idx === activeIndex;
                      return (
                        <button
                          key={`${item.route}-${idx}`}
                          onMouseEnter={() => setActiveIndex(idx)}
                          onClick={() => onSelect(item)}
                          className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${
                            isActive
                              ? (darkMode ? 'bg-white/10 text-white' : 'bg-blue-50 text-gray-900')
                              : (darkMode ? 'text-white/90 hover:bg-white/5' : 'text-gray-800 hover:bg-gray-50')
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${darkMode ? 'text-white/90' : 'text-gray-600'}`} />
                          <span className="text-sm font-medium truncate flex-1">{item.label}</span>
                          <span className={`text-[11px] ${darkMode ? 'text-white/60' : 'text-gray-500'}`}>Enter</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Right side - Notifications and User Profile */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <BellButton onClick={() => navigate('/notifications')} />

          {/* User Profile Dropdown (always show avatar, use initials if missing) */}
          {(
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className={`flex items-center gap-2 p-2 transition-colors duration-200 ${
                    darkMode 
                      ? 'hover:bg-caluu-blue/20' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {/* User Avatar */}
                  <div className="relative">
                    {user?.profile_picture ? (
                      <img
                        src={user.profile_picture}
                        alt="Profile"
                        className="w-8 h-8 rounded-full object-cover shadow-md border border-white"
                      />
                    ) : (
                      <div className="w-8 h-8 bg-gradient-to-br from-caluu-blue to-caluu-blue-light rounded-full flex items-center justify-center shadow-md border border-white">
                        <span className="text-white font-bold text-sm">
                          {(user?.first_name?.[0] || user?.username?.[0] || 'U').toUpperCase()}{(user?.last_name?.[0] || '')}
                        </span>
                      </div>
                    )}
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border border-white shadow-sm"></div>
                  </div>
                  
                  {/* Keep avatar compact at the right of notifications */}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

const BellButton: React.FC<{ onClick: () => void }> = ({ onClick }) => {
  const { darkMode } = useAppStore();
  const { unreadCount } = useNotifications();

  const showBadge = unreadCount > 0;

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={`p-2 relative transition-colors duration-200 ${
        darkMode 
          ? 'hover:bg-caluu-blue/20' 
          : 'hover:bg-gray-100'
      }`}
    >
      <Bell className="w-5 h-5" />
      {showBadge ? (
        <Badge 
          variant="destructive" 
          className="absolute -top-1 -right-1 min-h-[20px] min-w-[20px] h-5 w-auto px-1.5 flex items-center justify-center p-0 text-[10px] leading-none rounded-full"
        >
          {unreadCount > 99 ? '99+' : unreadCount}
        </Badge>
      ) : null}
    </Button>
  );
};
