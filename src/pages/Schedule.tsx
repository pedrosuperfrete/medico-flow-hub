
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface Appointment {
  id: string;
  patient: string;
  service: string;
  date: string;
  time: string;
  duration: number;
  value: number;
  status: 'scheduled' | 'completed' | 'cancelled' | 'missed';
  paymentStatus: 'pending' | 'paid';
}

const Schedule: React.FC = () => {
  const { user } = useUser();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');

  // Mock data
  const appointments: Appointment[] = [
    {
      id: '1',
      patient: 'Maria Santos',
      service: 'Consulta Cardiológica',
      date: '2024-06-16',
      time: '09:00',
      duration: 60,
      value: 200,
      status: 'scheduled',
      paymentStatus: 'pending'
    },
    {
      id: '2',
      patient: 'João Silva',
      service: 'Retorno',
      date: '2024-06-16',
      time: '10:30',
      duration: 30,
      value: 150,
      status: 'scheduled',
      paymentStatus: 'pending'
    },
    {
      id: '3',
      patient: 'Ana Costa',
      service: 'Exame Clínico',
      date: '2024-06-16',
      time: '14:00',
      duration: 45,
      value: 120,
      status: 'scheduled',
      paymentStatus: 'pending'
    },
    {
      id: '4',
      patient: 'Carlos Lima',
      service: 'Consulta',
      date: '2024-06-16',
      time: '15:30',
      duration: 60,
      value: 200,
      status: 'completed',
      paymentStatus: 'paid'
    },
  ];

  const todayAppointments = appointments.filter(
    apt => apt.date === currentDate.toISOString().split('T')[0]
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'missed': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      case 'missed': return 'Perdido';
      default: return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Agenda</h2>
          <p className="text-muted-foreground">
            Gerencie seus compromissos e consultas
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setView('day')}>
            Dia
          </Button>
          <Button variant="outline" onClick={() => setView('week')}>
            Semana
          </Button>
          <Button variant="outline" onClick={() => setView('month')}>
            Mês
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nova Consulta
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <CardTitle>{formatDate(currentDate)}</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {todayAppointments.length} consultas agendadas para hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {todayAppointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta agendada para hoje</p>
              </div>
            ) : (
              todayAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 min-w-[80px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{appointment.time}</span>
                    </div>
                    <div>
                      <div className="font-medium">{appointment.patient}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.service} • {appointment.duration} min
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      <div className="font-medium">R$ {appointment.value.toFixed(2)}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {getStatusText(appointment.status)}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo do Dia</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Total de consultas:</span>
                <span className="font-medium">{todayAppointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Concluídas:</span>
                <span className="font-medium text-green-600">
                  {todayAppointments.filter(a => a.status === 'completed').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pendentes:</span>
                <span className="font-medium text-blue-600">
                  {todayAppointments.filter(a => a.status === 'scheduled').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Faturamento:</span>
                <span className="font-medium">
                  R$ {todayAppointments.reduce((sum, a) => sum + a.value, 0).toFixed(2)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Próximas Consultas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayAppointments
                .filter(a => a.status === 'scheduled')
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.id} className="flex justify-between text-sm">
                    <span>{appointment.time}</span>
                    <span className="text-muted-foreground">{appointment.patient}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Horários Livres</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground">
                11:00 - 12:00
              </div>
              <div className="text-sm text-muted-foreground">
                16:30 - 17:30
              </div>
              <div className="text-sm text-muted-foreground">
                18:00 - 19:00
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Schedule;
