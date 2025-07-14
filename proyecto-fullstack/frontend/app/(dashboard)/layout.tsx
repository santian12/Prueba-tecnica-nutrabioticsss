'use client';

import { DashboardSidebar } from '@/components/dashboard/dashboard-sidebar';
import { Navbar } from '@/components/dashboard/navbar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 flex flex-col md:flex-row">
        <DashboardSidebar>
          <main className="flex-1 overflow-auto w-full">
            {children}
          </main>
        </DashboardSidebar>
      </div>
    </div>
  );
}
