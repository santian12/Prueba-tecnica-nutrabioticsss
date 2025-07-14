'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuthStore } from '@/lib/store/authStore'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const { login, isLoading, isAuthenticated } = useAuthStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loginError, setLoginError] = useState('')

  // Solo redirigir si realmente está autenticado y no hay errores
  useEffect(() => {
    // Solo redirigir si está autenticado Y no hay errores de login
    if (isAuthenticated && !loginError) {
      console.log('🔄 [LoginPage] Usuario autenticado, redirigiendo al dashboard...');
      router.push('/dashboard')
    }
  }, [isAuthenticated, router, loginError])

  // Limpiar errores cuando el usuario cambie algún campo
  useEffect(() => {
    if (loginError) {
      // Limpiar error después de 5 segundos o cuando el usuario empiece a interactuar
      const timer = setTimeout(() => {
        setLoginError('')
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [loginError])

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData, event?: React.BaseSyntheticEvent) => {
    // Prevenir el comportamiento por defecto del formulario
    event?.preventDefault()
    
    try {
      console.log('🚪 [LoginPage] Iniciando login...');
      // Limpiar errores previos al intentar nuevo login
      setLoginError('')
      
      await login(data.email, data.password)
      console.log('✅ [LoginPage] Login exitoso');
      toast.success('¡Bienvenido!')
      // No hacer router.push aquí, dejar que el useEffect lo maneje
    } catch (error) {
      console.error('❌ [LoginPage] Error en login:', error);
      console.error('❌ [LoginPage] Error tipo:', typeof error);
      console.error('❌ [LoginPage] Error instanceof Error:', error instanceof Error);
      console.error('❌ [LoginPage] Error.message:', (error as any)?.message);
      
      const errorMessage = error instanceof Error ? error.message : 'Error al iniciar sesión'
      console.log('💬 [LoginPage] Mensaje final mostrado:', errorMessage);
      setLoginError(errorMessage)
      toast.error(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta para gestionar tus proyectos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={handleSubmit(onSubmit)} 
            className="space-y-4"
            onKeyDown={(e) => {
              // Prevenir comportamientos inesperados con Enter
              if (e.key === 'Enter' && (e.target as HTMLElement).tagName !== 'BUTTON') {
                e.preventDefault()
                handleSubmit(onSubmit)()
              }
            }}
          >
            {loginError && (
              <Alert variant="destructive">
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                {...register('email')}
                className={errors.email ? 'border-red-500' : ''}
                onChange={(e) => {
                  register('email').onChange(e)
                  // Limpiar error cuando el usuario empiece a escribir
                  if (loginError) setLoginError('')
                }}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  {...register('password')}
                  className={errors.password ? 'border-red-500' : ''}
                  onChange={(e) => {
                    register('password').onChange(e)
                    // Limpiar error cuando el usuario empiece a escribir
                    if (loginError) setLoginError('')
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-600">{errors.password.message}</p>
              )}
            </div>

            <div className="text-right">
              <Link href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                'Iniciar Sesión'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
