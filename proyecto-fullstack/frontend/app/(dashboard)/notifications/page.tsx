'use client'

import { useState, useEffect } from 'react'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Bell, CheckCheck, Trash2, Search, Filter, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  time: string
  unread: boolean
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'task' | 'project' | 'meeting' | 'system'
  created_at: string
  updated_at: string
}

export default function NotificationsPage() {
  const {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications()
  
  const [searchTerm, setSearchTerm] = useState('')
  const [filter, setFilter] = useState<'all' | 'unread' | 'task' | 'project' | 'meeting' | 'system'>('all')

  // Cargar notificaciones al montar el componente
  // useEffect(() => {
  //   fetchNotifications()
  // }, [])

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (!matchesSearch) return false
    
    if (filter === 'all') return true
    if (filter === 'unread') return notification.unread
    return notification.category === filter
  })

  const handleNotificationClick = async (notification: Notification) => {
    // Marcar como leída al hacer click
    if (notification.unread) {
      await markAsRead(notification.id)
    }
    
    // Navegar según el tipo de notificación
    switch (notification.category) {
      case 'task':
        // Aquí podrías navegar a la tarea específica
        toast.success(`Navegando a la tarea: ${notification.title}`)
        break
      case 'project':
        // Aquí podrías navegar al proyecto específico
        toast.success(`Navegando al proyecto: ${notification.title}`)
        break
      case 'meeting':
        // Aquí podrías abrir el calendario
        toast.success(`Abriendo detalles de la reunión: ${notification.title}`)
        break
      default:
        toast(`Notificación: ${notification.title}`)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id)
    toast.success('Notificación marcada como leída')
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
    toast.success('Todas las notificaciones marcadas como leídas')
  }

  const handleDeleteNotification = async (id: string) => {
    await deleteNotification(id)
    toast.success('Notificación eliminada')
  }

  const getCategoryName = (category: string) => {
    switch (category) {
      case 'task': return 'Tarea'
      case 'project': return 'Proyecto'
      case 'meeting': return 'Reunión'
      case 'system': return 'Sistema'
      default: return category
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success': return '✅'
      case 'warning': return '⚠️'
      case 'error': return '❌'
      default: return 'ℹ️'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'
      case 'warning': return 'bg-yellow-100 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
      case 'error': return 'bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800'
      default: return 'bg-blue-100 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
    }
  }


  return (
    <div className="container mx-auto p-6 pt-20 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Bell className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full border border-transparent bg-destructive px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground">
              {unreadCount} nuevas
            </span>
          )}
        </div>
        
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline" size="sm" disabled={loading}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Marcar todas como leídas
          </Button>
        )}
      </div>

      {/* Filtros y búsqueda */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Buscar notificaciones..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input bg-background text-foreground rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            
            {/* Filtros */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: 'all', label: 'Todas' },
                { key: 'unread', label: 'Sin leer' },
                { key: 'task', label: 'Tareas' },
                { key: 'project', label: 'Proyectos' },
                { key: 'meeting', label: 'Reuniones' },
                { key: 'system', label: 'Sistema' }
              ].map(({ key, label }) => (
                <Button
                  key={key}
                  variant={filter === key ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(key as any)}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                Cargando notificaciones...
              </p>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-destructive text-center">
                Error al cargar notificaciones: {error}
              </p>
              <Button 
                onClick={() => fetchNotifications()} 
                variant="outline" 
                size="sm" 
                className="mt-4"
              >
                Reintentar
              </Button>
            </CardContent>
          </Card>
        ) : notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground text-center">
                No tienes notificaciones en este momento
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredNotifications.map((notification) => (
            <Card 
              key={notification.id} 
              className={cn(
                'transition-all duration-200 hover:shadow-md cursor-pointer',
                notification.unread ? 'ring-2 ring-primary/20' : '',
                getTypeColor(notification.type)
              )}
              onClick={() => handleNotificationClick(notification)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <span className="text-lg">{getTypeIcon(notification.type)}</span>
                    <div className="flex-1">
                      <p className={cn(
                        'text-sm',
                        notification.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'
                      )}>
                        {notification.title || notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {notification.unread && (
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleMarkAsRead(notification.id)
                        }}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteNotification(notification.id)
                      }}
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
