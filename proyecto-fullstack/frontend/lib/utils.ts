import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

// Función segura para formatear fechas que pueden ser nulas o inválidas
export function safeFormatDate(date: string | Date | null | undefined): string {
  // Verificar si la fecha es null, undefined, string vacío o solo espacios
  if (!date || (typeof date === 'string' && date.trim() === '')) {
    return 'Sin fecha'
  }
  
  try {
    const dateObj = new Date(date)
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida'
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(dateObj)
  } catch (error) {
    return 'Fecha inválida'
  }
}

// Función segura para formatear fecha y hora
export function safeFormatDateTime(date: string | Date | null | undefined): string {
  // Verificar si la fecha es null, undefined, string vacío o solo espacios
  if (!date || (typeof date === 'string' && date.trim() === '')) {
    return 'Sin fecha'
  }
  
  try {
    const dateObj = new Date(date)
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida'
    }
    
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(dateObj)
  } catch (error) {
    return 'Fecha inválida'
  }
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date))
}

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function debounce<T extends (...args: any[]) => void>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

// Función segura para parsear fechas que pueden ser nulas o inválidas
export function safeParseDate(date: string | Date | null | undefined): Date | null {
  // Verificar si la fecha es null, undefined, string vacío o solo espacios
  if (!date || (typeof date === 'string' && date.trim() === '')) {
    return null
  }
  
  try {
    const dateObj = new Date(date)
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return null
    }
    return dateObj
  } catch (error) {
    return null
  }
}

export function generateId(): string {
  return Math.random().toString(36).substr(2, 9)
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function getTaskPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'low':
      return 'bg-green-100 text-green-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getTaskStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'done':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'review':
      return 'bg-purple-100 text-purple-800'
    case 'todo':
      return 'bg-yellow-100 text-yellow-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getProjectStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'bg-green-100 text-green-800'
    case 'in_progress':
      return 'bg-blue-100 text-blue-800'
    case 'planning':
      return 'bg-yellow-100 text-yellow-800'
    case 'cancelled':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

// Función segura para formatDistanceToNow
export function safeFormatDistanceToNow(date: string | Date | null | undefined): string {
  if (!date) return 'Hace un momento'
  
  try {
    const dateObj = new Date(date)
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return 'Fecha inválida'
    }
    
    // Importar dinámicamente para evitar problemas de SSR
    const { formatDistanceToNow } = require('date-fns')
    const { es } = require('date-fns/locale')
    
    return formatDistanceToNow(dateObj, {
      addSuffix: true,
      locale: es
    })
  } catch (error) {
    return 'Hace un momento'
  }
}

// Función segura para convertir fecha a string para inputs HTML
export function safeToDateInputString(date: string | Date | null | undefined): string {
  if (!date) return ''
  
  try {
    const dateObj = new Date(date)
    // Verificar si la fecha es válida
    if (isNaN(dateObj.getTime())) {
      return ''
    }
    
    return dateObj.toISOString().split('T')[0]
  } catch (error) {
    return ''
  }
}
