
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Eye, Edit, Phone, Mail } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';

interface Patient {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  lastVisit: string;
  nextAppointment: string;
  status: 'active' | 'inactive';
}

const Patients: React.FC = () => {
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Mock data - em produção viria de uma API
  const patients: Patient[] = [
    {
      id: '1',
      name: 'Maria Santos',
      cpf: '123.456.789-10',
      email: 'maria@email.com',
      phone: '(11) 99999-9999',
      birthDate: '1985-05-15',
      lastVisit: '2024-06-10',
      nextAppointment: '2024-06-20',
      status: 'active'
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
      status: 'active'
    },
    {
      id: '3',
      name: 'Ana Costa',
      cpf: '456.789.123-45',
      email: 'ana@email.com',
      phone: '(11) 77777-7777',
      birthDate: '1992-12-03',
      lastVisit: '2024-05-28',
      nextAppointment: '',
      status: 'inactive'
    },
  ];

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.cpf.includes(searchTerm) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                    CPF: {patient.cpf} • Nascimento: {new Date(patient.birthDate).toLocaleDateString('pt-BR')}
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
