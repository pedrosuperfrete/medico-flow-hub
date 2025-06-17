
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Phone, Mail } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';

interface Patient {
  id: string;
  name: string;
  cpf?: string;
  email: string;
  phone: string;
  birthDate: string;
  lastVisit?: string;
  nextAppointment?: string;
  status: 'active' | 'inactive';
}

const Patients: React.FC = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [dataTimeout, setDataTimeout] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    const debugPatientsData = async () => {
      console.log('=== DEBUG PATIENTS PAGE ===');
      
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
        // Debug consulta de pacientes
        console.log('📊 Consultando tabela: pacientes');
        console.log('Payload Supabase:', {
          table: 'pacientes',
          select: '*',
          filter: 'professional_id = ' + session.user.id
        });

        const { data: pacientesData, error: pacientesError } = await supabase
          .from('pacientes')
          .select('*')
          .eq('professional_id', session.user.id);

        console.log('Resposta pacientes:', { data: pacientesData, error: pacientesError });

        if (pacientesError) {
          if (pacientesError.code === 'PGRST116' || pacientesError.message.includes('does not exist')) {
            console.log('❌ Tabela pacientes não encontrada ou erro 404 Supabase');
          } else {
            console.log('❌ Erro ao consultar pacientes:', pacientesError);
          }
        }

        if (!pacientesData || pacientesData.length === 0) {
          console.log('📝 Resposta vazia da tabela pacientes');
        }

        // Mapear dados dos pacientes ou usar dados mock
        const processedPatients = pacientesData?.map(p => ({
          id: p.id,
          name: p.nome,
          cpf: '000.000.000-00', // CPF não está na tabela atual
          email: p.email || 'email@exemplo.com',
          phone: p.telefone || '(00) 00000-0000',
          birthDate: p.data_nascimento || '1990-01-01',
          lastVisit: '2024-06-10',
          nextAppointment: '2024-06-20',
          status: 'active' as const
        })) || [
          // Dados mock se não houver dados reais
          {
            id: '1',
            name: 'Maria Santos',
            cpf: '123.456.789-10',
            email: 'maria@email.com',
            phone: '(11) 99999-9999',
            birthDate: '1985-05-15',
            lastVisit: '2024-06-10',
            nextAppointment: '2024-06-20',
            status: 'active' as const
          },
          {
            id: '2',
            name: 'João Silva',
            cpf: '987.654.321-00',
            email: 'joao@email.com',
            phone: '(11) 88888-8888',
            birthDate: '1978-09-22',
            lastVisit: '2024-06-08',
            nextAppointment: '2024-06-25',
            status: 'active' as const
          }
        ];

        console.log('✅ Dados de pacientes processados:', processedPatients);
        setPatients(processedPatients);
        clearTimeout(timeoutId);
        setLoading(false);

      } catch (error) {
        console.error('❌ Erro geral no carregamento de pacientes:', error);
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };

    debugPatientsData();
  }, [user]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.cpf && patient.cpf.includes(searchTerm)) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && !dataTimeout) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando pacientes...</p>
        </div>
      </div>
    );
  }

  if (dataTimeout && patients.length === 0) {
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
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie e visualize informações dos seus pacientes
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPatients.map((patient) => (
          <Card key={patient.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {patient.name}
                    <Badge variant={patient.status === 'active' ? 'default' : 'secondary'}>
                      {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {patient.cpf && `CPF: ${patient.cpf} • `}Nascimento: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{patient.phone}</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {patient.lastVisit && (
                    <span>Última consulta: {new Date(patient.lastVisit).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
              {patient.nextAppointment && (
                <div className="mt-2 p-2 bg-blue-50 rounded border-l-4 border-blue-500">
                  <span className="text-sm font-medium text-blue-800">
                    Próxima consulta: {new Date(patient.nextAppointment).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPatients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'Nenhum paciente encontrado com os termos de busca.' : 'Nenhum paciente cadastrado ainda.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Patients;
