// API Client simplificado - Versión nueva
import axios from 'axios';
import Cookies from 'js-cookie';
// Remove direct toast import to prevent SSR issues
// import toast from 'react-hot-toast';

// Types básicos
interface LoginData {
  email: string;
  password: string;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'project_manager' | 'developer';
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

// Configuración
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

console.log('🌐 API Base URL:', API_BASE_URL);

// Cliente HTTP
const httpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptors
httpClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('❌ Request error:', error);
    return Promise.reject(error);
  }
);

httpClient.interceptors.response.use(
  (response) => {
    console.log('📥 Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('❌ Response error:', error.response?.status, error.response?.data);
    
    // No mostrar toast automáticamente para errores 400, dejar que el componente maneje el error
    if (error.response?.status !== 400) {
      if (error.response?.status === 401) {
        // Solo redirigir si NO es una petición de login
        const isLoginRequest = error.config?.url?.includes('/auth/login');
        if (!isLoginRequest) {
          Cookies.remove('auth-token');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
      }
      
      const message = error.response?.data?.message || 'Error en la petición';
      // Don't show toast in API interceptor to prevent SSR issues
      // Components should handle their own error display
      console.error('API Error:', message);
    }
    
    return Promise.reject(error);
  }
);

// Funciones de API
export async function loginUser(data: LoginData): Promise<AuthResponse> {
  console.log('🔐 Iniciando login...');
  try {
    const response = await httpClient.post('/auth/login', data);
    console.log('✅ Login exitoso');
    return response.data;
  } catch (error) {
    console.error('❌ Error en login:', error);
    throw error;
  }
}

export async function registerUser(data: RegisterData): Promise<AuthResponse> {
  console.log('📝 Iniciando registro con datos:', data);
  console.log('📝 Tipo de datos:', typeof data);
  console.log('📝 Keys del objeto:', Object.keys(data));
  console.log('📝 Valores:', Object.values(data));
  
  try {
    const response = await httpClient.post('/auth/register', data);
    console.log('✅ Registro exitoso');
    return response.data;
  } catch (error) {
    console.error('❌ Error en registro:', error);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
      console.error('❌ Headers:', error.response.headers);
    }
    throw error;
  }
}

// ==================== PERFIL ====================
export async function updateProfile(userData: {
  name?: string;
  email?: string;
  password?: string;
}): Promise<AuthResponse> {
  console.log('👤 Actualizando perfil del usuario...');
  console.log('📝 Datos a actualizar:', userData);
  
  try {
    const response = await httpClient.put('/auth/profile', userData);
    console.log('✅ Perfil actualizado exitosamente');
    return response.data;
  } catch (error) {
    console.error('❌ Error al actualizar perfil:', error);
    if (error.response) {
      console.error('❌ Status:', error.response.status);
      console.error('❌ Data:', error.response.data);
      console.error('❌ Headers:', error.response.headers);
    }
    throw error;
  }
}

// ==================== PROYECTOS ====================
export async function getProjects(params?: {
  page?: number;
  per_page?: number;
  status?: string;
  priority?: string;
}): Promise<{ projects: any[]; pagination?: any }> {
  console.log('📋 Obteniendo proyectos...');
  try {
    const response = await httpClient.get('/projects', { params });
    console.log('✅ Proyectos obtenidos');
    return {
      projects: response.data.projects || [],
      pagination: response.data.pagination
    };
  } catch (error) {
    console.error('❌ Error al obtener proyectos:', error);
    throw error;
  }
}

export async function getProject(id: string): Promise<any> {
  console.log('📋 Obteniendo proyecto:', id);
  try {
    const response = await httpClient.get(`/projects/${id}`);
    console.log('✅ Proyecto obtenido');
    return response.data.project;
  } catch (error) {
    console.error('❌ Error al obtener proyecto:', error);
    throw error;
  }
}

export async function createProject(data: any): Promise<any> {
  console.log('📋 Creando proyecto...');
  try {
    const response = await httpClient.post('/projects', data);
    console.log('✅ Proyecto creado');
    return response.data.project;
  } catch (error) {
    console.error('❌ Error al crear proyecto:', error);
    throw error;
  }
}

export async function updateProject(id: string, data: any): Promise<any> {
  console.log('📋 Actualizando proyecto:', id);
  try {
    const response = await httpClient.put(`/projects/${id}`, data);
    console.log('✅ Proyecto actualizado');
    return response.data.project;
  } catch (error) {
    console.error('❌ Error al actualizar proyecto:', error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  console.log('📋 Eliminando proyecto:', id);
  try {
    await httpClient.delete(`/projects/${id}`);
    console.log('✅ Proyecto eliminado');
  } catch (error) {
    console.error('❌ Error al eliminar proyecto:', error);
    throw error;
  }
}

// ==================== TAREAS ====================
export async function getTasks(): Promise<any[]> {
  console.log('📝 Obteniendo tareas...');
  try {
    const response = await httpClient.get('/tasks');
    console.log('✅ Tareas obtenidas');
    return response.data.data || [];
  } catch (error) {
    console.error('❌ Error al obtener tareas:', error);
    throw error;
  }
}

export async function getProjectTasks(projectId: string): Promise<any[]> {
  console.log('📝 Obteniendo tareas del proyecto:', projectId);
  try {
    const response = await httpClient.get(`/projects/${projectId}/tasks`);
    console.log('✅ Tareas del proyecto obtenidas');
    return response.data.tasks || [];
  } catch (error) {
    console.error('❌ Error al obtener tareas del proyecto:', error);
    throw error;
  }
}

export async function createTask(projectId: string, data: any): Promise<any> {
  console.log('📝 Creando tarea en proyecto:', projectId);
  try {
    const response = await httpClient.post(`/projects/${projectId}/tasks`, data);
    console.log('✅ Tarea creada');
    return response.data.task;
  } catch (error) {
    console.error('❌ Error al crear tarea:', error);
    throw error;
  }
}

export async function updateTask(id: string, data: any): Promise<any> {
  console.log('📝 Actualizando tarea:', id);
  try {
    const response = await httpClient.put(`/tasks/${id}`, data);
    console.log('✅ Tarea actualizada');
    return response.data.task;
  } catch (error) {
    console.error('❌ Error al actualizar tarea:', error);
    throw error;
  }
}

export async function updateTaskStatus(id: string, status: string): Promise<any> {
  console.log('📝 Actualizando estado de tarea:', id, 'a', status);
  try {
    const response = await httpClient.put(`/tasks/${id}`, { status });
    console.log('✅ Estado de tarea actualizado');
    return response.data.task;
  } catch (error) {
    console.error('❌ Error al actualizar estado de tarea:', error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  console.log('📝 Eliminando tarea:', id);
  try {
    await httpClient.delete(`/tasks/${id}`);
    console.log('✅ Tarea eliminada');
  } catch (error) {
    console.error('❌ Error al eliminar tarea:', error);
    throw error;
  }
}

// ==================== RECUPERACIÓN DE CONTRASEÑA ====================
export async function forgotPassword(email: string): Promise<{ success: boolean; message: string }> {
  console.log('🔐 Forgot password attempt for email:', email);
  try {
    const response = await httpClient.post('/auth/forgot-password', { email });
    console.log('✅ Forgot password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Forgot password error:', error);
    throw error;
  }
}

export async function verifyResetToken(token: string): Promise<{ success: boolean; message: string; user_email?: string }> {
  console.log('🔍 Verify reset token:', token);
  try {
    const response = await httpClient.post('/auth/verify-reset-token', { token });
    console.log('✅ Verify token response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Verify token error:', error);
    throw error;
  }
}

export async function resetPassword(token: string, password: string): Promise<{ success: boolean; message: string }> {
  console.log('🔑 Reset password with token:', token);
  try {
    const response = await httpClient.post('/auth/reset-password', { token, password });
    console.log('✅ Reset password response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Reset password error:', error);
    throw error;
  }
}

// ================================
// GESTIÓN DE USUARIOS
// ================================

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'manager' | 'developer';
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'manager' | 'developer';
}

export async function getUsers(): Promise<{ success: boolean; data: any[]; total: number }> {
  console.log('👥 Fetching users...');
  try {
    const response = await httpClient.get('/users');
    console.log('✅ Users response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get users error:', error);
    throw error;
  }
}

export async function createUser(userData: CreateUserData): Promise<{ success: boolean; message: string; user?: any }> {
  console.log('➕ Creating user:', userData);
  try {
    const response = await httpClient.post('/users', userData);
    console.log('✅ Create user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Create user error:', error);
    throw error;
  }
}

export async function updateUser(userId: string, userData: UpdateUserData): Promise<{ success: boolean; message: string; user?: any }> {
  console.log('✏️ Updating user:', userId, userData);
  try {
    const response = await httpClient.put(`/users/${userId}`, userData);
    console.log('✅ Update user response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Update user error:', error);
    throw error;
  }
}

// ================================
// MÉTRICAS Y ESTADÍSTICAS
// ================================

export async function getOverviewStats(): Promise<{ success: boolean; data: any }> {
  console.log('📊 Fetching overview stats...');
  try {
    const response = await httpClient.get('/stats/overview');
    console.log('✅ Overview stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get overview stats error:', error);
    throw error;
  }
}

export async function getProjectStats(): Promise<{ success: boolean; data: any }> {
  console.log('📈 Fetching project stats...');
  try {
    const response = await httpClient.get('/stats/projects');
    console.log('✅ Project stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get project stats error:', error);
    throw error;
  }
}

export async function getTaskStats(): Promise<{ success: boolean; data: any }> {
  console.log('📉 Fetching task stats...');
  try {
    const response = await httpClient.get('/stats/tasks');
    console.log('✅ Task stats response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task stats error:', error);
    throw error;
  }
}

// ================================
// SISTEMA DE COMENTARIOS
// ================================

interface CreateCommentData {
  content: string;
}

interface UpdateCommentData {
  content: string;
}

export async function getTaskComments(taskId: string): Promise<{ success: boolean; data: any[]; total: number }> {
  console.log('💬 Fetching task comments...');
  try {
    const response = await httpClient.get(`/tasks/${taskId}/comments`);
    console.log('✅ Task comments response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get task comments error:', error);
    throw error;
  }
}

export async function createComment(taskId: string, commentData: CreateCommentData): Promise<{ success: boolean; message: string; comment?: any }> {
  console.log('💬 Creating comment for task:', taskId);
  try {
    const response = await httpClient.post(`/tasks/${taskId}/comments`, commentData);
    console.log('✅ Create comment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Create comment error:', error);
    throw error;
  }
}

export async function updateComment(commentId: string, commentData: UpdateCommentData): Promise<{ success: boolean; message: string; comment?: any }> {
  console.log('💬 Updating comment:', commentId);
  try {
    const response = await httpClient.put(`/comments/${commentId}`, commentData);
    console.log('✅ Update comment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Update comment error:', error);
    throw error;
  }
}

export async function deleteComment(commentId: string): Promise<{ success: boolean; message: string }> {
  console.log('💬 Deleting comment:', commentId);
  try {
    const response = await httpClient.delete(`/comments/${commentId}`);
    console.log('✅ Delete comment response:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Delete comment error:', error);
    throw error;
  }
}

// ============================================================================
// REPORTES PDF
// ============================================================================

export const exportProjectsPDF = async (projectId?: string): Promise<Blob> => {
  try {
    const url = projectId ? `/reports/projects/pdf?project_id=${projectId}` : '/reports/projects/pdf';
    const response = await httpClient.get(url, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting projects PDF:', error);
    throw error;
  }
};

export const exportProductivityPDF = async (userId?: string, dateRange?: string): Promise<Blob> => {
  try {
    let url = '/reports/productivity/pdf';
    const params = new URLSearchParams();
    
    if (userId) {
      params.append('user_id', userId);
    }
    if (dateRange) {
      params.append('date_range', dateRange);
    }
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await httpClient.get(url, {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting productivity PDF:', error);
    throw error;
  }
};

export const exportDashboardPDF = async (): Promise<Blob> => {
  try {
    const response = await httpClient.get('/reports/dashboard/pdf', {
      responseType: 'blob'
    });
    return response.data;
  } catch (error: any) {
    console.error('Error exporting dashboard PDF:', error);
    throw error;
  }
};

// Función helper para descargar blob como archivo
export const downloadPDFBlob = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

// Export por defecto también
const apiClient = {
  login: loginUser,
  register: registerUser,
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
  getTasks,
  getProjectTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  // Nuevas funciones de usuarios
  getUsers,
  createUser,
  updateUser,
  // Funciones de métricas
  getOverviewStats,
  getProjectStats,
  getTaskStats,
  // Funciones de comentarios
  getTaskComments,
  createComment,
  updateComment,
  deleteComment,
  // Funciones de reportes
  exportProjectsPDF,
  exportProductivityPDF,
  exportDashboardPDF,
};

export default apiClient;

// Log de verificación
console.log('📦 API module loaded');
console.log('🔧 Exported functions:', { loginUser, registerUser, forgotPassword, verifyResetToken, resetPassword });
