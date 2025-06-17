
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Filter, Eye, Edit, FileText, Calendar, Phone, Mail } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { supabase } from '@/integrations/supabase/client';
import PatientForm from '@/components/patients/PatientForm';
import PatientDetail from '@/components/patients/PatientDetail';
import { useToast } from '@/hooks/use-toast';

interface Patient {
  id: string;
  nome: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  data_nascimento?: string;
  genero?: string;
  convenio?: string;
  ativo: boolean;
  created_at: string;
  last_appointment?: string;
}

const Patients: React.FC = () => {
  const { user } = useUser();
  const { toast } = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [showForm, setShowForm] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (user) {
      loadPatients();
    }
  }, [user]);

  const loadPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select(`
          *,
          atendimentos!inner(data_hora)
        `)
        .eq('clinic_id', user?.clinic_id)
        .order('nome');

      if (error) throw error;

      const processedPatients = data?.map(patient => ({
        ...patient,
        last_appointment: patient.atendimentos?.[0]?.data_hora
      })) || [];

      setPatients(processedPatients);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os pacientes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async (patientData: any) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .insert([{
          ...patientData,
          clinic_id: user?.clinic_id,
          professional_id: user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Paciente cadastrado com sucesso"
      });

      setShowForm(false);
      loadPatients();
    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível cadastrar o paciente",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePatient = async (patientData: any) => {
    try {
      const { error } = await supabase
        .from('pacientes')
        .update(patientData)
        .eq('id', editingPatient?.id);

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Paciente atualizado com sucesso"
      });

      setEditingPatient(null);
      loadPatients();
    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o paciente",
        variant: "destructive"
      });
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.cpf?.includes(searchTerm) ||
                         patient.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || 
                         (filterStatus === 'active' && patient.ativo) ||
                         (filterStatus === 'inactive' && !patient.ativo);

    return matchesSearch && matchesFilter;
  });

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
          <h2 className="text-3xl font-bold tracking-tight">Pacientes</h2>
          <p className="text-muted-foreground">
            Gerencie o cadastro dos seus pacientes
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Paciente
        </Button>
      </div>

      <div className="flex space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, CPF ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex space-x-2">
          <Button
            variant={filterStatus === 'all' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('all')}
          >
            Todos
          </Button>
          <Button
            variant={filterStatus === 'active' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('active')}
          >
            Ativos
          </Button>
          <Button
            variant={filterStatus === 'inactive' ? 'default' : 'outline'}
            onClick={() => setFilterStatus('inactive')}
          >
            Inativos
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredPatients.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">Nenhum paciente encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold">{patient.nome}</h3>
                      <Badge variant={patient.ativo ? 'default' : 'secondary'}>
                        {patient.ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      {patient.cpf && (
                        <div className="flex items-center space-x-2">
                          <span>CPF: {patient.cpf}</span>
                        </div>
                      )}
                      {patient.email && (
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4" />
                          <span>{patient.email}</span>
                        </div>
                      )}
                      {patient.telefone && (
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4" />
                          <span>{patient.telefone}</span>
                        </div>
                      )}
                    </div>

                    {patient.last_appointment && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        Última consulta: {new Date(patient.last_appointment).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingPatient(patient)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {showForm && (
        <PatientForm
          onSubmit={handleCreatePatient}
          onCancel={() => setShowForm(false)}
        />
      )}

      {editingPatient && (
        <PatientForm
          patient={editingPatient}
          onSubmit={handleUpdatePatient}
          onCancel={() => setEditingPatient(null)}
        />
      )}

      {selectedPatient && (
        <PatientDetail
          patient={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}
    </div>
  );
};

export default Patients;
