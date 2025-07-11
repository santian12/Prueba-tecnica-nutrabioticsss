import axios from 'axios';
import { 
  User, 
  Project, 
  Task, 
  LoginData, 
  RegisterData, 
  AuthResponse, 
  CreateProjectData,
  CreateTaskData,
  UpdateTaskData
} from './types';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Cliente HTTP básico
const client = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor para agregar token
client.interceptors.request.use(
  (config) => {
    const token = Cookies.get('auth-token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor para manejar errores
client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('auth-token');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.message || 'Error en la petición';
    toast.error(message);
    
    return Promise.reject(error);
  }
);

// ==================== AUTENTICACIÓN ====================
export const login = async (data: LoginData): Promise<AuthResponse> => {
  try {
    const response = await client.post('/auth/login', data);
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  try {
    const response = await client.post('/auth/register', data);
    return response.data;
  } catch (error) {
    console.error('Register error:', error);
    throw error;
  }
};

export const getProfile = async (): Promise<User> => {
  const response = await client.get('/auth/profile');
  return response.data.user;
};

// ==================== PROYECTOS ====================
export const getProjects = async (params?: {
  page?: number;
  per_page?: number;
  status?: string;
  priority?: string;
}): Promise<{ projects: Project[]; pagination?: any }> => {
  const response = await client.get('/projects', { params });
  return {
    projects: response.data.data || [],
    pagination: response.data.pagination
  };
};

export const getProject = async (id: string): Promise<Project> => {
  const response = await client.get(`/projects/${id}`);
  return response.data.project;
};

export const createProject = async (data: CreateProjectData): Promise<Project> => {
  const response = await client.post('/projects', data);
  return response.data.project;
};

export const updateProject = async (id: string, data: Partial<CreateProjectData>): Promise<Project> => {
  const response = await client.put(`/projects/${id}`, data);
  return response.data.project;
};

export const deleteProject = async (id: string): Promise<void> => {
  await client.delete(`/projects/${id}`);
};

// ==================== TAREAS ====================
export const getTasks = async (): Promise<Task[]> => {
  const response = await client.get('/tasks');
  return response.data.data || [];
};

export const getProjectTasks = async (projectId: string): Promise<Task[]> => {
  const response = await client.get(`/projects/${projectId}/tasks`);
  return response.data.data || [];
};

export const createTask = async (projectId: string, data: CreateTaskData): Promise<Task> => {
  const response = await client.post(`/projects/${projectId}/tasks`, data);
  return response.data.task;
};

export const updateTask = async (id: string, data: UpdateTaskData): Promise<Task> => {
  const response = await client.put(`/tasks/${id}`, data);
  return response.data.task;
};

export const updateTaskStatus = async (id: string, status: string): Promise<Task> => {
  const response = await client.put(`/tasks/${id}`, { status });
  return response.data.task;
};

export const deleteTask = async (id: string): Promise<void> => {
  await client.delete(`/tasks/${id}`);
};

// ==================== USUARIOS ====================
export const getUsers = async (): Promise<User[]> => {
  const response = await client.get('/users');
  return response.data.data || [];
};

export const createUser = async (data: RegisterData): Promise<User> => {
  const response = await client.post('/users', data);
  return response.data.user;
};

export const updateUser = async (id: string, data: Partial<RegisterData>): Promise<User> => {
  const response = await client.put(`/users/${id}`, data);
  return response.data.user;
};
