import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import { ThemeProvider } from '@/components/theme-provider'
import { ClientToaster } from '@/components/client-toaster'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Nutrabiotics - Gestión de Proyectos',
  description: 'Sistema de gestión de proyectos y tareas para desarrollo de software',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>        <ThemeProvider
          defaultTheme="system"
          storageKey="nutrabiotics-theme"
        >
          <Providers>
            {children}
            <ClientToaster />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
