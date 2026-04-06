import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Search } from 'lucide-react';
import { chatService, type Conversation } from '@/services/chat.service';
import ChatWindow from '@/components/ChatWindow';

interface DraftConversation extends Conversation {
  isDraft?: boolean;
}

const Chats = () => {
  const location = useLocation();
  const [conversations, setConversations] = useState<DraftConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<DraftConversation | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(320);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const conversationListRef = useRef<HTMLDivElement>(null);
  const draftProcessedRef = useRef(false);

  // Fetch initial conversations
  useEffect(() => {
    fetchConversations();
  }, []);

  // Handle draft user from search
  useEffect(() => {
    // Try to get draft user from sessionStorage first
    const storedDraftUser = sessionStorage.getItem('draftUser');
    const state = location.state as { draftUser?: any } | null;
    const draftUser = storedDraftUser ? JSON.parse(storedDraftUser) : state?.draftUser;
    
    console.log('Draft user:', draftUser);
    
    if (draftUser && !draftProcessedRef.current) {
      draftProcessedRef.current = true;
      console.log('Creating draft conversation for:', draftUser);
      
      const draftConversation: DraftConversation = {
        id: `draft_${draftUser.id}`,
        type: 'direct',
        name: draftUser.name,
        avatarUrl: draftUser.photo_url,
        lastMessage: null,
        unreadCount: 0,
        updatedAt: new Date().toISOString(),
        isDraft: true,
      };
      
      // Add draft to the beginning of conversations
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== draftConversation.id);
        return [draftConversation, ...filtered];
      });
      
      setSelectedConversation(draftConversation);
      
      // Clear sessionStorage after processing
      sessionStorage.removeItem('draftUser');
    }
  }, [location.state]);

  const fetchConversations = useCallback(async (cursor?: string) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await chatService.getChats(cursor, 20);
      
      if (cursor) {
        // Append to existing conversations
        setConversations((prev) => [...prev, ...response.data]);
      } else {
        // Initial load
        setConversations(response.data);
        if (response.data.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data[0]);
        }
      }

      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasMore, selectedConversation]);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return;

      const container = containerRef.current;
      const newWidth = e.clientX - container.getBoundingClientRect().left;

      if (newWidth > 250 && newWidth < 500) {
        setLeftPanelWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Infinite scroll handler
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const element = e.currentTarget;
      const isNearBottom =
        element.scrollHeight - element.scrollTop - element.clientHeight < 100;

      if (isNearBottom && hasMore && !isLoading && nextCursor) {
        fetchConversations(nextCursor);
      }
    },
    [hasMore, isLoading, nextCursor, fetchConversations],
  );

  const filteredConversations = conversations?.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleConversationUpdate = (updatedConversation: DraftConversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === selectedConversation?.id ? updatedConversation : c))
    );
    setSelectedConversation(updatedConversation);
  };

  return (
    <div ref={containerRef} className="flex h-full bg-white">
      {/* Left Panel - Conversations List */}
      <div
        style={{ width: `${leftPanelWidth}px` }}
        className="flex flex-col bg-white border-r border-gray-200 overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Chats</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div
          ref={conversationListRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto"
        >
          {filteredConversations?.length === 0 && !isLoading ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <p className="text-sm">No conversations yet</p>
                <p className="text-xs mt-1">Start a new chat to begin messaging</p>
              </div>
            </div>
          ) : (
            filteredConversations?.map((conversation) => (
              <ConversationItem
                key={conversation.id}
                conversation={conversation}
                isSelected={selectedConversation?.id === conversation.id}
                onSelect={() => setSelectedConversation(conversation)}
              />
            ))
          )}

          {isLoading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Resizer */}
      <div
        onMouseDown={handleMouseDown}
        className={`w-1 bg-gray-200 hover:bg-blue-500 cursor-col-resize transition-colors ${
          isDragging ? 'bg-blue-500' : ''
        }`}
      />

      {/* Right Panel - Chat Window */}
      {selectedConversation ? (
        <ChatWindow
          conversation={selectedConversation}
          onConversationUpdate={handleConversationUpdate}
        />
      ) : (
        <div className="flex-1 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <p className="text-sm">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  );
};

interface ConversationItemProps {
  conversation: DraftConversation;
  isSelected: boolean;
  onSelect: () => void;
}

const ConversationItem = ({
  conversation,
  isSelected,
  onSelect,
}: ConversationItemProps) => {
  return (
    <div
      onClick={onSelect}
      className={`px-3 py-2 mx-2 my-1 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-100' : 'hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0 overflow-hidden">
          {conversation.avatarUrl ? (
            <img
              src={conversation.avatarUrl}
              alt={conversation.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <span>{conversation.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-gray-900 truncate">{conversation.name}</h4>
              {conversation.isDraft && (
                <span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700 rounded">Draft</span>
              )}
            </div>
            {conversation.unreadCount > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full flex-shrink-0">
                {conversation.unreadCount}
              </span>
            )}
          </div>
          {conversation.lastMessage && (
            <>
              <p className="text-sm text-gray-600 truncate">{conversation.lastMessage.content}</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {new Date(conversation.lastMessage.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chats;
