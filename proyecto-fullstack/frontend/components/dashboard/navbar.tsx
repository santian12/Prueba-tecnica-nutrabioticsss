'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store/authStore'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { 
  Bell, 
  User, 
  Settings, 
  LogOut, 
  Menu,
  X,
  Search
} from 'lucide-react'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

export function Navbar() {
  const router = useRouter()
  const { user, logout, isLoading } = useAuthStore()
  const { notifications, unreadCount, fetchNotifications, markAsRead } = useNotifications()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  // Obtener notificaciones no leídas al cargar el componente
  // useEffect(() => {
  //   if (user) {
  //     fetchNotifications(true) // Solo notificaciones no leídas para el navbar
  //   }
  // }, [user, fetchNotifications])

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/login')
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }
  }

  const handleNotificationClick = async (notification: any) => {
    // Marcar como leída si no lo está
    if (notification.unread) {
      await markAsRead(notification.id)
    }
    
    // Cerrar el menú de notificaciones
    setShowNotifications(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-background border-b border-border px-6 py-4 z-40">
      <div className="flex items-center justify-between">
        {/* Logo y título */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">N</span>
            </div>
            <h1 className="text-xl font-bold text-foreground">Nutrabiotics</h1>
          </div>
        </div>

        {/* Search bar (desktop) */}
        <div className="hidden md:flex flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar proyectos, tareas..."
              className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </Button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-popover rounded-lg shadow-lg border border-border z-50">
                <div className="p-4">
                  <h3 className="font-medium text-popover-foreground mb-3">Notificaciones</h3>
                  <div className="space-y-3">
                    {notifications.length === 0 ? (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No tienes notificaciones nuevas
                      </p>
                    ) : (
                      notifications.slice(0, 5).map((notification) => (
                        <div
                          key={notification.id}
                          className={cn(
                            'p-3 rounded-lg cursor-pointer hover:bg-accent',
                            notification.unread ? 'bg-accent/50' : ''
                          )}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between">
                            <p className="text-sm text-popover-foreground">{notification.title || notification.message}</p>
                            {notification.unread && (
                              <div className="w-2 h-2 bg-primary rounded-full mt-1"></div>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="mt-4 pt-3 border-t border-border">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full"
                      onClick={() => {
                        setShowNotifications(false)
                        router.push('/notifications')
                      }}
                    >
                      Ver todas las notificaciones
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User menu */}
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-2"
            >
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="hidden md:block text-sm font-medium text-foreground">
                {user?.name || 'Usuario'}
              </span>
            </Button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-popover rounded-lg shadow-lg border border-border z-50">
                <div className="p-2">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="text-sm font-medium text-popover-foreground">
                      {user?.name || 'Usuario'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user?.email || 'email@ejemplo.com'}
                    </p>
                  </div>
                  
                  <div className="py-2">
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/profile')
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md flex items-center space-x-2"
                    >
                      <User size={16} />
                      <span>Perfil</span>
                    </button>
                    <button 
                      onClick={() => {
                        setShowUserMenu(false)
                        router.push('/settings')
                      }}
                      className="w-full text-left px-3 py-2 text-sm text-popover-foreground hover:bg-accent rounded-md flex items-center space-x-2"
                    >
                      <Settings size={16} />
                      <span>Configuración</span>
                    </button>
                  </div>
                  
                  <div className="py-2 border-t border-border">
                    <button
                      onClick={handleLogout}
                      disabled={isLoading}
                      className="w-full text-left px-3 py-2 text-sm text-destructive hover:bg-accent rounded-md flex items-center space-x-2"
                    >
                      {isLoading ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        <LogOut size={16} />
                      )}
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
