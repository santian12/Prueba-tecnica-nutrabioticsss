import { create } from 'zustand';
import { Project, Task, CreateProjectData, CreateTaskData, UpdateTaskData } from '../types';
import {
  getProjects,
  createProject as createProjectAPI,
  updateProject as updateProjectAPI,
  deleteProject as deleteProjectAPI,
  getProjectTasks,
  createTask as createTaskAPI,
  updateTask as updateTaskAPI,
  updateTaskStatus as updateTaskStatusAPI,
  deleteTask as deleteTaskAPI
} from '../api-simple';

interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  tasks: Task[];
  taskCounts: Record<string, number>; // Nuevo campo para contar tareas por proyecto
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchProjects: () => Promise<void>;
  fetchAllTaskCounts: () => Promise<void>; // Nueva función para cargar conteos
  createProject: (data: CreateProjectData) => Promise<void>;
  updateProject: (id: string, data: Partial<CreateProjectData>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  setSelectedProject: (project: Project | null) => void;
  
  fetchTasks: (projectId: string) => Promise<void>;
  createTask: (projectId: string, data: CreateTaskData) => Promise<void>;
  updateTask: (id: string, data: UpdateTaskData) => Promise<void>;
  updateTaskStatus: (id: string, status: string) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  selectedProject: null,
  tasks: [],
  taskCounts: {}, // Inicializar el conteo de tareas
  isLoading: false,
  error: null,
  
  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await getProjects();
      set({ projects: response.projects, isLoading: false });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar proyectos';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  fetchAllTaskCounts: async () => {
    try {
      const { projects } = get();
      const taskCounts: Record<string, number> = {};
      
      // Cargar el conteo de tareas para cada proyecto
      await Promise.all(
        projects.map(async (project) => {
          try {
            const tasks = await getProjectTasks(project.id);
            taskCounts[project.id] = tasks.length;
          } catch (error) {
            console.warn(`Error cargando tareas para proyecto ${project.id}:`, error);
            taskCounts[project.id] = 0;
          }
        })
      );
      
      set(state => ({ 
        taskCounts: {
          ...state.taskCounts,
          ...taskCounts
        }
      }));
    } catch (error) {
      console.error('Error al cargar conteos de tareas:', error);
    }
  },

  createProject: async (data: CreateProjectData) => {
    set({ isLoading: true, error: null });
    try {
      const project = await createProjectAPI(data);
      set(state => ({ 
        projects: [...state.projects, project],
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear proyecto';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateProject: async (id: string, data: Partial<CreateProjectData>) => {
    set({ isLoading: true, error: null });
    try {
      const project = await updateProjectAPI(id, data);
      set(state => ({
        projects: state.projects.map(p => 
          p.id === id ? project : p
        ),
        selectedProject: state.selectedProject?.id === id 
          ? project 
          : state.selectedProject,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar proyecto';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  deleteProject: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteProjectAPI(id);
      set(state => ({
        projects: state.projects.filter(p => p.id !== id),
        selectedProject: state.selectedProject?.id === id 
          ? null 
          : state.selectedProject,
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar proyecto';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setSelectedProject: (project: Project | null) => set({ selectedProject: project }),

  fetchTasks: async (projectId: string) => {
    set({ isLoading: true, error: null });
    try {
      const tasks = await getProjectTasks(projectId);
      set(state => ({
        tasks, 
        taskCounts: {
          ...state.taskCounts,
          [projectId]: tasks.length
        },
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al cargar tareas';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  createTask: async (projectId: string, data: CreateTaskData) => {
    set({ isLoading: true, error: null });
    try {
      const task = await createTaskAPI(projectId, data);
      set(state => ({ 
        tasks: [...state.tasks, task],
        isLoading: false 
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al crear tarea';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTask: async (id: string, data: UpdateTaskData) => {
    set({ isLoading: true, error: null });
    try {
      const task = await updateTaskAPI(id, data);
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? task : t
        ),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar tarea';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  updateTaskStatus: async (id: string, status: string) => {
    try {
      const task = await updateTaskStatusAPI(id, status);
      set(state => ({
        tasks: state.tasks.map(t => 
          t.id === id ? task : t
        )
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al actualizar estado de tarea';
      set({ error: errorMessage });
      throw error;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await deleteTaskAPI(id);
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== id),
        isLoading: false
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al eliminar tarea';
      set({ error: errorMessage, isLoading: false });
      throw error;
    }
  },

  setLoading: (loading: boolean) => set({ isLoading: loading }),
  setError: (error: string | null) => set({ error }),
}));
