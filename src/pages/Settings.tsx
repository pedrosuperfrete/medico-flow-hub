import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

const Settings: React.FC = () => {
  const { user, clinic } = useUser();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [dataTimeout, setDataTimeout] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [clinicData, setClinicData] = useState(null);

  useEffect(() => {
    const debugSettingsData = async () => {
      console.log('=== DEBUG SETTINGS PAGE ===');
      
      // Debug sessão atual
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Sessão atual:', session);
      console.log('Erro de sessão:', sessionError);
      console.log('Usuário autenticado:', !!session?.user);
      console.log('Access token presente:', !!session?.access_token);

      if (!session?.user) {
        console.log('❌ Usuário não autenticado - redirecionando ou exibindo erro');
        setInitialLoading(false);
        return;
      }

      // Timeout de 3 segundos para mostrar fallback
      const timeoutId = setTimeout(() => {
        console.log('⏰ Timeout de 3s atingido - dados não carregaram');
        setDataTimeout(true);
      }, 3000);

      try {
        // Debug consulta do perfil do usuário
        console.log('📊 Consultando tabela: profiles');
        console.log('Payload Supabase:', {
          table: 'profiles',
          select: '*',
          filter: 'id = ' + session.user.id
        });

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('Resposta profile:', { data: profile, error: profileError });

        if (profileError) {
          if (profileError.code === 'PGRST116' || profileError.message.includes('does not exist')) {
            console.log('❌ Tabela profiles não encontrada ou erro 404 Supabase');
          } else {
            console.log('❌ Erro ao consultar profile:', profileError);
          }
        }

        if (!profile) {
          console.log('📝 Dados não carregados ainda - profile');
        } else {
          console.log('✅ Profile carregado:', profile);
          setProfileData(profile);
        }

        // Debug consulta da clínica se o usuário tiver clinic_id
        if (profile?.clinic_id) {
          console.log('📊 Consultando tabela: clinicas');
          console.log('Payload Supabase:', {
            table: 'clinicas',
            select: '*',
            filter: 'id = ' + profile.clinic_id
          });

          const { data: clinicInfo, error: clinicError } = await supabase
            .from('clinicas')
            .select('*')
            .eq('id', profile.clinic_id)
            .single();

          console.log('Resposta clinic:', { data: clinicInfo, error: clinicError });

          if (clinicError) {
            if (clinicError.code === 'PGRST116' || clinicError.message.includes('does not exist')) {
              console.log('❌ Tabela clinicas não encontrada ou erro 404 Supabase');
            } else {
              console.log('❌ Erro ao consultar clinic:', clinicError);
            }
          }

          if (!clinicInfo) {
            console.log('📝 Dados não carregados ainda - clinic');
          } else {
            console.log('✅ Clinic carregada:', clinicInfo);
            setClinicData(clinicInfo);
          }
        }

        clearTimeout(timeoutId);
        setInitialLoading(false);

      } catch (error) {
        console.error('❌ Erro geral no carregamento de configurações:', error);
        clearTimeout(timeoutId);
        setInitialLoading(false);
      }
    };

    debugSettingsData();
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    // Simula salvamento
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    
    toast({
      title: "Configurações salvas",
      description: "Suas alterações foram salvas com sucesso.",
    });
  };

  if (initialLoading && !dataTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (dataTimeout && !profileData) {
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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta e clínica
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList>
          <TabsTrigger value="profile">Perfil</TabsTrigger>
          <TabsTrigger value="clinic">Clínica</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
          <TabsTrigger value="security">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>
                Atualize suas informações pessoais e profissionais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    defaultValue={profileData?.name || user?.name}
                    placeholder="Seu nome completo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    defaultValue={profileData?.email || user?.email}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="specialty">Especialidade</Label>
                  <Select defaultValue={profileData?.specialty || user?.specialty}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione sua especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cardiologia">Cardiologia</SelectItem>
                      <SelectItem value="Dermatologia">Dermatologia</SelectItem>
                      <SelectItem value="Ginecologia">Ginecologia</SelectItem>
                      <SelectItem value="Neurologia">Neurologia</SelectItem>
                      <SelectItem value="Pediatria">Pediatria</SelectItem>
                      <SelectItem value="Psicologia">Psicologia</SelectItem>
                      <SelectItem value="Psiquiatria">Psiquiatria</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="crm">CRM/CRO</Label>
                  <Input
                    id="crm"
                    defaultValue={profileData?.crm || user?.crm}
                    placeholder="CRM-12345"
                  />
                </div>
              </div>

              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="clinic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Clínica</CardTitle>
              <CardDescription>
                Configurações gerais da sua clínica
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="clinicName">Nome da Clínica</Label>
                  <Input
                    id="clinicName"
                    defaultValue={clinicData?.name || clinic?.name}
                    placeholder="Nome da sua clínica"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinicPhone">Telefone</Label>
                  <Input
                    id="clinicPhone"
                    defaultValue={clinicData?.phone || clinic?.phone}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicAddress">Endereço</Label>
                <Input
                  id="clinicAddress"
                  defaultValue={clinicData?.address || clinic?.address}
                  placeholder="Endereço completo da clínica"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicEmail">Email da Clínica</Label>
                <Input
                  id="clinicEmail"
                  type="email"
                  defaultValue={clinicData?.email || clinic?.email}
                  placeholder="contato@clinica.com"
                />
              </div>

              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notificações</CardTitle>
              <CardDescription>
                Configure como você quer receber notificações
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Notificações por Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações sobre consultas e lembretes por email
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Lembrete de Consultas</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba lembretes 1 hora antes das consultas
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Relatórios Financeiros</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba relatórios financeiros semanais por email
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Novos Pacientes</Label>
                  <p className="text-sm text-muted-foreground">
                    Receba notificações quando novos pacientes se cadastrarem
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Salvando...' : 'Salvar Preferências'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança</CardTitle>
              <CardDescription>
                Gerencie a segurança da sua conta
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="Digite sua senha atual"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Digite sua nova senha"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirme sua nova senha"
                />
              </div>

              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Alterando...' : 'Alterar Senha'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Sessões Ativas</CardTitle>
              <CardDescription>
                Gerencie onde você está logado
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Chrome - Windows</div>
                    <div className="text-sm text-muted-foreground">
                      São Paulo, SP • Ativo agora
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Atual
                  </Button>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium">Safari - iPhone</div>
                    <div className="text-sm text-muted-foreground">
                      São Paulo, SP • Há 2 horas
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Revogar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
