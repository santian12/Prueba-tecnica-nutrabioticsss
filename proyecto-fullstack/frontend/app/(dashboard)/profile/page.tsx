'use client'

import { useState } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { User, Mail, Shield, Calendar, Edit2, Save, X } from 'lucide-react'
import { cn, safeFormatDate } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateProfile, isLoading } = useAuthStore()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    password: '',
    confirmPassword: ''
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      
      // Validaciones básicas
      if (!formData.name.trim()) {
        toast.error('El nombre es requerido')
        return
      }
      
      if (!formData.email.trim()) {
        toast.error('El email es requerido')
        return
      }
      
      if (formData.password && formData.password !== formData.confirmPassword) {
        toast.error('Las contraseñas no coinciden')
        return
      }

      const updateData: any = {
        name: formData.name,
        email: formData.email
      }

      if (formData.password) {
        updateData.password = formData.password
      }

      await updateProfile(updateData)
      toast.success('Perfil actualizado exitosamente')
      setIsEditing(false)
      setFormData({ ...formData, password: '', confirmPassword: '' })
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error)
      let errorMessage = 'Error al actualizar el perfil'
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error?.message) {
        errorMessage = error.message
      }
      
      toast.error(errorMessage)
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      password: '',
      confirmPassword: ''
    })
    setIsEditing(false)
  }

  const formatDate = (dateString: string) => {
    return safeFormatDate(dateString) || 'Fecha inválida'
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <span className="bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-200 px-2 py-1 rounded-full text-xs font-medium">Administrador</span>
      case 'project_manager':
        return <span className="bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs font-medium">Manager</span>
      case 'developer':
        return <span className="bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 px-2 py-1 rounded-full text-xs font-medium">Desarrollador</span>
      default:
        return <span className="bg-gray-100 dark:bg-gray-900/20 text-gray-800 dark:text-gray-200 px-2 py-1 rounded-full text-xs font-medium">Usuario</span>
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 pt-20">
        <div className="flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 pt-20 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <User className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Mi Perfil</h1>
        </div>
        
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Editar Perfil
          </Button>
        ) : (
          <div className="flex space-x-2">
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <LoadingSpinner size="sm" className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              Guardar
            </Button>
            <Button onClick={handleCancel} variant="outline" disabled={isSaving}>
              <X className="w-4 h-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Información Personal */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Información Personal</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre completo</Label>
              {isEditing ? (
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Tu nombre completo"
                />
              ) : (
                <p className="text-foreground font-medium">{user?.name || 'No especificado'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              {isEditing ? (
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="tu@email.com"
                />
              ) : (
                <p className="text-foreground font-medium">{user?.email || 'No especificado'}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Rol</Label>
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-muted-foreground" />
                {getRoleBadge(user?.role || 'user')}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fecha de registro</Label>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {user?.created_at ? formatDate(user.created_at) : 'No disponible'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Seguridad</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditing ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="password">Nueva contraseña (opcional)</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Deja en blanco para mantener la actual"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Repite la nueva contraseña"
                  />
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Contraseña</Label>
                  <p className="text-muted-foreground">••••••••</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Estado de la cuenta</Label>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-green-600 dark:text-green-400 text-sm">Activa</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
