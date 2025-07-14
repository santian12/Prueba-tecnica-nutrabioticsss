'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useProjectStore } from '@/lib/store/projectStore'
import { TaskCard } from './task-card'
import { TaskComments } from './task-comments'
import { KanbanColumn } from './kanban-column'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Task } from '@/lib/types'
import toast from 'react-hot-toast'

interface KanbanBoardProps {
  tasks: Task[]
  onEditTask: (task: Task) => void
  isLoading: boolean
}

const columns = [
  { id: 'todo', title: 'Todo', color: 'bg-yellow-100 border-yellow-300' },
  { id: 'in_progress', title: 'In Progress', color: 'bg-blue-100 border-blue-300' },
  { id: 'review', title: 'Review', color: 'bg-purple-100 border-purple-300' },
  { id: 'done', title: 'Done', color: 'bg-green-100 border-green-300' },
]

export function KanbanBoard({ tasks, onEditTask, isLoading }: KanbanBoardProps) {
  const { updateTaskStatus } = useProjectStore()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [showComments, setShowComments] = useState(false)
  const [selectedTaskForComments, setSelectedTaskForComments] = useState<string | null>(null)
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const task = tasks.find(t => t.id === active.id)
    if (task) {
      setActiveTask(task)
    }
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTask(null)

    console.log('🔍 DRAG END DEBUG:')
    console.log('🔍 active:', active)
    console.log('🔍 active.id:', active.id)
    console.log('🔍 over:', over)
    console.log('🔍 over?.id:', over?.id)

    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    console.log('🔄 Drag end - taskId:', taskId, 'overId:', overId)

    // Verificar que estamos droppando sobre una columna, no sobre una tarea
    let newStatus: string | null = null;
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '');
      console.log('🔄 Dropping over column:', newStatus);
    } else {
      // Se está droppando sobre una tarea, buscar la columna de esa tarea
      const targetTask = tasks.find(task => task.id === overId);
      if (targetTask) {
        newStatus = targetTask.status;
        console.log('🔄 Dropping over task, using its column status:', newStatus);
      } else {
        console.error('❌ Cannot determine target column for:', overId);
        toast.error('Invalid drop target');
        return;
      }
    }

    // Validar que newStatus es un estado válido
    const validColumn = columns.find(c => c.id === newStatus);
    if (!validColumn) {
      console.error('❌ Invalid column ID:', newStatus);
      console.log('🔍 Expected column IDs:', columns.map(c => c.id));
      toast.error('Invalid column selected');
      return;
    }

    // Find the task being moved
    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      console.error('❌ Task not found:', taskId);
      return;
    }

    // FILTRO: Si hay filtros activos, validar si la tarea debe mostrarse en la columna destino
    // (esto se implementará cuando se agregue la lógica de filtros)

    console.log('📋 Task found:', task);
    console.log('🔄 Current status:', task.status, '-> New status:', newStatus);

    // If the status hasn't changed, don't update
    if (task.status === newStatus) {
      console.log('🔄 Status unchanged, skipping update');
      return;
    }

    try {
      // Update the task status
      console.log('🚀 Calling updateTaskStatus with:', taskId, newStatus);
      await updateTaskStatus(taskId, newStatus);
      toast.success(`Task moved to "${validColumn.title}"`);
    } catch (error: any) {
      let errorMessage = 'Error actualizando estado de tarea';
      if (error?.response?.status === 403 || (typeof error?.message === 'string' && error?.message?.toLowerCase().includes('acceso denegado'))) {
        errorMessage = 'Acceso denegado: solo administradores o managers pueden mover tareas.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
      console.error('❌ Error updating task status:', error);
    }
  }

  // Filtro real de tareas por estado, usuario asignado, prioridad, etc.
  // Se asume que los filtros activos vendrán de props, contexto o estado global (ajustar según integración real)
  // Ejemplo de filtros locales (puedes conectar con modal de filtros):
  const [filters, setFilters] = useState<{
    status?: string;
    assignedTo?: string;
    priority?: string;
    search?: string;
  }>({});

  // Función para aplicar todos los filtros activos
  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => {
      // Filtrar por columna (estado)
      if (task.status !== status) return false;
      // Filtrar por usuario asignado
      if (filters.assignedTo && task.assigned_to !== filters.assignedTo) return false;
      // Filtrar por prioridad
      if (filters.priority && task.priority !== filters.priority) return false;
      // Filtrar por búsqueda de texto (en título o descripción)
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (!task.title.toLowerCase().includes(search) && !(task.description || '').toLowerCase().includes(search)) {
          return false;
        }
      }
      return true;
    });
  }

  // Handle comments modal
  const handleShowComments = (taskId: string) => {
    setSelectedTaskForComments(taskId)
    setShowComments(true)
  }

  const handleCloseComments = () => {
    setShowComments(false)
    setSelectedTaskForComments(null)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnTasks = getTasksByStatus(column.id)
          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={columnTasks}
              color={column.color}
              onEditTask={onEditTask}
              onShowComments={handleShowComments}
            />
          )
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEdit={() => {}}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>

      {/* Comments Modal */}
      {selectedTaskForComments && (
        <TaskComments
          taskId={selectedTaskForComments}
          isOpen={showComments}
          onClose={handleCloseComments}
        />
      )}
    </DndContext>
  )
}
