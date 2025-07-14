'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FolderOpen, 
  Users, 
  Calendar,
  BarChart3,
  Settings,
  Menu,
  X,
  FileText
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/lib/store/authStore';

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Dashboard',
    allowedRoles: ['admin', 'project_manager', 'developer']
  },
  {
    href: '/users',
    icon: Users,
    label: 'Usuarios',
    allowedRoles: ['admin', 'project_manager'] // Solo admin y manager pueden ver usuarios
  },
  {
    href: '/calendar',
    icon: Calendar,
    label: 'Calendario',
    allowedRoles: ['admin', 'project_manager', 'developer']
  },
  {
    href: '/metrics',
    icon: BarChart3,
    label: 'Métricas',
    allowedRoles: ['admin', 'project_manager']
  },
  {
    href: '/reports',
    icon: FileText,
    label: 'Reportes PDF',
    allowedRoles: ['admin', 'project_manager']
  }
];

interface DashboardSidebarProps {
  children: React.ReactNode;
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user } = useAuthStore();

  // Filtrar elementos de navegación según el rol del usuario
  const filteredNavItems = navItems.filter(item => 
    user?.role && item.allowedRoles.includes(user.role)
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className={cn(
        "bg-card border-r border-border transition-all duration-300 flex flex-col",
        collapsed ? "w-16" : "w-64"
      )}>
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {!collapsed && (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">N</span>
              </div>
              <span className="font-semibold text-card-foreground">Nutrabiotics</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground"
          >
            {collapsed ? <Menu className="w-5 h-5" /> : <X className="w-5 h-5" />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {filteredNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                            (item.href !== '/dashboard' && pathname?.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      "hover:bg-accent hover:text-accent-foreground",
                      isActive 
                        ? "bg-primary/10 text-primary border-r-2 border-primary" 
                        : "text-muted-foreground",
                      collapsed && "justify-center"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("w-5 h-5", !collapsed && "mr-3")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User info */}
        {!collapsed && user && (
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <span className="text-primary-foreground text-sm font-medium">
                  {user.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-card-foreground truncate">
                  {user.name}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user.role}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {children}
      </div>
    </div>
  );
}
