
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface ClinicInfoStepProps {
  onNext: (data: any) => void;
  initialData: any;
}

const ClinicInfoStep: React.FC<ClinicInfoStepProps> = ({ onNext, initialData }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    cnpj: initialData.cnpj || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    email: initialData.email || '',
    ...initialData
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Clínica</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="Clínica Saúde Mais"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="cnpj">CNPJ</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => handleChange('cnpj', e.target.value)}
            placeholder="00.000.000/0000-00"
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="address">Endereço Completo</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="Rua das Flores, 123 - Centro - São Paulo - SP - CEP: 01234-567"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            placeholder="(11) 99999-9999"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email da Clínica</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange('email', e.target.value)}
            placeholder="contato@clinica.com"
            required
          />
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <Button type="submit" className="px-8">
          Continuar
        </Button>
      </div>
    </form>
  );
};

export default ClinicInfoStep;
