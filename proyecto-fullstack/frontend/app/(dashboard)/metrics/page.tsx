'use client';

import { useState, useEffect } from 'react';
import { getOverviewStats, getProjectStats, getTaskStats } from '@/lib/api-simple';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  FolderOpen, 
  CheckCircle, 
  AlertCircle,
  Activity,
  Calendar,
  Target
} from 'lucide-react';
import { safeFormatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

// Colores para los gráficos
const COLORS = {
  primary: '#3B82F6',
  secondary: '#10B981',
  accent: '#F59E0B',
  danger: '#EF4444',
  info: '#6366F1',
  success: '#059669',
  warning: '#D97706'
};

const PIE_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.danger];

interface OverviewStats {
  total_projects: number;
  total_tasks: number;
  total_users: number;
  recent_projects: number;
  completed_tasks_week: number;
}

interface StatusData {
  status: string;
  count: number;
}

interface PriorityData {
  priority: string;
  count: number;
}

export default function MetricsPage() {
  const [loading, setLoading] = useState(true);
  const [overviewStats, setOverviewStats] = useState<OverviewStats | null>(null);
  const [projectsByStatus, setProjectsByStatus] = useState<StatusData[]>([]);
  const [tasksByStatus, setTasksByStatus] = useState<StatusData[]>([]);
  const [tasksByPriority, setTasksByPriority] = useState<PriorityData[]>([]);
  const [projectsProgress, setProjectsProgress] = useState<any[]>([]);
  const [tasksByAssignee, setTasksByAssignee] = useState<any[]>([]);
  const [weeklyProductivity, setWeeklyProductivity] = useState<any[]>([]);

  // Cargar todas las métricas
  const loadMetrics = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas generales
      const overviewResponse = await getOverviewStats();
      if (overviewResponse.success) {
        setOverviewStats(overviewResponse.data.overview);
        setProjectsByStatus(overviewResponse.data.projects_by_status);
        setTasksByStatus(overviewResponse.data.tasks_by_status);
        setTasksByPriority(overviewResponse.data.tasks_by_priority);
      }

      // Cargar estadísticas de proyectos
      const projectStatsResponse = await getProjectStats();
      if (projectStatsResponse.success) {
        setProjectsProgress(projectStatsResponse.data.projects_progress);
      }

      // Cargar estadísticas de tareas
      const taskStatsResponse = await getTaskStats();
      if (taskStatsResponse.success) {
        setTasksByAssignee(taskStatsResponse.data.tasks_by_assignee);
        setWeeklyProductivity(taskStatsResponse.data.weekly_productivity);
      }

    } catch (error) {
      console.error('Error loading metrics:', error);
      toast.error('Error al cargar métricas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMetrics();
  }, []);

  // Formatear datos para gráficos
  const formatStatusData = (data: StatusData[]) => {
    const statusLabels = {
      'planning': 'Planificación',
      'active': 'Activo',
      'on_hold': 'En Espera',
      'completed': 'Completado',
      'cancelled': 'Cancelado',
      'todo': 'Por Hacer',
      'review': 'En Revisión',
      'done': 'Terminado'
    };

    return data.map(item => ({
      name: statusLabels[item.status as keyof typeof statusLabels] || item.status,
      value: item.count,
      originalStatus: item.status
    }));
  };

  const formatPriorityData = (data: PriorityData[]) => {
    const priorityLabels = {
      'low': 'Baja',
      'medium': 'Media',
      'high': 'Alta'
    };

    return data.map(item => ({
      name: priorityLabels[item.priority as keyof typeof priorityLabels] || item.priority,
      value: item.count,
      originalPriority: item.priority
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Métricas y Estadísticas</h1>
        <p className="text-gray-600 mt-1">Dashboard de análisis y rendimiento del proyecto</p>
      </div>

      {/* Tarjetas de resumen */}
      {overviewStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Proyectos</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.total_projects}</p>
              </div>
              <FolderOpen className="w-8 h-8 text-blue-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tareas</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.total_tasks}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-gray-900">{overviewStats.total_users}</p>
              </div>
              <Users className="w-8 h-8 text-purple-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Proyectos Recientes</p>
                <p className="text-2xl font-bold text-green-600">{overviewStats.recent_projects}</p>
                <p className="text-xs text-gray-500">Últimos 7 días</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tareas Completadas</p>
                <p className="text-2xl font-bold text-blue-600">{overviewStats.completed_tasks_week}</p>
                <p className="text-xs text-gray-500">Esta semana</p>
              </div>
              <Target className="w-8 h-8 text-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Proyectos por Estado */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Proyectos por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatStatusData(projectsByStatus)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatStatusData(projectsByStatus).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Tareas por Estado */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Tareas por Estado</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={formatStatusData(tasksByStatus)}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill={COLORS.primary} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Gráficos secundarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tareas por Prioridad */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Tareas por Prioridad</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={formatPriorityData(tasksByPriority)}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {formatPriorityData(tasksByPriority).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Progreso de Proyectos */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Progreso de Proyectos</h3>
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {projectsProgress.slice(0, 6).map((project) => (
              <div key={project.id} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </span>
                    <span className="text-sm text-gray-500">
                      {project.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${project.progress}%` }}
                    ></div>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-gray-500">
                      {project.completed_tasks}/{project.total_tasks} tareas
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      project.status === 'completed' ? 'bg-green-100 text-green-800' :
                      project.status === 'active' ? 'bg-blue-100 text-blue-800' :
                      project.status === 'on_hold' ? 'bg-orange-100 text-orange-800' :
                      project.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {project.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tareas por Asignado */}
      {tasksByAssignee.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border mb-8">
          <h3 className="text-lg font-semibold mb-4">Tareas por Desarrollador</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksByAssignee}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="todo" stackId="a" fill={COLORS.danger} name="Por Hacer" />
              <Bar dataKey="active" stackId="a" fill={COLORS.accent} name="Activo" />
              <Bar dataKey="on_hold" stackId="a" fill="#f97316" name="En Espera" />
              <Bar dataKey="review" stackId="a" fill={COLORS.info} name="En Revisión" />
              <Bar dataKey="done" stackId="a" fill={COLORS.secondary} name="Completado" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Productividad Semanal */}
      {weeklyProductivity.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold mb-4">Productividad Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyProductivity}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="week" 
                tickFormatter={(value) => safeFormatDate(value) || 'Fecha inválida'}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(value) => `Semana del ${safeFormatDate(value) || 'fecha inválida'}`}
              />
              <Line 
                type="monotone" 
                dataKey="completed" 
                stroke={COLORS.primary} 
                strokeWidth={2}
                name="Tareas Completadas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
