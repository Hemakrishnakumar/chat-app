import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from 'react';
import { chatService, type Conversation } from '@/services/chat.service';
import { useSocket } from './socketContext';
import { useAuthContext } from './authContext';
import { MESSAGE_RECEIVED, NEW_CONVERSATION, UPDATE_UNREAD_COUNT } from '@/types/socket.events';

interface DraftConversation extends Conversation {
  isDraft?: boolean;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface ConversationContextType {
  conversations: DraftConversation[];
  messages: Message[];
  selectedConversation: DraftConversation | null;
  isLoadingHistory: boolean;
  isLoading: boolean;
  hasMore: boolean;
  nextCursor: string | null;
  // Actions
  fetchConversations: (cursor?: string) => Promise<void>;
  setMessages: (messages: Message[] | ((prev: Message[]) => Message[])) => void;
  setSelectedConversation: (conversation: DraftConversation | null) => void;
  addDraftConversation: (user: any) => void;
  updateConversation: (updatedConversation: DraftConversation) => void;
  addMessageToConversation: (conversationId: string, message: any) => void;
  resetConversations: () => void;
  markConversationAsRead: (conversationId: string) => void;
}

const ConversationContext = createContext<ConversationContextType | undefined>(undefined);

export const ConversationProvider = ({ children }: { children: ReactNode }) => {
  const [conversations, setConversations] = useState<DraftConversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const { user } = useAuthContext();
  const [selectedConversation, setSelectedConversation] = useState<DraftConversation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const socket = useSocket();
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  //fetch conversation messages
  useEffect(() => {
    if (!selectedConversation) return;
    const fetchChatHistory = async () => {
      // Reset messages immediately for draft conversations
      if (selectedConversation.isDraft) {
        setMessages([]);
        setIsLoadingHistory(false);
        return;
      }

      setIsLoadingHistory(true);
      try {
        const history = await chatService.getMessages(selectedConversation.id);
        // Backend returns array directly
        setMessages(Array.isArray(history) ? history : []);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [selectedConversation?.id, selectedConversation?.isDraft]);

  useEffect(() => {
      if (!socket) return;
  
      const handleMessage = (payload: any) => {
        if (document.hidden && Notification.permission === "granted") {
            new Notification("New Message", {
              body: `You recieved a message`,
              icon: "/logo.png",
            });
          }
        const message = payload.message;
        //update the conversations
        setConversations(prev => {
          let conv;
          const updated = prev.filter(conversation => {            
            if(conversation.id === payload.message.conversationId) {
              conv = {
                ...conversation,
                lastMessage: payload.message,
                updatedAt: payload.message.createdAt,
                unreadCount: user?.id === payload.message.senderId || message.conversationId === selectedConversation?.id ? 0 :  conversation.unreadCount + 1
              }
              return false;
            }
            return true;
          })
          if(!conv) return prev;
          return [conv, ...updated]
        })
        //check if the conversation chatwindow is opened
        if (message.conversationId !== selectedConversation?.id) {          
          return;
        };      
        
        setMessages((prev: Message[]): Message[] => {
          if(message.senderId === user?.id) {
            const tempMessageIndex = prev.findIndex(m => 
              m.id.startsWith('temp_') && m.senderId === String(user?.id) && m.content === message.content
            );
            let newMessages;
            newMessages = prev.filter((msg, index)=> index !== tempMessageIndex && msg.id !== message.id)
            return [...newMessages, {...message, status: 'sent'}]        
          } else {
            return [...prev, { ...message, status: 'sent' }];
          }
        });
      };
  
      socket.on(MESSAGE_RECEIVED, handleMessage);
  
      return () => {
        socket.off(MESSAGE_RECEIVED, handleMessage);
      };
    }, [socket, selectedConversation?.id, user?.id]);

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
              unreadCount: user?.id === payload.lastMessage.senderId ? 0 : 1,
              lastMessage: payload.lastMessage,
            };
          }
          return prev;
        });
      }
      else {
        setConversations((prev: DraftConversation[]) => [{ ...payload, unreadCount: user?.id === payload.lastMessage.senderId ? 0 : 1 }, ...prev])
      }
    };

    socket.on(NEW_CONVERSATION, handleNewConversation);

    return () => {
      socket.off(NEW_CONVERSATION, handleNewConversation);
    };
  }, [socket, user, selectedConversation]);


  useEffect( ()=> {
    if(!socket) return;
    const handleUpdateUnread = (payload: any) => {
      setConversations(prev => 
        prev.map(conv => 
          conv.id === payload.conversationId 
            ? { ...conv, unreadCount: 0 } 
            : conv
        )
      );
    };
    socket.on(UPDATE_UNREAD_COUNT, handleUpdateUnread)
    return () => {
      socket.off(UPDATE_UNREAD_COUNT, handleUpdateUnread)
    }
  }, [socket, user])

  


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

  const addDraftConversation = useCallback((conversation: any) => {
    const draftConversation: DraftConversation = {
      id: `draft`,
      type: conversation.type,
      members: conversation.ids,
      name: conversation.name,
      avatarUrl: conversation.photo_url,
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

  const markConversationAsRead = useCallback((conversationId: string) => {
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId ? { ...c, unreadCount: 0 } : c
      )
    );
  }, [])

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
    messages,
    setMessages,
    isLoadingHistory,
    isLoading,
    hasMore,
    nextCursor,
    fetchConversations,
    setSelectedConversation,
    addDraftConversation,
    updateConversation,
    addMessageToConversation,
    resetConversations,
    markConversationAsRead
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
