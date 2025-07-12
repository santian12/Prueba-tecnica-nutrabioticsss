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

    if (!over) return

    const taskId = active.id as string
    const newStatus = over.id as string

    console.log('🔄 Drag end - taskId:', taskId, 'newStatus:', newStatus)

    // Find the task being moved
    const task = tasks.find(t => t.id === taskId)
    if (!task) {
      console.error('❌ Task not found:', taskId)
      return
    }

    console.log('📋 Task found:', task)
    console.log('🔄 Current status:', task.status, '-> New status:', newStatus)

    // If the status hasn't changed, don't update
    if (task.status === newStatus) return

    try {
      // Update the task status
      console.log('🚀 Calling updateTaskStatus with:', taskId, newStatus)
      await updateTaskStatus(taskId, newStatus)
      toast.success(`Task moved to "${columns.find(c => c.id === newStatus)?.title}"`)
    } catch (error) {
      toast.error('Error updating task status')
      console.error('❌ Error updating task status:', error)
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
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
