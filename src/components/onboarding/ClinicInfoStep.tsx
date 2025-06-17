
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

    console.log('Tentando criar clínica com dados:', formData);
    console.log('Usuário autenticado:', user?.id);

    try {
      // Verificar se o usuário está autenticado e obter a sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão atual:', session);
      console.log('Access token presente:', !!session?.access_token);

      if (sessionError || !session || !session.access_token || !user) {
        throw new Error('Usuário não autenticado ou sessão inválida');
      }

      // Criar clínica no Supabase com os headers corretos
      console.log('Inserindo clínica com usuário autenticado...');
      const { data: clinic, error: clinicError } = await supabase
        .from('clinicas')
        .insert([formData])
        .select()
        .single();

      console.log('Resultado da inserção da clínica:', { clinic, clinicError });

      if (clinicError) {
        console.error('Erro ao criar clínica:', clinicError);
        console.error('Detalhes do erro:', {
          message: clinicError.message,
          details: clinicError.details,
          hint: clinicError.hint,
          code: clinicError.code
        });
        throw new Error(`Erro ao criar clínica: ${clinicError.message}`);
      }

      if (!clinic) {
        throw new Error('Clínica criada mas dados não retornados');
      }

      // Atualizar o perfil do usuário com o clinic_id
      console.log('Atualizando perfil do usuário com clinic_id:', clinic.id);
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          clinic_id: clinic.id,
          role: 'admin' // O primeiro usuário vira admin
        })
        .eq('id', user.id);

      console.log('Resultado da atualização do perfil:', { profileError });

      if (profileError) {
        console.error('Erro ao atualizar perfil:', profileError);
        // Se falhar em atualizar o perfil, não bloquear o fluxo
        console.warn('Continuando apesar do erro no perfil...');
      }

      console.log('Clínica criada com sucesso!');
      onNext({ ...formData, clinicId: clinic.id });
    } catch (error: any) {
      console.error('Erro completo:', error);
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
