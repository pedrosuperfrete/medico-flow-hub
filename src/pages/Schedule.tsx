import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(true);
  const [dataTimeout, setDataTimeout] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const debugScheduleData = async () => {
      console.log('=== DEBUG SCHEDULE PAGE ===');
      
      // Debug sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão atual:', session);
      console.log('Erro de sessão:', sessionError);
      console.log('Usuário autenticado:', !!session?.user);
      console.log('Access token presente:', !!session?.access_token);

      if (!session?.user) {
        console.log('❌ Usuário não autenticado - redirecionando ou exibindo erro');
        setLoading(false);
        return;
      }

      // Timeout de 3 segundos para mostrar fallback
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout de 3s atingido - dados não carregaram');
        setDataTimeout(true);
      }, 3000);

      try {
        // Debug consulta de atendimentos
        console.log('📊 Consultando tabela: atendimentos');
        console.log('Payload Supabase:', {
          table: 'atendimentos',
          select: '*, pacientes(*)',
          filter: 'professional_id = ' + session.user.id
        });

        const { data: atendimentosData, error: atendimentosError } = await supabase
          .from('atendimentos')
          .select('*, pacientes(*)')
          .eq('professional_id', session.user.id);

        console.log('Resposta atendimentos:', { data: atendimentosData, error: atendimentosError });

        if (atendimentosError) {
          if (atendimentosError.code === 'PGRST116' || atendimentosError.message.includes('does not exist')) {
            console.log('❌ Tabela atendimentos não encontrada ou erro 404 Supabase');
          } else {
            console.log('❌ Erro ao consultar atendimentos:', atendimentosError);
          }
        }

        if (!atendimentosData || atendimentosData.length === 0) {
          console.log('📝 Resposta vazia da tabela atendimentos');
        }

        // Debug consulta de cobranças para valores
        console.log('📊 Consultando tabela: cobrancas');
        const { data: cobrancasData, error: cobrancasError } = await supabase
          .from('cobrancas')
          .select('*')
          .eq('professional_id', session.user.id);

        console.log('Resposta cobrancas:', { data: cobrancasData, error: cobrancasError });

        // Mapear dados dos atendimentos ou usar dados mock
        const processedAppointments = atendimentosData?.map(a => {
          const cobranca = cobrancasData?.find(c => c.atendimento_id === a.id);
          const dataHora = new Date(a.data_hora);
          
          return {
            id: a.id,
            patient: a.pacientes?.nome || `Paciente ${a.paciente_id?.substring(0, 8)}`,
            service: a.tipo_servico,
            date: dataHora.toISOString().split('T')[0],
            time: dataHora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            duration: 60,
            value: cobranca ? Number(cobranca.valor) : 200,
            status: (a.status as 'scheduled' | 'completed' | 'cancelled' | 'missed') || 'scheduled',
            paymentStatus: (cobranca?.status === 'pago' ? 'paid' : 'pending') as 'pending' | 'paid'
          };
        }) || [
          // Dados mock se não houver dados reais
          {
            id: '1',
            patient: 'Maria Santos',
            service: 'Consulta Cardiológica',
            date: '2024-06-16',
            time: '09:00',
            duration: 60,
            value: 200,
            status: 'scheduled' as const,
            paymentStatus: 'pending' as const
          },
          {
            id: '2',
            patient: 'João Silva',
            service: 'Retorno',
            date: '2024-06-16',
            time: '10:30',
            duration: 30,
            value: 150,
            status: 'scheduled' as const,
            paymentStatus: 'pending' as const
          }
        ];

        console.log('✅ Dados de agendamentos processados:', processedAppointments);
        setAppointments(processedAppointments);
        clearTimeout(timeoutId);
        setLoading(false);

      } catch (error) {
        console.error('❌ Erro geral no carregamento da agenda:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    debugScheduleData();
  }, [user]);

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

  if (loading && !dataTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando agenda...</p>
        </div>
      </div>
    );
  }

  if (dataTimeout && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">⚠️ Dados não disponíveis</p>
          <p className="text-sm text-muted-foreground">
            Verifique o console para detalhes de debug
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
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
