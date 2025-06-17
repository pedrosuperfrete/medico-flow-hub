
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, FileText, Phone, Mail, MapPin, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PatientDetailProps {
  patient: any;
  onClose: () => void;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patient, onClose }) => {
  const [appointments, setAppointments] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPatientData();
  }, [patient.id]);

  const loadPatientData = async () => {
    try {
      // Carregar atendimentos
      const { data: appointmentsData } = await supabase
        .from('atendimentos')
        .select('*')
        .eq('paciente_id', patient.id)
        .order('data_hora', { ascending: false });

      // Carregar documentos
      const { data: documentsData } = await supabase
        .from('documentos')
        .select('*')
        .eq('paciente_id', patient.id)
        .order('created_at', { ascending: false });

      setAppointments(appointmentsData || []);
      setDocuments(documentsData || []);
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const formatDateTime = (date: string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>{patient.nome}</span>
            <Badge variant={patient.ativo ? 'default' : 'secondary'}>
              {patient.ativo ? 'Ativo' : 'Inativo'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="info">Informações</TabsTrigger>
            <TabsTrigger value="appointments">Atendimentos</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
            <TabsTrigger value="medical">Prontuário</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dados Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.nome}</span>
                  </div>
                  {patient.cpf && (
                    <div>
                      <span className="font-medium">CPF:</span> {patient.cpf}
                    </div>
                  )}
                  {patient.data_nascimento && (
                    <div>
                      <span className="font-medium">Data de Nascimento:</span> {formatDate(patient.data_nascimento)}
                    </div>
                  )}
                  {patient.genero && (
                    <div>
                      <span className="font-medium">Gênero:</span> {patient.genero}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patient.email && (
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  {patient.telefone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.telefone}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {patient.convenio && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Convênio</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Convênio:</span> {patient.convenio}
                      </div>
                      {patient.numero_convenio && (
                        <div>
                          <span className="font-medium">Número:</span> {patient.numero_convenio}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {patient.observacoes && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-lg">Observações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm">{patient.observacoes}</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="appointments" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : appointments.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum atendimento encontrado
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment: any) => (
                  <Card key={appointment.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{appointment.tipo_servico}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDateTime(appointment.data_hora)}
                          </div>
                          {appointment.observacoes && (
                            <div className="text-sm mt-2">{appointment.observacoes}</div>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant={
                            appointment.status === 'concluido' ? 'default' :
                            appointment.status === 'agendado' ? 'secondary' :
                            appointment.status === 'cancelado' ? 'destructive' : 'outline'
                          }>
                            {appointment.status}
                          </Badge>
                          {appointment.valor && (
                            <div className="text-sm font-medium mt-1">
                              R$ {Number(appointment.valor).toFixed(2)}
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="documents" className="space-y-4">
            {loading ? (
              <div className="text-center py-8">Carregando...</div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum documento encontrado
              </div>
            ) : (
              <div className="space-y-3">
                {documents.map((document: any) => (
                  <Card key={document.id}>
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{document.nome_arquivo}</div>
                            <div className="text-sm text-muted-foreground">
                              {document.tipo_documento} • {formatDate(document.created_at)}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Visualizar
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="text-center py-8 text-muted-foreground">
              Funcionalidade de prontuário em desenvolvimento
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PatientDetail;
