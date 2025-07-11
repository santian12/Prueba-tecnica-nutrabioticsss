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
import { cn, getProjectStatusColor } from '@/lib/utils'
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
    setSelectedProject
  } = useProjectStore()

  const [searchTerm, setSearchTerm] = useState('')
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any>(null)

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
  }, [isAuthenticated, fetchProjects, fetchAllTaskCounts])

  // Fetch tasks when project changes
  useEffect(() => {
    if (selectedProject) {
      fetchTasks(selectedProject.id)
    }
  }, [selectedProject, fetchTasks])

  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCreateProject = () => {
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
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
        isLoading={projectLoading}
      />
      
      {/* Main Content */}
      <div className="flex-1 ml-64 p-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {selectedProject ? selectedProject.name : 'Dashboard'}
                </h1>
                <p className="text-gray-600">
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
                  <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Buscar tareas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter size={16} className="mr-2" />
                  Filtros
                </Button>
              </div>
            )}
          </div>

          {/* Content */}
          {!selectedProject ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Bienvenido, {user?.name}
                </h3>
                <p className="text-gray-600 mb-6">
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
                  <div className="flex items-center space-x-6 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Estado:</span>
                      <span className={cn(
                        "ml-2 px-2 py-1 rounded-full text-xs",
                        getProjectStatusColor(selectedProject.status)
                      )}>
                        {selectedProject.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Creado:</span>
                      <span className="ml-2">
                        {new Date(selectedProject.createdAt).toLocaleDateString()}
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
          onClose={() => setShowProjectModal(false)}
          project={null}
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
