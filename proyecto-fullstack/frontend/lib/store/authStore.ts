import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { loginUser, registerUser, updateProfile as updateProfileAPI } from '../api-simple';
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
  updateProfile: (userData: { name?: string; email?: string; password?: string }) => Promise<void>;
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
        try {
          set({ isLoading: true, isAuthenticated: false }); // Asegurar que no esté autenticado al inicio
          console.log('🔐 [AuthStore] Iniciando login para:', email);
          const response = await loginUser({ email, password });
          console.log('📥 [AuthStore] Respuesta del backend:', response);
          
          if (response.success && response.user && response.token) {
            get().setAuth(response.user, response.token);
          } else {
            console.error('❌ [AuthStore] Login fallido:', response.message);
            set({ isLoading: false, isAuthenticated: false, user: null, token: null });
            throw new Error(response.message || 'Error en el login');
          }
        } catch (error: any) {
          console.error('❌ [AuthStore] Error capturado:', error);
          console.error('❌ [AuthStore] Error response:', error.response);
          console.error('❌ [AuthStore] Error response data:', error.response?.data);
          
          // Limpiar completamente el estado en caso de error
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null, 
            token: null 
          });
          
          // Preservar el mensaje específico del backend
          if (error.response?.data?.message) {
            console.log('💬 [AuthStore] Usando mensaje del backend:', error.response.data.message);
            const enhancedError = new Error(error.response.data.message) as any;
            enhancedError.response = error.response;
            throw enhancedError;
          }
          
          // Si es un error de red u otro tipo
          const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión';
          console.log('💬 [AuthStore] Usando mensaje genérico:', errorMessage);
          throw new Error(errorMessage);
        }
      },

      register: async (name: string, email: string, password: string, role: string) => {
        try {
          set({ isLoading: true, isAuthenticated: false }); // Limpiar estado al inicio
          console.log('📝 [AuthStore] Iniciando registro para:', email);
          
          const response = await registerUser({ 
            name, 
            email, 
            password, 
            role: role as 'developer' | 'project_manager' | 'admin'
          });
          
          console.log('📥 [AuthStore] Respuesta del registro:', response);
          
          if (response.success && response.user && response.token) {
            console.log('✅ [AuthStore] Registro exitoso, autenticando usuario');
            get().setAuth(response.user, response.token);
          } else {
            console.error('❌ [AuthStore] Registro fallido:', response.message);
            set({ isLoading: false, isAuthenticated: false, user: null, token: null });
            throw new Error(response.message || 'Error en el registro');
          }
        } catch (error: any) {
          console.error('❌ [AuthStore] Error en registro:', error);
          
          // Limpiar estado en caso de error
          set({ 
            isLoading: false, 
            isAuthenticated: false, 
            user: null, 
            token: null 
          });
          
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

      updateProfile: async (userData: { name?: string; email?: string; password?: string }) => {
        set({ isLoading: true });
        try {
          const response = await updateProfileAPI(userData);
          if (response.success && response.user) {
            // Actualizar el usuario en el store con los nuevos datos
            get().updateUser(response.user);
          } else {
            throw new Error(response.message || 'Error al actualizar el perfil');
          }
        } catch (error: any) {
          console.error('Error al actualizar perfil:', error);
          
          // Preservar el error original con toda su información
          if (error.response?.data?.message) {
            const enhancedError = new Error(error.response.data.message) as any;
            enhancedError.response = error.response;
            throw enhancedError;
          }
          
          throw error;
        } finally {
          set({ isLoading: false });
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
