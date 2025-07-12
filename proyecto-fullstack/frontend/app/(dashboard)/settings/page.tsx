'use client'

import { useState } from 'react'
import { useTheme } from '@/components/theme-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Moon, Sun, Monitor, Bell, Lock, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [notifications, setNotifications] = useState({
    email: true,
    desktop: true,
  })

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({
      ...prev,
      [key]: value
    }))
    toast.success('Configuración actualizada')
  }

  const getThemeIcon = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light': return <Sun className="w-4 h-4" />
      case 'dark': return <Moon className="w-4 h-4" />
      default: return <Monitor className="w-4 h-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 pt-20 max-w-4xl">
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="w-6 h-6 text-primary" />
        <h1 className="text-2xl font-bold text-foreground">Configuración</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Apariencia */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getThemeIcon(theme)}
              <span>Apariencia</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Tema</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('light')}
                  className="w-full"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Claro
                </Button>
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('dark')}
                  className="w-full"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Oscuro
                </Button>
                <Button
                  variant={theme === 'system' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTheme('system')}
                  className="w-full"
                >
                  <Monitor className="w-4 h-4 mr-2" />
                  Sistema
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notificaciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notificaciones</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones por email</Label>
                <p className="text-sm text-muted-foreground">
                  Recibe notificaciones importantes en tu correo
                </p>
              </div>
              <Switch
                checked={notifications.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificaciones de escritorio</Label>
                <p className="text-sm text-muted-foreground">
                  Notificaciones del navegador
                </p>
              </div>
              <Switch
                checked={notifications.desktop}
                onCheckedChange={(checked) => handleNotificationChange('desktop', checked)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Perfil y Seguridad */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Lock className="w-5 h-5" />
              <span>Perfil y Seguridad</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => toast.success('Funcionalidad próximamente disponible')}
            >
              Cambiar contraseña
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => toast.success('Funcionalidad próximamente disponible')}
            >
              Cerrar otras sesiones
            </Button>

            <div className="pt-4 border-t border-border">
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={() => toast.error('Contacta al administrador para eliminar tu cuenta')}
              >
                Eliminar cuenta
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Esta acción no se puede deshacer
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
