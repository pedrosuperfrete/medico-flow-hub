
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Calendar, TrendingUp, Clock } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const Dashboard: React.FC = () => {
  const { user } = useUser();

  const stats = [
    {
      title: "Pacientes Ativos",
      value: "127",
      change: "+12%",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Consultas Hoje",
      value: "8",
      change: "+2",
      icon: Calendar,
      color: "text-green-600"
    },
    {
      title: "Faturamento Mensal",
      value: "R$ 15.430",
      change: "+8%",
      icon: TrendingUp,
      color: "text-purple-600"
    },
    {
      title: "Próxima Consulta",
      value: "14:30",
      change: "João Silva",
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
        {stats.map((stat, index) => (
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
              {[
                { time: '09:00', patient: 'Maria Santos', type: 'Consulta', status: 'confirmado' },
                { time: '10:30', patient: 'João Silva', type: 'Retorno', status: 'confirmado' },
                { time: '14:00', patient: 'Ana Costa', type: 'Exame', status: 'pendente' },
                { time: '15:30', patient: 'Carlos Lima', type: 'Consulta', status: 'confirmado' },
              ].map((appointment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="text-sm font-medium">{appointment.time}</div>
                    <div>
                      <div className="font-medium">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground">{appointment.type}</div>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    appointment.status === 'confirmado' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {appointment.status}
                  </div>
                </div>
              ))}
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
              {[
                'Novo paciente cadastrado: Pedro Oliveira',
                'Consulta concluída: Maria Santos',
                'Pagamento recebido: R$ 150,00',
                'Consulta agendada: Ana Costa',
                'Relatório financeiro gerado'
              ].map((activity, index) => (
                <div key={index} className="text-sm text-muted-foreground">
                  {activity}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
