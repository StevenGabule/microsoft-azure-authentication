import { create } from 'zustand';
import { AuthUser } from '@/types';
import { setAccessToken, clearAccessToken } from '@/lib/utils/tokens';

interface AuthStore {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mfaRequired: boolean;

  setUser: (user: AuthUser | null) => void;
  setAuthenticated: (value: boolean) => void;
  setLoading: (value: boolean) => void;
  setMfaRequired: (value: boolean) => void;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  completeMfa: (token: string) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  mfaRequired: false,

  setUser: (user) => set({ user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setMfaRequired: (mfaRequired) => set({ mfaRequired }),

  login: (user, token) => {
    setAccessToken(token);
    set({
      user,
      isAuthenticated: true,
      isLoading: false,
      mfaRequired: false,
    });
  },

  logout: () => {
    clearAccessToken();
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      mfaRequired: false,
    });
  },

  completeMfa: (token) => {
    setAccessToken(token);
    set({ mfaRequired: false });
  },
}));
