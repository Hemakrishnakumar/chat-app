import {  useState, useRef, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Video,
  Calendar,
  Users2,
  Settings,
  LogOut,
  Search,
} from 'lucide-react';
import React from 'react';
import { useAuth } from '@/context';
import { useSocket } from '@/context/socketContext';
import { useConversation } from '@/context/conversationContext';
import { apiClient } from '@/api';

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
  const { addDraftConversation } = useConversation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
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
    // Add draft conversation using context
    addDraftConversation({ ids: [user.id], type: 'direct', name: user.name, photo_url: user.photo_url});
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
    <div className="relative flex-1 w-full md:max-w-md" ref={searchContainerRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
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
                  className="w-full px-3 md:px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-center gap-2 md:gap-3"
                >
                  <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs md:text-sm flex-shrink-0 overflow-hidden">
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
                    <p className="font-medium text-gray-900 truncate text-sm">{user.name}</p>
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
    <div className="relative flex-shrink-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 text-white font-semibold text-sm hover:shadow-lg transition-shadow"
      >
        {user?.photo_url ? (
          <img
            src={user.photo_url}
            alt={user.name}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span className="text-xs md:text-sm">{getInitial()}</span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 md:w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {/* Profile Info */}
          <div className="px-3 md:px-4 py-2 md:py-3 border-b border-gray-200">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.name}</p>
            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="w-full px-3 md:px-4 py-2 text-left text-xs md:text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
  const socket = useSocket();


  async function registerUserToPushNotifications() {
    const registration = await navigator.serviceWorker.ready;

    let subscription = await registration.pushManager.getSubscription();
    if (subscription) return;

    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: "BCCKdWlm-U56vXr4hMT8DctwetauMi6z_GSSyr-LgkZtBuf-aIRaWIm6eW9EAAITJp3gc1Qj5r1huoIhz397B7I",
    });
    await apiClient.post('users/notifications/subscribe', subscription);
  }
  

  useEffect(()=>{
    registerUserToPushNotifications()
  }, [])

  useEffect(() => {
      const initializeSocket = async () => {
        if(!socket) return;
        try {
          socket.on('typing', (data: any) => {
            console.log('User typing:', data);
          });
  
          socket.on('disconnect', () => {
            console.log('Socket disconnected');
          });  
          
        } catch (error) {
          console.error('Failed to initialize socket:', error);
        }
      };  
      initializeSocket();
    }, [socket]);

  const navItems: NavItem[] = [
    {
      id: 'chats',
      icon: <MessageSquare size={28} strokeWidth={1.5} />,
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
      icon: <Users2 size={28} strokeWidth={1.5} />,
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
    <div className="flex h-screen bg-white overflow-hidden flex-col md:flex-row">
      {/* Sidebar - Icon Ribbon */}
      <aside className="w-full md:w-20 bg-gradient-to-b from-gray-50 to-gray-100 border-b md:border-b-0 md:border-r border-gray-200 flex md:flex-col items-center py-3 md:py-6 gap-2 overflow-x-auto md:overflow-x-visible">
        {/* Logo */}
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex-shrink-0 mb-0 md:mb-4 shadow-lg hover:shadow-xl transition-shadow">
          <span className="text-white font-bold text-lg">T</span>
        </div>

        {/* Navigation Items */}
        <nav className="flex flex-row md:flex-col gap-3 items-center flex-1 md:flex-none">
          {navItems.map((item) => (
            <Tooltip key={item.id} label={item.label}>
              <button
                className={`relative cursor-pointer flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-200 group flex-shrink-0 ${
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
                  <div className="absolute left-0 md:left-0 top-1/2 md:top-1/2 -translate-y-1/2 w-1 h-6 md:w-1 md:h-6 bg-blue-600 rounded-r-full hidden md:block"></div>
                )}
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="flex flex-row md:flex-col gap-3 items-center border-l md:border-l-0 md:border-t border-gray-200 pl-3 md:pl-0 md:pt-4">
          <Tooltip label="Settings">
            <button
              className="flex items-center justify-center w-12 h-12 rounded-xl bg-transparent text-gray-600 hover:bg-gray-200 hover:text-blue-600 transition-all duration-200 flex-shrink-0"
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
        <header className="flex items-center justify-between px-4 md:px-6 bg-white border-b border-gray-200 h-14 md:h-16 flex-shrink-0 gap-2 md:gap-4 flex-wrap md:flex-nowrap">
          <h1 className="text-lg md:text-xl font-semibold text-gray-900 hidden md:block">Teams</h1>
          <div className="flex-1 min-w-0 md:max-w-md">
            <SearchBar />
          </div>
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
