import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { loginUser, registerUser } from '../api-simple';
import Cookies from 'js-cookie';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  setAuth: (user: User, token: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      setAuth: (user: User, token: string) => {
        Cookies.set('auth-token', token, { expires: 7 });
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await loginUser({ email, password });
          if (response.success && response.user && response.token) {
            get().setAuth(response.user, response.token);
          } else {
            throw new Error(response.message || 'Error en el login');
          }
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (name: string, email: string, password: string, role: string) => {
        set({ isLoading: true });
        try {
          const response = await registerUser({ 
            name, 
            email, 
            password, 
            role: role as 'developer' | 'project_manager' | 'admin'
          });
          if (response.success && response.user && response.token) {
            get().setAuth(response.user, response.token);
          } else {
            throw new Error(response.message || 'Error en el registro');
          }
        } catch (error: any) {
          set({ isLoading: false });
          
          // Preservar el error original con toda su información
          if (error.response?.data?.message) {
            const enhancedError = new Error(error.response.data.message) as any;
            enhancedError.response = error.response;
            throw enhancedError;
          }
          
          throw error;
        }
      },
      
      logout: () => {
        Cookies.remove('auth-token');
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);
