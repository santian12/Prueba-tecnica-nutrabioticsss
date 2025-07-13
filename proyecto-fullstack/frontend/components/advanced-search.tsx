'use client';

import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Calendar, User, Tag, FolderOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AdvancedSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  availableProjects?: Array<{ id: string; name: string }>;
  availableUsers?: Array<{ id: string; name: string }>;
}

export interface SearchFilters {
  query: string;
  status: string[];
  priority: string[];
  assignedTo: string[];
  projects: string[];
  dateRange: {
    start: string;
    end: string;
  };
  tags: string[];
}

const statusOptions = [
  { value: 'todo', label: 'Por hacer', color: 'bg-gray-500' },
  { value: 'active', label: 'Activo', color: 'bg-blue-500' },
  { value: 'on_hold', label: 'En espera', color: 'bg-orange-500' },
  { value: 'review', label: 'En revisión', color: 'bg-purple-500' },
  { value: 'done', label: 'Completado', color: 'bg-green-500' },
];

const priorityOptions = [
  { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800' },
];

export function AdvancedSearch({
  isOpen,
  onClose,
  onSearch,
  availableProjects = [],
  availableUsers = []
}: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    status: [],
    priority: [],
    assignedTo: [],
    projects: [],
    dateRange: { start: '', end: '' },
    tags: [],
  });

  const [newTag, setNewTag] = useState('');

  // Reset filters
  const resetFilters = () => {
    setFilters({
      query: '',
      status: [],
      priority: [],
      assignedTo: [],
      projects: [],
      dateRange: { start: '', end: '' },
      tags: [],
    });
  };

  // Toggle array filter
  const toggleArrayFilter = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => {
      const currentArray = prev[key] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return { ...prev, [key]: newArray };
    });
  };

  // Add tag
  const addTag = () => {
    if (newTag.trim() && !filters.tags.includes(newTag.trim())) {
      setFilters(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  // Remove tag
  const removeTag = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  // Handle search
  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  // Handle key press for tags
  const handleTagKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  if (!isOpen) return null;

  const hasActiveFilters = Object.values(filters).some(value => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value !== null && 'start' in value && 'end' in value) {
      return (value as { start: string; end: string }).start || (value as { start: string; end: string }).end;
    }
    return value;
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle className="flex items-center space-x-2">
            <Search className="w-5 h-5" />
            <span>Búsqueda Avanzada</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Search Query */}
          <div>
            <label className="block text-sm font-medium mb-2">Búsqueda</label>
            <Input
              placeholder="Buscar en títulos, descripciones..."
              value={filters.query}
              onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Estado</label>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((status) => (
                <button
                  key={status.value}
                  onClick={() => toggleArrayFilter('status', status.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    filters.status.includes(status.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  )}
                >
                  <div className="flex items-center space-x-1">
                    <div className={cn('w-2 h-2 rounded-full', status.color)}></div>
                    <span>{status.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium mb-2">Prioridad</label>
            <div className="flex flex-wrap gap-2">
              {priorityOptions.map((priority) => (
                <button
                  key={priority.value}
                  onClick={() => toggleArrayFilter('priority', priority.value)}
                  className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium border transition-colors',
                    filters.priority.includes(priority.value)
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-white border-gray-300 hover:bg-gray-50',
                    !filters.priority.includes(priority.value) && priority.color
                  )}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Filter */}
          {availableProjects.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Proyectos</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableProjects.map((project) => (
                  <button
                    key={project.id}
                    onClick={() => toggleArrayFilter('projects', project.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center space-x-1',
                      filters.projects.includes(project.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <FolderOpen className="w-3 h-3" />
                    <span>{project.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Assigned Users Filter */}
          {availableUsers.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Asignado a</label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {availableUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => toggleArrayFilter('assignedTo', user.id)}
                    className={cn(
                      'px-3 py-1 rounded-full text-xs font-medium border transition-colors flex items-center space-x-1',
                      filters.assignedTo.includes(user.id)
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    )}
                  >
                    <User className="w-3 h-3" />
                    <span>{user.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium mb-2">Rango de fechas</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Desde</label>
                <Input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Hasta</label>
                <Input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => setFilters(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium mb-2">Etiquetas</label>
            <div className="space-y-2">
              <div className="flex space-x-2">
                <Input
                  placeholder="Agregar etiqueta..."
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleTagKeyPress}
                />
                <Button onClick={addTag} disabled={!newTag.trim()}>
                  <Tag className="w-4 h-4" />
                </Button>
              </div>
              {filters.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs flex items-center space-x-1"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                      <button
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={resetFilters}
              disabled={!hasActiveFilters}
            >
              Limpiar filtros
            </Button>
            <div className="space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Buscar
              </Button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="pt-4 border-t">
              <p className="text-sm text-gray-600 mb-2">Filtros activos:</p>
              <div className="flex flex-wrap gap-1 text-xs">
                {filters.query && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Texto: &quot;{filters.query}&quot;
                  </span>
                )}
                {filters.status.length > 0 && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                    Estados: {filters.status.length}
                  </span>
                )}
                {filters.priority.length > 0 && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Prioridades: {filters.priority.length}
                  </span>
                )}
                {filters.projects.length > 0 && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded">
                    Proyectos: {filters.projects.length}
                  </span>
                )}
                {filters.assignedTo.length > 0 && (
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded">
                    Usuarios: {filters.assignedTo.length}
                  </span>
                )}
                {(filters.dateRange.start || filters.dateRange.end) && (
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded">
                    Fechas
                  </span>
                )}
                {filters.tags.length > 0 && (
                  <span className="px-2 py-1 bg-pink-100 text-pink-800 rounded">
                    Etiquetas: {filters.tags.length}
                  </span>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
