import { useState, useEffect, useRef } from 'react';
import { CheckCircle2, Check, Clock, AlertCircle } from 'lucide-react';
import { chatService, } from '@/services/chat.service';
import { useAuth } from '@/context';
import { useSocket } from '@/context/socketContext';
import { useConversation, type Message } from '@/context/conversationContext';
import { MARK_READ, SEND_MESSAGE } from '@/types/socket.events';

type ConversationMember = {
  id: string,
  name: string,
  photo_url?: string | null  
}

const MessageStatusIcon = ({ status }: { status?: string }) => {
  switch (status) {
    case 'sending':
      return <Clock size={14} className="opacity-70" />;
    case 'sent':
      return <Check size={14} className="opacity-70" />;
    case 'delivered':
      return <CheckCircle2 size={14} className="opacity-70" />;
    case 'read':
      return <CheckCircle2 size={14} className="opacity-100 text-blue-400" />;
    case 'failed':
      return <AlertCircle size={14} className="text-red-400" />;
    default:
      return null;
  }
};

const ChatWindow = () => {
  const { user } = useAuth();
  const [messageInput, setMessageInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { messages, setMessages, isLoadingHistory, selectedConversation: conversation, markConversationAsRead} = useConversation();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  const [groupMembers, setGroupMembers] = useState<ConversationMember[]>([]);

  if(!conversation) {
    throw new Error('conversation should not be null');
  }

  useEffect(()=> {
    if(conversation.isDraft || conversation.type !== 'group') return;
    chatService.getConversationMembers(conversation.id).then((response) => {
      if(response.success) {
        setGroupMembers(response.data);
      }
    })
  }, [])


  useEffect(() => {
    if (!socket || conversation.isDraft || conversation.unreadCount > 0) return;

    socket.emit(MARK_READ, { conversationId: conversation.id }, (response: any)=> {
      if(response.success) {
        markConversationAsRead(conversation.id)
      }
    });
  }, [socket, conversation.id]);



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
        const response = await chatService.sendMessage({participantIds: conversation.members, content: messageContent, type: conversation.type, name: conversation.name ?? undefined});

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
      } else {
        if (socket && !conversation.isDraft) {
          socket.emit(SEND_MESSAGE, {
            conversationId: conversation.id,
            content: messageContent,
          }, (response: any) => {
            if (response?.success) {
              // Update message status to sent
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticMessage.id
                    ? {
                      ...m,
                      id: response.message.id,
                      createdAt: response.message.createdAt,
                      status: 'sent',
                    }
                    : m
                )
              );
            } else {
              // Update message status to failed
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === optimisticMessage.id
                    ? { ...m, status: 'failed' }
                    : m
                )
              );
            }
          });
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
      <div className="flex items-center justify-between p-3 md:p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2 md:gap-3 min-w-0">
          <div className="w-8 md:w-10 h-8 md:h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs md:text-sm overflow-hidden flex-shrink-0">
            {conversation.avatarUrl ? (
              <img
                src={conversation.avatarUrl}
                alt={conversation.name || ""}
                className="w-full h-full object-cover"
              />
            ) : (
              <span>{conversation.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm md:text-base truncate">{conversation.name}</h3>
            <p className="text-xs text-gray-500">
              {conversation.isDraft ? 'Draft' : conversation.type === 'group' ? 'Group' : 'Active now'}
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-3 md:p-4 space-y-1">
        {isLoadingHistory ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-400 py-8">
            <p className="text-sm">No messages yet</p>
          </div>
        ) : (
          messages.map((message, index) => {
            const isCurrentUser = String(message.senderId) === String(user?.id);
            const senderMember = groupMembers.find(m => m.id === message.senderId);
            const isGroupChat = conversation.type === 'group';

            // Check if this is the first message from this sender or if the previous message was from a different sender
            const previousMessage = index > 0 ? messages[index - 1] : null;
            const isFirstInGroup = !previousMessage || previousMessage.senderId !== message.senderId;

            // Check if the next message is from the same sender
            const nextMessage = index < messages.length - 1 ? messages[index + 1] : null;
            const isLastInGroup = !nextMessage || nextMessage.senderId !== message.senderId;

            return (
              <div
                key={message.id}
                className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex flex-col gap-0.5 w-full max-w-xs md:max-w-md`}>
                  {/* Avatar and Message Container */}
                  <div className={`flex gap-2 md:gap-3 items-center ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar Container - Always reserve space for alignment */}
                    {isGroupChat && !isCurrentUser && (
                      <div className="w-8 h-8 flex-shrink-0">
                        {isFirstInGroup && (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-semibold text-xs overflow-hidden">
                            {senderMember?.photo_url ? (
                              <img
                                src={senderMember.photo_url}
                                alt={senderMember.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span>{senderMember?.name?.charAt(0).toUpperCase() || '?'}</span>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Message Content */}
                    <div className="flex flex-col gap-1">
                      {/* Sender Name - Only show for group chats, non-current user messages, and first message in group */}
                      {isGroupChat && !isCurrentUser && isFirstInGroup && (
                        <p className="text-xs font-medium text-gray-600 px-3">
                          {senderMember?.name || 'Unknown'}
                        </p>
                      )}

                      {/* Message Bubble */}
                      <div
                        className={`px-3 md:px-4 py-2 rounded-lg text-sm md:text-base w-fit ${
                          isCurrentUser
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p className="break-words">{message.content}</p>
                      </div>
                    </div>
                  </div>

                  {/* Timestamp - Only show for last message in group */}
                  {isLastInGroup && (
                    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} ${isGroupChat && !isCurrentUser ? 'pl-10' : ''}`}>
                      <p className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleTimeString('en-IN', {
                          timeZone: 'Asia/Kolkata',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                        {isCurrentUser && message.status && (
                          <span className="ml-1">
                            <MessageStatusIcon status={message.status} />
                          </span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
        <div className="flex gap-2 md:gap-3">
          <input
            type="text"
            placeholder="Type a message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isSending}
            className="flex-1 px-3 md:px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={isSending || !messageInput.trim()}
            className="px-4 md:px-6 py-2 bg-blue-500 text-white rounded-lg font-medium text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
