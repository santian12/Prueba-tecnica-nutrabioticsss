export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatar?: string;
  created_at: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high';
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
  created_by: string;
  managerName?: string;
  developersIds?: string[];
  developers?: User[];
  tasks?: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  project_id: string;
  assigned_to?: string;
  assignedUserName?: string;
  estimatedHours?: number;
  actualHours?: number;
  due_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'developer' | 'project_manager' | 'admin';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  total?: number;
  pagination?: {
    page: number;
    pages: number;
    total: number;
    per_page: number;
  };
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: Project['status'];
  priority?: Project['priority'];
  start_date?: string;
  end_date?: string;
  developers_ids?: string[];
}

export interface CreateTaskData {
  title: string;
  description?: string;
  status?: Task['status'];
  priority?: Task['priority'];
  assigned_to?: string;
  estimated_hours?: number;
  due_date?: string;
}

export interface UpdateTaskData extends Partial<CreateTaskData> {}

export interface KanbanColumn {
  id: Task['status'];
  title: string;
  tasks: Task[];
}

export interface DragResult {
  draggableId: string;
  type: string;
  source: {
    droppableId: string;
    index: number;
  };
  destination?: {
    droppableId: string;
    index: number;
  } | null;
}
