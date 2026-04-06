import { useState, useEffect, useRef } from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import type { Conversation } from '@/services/chat.service';
import { useAuth } from '@/context';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  type: string;
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface ChatWindowProps {
  conversation: Conversation & { isDraft?: boolean };
  onConversationUpdate?: (conversation: Conversation) => void;
}

const MessageStatusIcon = ({ status }: { status?: string }) => {
  switch (status) {
    case 'sending':
      return <Clock size={14} className="opacity-70" />;
    case 'sent':
      return <Check size={14} className="opacity-70" />;
    case 'delivered':
      return <CheckCheck size={14} className="opacity-70" />;
    case 'read':
      return <CheckCheck size={14} className="opacity-100" />;
    case 'failed':
      return <AlertCircle size={14} className="text-red-400" />;
    default:
      return null;
  }
};

const ChatWindow = ({ conversation, onConversationUpdate }: ChatWindowProps) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<any>(null);

  // Fetch chat history when conversation changes
  useEffect(() => {
    const fetchChatHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const { chatService } = await import('@/services');
        const history = await chatService.getMessages(conversation.id);
        setMessages(history || []);
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchChatHistory();
  }, [conversation.id]);

  // Initialize socket connection
  useEffect(() => {
    const initializeSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const socket = io(import.meta.env.VITE_API_BASE_URL as string || 'http://localhost:3000', {
          withCredentials: true,
        });

        socket.on('connect', () => {
          console.log('Socket connected');
          // Join the conversation room
          socket.emit('join_conversation', { conversationId: conversation.id });
        });

        socket.on('message_received', (data: any) => {
          console.log('Message received:', data);
          const receivedMessage = data.message;
          
          // If it's our optimistic message, update it with server data
          setMessages((prev) =>
            prev.map((m) =>
              m.id.startsWith('temp_') && m.content === receivedMessage.content && m.senderId === receivedMessage.senderId
                ? {
                    ...m,
                    id: receivedMessage.id,
                    createdAt: receivedMessage.createdAt,
                    status: 'delivered',
                  }
                : m
            )
          );
          
          // If it's a new message from another user, add it
          if (!receivedMessage.id.startsWith('temp_')) {
            setMessages((prev) => [...prev, receivedMessage]);
          }
        });

        socket.on('typing', (data: any) => {
          console.log('User typing:', data);
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

        socketRef.current = socket;

        return () => {
          socket.emit('leave_conversation', { conversationId: conversation.id });
          socket.disconnect();
        };
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initializeSocket();
  }, [conversation.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSending) return;

    const messageContent = messageInput;
    setMessageInput('');
    setIsSending(true);

    // Add optimistic message
    const optimisticMessage: Message = {
      id: `temp_${Date.now()}`,
      content: messageContent,
      senderId: String(user?.id || 'current-user'),
      createdAt: new Date().toISOString(),
      type: 'text',
      status: 'sending',
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      // If it's a draft conversation, use REST API for first message
      if (conversation.isDraft) {
        const { chatService } = await import('@/services');

        // Extract recipient ID from draft conversation
        const recipientId = conversation.id.replace('draft_', '');

        const response = await chatService.sendMessage(recipientId, messageContent);

        // Update message with server data (including server timestamp)
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMessage.id
              ? {
                  ...m,
                  id: response.data?.message?.id || m.id,
                  createdAt: response.data?.message?.createdAt || m.createdAt,
                  status: 'sent',
                }
              : m
          )
        );

        // Update conversation if it was a draft
        if (response.data?.conversationId && onConversationUpdate) {
          const updatedConversation: Conversation = {
            ...conversation,
            id: response.data.conversationId,
            lastMessage: {
              id: response.data.message.id,
              content: messageContent,
              senderId: response.data.message.senderId,
              createdAt: response.data.message.createdAt,
              type: 'text',
            },
          };
          onConversationUpdate(updatedConversation);
        }
      } else {
        // For existing conversations, use socket event
        if (socketRef.current) {
          socketRef.current.emit('send_message', {
            conversationId: conversation.id,
            content: messageContent,
          });

          // Update optimistic message to sent status
          setMessages((prev) =>
            prev.map((m) =>
              m.id === optimisticMessage.id ? { ...m, status: 'sent' } : m
            )
          );
        } else {
          throw new Error('Socket not connected');
        }
      }
    } catch (error) {
      console.error('Failed to send message:', error);
      // Update message status to "failed"
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMessage.id ? { ...m, status: 'failed' } : m))
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-sm overflow-hidden">
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
          <div>
            <h3 className="font-semibold text-gray-900">{conversation.name}</h3>
            <p className="text-xs text-gray-500">
              {conversation.isDraft ? 'Draft' : conversation.type === 'group' ? 'Group' : 'Active now'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  message.senderId === user?.id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <p className="text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                  {message.senderId === user?.id && <MessageStatusIcon status={message.status} />}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending}
            className="flex-1 px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageInput.trim()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
