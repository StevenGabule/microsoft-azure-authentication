import apiClient from './client';
import { API_ENDPOINTS } from '../utils/constants';
import { MfaSetupResponse, MfaStatusResponse } from '@/types';

/**
 * MFA API functions.
 */
export const mfaApi = {
  /**
   * Initiates MFA setup - generates TOTP secret and QR code.
   */
  setup: async (): Promise<MfaSetupResponse> => {
    const response = await apiClient.post(API_ENDPOINTS.MFA.SETUP);
    return response.data?.data || response.data;
  },

  /**
   * Enables MFA by verifying the initial TOTP code.
   */
  enable: async (code: string): Promise<void> => {
    await apiClient.post(API_ENDPOINTS.MFA.ENABLE, { code });
  },

  /**
   * Gets the current MFA status.
   */
  getStatus: async (): Promise<MfaStatusResponse> => {
    const response = await apiClient.get(API_ENDPOINTS.MFA.STATUS);
    return response.data?.data || response.data;
  },

  /**
   * Disables MFA.
   */
  disable: async (): Promise<void> => {
    await apiClient.delete(API_ENDPOINTS.MFA.DISABLE);
  },

  /**
   * Regenerates recovery codes.
   */
  regenerateRecoveryCodes: async (): Promise<{ recoveryCodes: string[] }> => {
    const response = await apiClient.post(API_ENDPOINTS.MFA.REGENERATE_CODES);
    return response.data?.data || response.data;
  },
};
