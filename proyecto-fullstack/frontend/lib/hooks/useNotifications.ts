import { useState, useEffect, useCallback } from 'react'
import { useAuthStore } from '@/lib/store/authStore'
import { safeFormatDistanceToNow } from '@/lib/utils'

interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'task' | 'project' | 'meeting' | 'system'
  unread: boolean
  time: string
  created_at: string
  updated_at: string
}

interface NotificationsData {
  notifications: Notification[]
  unread_count: number
  total: number
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { token } = useAuthStore()

  const fetchNotifications = useCallback(async (unreadOnly = false) => {
    if (!token) return

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      if (unreadOnly) {
        params.append('unread_only', 'true')
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener notificaciones')
      }

      const data = await response.json()
      
      if (data.success) {
        const notificationsData: NotificationsData = data.data
        setNotifications(notificationsData.notifications)
        setUnreadCount(notificationsData.unread_count)
      } else {
        throw new Error(data.message || 'Error al obtener notificaciones')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [token])

  const markAsRead = async (notificationId: string) => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al marcar como leída')
      }

      const data = await response.json()
      
      if (data.success) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, unread: false } : notif
          )
        )
        
        // Actualizar contador
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (err) {
      console.error('Error al marcar notificación como leída:', err)
    }
  }

  const markAllAsRead = async () => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/mark-all-read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al marcar todas como leídas')
      }

      const data = await response.json()
      
      if (data.success) {
        // Actualizar estado local
        setNotifications(prev => 
          prev.map(notif => ({ ...notif, unread: false }))
        )
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error al marcar todas las notificaciones como leídas:', err)
    }
  }


  const deleteNotification = async (notificationId: string) => {
    if (!token) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Error al eliminar notificación')
      }
      const data = await response.json()
      if (data.success) {
        const deletedNotification = notifications.find(n => n.id === notificationId)
        setNotifications(prev => prev.filter(notif => notif.id !== notificationId))
        if (deletedNotification?.unread) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
      }
    } catch (err) {
      console.error('Error al eliminar notificación:', err)
    }
  }

  // Eliminar todas las notificaciones del usuario
  const deleteAllNotifications = async () => {
    if (!token) return
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/delete-all`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      if (!response.ok) {
        throw new Error('Error al eliminar todas las notificaciones')
      }
      const data = await response.json()
      if (data.success) {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Error al eliminar todas las notificaciones:', err)
    }
  }

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/notifications/unread-count`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener contador')
      }

      const data = await response.json()
      
      if (data.success) {
        setUnreadCount(data.data.unread_count)
      }
    } catch (err) {
      console.error('Error al obtener contador de notificaciones:', err)
    }
  }, [token])

  // Función para obtener el tiempo relativo (hace X minutos/horas/días)
  const getRelativeTime = (dateString: string) => {
    return safeFormatDistanceToNow(dateString) || 'Fecha inválida'
  }

  // Formatear las notificaciones para incluir tiempo relativo
  const formattedNotifications = notifications.map(notification => ({
    ...notification,
    time: getRelativeTime(notification.created_at)
  }))

  return {
    notifications: formattedNotifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refetch: fetchNotifications
  }
}
