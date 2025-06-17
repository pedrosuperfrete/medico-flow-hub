
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  onSubmit: () => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onSubmit, onCancel }) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [formData, setFormData] = useState({
    atendimento_id: '',
    valor: '',
    forma_pagamento: '',
    data_vencimento: '',
    status: 'pendente'
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('atendimentos')
        .select(`
          id,
          tipo_servico,
          data_hora,
          valor,
          pacientes!inner(nome)
        `)
        .eq('clinic_id', user?.clinic_id)
        .is('pagamentos.id', null)
        .order('data_hora', { ascending: false });

      if (error) throw error;
      setAppointments(data || []);
    } catch (error) {
      console.error('Erro ao carregar atendimentos:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const { error } = await supabase
        .from('pagamentos')
        .insert([{
          ...formData,
          valor: parseFloat(formData.valor),
          paciente_id: appointments.find((apt: any) => apt.id === formData.atendimento_id)?.pacientes?.id
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Pagamento criado com sucesso"
      });

      onSubmit();
    } catch (error) {
      console.error('Erro ao criar pagamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar o pagamento",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-preencher valor quando selecionar atendimento
    if (field === 'atendimento_id') {
      const selectedAppointment = appointments.find((apt: any) => apt.id === value);
      if (selectedAppointment?.valor) {
        setFormData(prev => ({ ...prev, valor: selectedAppointment.valor.toString() }));
      }
    }
  };

  const paymentMethods = [
    'Dinheiro',
    'PIX',
    'Cartão de Débito',
    'Cartão de Crédito',
    'Convênio',
    'Cheque',
    'Transferência'
  ];

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Novo Pagamento</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="atendimento_id">Atendimento *</Label>
            <Select value={formData.atendimento_id} onValueChange={(value) => handleInputChange('atendimento_id', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um atendimento" />
              </SelectTrigger>
              <SelectContent>
                {appointments.map((appointment: any) => (
                  <SelectItem key={appointment.id} value={appointment.id}>
                    {appointment.pacientes?.nome} - {appointment.tipo_servico} - {new Date(appointment.data_hora).toLocaleDateString('pt-BR')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="valor">Valor (R$) *</Label>
            <Input
              id="valor"
              type="number"
              step="0.01"
              min="0"
              value={formData.valor}
              onChange={(e) => handleInputChange('valor', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="forma_pagamento">Forma de Pagamento *</Label>
            <Select value={formData.forma_pagamento} onValueChange={(value) => handleInputChange('forma_pagamento', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method} value={method}>
                    {method}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="data_vencimento">Data de Vencimento</Label>
            <Input
              id="data_vencimento"
              type="date"
              value={formData.data_vencimento}
              onChange={(e) => handleInputChange('data_vencimento', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit">
              Criar Pagamento
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentForm;
