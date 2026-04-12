import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import { chatService, type Conversation } from '@/services/chat.service';
import { useSocket } from './socketContext';
import { useAuthContext } from './authContext';
import { NEW_CONVERSATION, UPDATE_CONVERSATION } from '@/types/socket.events';

interface DraftConversation extends Conversation {
  isDraft?: boolean;
}

interface ConversationContextType {
  conversations: DraftConversation[];
  selectedConversation: DraftConversation | null;
  isLoading: boolean;
  hasMore: boolean;
  nextCursor: string | null;

  // Actions
  fetchConversations: (cursor?: string) => Promise<void>;
  setSelectedConversation: (conversation: DraftConversation | null) => void;
  addDraftConversation: (user: any) => void;
  updateConversation: (updatedConversation: DraftConversation) => void;
  addMessageToConversation: (conversationId: string, message: any) => void;
  resetConversations: () => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<DraftConversation[]>([]);
  const { user } = useAuthContext();
  const [selectedConversation, setSelectedConversation] = useState<DraftConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) return;

    const handleNewConversation = (payload: any) => {
      if (user?.id === payload.lastMessage.senderId && selectedConversation?.isDraft) {
        setConversations(prev =>
          prev.map(con => {
            if (con.isDraft && con.id.startsWith('draft')) {
              return {
                ...con,
                isDraft: false,
                id: payload.id,
                updatedAt: payload.updatedAt,
                unreadCount: 0,
                lastMessage: payload.lastMessage,
              };
            }
            return con;
          })
        );
        
        // Update selectedConversation to match the new real conversation
        setSelectedConversation(prev => {
          if (prev?.isDraft && prev.id.startsWith('draft')) {
            return {
              ...prev,
              isDraft: false,
              id: payload.id,
              updatedAt: payload.updatedAt,
              unreadCount: user?.id === payload.lastMessage.senderId ? 0: 1,
              lastMessage: payload.lastMessage,
            };
          }
          return prev;
        });
      }
      else {
        setConversations((prev: DraftConversation[]) => [{...payload, unreadCount: user?.id === payload.lastMessage.senderId ? 0: 1}, ...prev])
      }
    };

    socket.on(NEW_CONVERSATION, handleNewConversation);

    return () => {
      socket.off(NEW_CONVERSATION, handleNewConversation);
    };
  }, [socket, user, selectedConversation]);

  useEffect(()=>{
    if(!socket) return;
    socket.on(UPDATE_CONVERSATION, (payload: any) => {
      console.log('new message', payload)
      setConversations(prev => 
        prev.map(conversation => {
          if(conversation.id === payload.message.conversationId) {
            return {
              ...conversation,
              lastMessage: payload,
              updatedAt: payload.createdAt,
              unreadCount: user?.id === payload.message.senderId ? 0 : conversation.unreadCount + 1
            }
          }
          return conversation;
        })
      )
    })

    socket.on('unread_count_updated', (payload: any) => {
      setConversations(prev =>
        prev.map(conversation => {
          if(conversation.id === payload.conversationId) {
            return {
              ...conversation,
              unreadCount: payload.unreadCount
            }
          }
          return conversation;
        })
      )
    })

    return () => {
      socket.off(UPDATE_CONVERSATION)
      socket.off('unread_count_updated')
    }
  }   
  , [socket, user])
 

  const fetchConversations = useCallback(async (cursor?: string) => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const response = await chatService.getChats(cursor, 20);

      if (cursor) {
        setConversations((prev) => [...prev, ...response.data]);
      } else {
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

  const addDraftConversation = useCallback((user: any) => {
    const draftConversation: DraftConversation = {
      id: `draft_${user.id}`,
      type: 'direct',
      name: user.name,
      avatarUrl: user.photo_url,
      lastMessage: null,
      unreadCount: 0,
      updatedAt: new Date().toISOString(),
      isDraft: true,
    };

    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== draftConversation.id);
      return [draftConversation, ...filtered];
    });

    setSelectedConversation(draftConversation);
  }, []);

  const updateConversation = useCallback((updatedConversation: DraftConversation) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === updatedConversation.id ? updatedConversation : c))
    );
    setSelectedConversation(updatedConversation);
  }, []);

  const addMessageToConversation = useCallback((conversationId: string, message: any) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? {
            ...c,
            lastMessage: {
              id: message.id,
              content: message.content,
              senderId: message.senderId,
              createdAt: message.createdAt,
              type: message.type,
            },
            updatedAt: message.createdAt,
          }
          : c
      )
    );
  }, []);

  const resetConversations = useCallback(() => {
    setConversations([]);
    setSelectedConversation(null);
    setNextCursor(null);
    setHasMore(true);
  }, []);

  const value: ConversationContextType = {
    conversations,
    selectedConversation,
    isLoading,
    hasMore,
    nextCursor,
    fetchConversations,
    setSelectedConversation,
    addDraftConversation,
    updateConversation,
    addMessageToConversation,
    resetConversations,
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};

export const useConversation = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversation must be used within ConversationProvider');
  }
  return context;
};
