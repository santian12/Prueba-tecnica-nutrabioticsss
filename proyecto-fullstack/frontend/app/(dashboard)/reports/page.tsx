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
        
        // Cargar proyectos
        const projectsResponse = await getProjects();
        setProjects(projectsResponse.projects || []);

        // Cargar usuarios
        const usersResponse = await getUsers();
        setUsers(usersResponse.data || []);
      } catch (error) {
        console.error('Error loading data:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

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
        availableProjects={projects}
        availableUsers={users}
      />
    </div>
  );
}
