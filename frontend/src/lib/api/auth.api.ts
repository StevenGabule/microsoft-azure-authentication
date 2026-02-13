import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import { TokenRefreshResponse } from '@/types';

/**
 * Auth API functions for communicating with the backend.
 */
export const authApi = {
  /**
   * Initiates the login flow by redirecting to the backend login endpoint.
   */
  login: () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
    window.location.href = `${apiUrl}${API_ENDPOINTS.AUTH.LOGIN}`;
  },

  /**
   * Logs out the user.
   */
  logout: async (): Promise<{ logoutUrl: string }> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
    return response.data?.data || response.data;
  },

  /**
   * Refreshes the access token.
   */
  refreshToken: async (): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH);
    return response.data?.data || response.data;
  },

  /**
   * Gets the current user's auth info.
   */
  getCurrentUser: async () => {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.ME);
    return response.data?.data || response.data;
  },

  /**
   * Verifies MFA code during login.
   */
  verifyMfa: async (code: string, isRecoveryCode: boolean = false) => {
    const payload = isRecoveryCode
      ? { code: '', recoveryCode: code }
      : { code };
    const response = await apiClient.post(API_ENDPOINTS.AUTH.MFA_VERIFY, payload);
    return response.data?.data || response.data;
  },
};
