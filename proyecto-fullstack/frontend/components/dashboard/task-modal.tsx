'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjectStore } from '@/lib/store/projectStore'
import { useAuthStore } from '@/lib/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Task } from '@/lib/types'
import { safeToDateInputString } from '@/lib/utils'
import { X, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { getUsers } from '@/lib/api-simple'

const taskSchema = z.object({
  title: z.string().min(2, 'El título debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  status: z.enum(['todo', 'in_progress', 'review', 'done']).default('todo'),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  due_date: z.string().optional(),
  assigned_to: z.string().optional()
})

type TaskFormData = z.infer<typeof taskSchema>

interface TaskModalProps {
  isOpen: boolean
  onClose: () => void
  task?: Task | null
  projectId?: string
}

export function TaskModal({ isOpen, onClose, task, projectId }: TaskModalProps) {
  const { createTask, updateTask, deleteTask, isLoading } = useProjectStore();
  const { user } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userOptions, setUserOptions] = useState<{ id: string; name: string; email: string }[]>([]);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors }
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: task ? {
      title: task.title,
      description: task.description,
      status: task.status || 'todo',
      priority: task.priority || 'medium',
      due_date: safeToDateInputString(task.due_date),
      assigned_to: task.assigned_to
    } : {
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      due_date: '',
      assigned_to: undefined
    }
  })

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description,
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        due_date: safeToDateInputString(task.due_date),
        assigned_to: task.assigned_to
      })
    } else {
      reset({
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        assigned_to: undefined
      })
    }
  }, [task, reset])

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await getUsers();
        if (res.success && Array.isArray(res.data)) {
          setUserOptions(res.data.map((u: any) => ({ id: u.id, name: u.name, email: u.email })));
        }
      } catch (err) {
        setUserOptions([]);
      }
    }
    if (isOpen) loadUsers();
  }, [isOpen]);

  const onSubmit = async (data: TaskFormData) => {
    try {
      setIsSubmitting(true)
      if (task) {
        // Para actualización, también limpiar fechas vacías y usar snake_case
        const updateData = {
          ...data,
          due_date: data.due_date && data.due_date.trim() !== '' ? data.due_date : undefined,
          assigned_to: data.assigned_to && data.assigned_to.trim() !== '' ? data.assigned_to : undefined
        };
        console.log('[MODAL] updateTask called with:', task.id, updateData);
        await updateTask(task.id, updateData)
        toast.success('Tarea actualizada exitosamente')
      } else {
        if (!projectId) {
          toast.error('No se ha seleccionado un proyecto')
          return
        }
        // Mapear a snake_case para el backend
        const createData = {
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          due_date: (typeof data.due_date === 'string' && data.due_date.trim() !== '') ? data.due_date : undefined,
          assigned_to: (typeof data.assigned_to === 'string' && data.assigned_to.trim() !== '') ? data.assigned_to : undefined,
          project_id: projectId
        }
        await createTask(projectId, createData)
        toast.success('Tarea creada exitosamente')
      }
      onClose()
      reset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar la tarea'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Eliminar tarea
  const handleDeleteTask = async () => {
    if (!task) return;
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta tarea? Esta acción no se puede deshacer.')) return;
    setIsDeleting(true);
    try {
      await deleteTask(task.id);
      toast.success('Tarea eliminada exitosamente');
      onClose();
    } catch (error: any) {
      let errorMessage = 'Error al eliminar tarea';
      if (error?.response?.status === 403 || error?.message?.toLowerCase().includes('acceso denegado')) {
        errorMessage = 'Acceso denegado: solo administradores o managers pueden eliminar tareas.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">
                {task ? 'Editar Tarea' : 'Crear Tarea'}
              </CardTitle>
              <CardDescription>
                {task ? 'Actualiza la información de la tarea' : 'Crea una nueva tarea para el proyecto'}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X size={16} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la Tarea</Label>
              <Input
                id="title"
                placeholder="Ej: Implementar login de usuario"
                {...register('title')}
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                placeholder="Describe los detalles de la tarea..."
                rows={3}
                {...register('description')}
                className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-none ${
                  errors.description ? 'border-destructive focus-visible:ring-destructive' : ''
                }`}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Estado</Label>
                <Controller
                  name="status"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={value => field.onChange(value || 'todo')} value={field.value || 'todo'}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona el estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Por Hacer</SelectItem>
                        <SelectItem value="in_progress">En Progreso</SelectItem>
                        <SelectItem value="review">En Revisión</SelectItem>
                        <SelectItem value="done">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message === 'Invalid enum value. Expected \'todo\' | \'in_progress\' | \'review\' | \'done\', received \'' ? 'Selecciona un estado válido.' : errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={value => field.onChange(value || 'medium')} value={field.value || 'medium'}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecciona la prioridad" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority.message === 'Invalid enum value. Expected \'low\' | \'medium\' | \'high\', received \'' ? 'Selecciona una prioridad válida.' : errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="due_date">Fecha Límite (Opcional)</Label>
              <Input
                id="due_date"
                type="date"
                {...register('due_date')}
                className={errors.due_date ? 'border-red-500' : ''}
              />
              {errors.due_date && (
                <p className="text-sm text-red-600">{errors.due_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              {user && (user.role === 'admin' || user.role === 'project_manager') ? (
                <div className="space-y-2">
                  <Label htmlFor="assigned_to">Asignar a usuario</Label>
                  <Controller
                    name="assigned_to"
                    control={control}
                    render={({ field }) => (
                      <select
                        id="assigned_to"
                        {...field}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="">Sin asignar</option>
                        {userOptions.map((u) => (
                          <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                        ))}
                      </select>
                    )}
                  />
                </div>
              ) : null}
              </div>
            <div className="flex flex-row-reverse items-center gap-2 pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  task ? 'Actualizar' : 'Crear'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              {/* Botón eliminar solo para admin o manager y si es edición */}
              {task && user && (user.role === 'admin' || user.role === 'project_manager') && (
                <Button
                  variant="destructive"
                  onClick={handleDeleteTask}
                  disabled={isDeleting}
                  className="flex items-center justify-center"
                >
                  {isDeleting ? <LoadingSpinner size="sm" className="mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                  Eliminar Tarea
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
      
    </div>
  )
}
