'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useProjectStore } from '@/lib/store/projectStore'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { KanbanBoard } from '@/components/dashboard/kanban-board'
import { ProjectSidebar } from '@/components/dashboard/project-sidebar'
import { ProjectModal } from '@/components/dashboard/project-modal'
import { TaskModal } from '@/components/dashboard/task-modal'
import { Navbar } from '@/components/dashboard/navbar'
import { Plus, Search, Filter } from 'lucide-react'
import { cn, getProjectStatusColor, safeFormatDate, translateProjectStatus } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore()
  const { 
    projects, 
    selectedProject, 
    tasks, 
    taskCounts,
    isLoading: projectLoading,
    fetchProjects,
    fetchAllTaskCounts,
    fetchTasks,
    setSelectedProject,
    updateProject,
    deleteProject
  } = useProjectStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)
  const [editingProject, setEditingProject] = useState<any>(null)
  const [showFilters, setShowFilters] = useState(false)
  // Estado de filtros para el modal y para el Kanban
  const [filters, setFilters] = useState<{
    status?: string;
    assignedTo?: string;
    priority?: string;
    search?: string;
  }>({})

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, authLoading, router])

  // Fetch initial data
  useEffect(() => {
    if (isAuthenticated) {
      fetchProjects().then(() => {
        // Cargar conteos de tareas después de cargar proyectos
        fetchAllTaskCounts()
      })
    }
  }, [isAuthenticated]) // Removemos las funciones de las dependencias

  // Fetch tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id)
    }
  }, [selectedProject]) // Removemos fetchTasks de las dependencias

  // Filtrado real combinando búsqueda y filtros avanzados
  const filteredTasks = tasks.filter(task => {
    // Filtro de búsqueda
    if (searchTerm && !task.title.toLowerCase().includes(searchTerm.toLowerCase()) && !(task.description || '').toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    // Filtro de estado
    if (filters.status && task.status !== filters.status) return false;
    // Filtro de prioridad
    if (filters.priority && task.priority !== filters.priority) return false;
    // Filtro de responsable (por id o nombre parcial)
    if (filters.assignedTo) {
      const assigned = (task.assigned_to || '');
      if (!assigned.toLowerCase().includes(filters.assignedTo.toLowerCase())) return false;
    }
    // Filtro de búsqueda avanzada
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (!task.title.toLowerCase().includes(search) && !(task.description || '').toLowerCase().includes(search)) {
        return false;
      }
    }
    return true;
  })

  const handleCreateProject = () => {
    setEditingProject(null)
    setShowProjectModal(true)
  }

  const handleCreateTask = () => {
    if (!selectedProject) {
      toast.error('Selecciona un proyecto primero')
      return
    }
    setSelectedTask(null)
    setShowTaskModal(true)
  }

  const handleEditTask = (task: any) => {
    setSelectedTask(task)
    setShowTaskModal(true)
  }

  const handleEditProject = (project: any) => {
    console.log('🔧 Dashboard: Abriendo modal de edición para:', project)
    setEditingProject(project)
    setShowProjectModal(true)
  }

  const handleArchiveProject = async (projectId: string) => {
    console.log('📦 Dashboard: Archivando proyecto:', projectId)
    try {
      const project = projects.find(p => p.id === projectId)
      if (project) {
        await updateProject(projectId, { status: 'cancelled' })
        toast.success('Proyecto archivado exitosamente')
        // Actualizar conteos después de archivar
        await fetchAllTaskCounts()
      }
    } catch (error) {
      console.error('Error al archivar proyecto:', error)
      toast.error('Error al archivar proyecto')
    }
  }

  const handleDeleteProject = async (projectId: string) => {
    console.log('🗑️ Dashboard: Eliminando proyecto:', projectId)
    try {
      await deleteProject(projectId)
      toast.success('Proyecto eliminado exitosamente')
      // Si el proyecto eliminado era el seleccionado, limpiar selección
      if (selectedProject?.id === projectId) {
        setSelectedProject(null)
      }
      // Actualizar conteos después de eliminar
      await fetchAllTaskCounts()
    } catch (error: any) {
      console.error('Error al eliminar proyecto:', error)
      let errorMessage = 'Error al eliminar proyecto';
      if (error?.response?.status === 403 || error?.message?.toLowerCase().includes('acceso denegado')) {
        errorMessage = 'Acceso denegado: solo administradores pueden eliminar proyectos.';
      } else if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex">
      {/* Project Sidebar */}
      <ProjectSidebar 
        projects={projects}
        selectedProject={selectedProject}
        taskCounts={taskCounts}
        onSelectProject={setSelectedProject}
        onCreateProject={handleCreateProject}
        onEditProject={handleEditProject}
        onArchiveProject={handleArchiveProject}
        onDeleteProject={handleDeleteProject}
        isLoading={projectLoading}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  {selectedProject ? selectedProject.name : 'Dashboard'}
                </h1>
                <p className="text-muted-foreground">
                  {selectedProject 
                    ? `${tasks.length} tareas en este proyecto` 
                    : 'Selecciona un proyecto para comenzar'
                  }
                </p>
              </div>
              <div className="flex space-x-3">
                <Button
                  onClick={handleCreateProject}
                  variant="outline"
                  size="sm"
                >
                  <Plus size={16} className="mr-2" />
                  Nuevo Proyecto
                </Button>
                {selectedProject && (
                  <Button
                    onClick={handleCreateTask}
                    size="sm"
                  >
                    <Plus size={16} className="mr-2" />
                    Nueva Tarea
                  </Button>
                )}
              </div>
            </div>

            {/* Search and Filters */}
            {selectedProject && (
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-md">
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm" onClick={() => setShowFilters(true)}>
                  <Filter size={16} className="mr-2" />
                  Filtros
                </Button>
              </div>
            )}
            {/* Modal de Filtros funcional */}
            {showFilters && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl p-6 w-full max-w-sm relative">
                  <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100"
                    onClick={() => setShowFilters(false)}
                  >
                    ×
                  </button>
                  <h2 className="text-lg font-bold mb-4 text-foreground">Filtros</h2>
                  <p className="text-muted-foreground mb-4">Filtra tareas por estado, prioridad, responsable, etc.</p>
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setShowFilters(false);
                    }}
                  >
                    <div className="space-y-3">
                      {/* Estado */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Estado</label>
                        <select
                          className="w-full border rounded px-2 py-1 bg-background"
                          value={filters?.status || ''}
                          onChange={e => setFilters(f => ({ ...f, status: e.target.value || undefined }))}
                        >
                          <option value="">Todos</option>
                          <option value="todo">Por hacer</option>
                          <option value="in_progress">En progreso</option>
                          <option value="review">En revisión</option>
                          <option value="done">Hecho</option>
                        </select>
                      </div>
                      {/* Prioridad */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Prioridad</label>
                        <select
                          className="w-full border rounded px-2 py-1 bg-background"
                          value={filters?.priority || ''}
                          onChange={e => setFilters(f => ({ ...f, priority: e.target.value || undefined }))}
                        >
                          <option value="">Todas</option>
                          <option value="low">Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                        </select>
                      </div>
                      {/* Responsable */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Responsable</label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1 bg-background"
                          placeholder="ID o nombre de usuario"
                          value={filters?.assignedTo || ''}
                          onChange={e => setFilters(f => ({ ...f, assignedTo: e.target.value || undefined }))}
                        />
                      </div>
                      {/* Búsqueda */}
                      <div>
                        <label className="block text-sm font-medium mb-1">Buscar en título/descripción</label>
                        <input
                          type="text"
                          className="w-full border rounded px-2 py-1 bg-background"
                          placeholder="Buscar..."
                          value={filters?.search || ''}
                          onChange={e => setFilters(f => ({ ...f, search: e.target.value || undefined }))}
                        />
                      </div>
                    </div>
                    <div className="mt-6 flex justify-end space-x-2">
                      <Button variant="outline" type="button" onClick={() => setShowFilters(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">Aplicar</Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>

          {/* Content */}
          {!selectedProject ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Bienvenido, {user?.name}
                </h3>
                <p className="text-muted-foreground mb-6">
                  Selecciona un proyecto desde la barra lateral o crea uno nuevo para comenzar.
                </p>
                <Button onClick={handleCreateProject}>
                  <Plus size={16} className="mr-2" />
                  Crear Primer Proyecto
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{selectedProject.name}</CardTitle>
                  <CardDescription>{selectedProject.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                    <div>
                      <span className="font-medium">Estado:</span>
                      <span className={cn(
                        "ml-2 px-2 py-1 rounded-full text-xs",
                        getProjectStatusColor(selectedProject.status)
                      )}>
                        {translateProjectStatus(selectedProject.status)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Fecha límite:</span>
                      <span className="ml-2">
                        {selectedProject.end_date ? safeFormatDate(selectedProject.end_date) : 'Sin fecha'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Kanban Board */}
              <KanbanBoard 
                tasks={filteredTasks}
                onEditTask={handleEditTask}
                isLoading={projectLoading}
              />
            </div>
          )}
        </div>
      
        {/* Modals */}
        <ProjectModal 
          isOpen={showProjectModal}
          onClose={() => {
            setShowProjectModal(false)
            setEditingProject(null)
          }}
          project={editingProject}
        />
        
        <TaskModal 
          isOpen={showTaskModal}
          onClose={() => setShowTaskModal(false)}
          task={selectedTask}
          projectId={selectedProject?.id}
        />
    </div>
  )
}
