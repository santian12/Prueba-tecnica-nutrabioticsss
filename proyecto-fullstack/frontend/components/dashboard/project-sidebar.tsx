'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Project } from '@/lib/types'
import { cn, getProjectStatusColor } from '@/lib/utils'
import { 
  Plus, 
  Search, 
  Folder, 
  FolderOpen,
  MoreVertical,
  Edit,
  Trash2,
  Archive
} from 'lucide-react'

interface ProjectSidebarProps {
  projects: Project[]
  selectedProject: Project | null
  taskCounts: Record<string, number> // Nuevo prop
  onSelectProject: (project: Project) => void
  onCreateProject: () => void
  isLoading: boolean
}

export function ProjectSidebar({ 
  projects, 
  selectedProject, 
  taskCounts, // Nuevo prop
  onSelectProject, 
  onCreateProject, 
  isLoading 
}: ProjectSidebarProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [showProjectMenu, setShowProjectMenu] = useState<string | null>(null)

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleProjectClick = (project: Project) => {
    onSelectProject(project)
    setShowProjectMenu(null)
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 fixed left-0 top-16 h-full overflow-y-auto">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Proyectos</h2>
          <Button
            size="sm"
            onClick={onCreateProject}
            className="flex items-center space-x-1"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo</span>
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Buscar proyectos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Projects List */}
        <div className="space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="md" />
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <Folder size={48} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-500">
                {searchTerm ? 'No se encontraron proyectos' : 'No hay proyectos aún'}
              </p>
              {!searchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCreateProject}
                  className="mt-3"
                >
                  <Plus size={16} className="mr-2" />
                  Crear proyecto
                </Button>
              )}
            </div>
          ) : (
            filteredProjects.map((project) => (
              <div
                key={project.id}
                className={cn(
                  'group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                  selectedProject?.id === project.id 
                    ? 'bg-blue-50 border-blue-200 border' 
                    : 'hover:bg-gray-50'
                )}
                onClick={() => handleProjectClick(project)}
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  {selectedProject?.id === project.id ? (
                    <FolderOpen size={20} className="text-blue-600" />
                  ) : (
                    <Folder size={20} className="text-gray-400" />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </h3>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className={cn(
                        'text-xs px-2 py-0.5 rounded-full',
                        getProjectStatusColor(project.status)
                      )}>
                        {project.status}
                      </span>
                      <span className="text-xs text-gray-500">
                        {taskCounts[project.id] || 0} tareas
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project menu */}
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowProjectMenu(showProjectMenu === project.id ? null : project.id)
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreVertical size={16} />
                  </Button>

                  {showProjectMenu === project.id && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                      <div className="p-2">
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2">
                          <Edit size={16} />
                          <span>Editar</span>
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2">
                          <Archive size={16} />
                          <span>Archivar</span>
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md flex items-center space-x-2">
                          <Trash2 size={16} />
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
