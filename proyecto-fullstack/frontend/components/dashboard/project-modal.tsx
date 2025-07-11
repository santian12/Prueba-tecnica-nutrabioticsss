'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjectStore } from '@/lib/store/projectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Project } from '@/lib/types'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const projectSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  end_date: z.string().optional(),
  status: z.enum(['planning', 'in_progress', 'completed', 'cancelled']).default('planning'),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
})

type ProjectFormData = z.infer<typeof projectSchema>

interface ProjectModalProps {
  isOpen: boolean
  onClose: () => void
  project?: Project | null
}

export function ProjectModal({ isOpen, onClose, project }: ProjectModalProps) {
  const { createProject, updateProject, isLoading } = useProjectStore()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description,
      end_date: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
      status: project.status,
      priority: project.priority
    } : {
      name: '',
      description: '',
      end_date: '',
      status: 'planning',
      priority: 'medium'
    }
  })

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description,
        end_date: project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '',
        status: project.status,
        priority: project.priority
      })
    } else {
      reset({
        name: '',
        description: '',
        end_date: '',
        status: 'planning',
        priority: 'medium'
      })
    }
  }, [project, reset])

  const onSubmit = async (data: ProjectFormData) => {
    try {
      setIsSubmitting(true)
      
      if (project) {
        await updateProject(project.id, data)
        toast.success('Proyecto actualizado exitosamente')
      } else {
        // Ensure required fields are present for CreateProjectData type
        const projectData = {
          name: data.name,
          description: data.description,
          end_date: data.end_date || undefined,
          status: data.status as Required<typeof data.status>,
          priority: data.priority as Required<typeof data.priority>
        };
        await createProject(projectData as any)
        toast.success('Proyecto creado exitosamente')
      }      
      onClose()
      reset()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al guardar el proyecto'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

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
                {project ? 'Editar Proyecto' : 'Crear Proyecto'}
              </CardTitle>
              <CardDescription>
                {project ? 'Actualiza la información del proyecto' : 'Crea un nuevo proyecto para tu equipo'}
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
              <Label htmlFor="name">Nombre del Proyecto</Label>
              <Input
                id="name"
                placeholder="Ej: Sistema de Gestión de Inventario"
                {...register('name')}
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <textarea
                id="description"
                placeholder="Describe el objetivo y alcance del proyecto..."
                rows={3}
                {...register('description')}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="end_date">Fecha Límite (Opcional)</Label>
                <Input
                  id="end_date"
                  type="date"
                  {...register('end_date')}
                  className={errors.end_date ? 'border-red-500' : ''}
                />
                {errors.end_date && (
                  <p className="text-sm text-red-600">{errors.end_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Prioridad</Label>
                <select
                  id="priority"
                  {...register('priority')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Baja</option>
                  <option value="medium">Media</option>
                  <option value="high">Alta</option>
                </select>
                {errors.priority && (
                  <p className="text-sm text-red-600">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="planning">Planificación</option>
                <option value="in_progress">En Progreso</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
              {errors.status && (
                <p className="text-sm text-red-600">{errors.status.message}</p>
              )}
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1"
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  project ? 'Actualizar' : 'Crear'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
