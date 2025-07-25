'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useProjectStore } from '@/lib/store/projectStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Project } from '@/lib/types'
import { safeToDateInputString } from '@/lib/utils'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

const projectSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  end_date: z.string().optional(),
  status: z.enum(['planning', 'active', 'on_hold', 'completed', 'cancelled']).default('planning'),
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
    control,
    formState: { errors }
  } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: project ? {
      name: project.name,
      description: project.description,
      end_date: safeToDateInputString(project.end_date),
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
        end_date: safeToDateInputString(project.end_date),
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
        // Para actualización, también limpiar fechas vacías
        const updateData = {
          ...data,
          end_date: data.end_date && data.end_date.trim() !== '' ? data.end_date : undefined
        };
        await updateProject(project.id, updateData)
        toast.success('Proyecto actualizado exitosamente')
      } else {
        // Ensure required fields are present for CreateProjectData type
        const projectData = {
          name: data.name,
          description: data.description,
          end_date: data.end_date && data.end_date.trim() !== '' ? data.end_date : undefined,
          status: data.status as Required<typeof data.status>,
          priority: data.priority as Required<typeof data.priority>
        };
        await createProject(projectData as any)
        toast.success('Proyecto creado exitosamente')
      }      
      onClose()
      reset()
    } catch (error: any) {
      console.error('Error al procesar proyecto:', error)
      
      // Mejor manejo de errores para el usuario final
      let errorMessage = 'Error inesperado. Inténtalo de nuevo.'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      } else if (typeof error === 'string') {
        errorMessage = error
      }
      
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4 bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg text-card-foreground">
                {project ? 'Editar Proyecto' : 'Crear Proyecto'}
              </CardTitle>
              <CardDescription className="text-muted-foreground">
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
              <Label htmlFor="name" className="text-card-foreground">Nombre del Proyecto</Label>
              <Input
                id="name"
                placeholder="Ej: Sistema de Gestión de Inventario"
                {...register('name')}
                className={errors.name ? 'border-destructive focus:ring-destructive' : ''}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-card-foreground">Descripción</Label>
              <textarea
                id="description"
                placeholder="Describe el objetivo y alcance del proyecto..."
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
                <Controller
                  name="priority"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
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
                  <p className="text-sm text-destructive">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Controller
                name="status"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecciona el estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="planning">Planificación</SelectItem>
                      <SelectItem value="active">Activo</SelectItem>
                      <SelectItem value="on_hold">En Espera</SelectItem>
                      <SelectItem value="completed">Completado</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.status && (
                <p className="text-sm text-destructive">{errors.status.message}</p>
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
