'use client';

import { useState, useEffect } from 'react';
import { PDFExportComponent } from '@/components/pdf-export';
import { getProjects, getUsers } from '@/lib/api-simple';
import { useAuthStore } from '@/lib/store/authStore';
import { redirect } from 'next/navigation';
import toast from 'react-hot-toast';

interface Project {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
}

export default function ReportsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated } = useAuthStore();

  // Verificar autenticación
  useEffect(() => {
    if (!isAuthenticated) {
      redirect('/auth/login');
    }
  }, [isAuthenticated]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Cargar proyectos
        const projectsResponse = await getProjects();
        setProjects(projectsResponse.projects || []);

        // Cargar usuarios
        const usersResponse = await getUsers();
        setUsers(usersResponse.data || []);
      } catch (error: any) {
        console.error('Error loading data:', error);
        setError('No se pudo cargar los datos. Verifica tu conexión o el estado del servidor.');
        toast.error('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="mb-4 text-destructive font-bold text-lg">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          Reintentar
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filtrar proyectos y usuarios con id válido
  const filteredProjects = projects.filter(p => typeof p.id === 'string' && p.id.trim() !== '');
  const filteredUsers = users.filter(u => typeof u.id === 'string' && u.id.trim() !== '');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Reportes y Exportación
        </h1>
        <p className="text-gray-600">
          Genera y exporta reportes detallados en formato PDF de proyectos, productividad y métricas del sistema.
        </p>
      </div>

      <PDFExportComponent 
        availableProjects={filteredProjects}
        availableUsers={filteredUsers}
      />
    </div>
  );
}
