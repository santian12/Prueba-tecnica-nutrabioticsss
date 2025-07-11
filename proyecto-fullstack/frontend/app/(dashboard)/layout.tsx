'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Navbar } from '@/components/dashboard/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <DashboardSidebar>
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </DashboardSidebar>
    </div>
  );
}
