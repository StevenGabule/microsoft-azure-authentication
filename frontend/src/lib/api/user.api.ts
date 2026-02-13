import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import { UserProfile, UpdateProfileRequest, SessionInfo } from '@/types';
import { ApiResponse, PaginatedResponse } from '@/types';

/**
 * User API functions.
 */
export const userApi = {
  /**
   * Gets the current user's profile.
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await apiClient.get(API_ENDPOINTS.USER.PROFILE);
    return response.data?.data || response.data;
  },

  /**
   * Updates the current user's profile.
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await apiClient.patch(API_ENDPOINTS.USER.PROFILE, data);
    return response.data?.data || response.data;
  },

  /**
   * Gets active sessions.
   */
  getSessions: async (): Promise<SessionInfo[]> => {
    const response = await apiClient.get(API_ENDPOINTS.SESSION.LIST);
    return response.data?.data || response.data;
  },

  /**
   * Revokes a specific session.
   */
  revokeSession: async (sessionId: string): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SESSION.REVOKE(sessionId));
  },

  /**
   * Revokes all sessions.
   */
  revokeAllSessions: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.SESSION.REVOKE_ALL);
  },
};
