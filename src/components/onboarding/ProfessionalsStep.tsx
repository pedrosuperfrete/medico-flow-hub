
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';

interface Professional {
  id: string;
  name: string;
  specialty: string;
  cpf: string;
  crm: string;
  email: string;
  password: string;
}

interface ProfessionalsStepProps {
  onNext: (data: any) => void;
  onBack: () => void;
  initialData: Professional[];
}

const ProfessionalsStep: React.FC<ProfessionalsStepProps> = ({ onNext, onBack, initialData }) => {
  const [professionals, setProfessionals] = useState<Professional[]>(
    initialData.length > 0 ? initialData : [
      {
        id: '1',
        name: '',
        specialty: '',
        cpf: '',
        crm: '',
        email: '',
        password: '',
      }
    ]
  );

  const specialties = [
    'Cardiologia',
    'Dermatologia',
    'Ginecologia',
    'Neurologia',
    'Pediatria',
    'Psicologia',
    'Psiquiatria',
    'Ortopedia',
    'Oftalmologia',
    'Odontologia',
    'Outro'
  ];

  const addProfessional = () => {
    const newProfessional: Professional = {
      id: Date.now().toString(),
      name: '',
      specialty: '',
      cpf: '',
      crm: '',
      email: '',
      password: '',
    };
    setProfessionals([...professionals, newProfessional]);
  };

  const removeProfessional = (id: string) => {
    setProfessionals(professionals.filter(p => p.id !== id));
  };

  const updateProfessional = (id: string, field: keyof Professional, value: string) => {
    setProfessionals(professionals.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    ));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext(professionals);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        {professionals.map((professional, index) => (
          <Card key={professional.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg">
                Profissional {index + 1}
              </CardTitle>
              {professionals.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeProfessional(professional.id)}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome Completo</Label>
                  <Input
                    value={professional.name}
                    onChange={(e) => updateProfessional(professional.id, 'name', e.target.value)}
                    placeholder="Dr. João Silva"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Especialidade</Label>
                  <Select
                    value={professional.specialty}
                    onValueChange={(value) => updateProfessional(professional.id, 'specialty', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a especialidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty} value={specialty}>
                          {specialty}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>CPF</Label>
                  <Input
                    value={professional.cpf}
                    onChange={(e) => updateProfessional(professional.id, 'cpf', e.target.value)}
                    placeholder="000.000.000-00"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>CRM/CRO</Label>
                  <Input
                    value={professional.crm}
                    onChange={(e) => updateProfessional(professional.id, 'crm', e.target.value)}
                    placeholder="CRM-12345"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={professional.email}
                    onChange={(e) => updateProfessional(professional.id, 'email', e.target.value)}
                    placeholder="doutor@email.com"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Senha</Label>
                  <Input
                    type="password"
                    value={professional.password}
                    onChange={(e) => updateProfessional(professional.id, 'password', e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addProfessional}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Adicionar Profissional
      </Button>

      <div className="flex justify-between pt-4">
        <Button type="button" variant="outline" onClick={onBack}>
          Voltar
        </Button>
        <Button type="submit" className="px-8">
          Continuar
        </Button>
      </div>
    </form>
  );
};

export default ProfessionalsStep;
