'use client';

import { useState } from 'react';
import { 
  FileText, 
  Download, 
  BarChart3, 
  Users, 
  FolderOpen,
  Loader2,
  Calendar,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  exportProjectsPDF, 
  exportProductivityPDF, 
  exportDashboardPDF,
  downloadPDFBlob 
} from '@/lib/api-simple';
import toast from 'react-hot-toast';

interface PDFExportComponentProps {
  availableProjects?: Array<{ id: string; name: string }>;
  availableUsers?: Array<{ id: string; name: string }>;
}

export function PDFExportComponent({ 
  availableProjects = [], 
  availableUsers = [] 
}: PDFExportComponentProps) {
  const [loading, setLoading] = useState<string | null>(null);
  
  // Estados para filtros
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('');

  const handleExportProjects = async (projectId?: string) => {
    try {
      setLoading('projects');
      const blob = await exportProjectsPDF(projectId);
      
      const filename = projectId 
        ? `reporte_proyecto_${projectId}_${new Date().toISOString().split('T')[0]}.pdf`
        : `reporte_proyectos_${new Date().toISOString().split('T')[0]}.pdf`;
      
      downloadPDFBlob(blob, filename);
      toast.success('Reporte de proyectos exportado exitosamente');
    } catch (error) {
      console.error('Error exporting projects:', error);
      toast.error('Error al exportar reporte de proyectos');
    } finally {
      setLoading(null);
    }
  };

  const handleExportProductivity = async (userId?: string, dateRange?: string) => {
    try {
      setLoading('productivity');
      const blob = await exportProductivityPDF(userId, dateRange);
      
      const filename = userId 
        ? `reporte_productividad_${userId}_${new Date().toISOString().split('T')[0]}.pdf`
        : `reporte_productividad_${new Date().toISOString().split('T')[0]}.pdf`;
      
      downloadPDFBlob(blob, filename);
      toast.success('Reporte de productividad exportado exitosamente');
    } catch (error) {
      console.error('Error exporting productivity:', error);
      toast.error('Error al exportar reporte de productividad');
    } finally {
      setLoading(null);
    }
  };

  const handleExportDashboard = async () => {
    try {
      setLoading('dashboard');
      const blob = await exportDashboardPDF();
      
      const filename = `reporte_metricas_${new Date().toISOString().split('T')[0]}.pdf`;
      
      downloadPDFBlob(blob, filename);
      toast.success('Reporte de métricas exportado exitosamente');
    } catch (error) {
      console.error('Error exporting dashboard:', error);
      toast.error('Error al exportar reporte de métricas');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <FileText className="h-6 w-6 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Exportar Reportes PDF</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Reporte de Proyectos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FolderOpen className="h-5 w-5 text-blue-600" />
              <span>Reporte de Proyectos</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Exporta información detallada de proyectos, tareas y estadísticas.
            </p>
            
            {/* Filtro por proyecto */}
            <div className="space-y-2">
              <Label htmlFor="project-select">Proyecto específico (opcional):</Label>
              <Select value={selectedProject} onValueChange={setSelectedProject}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los proyectos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los proyectos</SelectItem>
                  {availableProjects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-2">
              <Button
                onClick={() => handleExportProjects()}
                disabled={loading === 'projects'}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                {loading === 'projects' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Todos
              </Button>
              
              {selectedProject && (
                <Button
                  onClick={() => handleExportProjects(selectedProject)}
                  disabled={loading === 'projects'}
                  size="sm"
                  className="flex-1"
                >
                  {loading === 'projects' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  Específico
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reporte de Productividad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-green-600" />
              <span>Productividad</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Exporta métricas de productividad y rendimiento de usuarios.
            </p>
            
            {/* Filtro por usuario */}
            <div className="space-y-2">
              <Label htmlFor="user-select">Usuario específico (opcional):</Label>
              <Select value={selectedUser} onValueChange={setSelectedUser}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos los usuarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos los usuarios</SelectItem>
                  {availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro por rango de fechas */}
            <div className="space-y-2">
              <Label htmlFor="date-range">Rango de fechas (opcional):</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <Input
                  type="date"
                  value={dateRange.split(',')[0] || ''}
                  onChange={(e) => setDateRange(e.target.value + ',' + (dateRange.split(',')[1] || ''))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-500">a</span>
                <Input
                  type="date"
                  value={dateRange.split(',')[1] || ''}
                  onChange={(e) => setDateRange((dateRange.split(',')[0] || '') + ',' + e.target.value)}
                  className="flex-1"
                />
              </div>
            </div>

            <Button
              onClick={() => handleExportProductivity(selectedUser || undefined, dateRange || undefined)}
              disabled={loading === 'productivity'}
              className="w-full"
            >
              {loading === 'productivity' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar Productividad
            </Button>
          </CardContent>
        </Card>

        {/* Reporte de Métricas del Dashboard */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              <span>Métricas del Sistema</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Exporta un resumen completo de las métricas generales del sistema.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-lg">
              <h4 className="font-medium text-sm mb-2">Incluye:</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Total de proyectos, tareas y usuarios</li>
                <li>• Distribución por estados y prioridades</li>
                <li>• Estadísticas de completitud</li>
                <li>• Métricas de actividad reciente</li>
              </ul>
            </div>

            <Button
              onClick={handleExportDashboard}
              disabled={loading === 'dashboard'}
              className="w-full"
            >
              {loading === 'dashboard' ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar Métricas
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Información adicional */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 mb-1">
                Información sobre los reportes PDF
              </h3>
              <div className="text-sm text-blue-700 space-y-1">
                <p>• Los reportes se generan en tiempo real con los datos más actuales</p>
                <p>• Incluyen gráficos, tablas y estadísticas detalladas</p>
                <p>• Los archivos se descargan automáticamente al navegador</p>
                <p>• Los nombres de archivo incluyen la fecha de generación</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
