import {  useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageCircle,
  Video,
  Calendar,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '@/context';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path: string;
}

const Tooltip = ({ label, children }: { label: string; children: React.ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative group">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && (
        <div className="absolute left-full ml-3 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap pointer-events-none z-50 shadow-lg">
          {label}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></div>
        </div>
      )}
    </div>
  );
};

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const performSearch = async (query: string) => {
    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    setIsSearching(true);
    try {
      const { userService } = await import('@/services');
      const response = await userService.searchUsers(query);
      setSearchResults(response.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
      setShowResults(true);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.length < 3) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
  };

  const handleSelectUser = (user: any) => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
    // Store user data in sessionStorage and navigate
    sessionStorage.setItem('draftUser', JSON.stringify(user));
    navigate(`/chats`);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    if (showResults) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showResults]);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="relative flex-1 max-w-md" ref={searchContainerRef}>
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          placeholder="Search people..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              setSearchResults([]);
              setShowResults(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            ✕
          </button>
        )}
      </div>

      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : searchResults?.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-400">
              <p className="text-sm">No users found</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {searchResults?.map((user) => (
                <button
                  key={user.id}
                  onClick={() => handleSelectUser(user)}
                  className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
                    {user.photo_url ? (
                      <img
                        src={user.photo_url}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{user.name.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const ProfileDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getInitial = () => {
    return user?.name ? user.name.charAt(0).toUpperCase() : '?';
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-semibold hover:shadow-lg transition-shadow"
      >
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{getInitial()}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Profile Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900">{user?.name}</p>
            <p className="text-sm text-gray-600">{user?.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      )}

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

const AppLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems: NavItem[] = [
    {
      id: 'chats',
      icon: <MessageCircle size={28} strokeWidth={1.5} />,
      label: 'Chats',
      path: '/',
    },
    {
      id: 'meet',
      icon: <Video size={28} strokeWidth={1.5} />,
      label: 'Meet',
      path: '/meet',
    },
    {
      id: 'calendar',
      icon: <Calendar size={28} strokeWidth={1.5} />,
      label: 'Calendar',
      path: '/calendar',
    },
    {
      id: 'people',
      icon: <Users size={28} strokeWidth={1.5} />,
      label: 'People',
      path: '/people',
    },
  ];

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar - Icon Ribbon */}
      <aside className="w-20 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 flex flex-col items-center py-6 gap-2">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex-shrink-0 mb-4 shadow-lg hover:shadow-xl transition-shadow">
          <span className="text-white font-bold text-lg">T</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 flex flex-col gap-3 items-center">
          {navItems.map((item) => (
            <Tooltip key={item.id} label={item.label}>
              <button
                className={`relative cursor-pointer flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group ${
                  isActive(item.path)
                    ? 'bg-blue-100 text-blue-600 shadow-md'
                    : 'text-gray-600 hover:bg-gray-200 hover:text-blue-600'
                }`}
                onClick={() => handleNavigation(item.path)}
              >
                <span className="flex items-center justify-center text-inherit">
                  {item.icon}
                </span>
                {isActive(item.path) && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-600 rounded-r-full"></div>
                )}
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex flex-col gap-3 items-center border-t border-gray-200 pt-4">
          <Tooltip label="Settings">
            <button
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-transparent text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200"
              onClick={() => navigate('/settings')}
            >
              <Settings size={28} strokeWidth={1.5} />
            </button>
          </Tooltip>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between px-6 bg-white border-b border-gray-200 h-16 flex-shrink-0 gap-4">
          <h1 className="text-xl font-semibold text-gray-900">Teams</h1>
          <SearchBar />
          <ProfileDropdown />
        </header>

        {/* Content Area with Outlet */}
        <main className="flex-1 overflow-y-auto bg-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
