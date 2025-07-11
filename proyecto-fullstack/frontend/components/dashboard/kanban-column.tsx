'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './task-card'
import { Task } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Plus } from 'lucide-react'

interface KanbanColumnProps {
  id: string
  title: string
  tasks: Task[]
  color: string
  onEditTask: (task: Task) => void
  onShowComments?: (taskId: string) => void
}

export function KanbanColumn({ id, title, tasks, color, onEditTask, onShowComments }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  const taskIds = tasks.map(task => task.id)

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col rounded-lg border-2 border-dashed min-h-[400px] p-4',
        color,
        isOver && 'ring-2 ring-blue-500 ring-offset-2'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-900 flex items-center">
          {title}
          <span className="ml-2 text-sm bg-white px-2 py-1 rounded-full">
            {tasks.length}
          </span>
        </h3>
      </div>

      {/* Tasks */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div className="flex-1 space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="group">
              <TaskCard
                task={task}
                onEdit={() => onEditTask(task)}
                onShowComments={onShowComments}
              />
            </div>
          ))}
          
          {/* Drop Zone Indicator */}
          {tasks.length === 0 && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
              <div className="text-center">
                <Plus size={24} className="mx-auto mb-2 opacity-50" />
                <p>Suelta tareas aquí</p>
              </div>
            </div>
          )}
        </div>
      </SortableContext>
    </div>
  )
}
