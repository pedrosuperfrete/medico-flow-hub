
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight, Filter } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import AppointmentForm from '@/components/schedule/AppointmentForm';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: string;
  paciente: {
    nome: string;
    telefone?: string;
  };
  tipo_servico: string;
  data_hora: string;
  data_fim?: string;
  valor?: number;
  status: 'agendado' | 'confirmado' | 'em_andamento' | 'concluido' | 'cancelado' | 'perdido';
  forma_pagamento?: string;
  observacoes?: string;
}

const Schedule: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'day' | 'week' | 'month'>('day');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  useEffect(() => {
    if (user) {
      loadAppointments();
    }
  }, [user, currentDate]);

  const loadAppointments = async () => {
    try {
      const startDate = new Date(currentDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(currentDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('atendimentos')
        .select(`
          *,
          pacientes!inner(nome, telefone)
        `)
        .eq('clinic_id', user?.clinic_id)
        .gte('data_hora', startDate.toISOString())
        .lte('data_hora', endDate.toISOString())
        .order('data_hora');

      if (error) throw error;

      const processedAppointments = data?.map(appointment => ({
        ...appointment,
        paciente: appointment.pacientes
      })) || [];

      setAppointments(processedAppointments);
    } catch (error) {
      console.error('Erro ao carregar agenda:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a agenda",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAppointment = async (appointmentData: any) => {
    try {
      const { error } = await supabase
        .from('atendimentos')
        .insert([{
          ...appointmentData,
          clinic_id: user?.clinic_id,
          professional_id: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Agendamento criado com sucesso"
      });

      setShowForm(false);
      loadAppointments();
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o agendamento",
        variant: "destructive"
      });
    }
  };

  const handleStatusChange = async (appointmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('atendimentos')
        .update({ status: newStatus })
        .eq('id', appointmentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status atualizado com sucesso"
      });

      loadAppointments();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'agendado': return 'bg-blue-100 text-blue-800';
      case 'confirmado': return 'bg-green-100 text-green-800';
      case 'em_andamento': return 'bg-yellow-100 text-yellow-800';
      case 'concluido': return 'bg-green-100 text-green-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'perdido': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'agendado': return 'Agendado';
      case 'confirmado': return 'Confirmado';
      case 'em_andamento': return 'Em Andamento';
      case 'concluido': return 'Concluído';
      case 'cancelado': return 'Cancelado';
      case 'perdido': return 'Perdido';
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

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    if (direction === 'prev') {
      newDate.setDate(newDate.getDate() - 1);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setCurrentDate(newDate);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

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
          <Button onClick={() => setShowForm(true)}>
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
              <Button variant="outline" size="icon" onClick={() => navigateDate('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={() => navigateDate('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>
            {appointments.length} consultas agendadas para hoje
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma consulta agendada para hoje</p>
              </div>
            ) : (
              appointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2 min-w-[80px]">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">
                        {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{appointment.paciente.nome}</div>
                      <div className="text-sm text-muted-foreground">
                        {appointment.tipo_servico}
                        {appointment.paciente.telefone && ` • ${appointment.paciente.telefone}`}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-right">
                      {appointment.valor && (
                        <div className="font-medium">R$ {Number(appointment.valor).toFixed(2)}</div>
                      )}
                      {appointment.forma_pagamento && (
                        <div className="text-sm text-muted-foreground">
                          {appointment.forma_pagamento}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col space-y-1">
                      <Badge className={getStatusColor(appointment.status)}>
                        {getStatusText(appointment.status)}
                      </Badge>
                      {appointment.status === 'agendado' && (
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'confirmado')}
                          >
                            Confirmar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(appointment.id, 'em_andamento')}
                          >
                            Iniciar
                          </Button>
                        </div>
                      )}
                      {appointment.status === 'em_andamento' && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(appointment.id, 'concluido')}
                        >
                          Finalizar
                        </Button>
                      )}
                    </div>
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
                <span className="font-medium">{appointments.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Concluídas:</span>
                <span className="font-medium text-green-600">
                  {appointments.filter(a => a.status === 'concluido').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Pendentes:</span>
                <span className="font-medium text-blue-600">
                  {appointments.filter(a => ['agendado', 'confirmado'].includes(a.status)).length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Faturamento:</span>
                <span className="font-medium">
                  R$ {appointments.reduce((sum, a) => sum + (Number(a.valor) || 0), 0).toFixed(2)}
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
              {appointments
                .filter(a => ['agendado', 'confirmado'].includes(a.status))
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.id} className="flex justify-between text-sm">
                    <span>
                      {new Date(appointment.data_hora).toLocaleTimeString('pt-BR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </span>
                    <span className="text-muted-foreground">{appointment.paciente.nome}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full" onClick={() => setShowForm(true)}>
                Novo Agendamento
              </Button>
              <Button variant="outline" className="w-full">
                Pacientes em Espera
              </Button>
              <Button variant="outline" className="w-full">
                Relatório do Dia
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {showForm && (
        <AppointmentForm
          onSubmit={handleCreateAppointment}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Schedule;
