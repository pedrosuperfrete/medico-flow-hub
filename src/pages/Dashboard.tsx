
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

const Dashboard: React.FC = () => {
  const { user } = useUser();

  // Query para buscar estatísticas do dashboard
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const today = new Date().toISOString().split('T')[0];
      
      // Buscar total de pacientes
      const { count: totalPatients } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', user.id);

      // Buscar consultas de hoje
      const { count: todayAppointments } = await supabase
        .from('atendimentos')
        .select('*', { count: 'exact', head: true })
        .eq('professional_id', user.id)
        .gte('data_hora', `${today}T00:00:00`)
        .lt('data_hora', `${today}T23:59:59`);

      // Buscar faturamento do mês
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      const { data: monthlyRevenue } = await supabase
        .from('cobrancas')
        .select('valor')
        .eq('professional_id', user.id)
        .eq('status', 'pago')
        .gte('data_cobranca', startOfMonth);

      const totalRevenue = monthlyRevenue?.reduce((sum, item) => sum + Number(item.valor), 0) || 0;

      // Buscar próxima consulta
      const { data: nextAppointment } = await supabase
        .from('atendimentos')
        .select(`
          data_hora,
          pacientes(nome)
        `)
        .eq('professional_id', user.id)
        .eq('status', 'agendado')
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(1)
        .single();

      return {
        totalPatients: totalPatients || 0,
        todayAppointments: todayAppointments || 0,
        monthlyRevenue: totalRevenue,
        nextAppointment
      };
    },
    enabled: !!user
  });

  // Query para buscar agenda de hoje
  const { data: todaySchedule } = useQuery({
    queryKey: ['today-schedule', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const today = new Date().toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('atendimentos')
        .select(`
          *,
          pacientes(nome)
        `)
        .eq('professional_id', user.id)
        .gte('data_hora', `${today}T00:00:00`)
        .lt('data_hora', `${today}T23:59:59`)
        .order('data_hora', { ascending: true });

      return data || [];
    },
    enabled: !!user
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const dashboardStats = [
    {
      title: "Pacientes Ativos",
      value: stats?.totalPatients?.toString() || "0",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Consultas Hoje",
      value: stats?.todayAppointments?.toString() || "0",
      change: "+2",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Faturamento Mensal",
      value: `R$ ${stats?.monthlyRevenue?.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) || '0,00'}`,
      change: "+8%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Próxima Consulta",
      value: stats?.nextAppointment ? 
        new Date(stats.nextAppointment.data_hora).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }) : "--:--",
      change: stats?.nextAppointment?.pacientes?.nome || "Nenhuma agendada",
      icon: Clock,
      color: "text-orange-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Bem-vindo, {user?.name}! Aqui está um resumo de hoje.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Agenda de Hoje</CardTitle>
            <CardDescription>
              Suas consultas agendadas para hoje
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaySchedule && todaySchedule.length > 0 ? (
                todaySchedule.map((appointment, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-sm font-medium">
                        {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div>
                        <div className="font-medium">{appointment.pacientes?.nome}</div>
                        <div className="text-sm text-muted-foreground">{appointment.tipo_servico}</div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      appointment.status === 'realizado' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {appointment.status}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-center py-4">
                  Nenhuma consulta agendada para hoje
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Atividades Recentes</CardTitle>
            <CardDescription>
              Últimas atividades na plataforma
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Sistema integrado com Supabase
              </div>
              <div className="text-sm text-muted-foreground">
                Dados sendo carregados em tempo real
              </div>
              <div className="text-sm text-muted-foreground">
                Autenticação configurada
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
