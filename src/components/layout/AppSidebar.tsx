
import React from 'react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Calendar, Home, Users, TrendingUp, Settings, LogOut } from "lucide-react";
import { useUser } from '@/contexts/UserContext';
import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';

const AppSidebar: React.FC = () => {
  const { user, clinic, logout } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Pacientes",
      url: "/patients",
      icon: Users,
    },
    {
      title: "Agenda",
      url: "/schedule",
      icon: Calendar,
    },
    {
      title: "Financeiro",
      url: "/financial",
      icon: TrendingUp,
    },
    {
      title: "Configurações",
      url: "/settings",
      icon: Settings,
    },
  ];

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex flex-col space-y-1">
          <h2 className="text-lg font-semibold text-primary">
            {clinic?.name || 'Clínica'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {user?.name} • {user?.role === 'admin' ? 'Administrador' : 'Profissional'}
          </p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === item.url}
                  >
                    <a href={item.url} className="flex items-center space-x-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <Button 
          variant="outline" 
          onClick={handleLogout}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
