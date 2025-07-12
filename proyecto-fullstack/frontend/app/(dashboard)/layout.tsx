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
      <div className="pt-20"> {/* Compensar altura del navbar fijo */}
        <DashboardSidebar>
          <main className="flex-1 overflow-auto">
            {children}
          </main>
        </DashboardSidebar>
      </div>
    </div>
  );
}
