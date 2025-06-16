
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, Calendar, Download } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

const Financial: React.FC = () => {
  const { user } = useUser();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedProfessional, setSelectedProfessional] = useState('all');

  // Mock data
  const financialData = {
    totalRevenue: 25430,
    totalPaid: 22150,
    totalPending: 3280,
    monthlyGrowth: 12.5,
    transactions: [
      {
        id: '1',
        patient: 'Maria Santos',
        service: 'Consulta Cardiológica',
        date: '2024-06-15',
        value: 200,
        status: 'paid',
        paymentMethod: 'PIX'
      },
      {
        id: '2',
        patient: 'João Silva',
        service: 'Retorno',
        date: '2024-06-15',
        value: 150,
        status: 'pending',
        paymentMethod: 'Cartão'
      },
      {
        id: '3',
        patient: 'Ana Costa',
        service: 'Exame Clínico',
        date: '2024-06-14',
        value: 120,
        status: 'paid',
        paymentMethod: 'Dinheiro'
      },
      {
        id: '4',
        patient: 'Carlos Lima',
        service: 'Consulta',
        date: '2024-06-14',
        value: 200,
        status: 'cancelled',
        paymentMethod: 'PIX'
      },
      {
        id: '5',
        patient: 'Luiza Mendes',
        service: 'Psicoterapia',
        date: '2024-06-13',
        value: 180,
        status: 'paid',
        paymentMethod: 'Transferência'
      },
    ]
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pago';
      case 'pending': return 'Pendente';
      case 'cancelled': return 'Cancelado';
      default: return status;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Financeiro</h2>
          <p className="text-muted-foreground">
            Acompanhe receitas, pagamentos e relatórios financeiros
          </p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecionar período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Esta semana</SelectItem>
              <SelectItem value="month">Este mês</SelectItem>
              <SelectItem value="quarter">Este trimestre</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          {user?.role === 'admin' && (
            <Select value={selectedProfessional} onValueChange={setSelectedProfessional}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos profissionais" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos profissionais</SelectItem>
                <SelectItem value="1">Dr. João Silva</SelectItem>
                <SelectItem value="2">Dra. Maria Santos</SelectItem>
              </SelectContent>
            </Select>
          )}
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {financialData.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +{financialData.monthlyGrowth}% em relação ao mês anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valores Recebidos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              R$ {financialData.totalPaid.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((financialData.totalPaid / financialData.totalRevenue) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valores Pendentes</CardTitle>
            <TrendingDown className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              R$ {financialData.totalPending.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {((financialData.totalPending / financialData.totalRevenue) * 100).toFixed(1)}% do total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {(financialData.totalRevenue / financialData.transactions.length).toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por consulta realizada
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>
            Histórico de pagamentos e valores recebidos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {financialData.transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <div>
                    <div className="font-medium">{transaction.patient}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.service} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="font-medium">R$ {transaction.value.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {transaction.paymentMethod}
                    </div>
                  </div>
                  <Badge className={getStatusColor(transaction.status)}>
                    {getStatusText(transaction.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Métodos de Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { method: 'PIX', count: 8, percentage: 40 },
                { method: 'Cartão', count: 6, percentage: 30 },
                { method: 'Dinheiro', count: 4, percentage: 20 },
                { method: 'Transferência', count: 2, percentage: 10 }
              ].map((item) => (
                <div key={item.method} className="flex items-center justify-between">
                  <span className="text-sm">{item.method}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{item.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Metas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Receita Mensal</span>
                  <span>R$ 22.150 / R$ 30.000</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '74%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Consultas Realizadas</span>
                  <span>85 / 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taxa de Inadimplência</span>
                  <span>8% / 5%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full" style={{ width: '8%' }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Financial;
