
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DollarSign, TrendingUp, TrendingDown, Calendar, Filter, Download } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import PaymentForm from '@/components/financial/PaymentForm';
import { useToast } from '@/hooks/use-toast';

interface Payment {
  id: string;
  atendimento: {
    paciente: {
      nome: string;
    };
    tipo_servico: string;
    data_hora: string;
  };
  valor: number;
  forma_pagamento: string;
  status: 'pendente' | 'pago' | 'cancelado' | 'estornado';
  data_vencimento?: string;
  data_pagamento?: string;
}

const Financial: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    if (user) {
      loadFinancialData();
    }
  }, [user, selectedPeriod]);

  const loadFinancialData = async () => {
    try {
      let startDate = new Date();
      
      if (selectedPeriod === 'month') {
        startDate.setDate(1);
      } else if (selectedPeriod === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      }

      const { data, error } = await supabase
        .from('pagamentos')
        .select(`
          *,
          atendimentos!inner(
            tipo_servico,
            data_hora,
            pacientes!inner(nome)
          )
        `)
        .gte('created_at', startDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;

      const processedPayments = data?.map(payment => ({
        ...payment,
        atendimento: {
          ...payment.atendimentos,
          paciente: payment.atendimentos.pacientes
        }
      })) || [];

      setPayments(processedPayments);
    } catch (error) {
      console.error('Erro ao carregar dados financeiros:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados financeiros",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentStatusChange = async (paymentId: string, newStatus: string) => {
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === 'pago') {
        updateData.data_pagamento = new Date().toISOString();
      }

      const { error } = await supabase
        .from('pagamentos')
        .update(updateData)
        .eq('id', paymentId);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Status do pagamento atualizado"
      });

      loadFinancialData();
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
      case 'pago': return 'bg-green-100 text-green-800';
      case 'pendente': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      case 'estornado': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'pendente': return 'Pendente';
      case 'cancelado': return 'Cancelado';
      case 'estornado': return 'Estornado';
      default: return status;
    }
  };

  const totalReceived = payments
    .filter(p => p.status === 'pago')
    .reduce((sum, p) => sum + Number(p.valor), 0);

  const totalPending = payments
    .filter(p => p.status === 'pendente')
    .reduce((sum, p) => sum + Number(p.valor), 0);

  const totalCanceled = payments
    .filter(p => ['cancelado', 'estornado'].includes(p.status))
    .reduce((sum, p) => sum + Number(p.valor), 0);

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
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">
            Controle completo das suas receitas e pagamentos
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <DollarSign className="h-4 w-4 mr-2" />
            Novo Pagamento
          </Button>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          variant={selectedPeriod === 'week' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('week')}
        >
          Esta Semana
        </Button>
        <Button
          variant={selectedPeriod === 'month' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('month')}
        >
          Este Mês
        </Button>
        <Button
          variant={selectedPeriod === 'year' ? 'default' : 'outline'}
          onClick={() => setSelectedPeriod('year')}
        >
          Este Ano
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {totalReceived.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === 'pago').length} pagamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendente</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {totalPending.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => p.status === 'pendente').length} pendências
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cancelado</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              R$ {totalCanceled.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.filter(p => ['cancelado', 'estornado'].includes(p.status)).length} cancelamentos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(totalReceived + totalPending).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              {payments.length} transações
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="payments" className="w-full">
        <TabsList>
          <TabsTrigger value="payments">Pagamentos</TabsTrigger>
          <TabsTrigger value="reports">Relatórios</TabsTrigger>
          <TabsTrigger value="config">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>
                Gerencie todos os pagamentos e cobranças
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {payments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento encontrado
                  </div>
                ) : (
                  payments.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div>
                            <div className="font-medium">{payment.atendimento.paciente.nome}</div>
                            <div className="text-sm text-muted-foreground">
                              {payment.atendimento.tipo_servico} • {new Date(payment.atendimento.data_hora).toLocaleDateString('pt-BR')}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {payment.forma_pagamento}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="font-medium text-lg">
                            R$ {Number(payment.valor).toFixed(2)}
                          </div>
                          {payment.data_vencimento && (
                            <div className="text-sm text-muted-foreground">
                              Venc: {new Date(payment.data_vencimento).toLocaleDateString('pt-BR')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Badge className={getStatusColor(payment.status)}>
                            {getStatusText(payment.status)}
                          </Badge>
                          
                          {payment.status === 'pendente' && (
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                onClick={() => handlePaymentStatusChange(payment.id, 'pago')}
                              >
                                Confirmar
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handlePaymentStatusChange(payment.id, 'cancelado')}
                              >
                                Cancelar
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Relatórios Financeiros</CardTitle>
              <CardDescription>
                Analise o desempenho financeiro da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Relatórios em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Financeiras</CardTitle>
              <CardDescription>
                Configure métodos de pagamento e integrações
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Configurações em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {showForm && (
        <PaymentForm
          onSubmit={() => {
            setShowForm(false);
            loadFinancialData();
          }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default Financial;
