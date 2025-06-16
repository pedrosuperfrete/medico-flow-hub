
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface PaymentStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: any;
}

const PaymentStep: React.FC<PaymentStepProps> = ({ onNext, onBack, initialData }) => {
  const [paymentData, setPaymentData] = useState({
    bank: initialData.bank || '',
    agency: initialData.agency || '',
    account: initialData.account || '',
    pixKey: initialData.pixKey || '',
    pixType: initialData.pixType || '',
    ...initialData
  });

  const pixTypes = [
    { value: 'cpf', label: 'CPF' },
    { value: 'cnpj', label: 'CNPJ' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Telefone' },
    { value: 'random', label: 'Chave Aleatória' }
  ];

  const banks = [
    'Banco do Brasil',
    'Bradesco',
    'Caixa Econômica',
    'Itaú',
    'Santander',
    'Nubank',
    'Inter',
    'Sicoob',
    'Sicredi',
    'Outro'
  ];

  const handleChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(paymentData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dados Bancários</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Banco</Label>
            <Select value={paymentData.bank} onValueChange={(value) => handleChange('bank', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o banco" />
              </SelectTrigger>
              <SelectContent>
                {banks.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="agency">Agência</Label>
              <Input
                id="agency"
                value={paymentData.agency}
                onChange={(e) => handleChange('agency', e.target.value)}
                placeholder="0000"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account">Conta</Label>
              <Input
                id="account"
                value={paymentData.account}
                onChange={(e) => handleChange('account', e.target.value)}
                placeholder="00000-0"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Chave PIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="pixType">Tipo de Chave PIX</Label>
            <Select value={paymentData.pixType} onValueChange={(value) => handleChange('pixType', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {pixTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX</Label>
            <Input
              id="pixKey"
              value={paymentData.pixKey}
              onChange={(e) => handleChange('pixKey', e.target.value)}
              placeholder="Digite sua chave PIX"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" className="px-8">
          Finalizar Configuração
        </Button>
      </div>
    </form>
  );
};

export default PaymentStep;
