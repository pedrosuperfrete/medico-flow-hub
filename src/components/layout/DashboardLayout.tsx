
import React from 'react';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useUser } from '@/contexts/UserContext';
import { Navigate } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import OnboardingFlow from '../onboarding/OnboardingFlow';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { isAuthenticated, isOnboardingComplete } = useUser();

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  if (!isOnboardingComplete) {
    return <OnboardingFlow />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-white px-4 py-3 flex items-center">
            <SidebarTrigger className="mr-4" />
            <h1 className="text-xl font-semibold">Plataforma Clínica</h1>
          </header>
          <div className="flex-1 p-6">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
