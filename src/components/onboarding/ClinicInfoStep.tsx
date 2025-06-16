
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useUser } from '@/contexts/UserContext';

interface ClinicInfoStepProps {
  onNext: (data: any) => void;
  initialData?: any;
}

const ClinicInfoStep: React.FC<ClinicInfoStepProps> = ({ onNext, initialData = {} }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || '',
    cnpj: initialData.cnpj || '',
    address: initialData.address || '',
    phone: initialData.phone || '',
    email: initialData.email || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Criar clínica no Supabase
      const { data: clinic, error: clinicError } = await supabase
        .from('clinicas')
        .insert([formData])
        .select()
        .single();

      if (clinicError) {
        throw clinicError;
      }

      // Atualizar o perfil do usuário com o clinic_id
      if (user && clinic) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ 
            clinic_id: clinic.id,
            role: 'admin' // O primeiro usuário vira admin
          })
          .eq('id', user.id);

        if (profileError) {
          throw profileError;
        }
      }

      onNext({ ...formData, clinicId: clinic.id });
    } catch (error: any) {
      setError(error.message || 'Erro ao salvar dados da clínica');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nome da Clínica *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Nome da sua clínica"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="cnpj">CNPJ</Label>
        <Input
          id="cnpj"
          value={formData.cnpj}
          onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
          placeholder="00.000.000/0000-00"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Endereço</Label>
        <Input
          id="address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          placeholder="Endereço completo da clínica"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Telefone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="(11) 99999-9999"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email da Clínica</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          placeholder="contato@clinica.com"
        />
      </div>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Continuar'}
      </Button>
    </form>
  );
};

export default ClinicInfoStep;
