import { apiClient, API_ENDPOINTS } from '../api';
import type { RequestCallbacks } from '../api';

export interface SearchUser {
  id: string;
  name: string;
  email: string;
  photo_url: string | null;
}

export interface SearchUsersResponse {
  statusCode: number;
  message: string;
  data: SearchUser[];
}

export const userService = {
  searchUsers(query: string, callbacks?: RequestCallbacks<SearchUsersResponse>) {
    const url = `${API_ENDPOINTS.USERS.SEARCH}?query=${encodeURIComponent(query)}`;
    return apiClient.get<SearchUsersResponse>(url, callbacks);
  },
};
