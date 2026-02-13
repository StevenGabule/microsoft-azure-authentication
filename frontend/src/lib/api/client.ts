import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, setAccessToken, isTokenExpired } from '../utils/tokens';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

/**
 * Axios instance with interceptors for automatic token attachment
 * and refresh token rotation.
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Send cookies (refresh token)
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Token refresh state
let isRefreshing = false;
let refreshSubscribers: Array<(token: string) => void> = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onTokenRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

/**
 * Request interceptor: Attaches the access token to outgoing requests.
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

/**
 * Response interceptor: Handles 401 errors by refreshing the access token.
 * Implements a request queue to prevent multiple simultaneous refresh requests.
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Only handle 401 errors and non-retry requests
    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't retry refresh or login requests
    if (
      originalRequest.url?.includes('/auth/refresh') ||
      originalRequest.url?.includes('/auth/login')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until refresh completes
      return new Promise((resolve) => {
        subscribeTokenRefresh((newToken: string) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const response = await apiClient.post('/auth/refresh');
      const newAccessToken = response.data?.data?.accessToken || response.data?.accessToken;

      if (newAccessToken) {
        setAccessToken(newAccessToken);
        onTokenRefreshed(newAccessToken);
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      }
    } catch (refreshError) {
      // Refresh failed - clear auth state and redirect to login
      setAccessToken(null);
      if (typeof window !== 'undefined') {
        window.location.href = '/login?error=session_expired';
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }

    return Promise.reject(error);
  },
);

export default apiClient;
