import { apiClient, API_ENDPOINTS } from '../api';
import type { RequestCallbacks } from '../api';

export interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  type: string;
}

export interface Conversation {
  id: string;
  type: 'direct' | 'group';
  name: string | null;
  avatarUrl: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface GetChatsResponse {
  data: Conversation[];
  nextCursor: string | null;
}

export const chatService = {
  getChats(cursor?: string, limit: number = 20, callbacks?: RequestCallbacks<GetChatsResponse>) {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    params.append('limit', limit.toString());

    const queryString = params.toString();
    const url = queryString ? `${API_ENDPOINTS.CHATS.LIST}?${queryString}` : API_ENDPOINTS.CHATS.LIST;

    return apiClient.get<GetChatsResponse>(url, callbacks);
  },

  sendMessage(participantIds: string[], content: string, type: string, callbacks?: RequestCallbacks<any>) {
    return apiClient.post<any>(
      API_ENDPOINTS.CHATS.CREATE_CONVERSATION,
      { participantIds, content, type },
      callbacks,
    );
  },

  getMessages(conversationId: string, callbacks?: RequestCallbacks<Message[]>) {
    const url = `${API_ENDPOINTS.CHATS.LIST}/${conversationId}/messages`;
    return apiClient.get<Message[]>(url, callbacks);
  },
};
