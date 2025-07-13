'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Task } from '@/lib/types'
import { cn, getTaskPriorityColor, safeFormatDate, translateTaskPriority } from '@/lib/utils'
import { Edit, User, Clock, Calendar, MessageCircle } from 'lucide-react'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onShowComments?: (taskId: string) => void
  isDragging?: boolean
}

export function TaskCard({ task, onEdit, onShowComments, isDragging = false }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'cursor-move transition-all duration-200 hover:shadow-md',
        (isDragging || isSortableDragging) && 'opacity-50 rotate-2 scale-105'
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm font-medium line-clamp-2">
            {task.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit size={14} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge 
            variant="outline" 
            className={cn(
              'text-xs px-2 py-1',
              getTaskPriorityColor(task.priority)
            )}
          >
            {translateTaskPriority(task.priority)}
          </Badge>
          
          <div className="flex items-center text-xs text-gray-500">
            <Calendar size={12} className="mr-1" />
            {task.due_date ? safeFormatDate(task.due_date) : 'Sin fecha'}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        {task.description && (
          <p className="text-xs text-gray-600 line-clamp-3 mb-3">
            {task.description}
          </p>
        )}
        
        <div className="flex items-center justify-between">
          {task.assignedUserName && (
            <div className="flex items-center text-xs text-gray-500">
              <User size={12} className="mr-1" />
              <span className="truncate max-w-[100px]">
                {task.assignedUserName}
              </span>
            </div>
          )}
          
          <div className="flex items-center space-x-2">
            {/* Comments button */}
            {onShowComments && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onShowComments(task.id)
                }}
                className="flex items-center text-xs text-gray-500 hover:text-blue-600 transition-colors"
                title="Ver comentarios"
              >
                <MessageCircle size={12} className="mr-1" />
                <span>{(task as any).commentsCount || 0}</span>
              </button>
            )}
            
            <div className="flex items-center text-xs text-gray-500">
              <Clock size={12} className="mr-1" />
              {task.due_date ? safeFormatDate(task.due_date) : 'Sin fecha'}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
