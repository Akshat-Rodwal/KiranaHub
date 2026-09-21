import { create } from 'zustand';
import authService from '../services/auth.service.js';

const initialState = {
  isAuthenticated: false,
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: false,
  isInitializing: true,
  error: null,
};

const useAuthStore = create((set, get) => ({
  ...initialState,

  initialize: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const refresh = localStorage.getItem('refreshToken');
      const storedUser = localStorage.getItem('user');

      if (token && storedUser) {
        const parsedUser = JSON.parse(storedUser);
        set({
          accessToken: token,
          refreshToken: refresh,
          user: parsedUser,
          isAuthenticated: true,
          isInitializing: false,
        });

        // Optionally background refresh profile to ensure role & active status are accurate
        try {
          const { user: freshUser } = await authService.getMe();
          if (freshUser) {
            localStorage.setItem('user', JSON.stringify(freshUser));
            set({ user: freshUser });
          }
        } catch {
          // If 401 and refresh also failed in apiClient, apiClient already cleared localStorage
          if (!localStorage.getItem('accessToken')) {
            set({ ...initialState, isInitializing: false });
          }
        }
      } else {
        set({ isInitializing: false });
      }
    } catch (e) {
      console.warn('[Auth] Failed to restore session:', e?.message);
      set({ ...initialState, isInitializing: false });
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const { user, accessToken, refreshToken } = await authService.login(credentials);
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const errorMessage =
        err?.message || err?.error || (typeof err === 'string' ? err : 'Login failed');
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const { user, accessToken, refreshToken } = await authService.register(userData);
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      const errorMessage =
        err?.message || err?.error || (typeof err === 'string' ? err : 'Registration failed');
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  loginWithGoogle: async (credential) => {
    set({ isLoading: true, error: null });
    try {
      const { user, accessToken, refreshToken, isNewUser } =
        await authService.googleLogin({ credential });
      localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      set({
        user,
        accessToken,
        refreshToken: refreshToken || null,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { user, isNewUser };
    } catch (err) {
      const errorMessage =
        err?.message || err?.error || (typeof err === 'string' ? err : 'Google Sign-In failed');
      set({ isLoading: false, error: errorMessage });
      throw new Error(errorMessage);
    }
  },

  setSession: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      accessToken,
      refreshToken: refreshToken || get().refreshToken,
      isAuthenticated: true,
      error: null,
    });
  },

  updateUser: (updates) => {
    const merged = { ...get().user, ...updates };
    localStorage.setItem('user', JSON.stringify(merged));
    set({ user: merged });
  },

  logout: async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore network errors on logout
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      set({
        ...initialState,
        isInitializing: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
