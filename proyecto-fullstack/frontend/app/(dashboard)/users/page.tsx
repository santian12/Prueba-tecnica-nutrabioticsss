'use client';

import { useState, useEffect } from 'react';
import { getUsers, createUser, updateUser, deleteUser } from '@/lib/api-simple';
import { safeFormatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2, Users, UserCheck, Shield } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'project_manager' | 'developer';
  avatar?: string;
  createdAt: string;
}

interface CreateUserData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'project_manager' | 'developer';
}

interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  role?: 'admin' | 'project_manager' | 'developer';
}

export default function UsersPage() {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingUser, setDeletingUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserData>({
    name: '',
    email: '',
    password: '',
    role: 'developer'
  });

  // Cargar usuarios
  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await getUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        const errorMsg = (response as any).message;
        if (errorMsg && typeof errorMsg === 'string' && errorMsg.toLowerCase().includes('acceso denegado')) {
          toast.error('Acceso denegado: solo administradores pueden ver los usuarios.');
        } else {
          toast.error(errorMsg || 'Error al cargar usuarios');
        }
      }
    } catch (error: any) {
      console.error('Error loading users:', error);
      // Manejo específico para errores 403
      if (error?.response?.status === 403 || error?.message?.toLowerCase().includes('acceso denegado')) {
        toast.error('Acceso denegado: solo administradores pueden ver los usuarios.');
      } else {
        toast.error(error?.response?.data?.message || 'Error al cargar usuarios');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Manejar submit del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        // Actualizar usuario
        const updateData: UpdateUserData = {
          name: formData.name,
          email: formData.email,
          role: formData.role
        };
        
        // Solo incluir password si se proporcionó
        if (formData.password.trim()) {
          updateData.password = formData.password;
        }
        
        const response = await updateUser(editingUser.id, updateData);
        if (response.success) {
          toast.success('Usuario actualizado exitosamente');
          loadUsers();
          closeModal();
        } else {
          toast.error(response.message);
        }
      } else {
        // Crear nuevo usuario
        const response = await createUser(formData);
        if (response.success) {
          toast.success('Usuario creado exitosamente');
          loadUsers();
          closeModal();
        } else {
          toast.error(response.message);
        }
      }
    } catch (error: any) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Error al guardar usuario');
    }
  };

  // Abrir modal para crear
  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      name: '',
      email: '',
      password: '',
      role: 'developer'
    });
    setShowModal(true);
  };

  // Abrir modal para editar
  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      password: '', // Vacío para no cambiar password
      // Si el usuario tiene role 'project_manager', el select debe mostrar ese valor
      role: user.role
    });
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  // Abrir confirmación de eliminación
  const openDeleteConfirm = (user: User) => {
    setDeletingUser(user);
    setShowDeleteConfirm(true);
  };

  // Cerrar confirmación de eliminación
  const closeDeleteConfirm = () => {
    setShowDeleteConfirm(false);
    setDeletingUser(null);
  };

  // Eliminar usuario
  const handleDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const response = await deleteUser(deletingUser.id);
      if (response.success) {
        toast.success('Usuario eliminado exitosamente');
        loadUsers();
        closeDeleteConfirm();
        closeModal();
      } else {
        toast.error(response.message || 'Error al eliminar usuario');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error al eliminar usuario');
    }
  };

  // Obtener icono según el rol
  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'project_manager':
        return <UserCheck className="w-4 h-4 text-blue-500" />;
      default:
        return <Users className="w-4 h-4 text-green-500" />;
    }
  };

  // Obtener badge del rol
  const getRoleBadge = (role: string) => {
    // Mapear project_manager a Manager para mostrarlo al usuario
    const roleConfig = {
      admin: { label: 'Administrador', color: 'bg-red-100 text-red-800' },
      project_manager: { label: 'Manager', color: 'bg-blue-100 text-blue-800' },
      developer: { label: 'Desarrollador', color: 'bg-green-100 text-green-800' }
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.developer;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {getRoleIcon(role)}
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Gestión de Usuarios</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Administra los usuarios y sus roles en el sistema</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
        >
          <Plus className="w-4 h-4" />
          Nuevo Usuario
        </button>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Usuarios</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{users.length}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Administradores</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Managers</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {users.filter(u => u.role === 'project_manager').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow border dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Desarrolladores</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {users.filter(u => u.role === 'developer').length}
              </p>
            </div>
            <Users className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>

      {/* Tabla de usuarios */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow border dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Usuario
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Fecha Registro
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-500 dark:bg-blue-700 flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-100">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {safeFormatDate(user.createdAt) || 'Fecha inválida'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => openEditModal(user)}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                      title="Editar usuario"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-md w-full mx-4 border dark:border-gray-700">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                {editingUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}
              </h3>
            </div>
            <form onSubmit={handleSubmit} className="px-6 py-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {editingUser ? 'Nueva Contraseña (opcional)' : 'Contraseña'}
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                    required={!editingUser}
                  />
                  {editingUser && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Deja vacío para mantener la contraseña actual
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Rol
                  </label>
                  <select
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="developer">Desarrollador</option>
                    <option value="project_manager">Manager</option>
                    <option value="admin">Administrador</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {editingUser ? 'Actualizar' : 'Crear'}
                </button>
                {editingUser && (
                  <button
                    type="button"
                    onClick={() => openDeleteConfirm(editingUser)}
                    className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600"
                  >
                    Eliminar
                  </button>
                )}
              </div>
      {/* Confirmación de eliminación */}
      {showDeleteConfirm && deletingUser && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-sm w-full mx-4 border dark:border-gray-700 p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-4">¿Eliminar usuario?</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-6">¿Estás seguro que deseas eliminar a <span className="font-semibold">{deletingUser.name}</span>? Esta acción no se puede deshacer.</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={closeDeleteConfirm}
                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-200 dark:bg-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
