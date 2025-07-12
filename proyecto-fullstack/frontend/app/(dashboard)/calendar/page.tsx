'use client';

import { useState, useEffect } from 'react';
import { getTasks } from '@/lib/api-simple';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths, isToday, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { cn, safeParseDate } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  projectId: string;
  assignedTo: string;
  assignedUserName: string;
  estimatedHours: number;
  actualHours: number;
  dueDate: string;
  createdAt: string;
}

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTasks, setSelectedTasks] = useState<Task[]>([]);

  // Cargar tareas
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await getTasks();
      // getTasks retorna directamente el array de tareas
      const tasksWithDueDate = response.filter((task: Task) => task.dueDate);
      setTasks(tasksWithDueDate);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Obtener tareas para una fecha específica
  const getTasksForDate = (date: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = safeParseDate(task.dueDate);
      if (!taskDate) return false;
      return isSameDay(taskDate, date);
    });
  };

  // Navegación del calendario
  const goToPreviousMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Generar días del mes
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Obtener color según prioridad
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Obtener color según estado
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done':
        return 'bg-green-500';
      case 'in_progress':
        return 'bg-blue-500';
      case 'review':
        return 'bg-purple-500';
      case 'todo':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Manejar clic en una fecha
  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayTasks = getTasksForDate(date);
    setSelectedTasks(dayTasks);
  };

  // Obtener tareas próximas a vencer (próximos 7 días)
  const getUpcomingTasks = () => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = safeParseDate(task.dueDate);
      if (!taskDate) return false;
      return taskDate >= today && taskDate <= nextWeek && task.status !== 'done';
    }).sort((a, b) => {
      const dateA = safeParseDate(a.dueDate);
      const dateB = safeParseDate(b.dueDate);
      if (!dateA || !dateB) return 0;
      return dateA.getTime() - dateB.getTime();
    });
  };

  // Obtener tareas vencidas
  const getOverdueTasks = () => {
    const today = new Date();
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = safeParseDate(task.dueDate);
      if (!taskDate) return false;
      return taskDate < today && task.status !== 'done';
    }).sort((a, b) => {
      const dateA = safeParseDate(a.dueDate);
      const dateB = safeParseDate(b.dueDate);
      if (!dateA || !dateB) return 0;
      return dateB.getTime() - dateA.getTime(); // Más recientes primero
    });
  };

  const upcomingTasks = getUpcomingTasks();
  const overdueTasks = getOverdueTasks();

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendario de Tareas</h1>
          <p className="text-gray-600 mt-1">Vista de vencimientos y planificación</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Hoy
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendario Principal */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow border">
            {/* Header del calendario */}
            <div className="flex items-center justify-between p-4 border-b">
              <button
                onClick={goToPreviousMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'MMMM yyyy', { locale: es })}
              </h2>
              
              <button
                onClick={goToNextMonth}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Días de la semana */}
            <div className="grid grid-cols-7 border-b">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
                <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 border-r last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Días del calendario */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => {
                const dayTasks = getTasksForDate(day);
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isCurrentDay = isToday(day);
                const isSelected = selectedDate && isSameDay(day, selectedDate);

                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      "min-h-[120px] p-2 border-r border-b last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors",
                      !isCurrentMonth && "bg-gray-50 text-gray-400",
                      isCurrentDay && "bg-blue-50",
                      isSelected && "bg-blue-100 ring-2 ring-blue-500"
                    )}
                    onClick={() => handleDateClick(day)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={cn(
                        "text-sm font-medium",
                        isCurrentDay && "bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center"
                      )}>
                        {format(day, 'd')}
                      </span>
                      {dayTasks.length > 0 && (
                        <span className="text-xs bg-blue-600 text-white rounded-full px-1.5 py-0.5">
                          {dayTasks.length}
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            "text-xs p-1 rounded border truncate",
                            getPriorityColor(task.priority)
                          )}
                          title={task.title}
                        >
                          <div className="flex items-center space-x-1">
                            <div className={cn("w-2 h-2 rounded-full", getStatusColor(task.status))}></div>
                            <span className="truncate">{task.title}</span>
                          </div>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{dayTasks.length - 3} más
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar con tareas próximas y vencidas */}
        <div className="space-y-6">
          {/* Tareas del día seleccionado */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow border p-4">
              <h3 className="font-semibold mb-3 flex items-center">
                <CalendarIcon className="w-4 h-4 mr-2" />
                {format(selectedDate, 'd MMMM yyyy', { locale: es })}
              </h3>
              {selectedTasks.length === 0 ? (
                <p className="text-gray-500 text-sm">No hay tareas para este día</p>
              ) : (
                <div className="space-y-2">
                  {selectedTasks.map((task) => (
                    <div key={task.id} className="p-2 border rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{task.title}</span>
                        <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityColor(task.priority))}>
                          {task.priority}
                        </span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <User className="w-3 h-3" />
                        <span>{task.assignedUserName || 'Sin asignar'}</span>
                      </div>
                      {task.estimatedHours && (
                        <div className="flex items-center text-xs text-gray-500 space-x-2 mt-1">
                          <Clock className="w-3 h-3" />
                          <span>{task.estimatedHours}h estimadas</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tareas vencidas */}
          {overdueTasks.length > 0 && (
            <div className="bg-white rounded-lg shadow border p-4">
              <h3 className="font-semibold mb-3 text-red-600 flex items-center">
                <AlertCircle className="w-4 h-4 mr-2" />
                Tareas Vencidas ({overdueTasks.length})
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {overdueTasks.map((task) => (
                  <div key={task.id} className="p-2 border border-red-200 rounded-lg bg-red-50">
                    <div className="font-medium text-sm text-red-900">{task.title}</div>
                    <div className="text-xs text-red-600 mt-1">
                      Vencía: {safeParseDate(task.dueDate) ? format(safeParseDate(task.dueDate)!, 'd MMM yyyy', { locale: es }) : 'Fecha inválida'}
                    </div>
                    <div className="flex items-center text-xs text-red-500 space-x-2 mt-1">
                      <User className="w-3 h-3" />
                      <span>{task.assignedUserName || 'Sin asignar'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Próximas tareas */}
          <div className="bg-white rounded-lg shadow border p-4">
            <h3 className="font-semibold mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Próximos 7 días ({upcomingTasks.length})
            </h3>
            {upcomingTasks.length === 0 ? (
              <p className="text-gray-500 text-sm">No hay tareas próximas</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {upcomingTasks.map((task) => (
                  <div key={task.id} className="p-2 border rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">{task.title}</span>
                      <span className={cn("text-xs px-2 py-0.5 rounded-full", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-1">
                      {safeParseDate(task.dueDate) ? format(safeParseDate(task.dueDate)!, 'd MMM yyyy', { locale: es }) : 'Fecha inválida'}
                    </div>
                    <div className="flex items-center text-xs text-gray-500 space-x-2">
                      <User className="w-3 h-3" />
                      <span>{task.assignedUserName || 'Sin asignar'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Leyenda */}
          <div className="bg-white rounded-lg shadow border p-4">
            <h3 className="font-semibold mb-3">Leyenda</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Completado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <span className="text-sm">En progreso</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <span className="text-sm">En revisión</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                <span className="text-sm">Por hacer</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
