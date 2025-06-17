
-- Limpar tabelas existentes se necessário (cuidado em produção)
DROP TABLE IF EXISTS public.documentos CASCADE;
DROP TABLE IF EXISTS public.cobrancas CASCADE;
DROP TABLE IF EXISTS public.atendimentos CASCADE;
DROP TABLE IF EXISTS public.tarefas CASCADE;
DROP TABLE IF EXISTS public.pacientes CASCADE;
DROP TABLE IF EXISTS public.prontuarios CASCADE;
DROP TABLE IF EXISTS public.templates_documentos CASCADE;
DROP TABLE IF EXISTS public.configuracoes_clinica CASCADE;
DROP TABLE IF EXISTS public.agenda_configuracao CASCADE;
DROP TABLE IF EXISTS public.pagamentos CASCADE;
DROP TABLE IF EXISTS public.log_acoes CASCADE;

-- Tabela de configurações da clínica
CREATE TABLE public.configuracoes_clinica (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  google_calendar_token TEXT,
  whatsapp_api_token TEXT,
  payment_gateway_config JSONB DEFAULT '{}',
  nfe_config JSONB DEFAULT '{}',
  assinatura_digital_config JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pacientes melhorada
CREATE TABLE public.pacientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  nome TEXT NOT NULL,
  cpf TEXT UNIQUE,
  email TEXT,
  telefone TEXT,
  data_nascimento DATE,
  genero TEXT CHECK (genero IN ('M', 'F', 'Outro')),
  endereco JSONB DEFAULT '{}',
  contato_emergencia JSONB DEFAULT '{}',
  convenio TEXT,
  numero_convenio TEXT,
  observacoes TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de prontuários
CREATE TABLE public.prontuarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  data_atendimento TIMESTAMP WITH TIME ZONE DEFAULT now(),
  tipo_atendimento TEXT NOT NULL,
  template_usado TEXT,
  dados_clinicos JSONB DEFAULT '{}',
  observacoes TEXT,
  anexos TEXT[],
  assinado BOOLEAN DEFAULT false,
  assinatura_digital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de atendimentos melhorada
CREATE TABLE public.atendimentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  data_hora TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  tipo_servico TEXT NOT NULL,
  valor DECIMAL(10,2),
  status TEXT CHECK (status IN ('agendado', 'confirmado', 'em_andamento', 'concluido', 'cancelado', 'perdido')) DEFAULT 'agendado',
  forma_pagamento TEXT,
  observacoes TEXT,
  google_event_id TEXT,
  lembrete_enviado BOOLEAN DEFAULT false,
  confirmacao_paciente BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pagamentos
CREATE TABLE public.pagamentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  atendimento_id UUID REFERENCES public.atendimentos(id) ON DELETE CASCADE,
  paciente_id UUID REFERENCES public.pacientes(id),
  valor DECIMAL(10,2) NOT NULL,
  forma_pagamento TEXT NOT NULL,
  status TEXT CHECK (status IN ('pendente', 'pago', 'cancelado', 'estornado')) DEFAULT 'pendente',
  data_vencimento DATE,
  data_pagamento TIMESTAMP WITH TIME ZONE,
  link_pagamento TEXT,
  gateway_transaction_id TEXT,
  gateway_response JSONB DEFAULT '{}',
  parcelamento JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de documentos melhorada
CREATE TABLE public.documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id UUID REFERENCES public.pacientes(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  nome_arquivo TEXT NOT NULL,
  tipo_documento TEXT NOT NULL,
  categoria TEXT,
  url TEXT NOT NULL,
  tamanho_arquivo BIGINT,
  mime_type TEXT,
  assinado BOOLEAN DEFAULT false,
  assinatura_digital TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de templates de documentos
CREATE TABLE public.templates_documentos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id UUID REFERENCES public.clinicas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL,
  template_html TEXT NOT NULL,
  variaveis JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de configuração de agenda
CREATE TABLE public.agenda_configuracao (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  professional_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  horario_inicio TIME DEFAULT '08:00',
  horario_fim TIME DEFAULT '18:00',
  intervalo_consulta INTEGER DEFAULT 60,
  dias_semana INTEGER[] DEFAULT '{1,2,3,4,5}',
  horarios_bloqueados JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de log de ações
CREATE TABLE public.log_acoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id),
  acao TEXT NOT NULL,
  tabela_afetada TEXT,
  registro_id UUID,
  dados_anteriores JSONB,
  dados_novos JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.configuracoes_clinica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prontuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agenda_configuracao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.log_acoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para configuracoes_clinica
CREATE POLICY "Users can view their clinic config" ON public.configuracoes_clinica
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = configuracoes_clinica.clinic_id
  )
);

CREATE POLICY "Admins can manage clinic config" ON public.configuracoes_clinica
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = configuracoes_clinica.clinic_id 
    AND profiles.role = 'admin'
  )
);

-- Políticas RLS para pacientes
CREATE POLICY "Users can view clinic patients" ON public.pacientes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = pacientes.clinic_id
  )
);

CREATE POLICY "Users can manage clinic patients" ON public.pacientes
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = pacientes.clinic_id
  )
);

-- Políticas RLS para prontuários
CREATE POLICY "Professionals can view their patient records" ON public.prontuarios
FOR SELECT USING (
  professional_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.pacientes 
      WHERE pacientes.id = prontuarios.paciente_id AND pacientes.clinic_id = profiles.clinic_id
    )
  )
);

CREATE POLICY "Professionals can manage their patient records" ON public.prontuarios
FOR ALL USING (
  professional_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    AND EXISTS (
      SELECT 1 FROM public.pacientes 
      WHERE pacientes.id = prontuarios.paciente_id AND pacientes.clinic_id = profiles.clinic_id
    )
  )
);

-- Políticas RLS para atendimentos
CREATE POLICY "Users can view clinic appointments" ON public.atendimentos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = atendimentos.clinic_id
  )
);

CREATE POLICY "Users can manage clinic appointments" ON public.atendimentos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = atendimentos.clinic_id
  )
);

-- Políticas RLS para pagamentos
CREATE POLICY "Users can view clinic payments" ON public.pagamentos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.atendimentos 
    JOIN public.profiles ON profiles.id = auth.uid()
    WHERE atendimentos.id = pagamentos.atendimento_id 
    AND profiles.clinic_id = atendimentos.clinic_id
  )
);

CREATE POLICY "Users can manage clinic payments" ON public.pagamentos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.atendimentos 
    JOIN public.profiles ON profiles.id = auth.uid()
    WHERE atendimentos.id = pagamentos.atendimento_id 
    AND profiles.clinic_id = atendimentos.clinic_id
  )
);

-- Políticas RLS para documentos
CREATE POLICY "Users can view clinic documents" ON public.documentos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.pacientes 
    JOIN public.profiles ON profiles.id = auth.uid()
    WHERE pacientes.id = documentos.paciente_id 
    AND profiles.clinic_id = pacientes.clinic_id
  )
);

CREATE POLICY "Users can manage clinic documents" ON public.documentos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.pacientes 
    JOIN public.profiles ON profiles.id = auth.uid()
    WHERE pacientes.id = documentos.paciente_id 
    AND profiles.clinic_id = pacientes.clinic_id
  )
);

-- Políticas RLS para templates
CREATE POLICY "Users can view clinic templates" ON public.templates_documentos
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = templates_documentos.clinic_id
  )
);

CREATE POLICY "Admins can manage clinic templates" ON public.templates_documentos
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = templates_documentos.clinic_id 
    AND profiles.role = 'admin'
  )
);

-- Políticas RLS para agenda_configuracao
CREATE POLICY "Users can view their agenda config" ON public.agenda_configuracao
FOR SELECT USING (professional_id = auth.uid());

CREATE POLICY "Users can manage their agenda config" ON public.agenda_configuracao
FOR ALL USING (professional_id = auth.uid());

-- Políticas RLS para log_acoes
CREATE POLICY "Admins can view action logs" ON public.log_acoes
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
  )
);

CREATE POLICY "System can insert action logs" ON public.log_acoes
FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_configuracoes_clinica_updated_at
  BEFORE UPDATE ON public.configuracoes_clinica
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pacientes_updated_at
  BEFORE UPDATE ON public.pacientes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_prontuarios_updated_at
  BEFORE UPDATE ON public.prontuarios
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_atendimentos_updated_at
  BEFORE UPDATE ON public.atendimentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_pagamentos_updated_at
  BEFORE UPDATE ON public.pagamentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_templates_documentos_updated_at
  BEFORE UPDATE ON public.templates_documentos
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_agenda_configuracao_updated_at
  BEFORE UPDATE ON public.agenda_configuracao
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Inserir alguns templates de documento padrão
INSERT INTO public.templates_documentos (nome, tipo, template_html, variaveis) VALUES
('Atestado Médico', 'atestado', 
'<div class="documento">
  <h2>ATESTADO MÉDICO</h2>
  <p>Atesto que {{paciente_nome}}, portador do CPF {{paciente_cpf}}, esteve sob meus cuidados médicos no período de {{data_inicio}} a {{data_fim}}, necessitando de afastamento de suas atividades por {{dias}} dias.</p>
  <p>CID: {{cid}}</p>
  <p>{{cidade}}, {{data_emissao}}</p>
  <p>{{profissional_nome}}<br/>{{profissional_crm}}</p>
</div>',
'{"paciente_nome": "", "paciente_cpf": "", "data_inicio": "", "data_fim": "", "dias": "", "cid": "", "cidade": "", "data_emissao": "", "profissional_nome": "", "profissional_crm": ""}'),

('Declaração de Comparecimento', 'declaracao',
'<div class="documento">
  <h2>DECLARAÇÃO DE COMPARECIMENTO</h2>
  <p>Declaro que {{paciente_nome}}, portador do CPF {{paciente_cpf}}, compareceu a consulta médica neste estabelecimento no dia {{data_consulta}} das {{hora_inicio}} às {{hora_fim}}.</p>
  <p>{{cidade}}, {{data_emissao}}</p>
  <p>{{profissional_nome}}<br/>{{profissional_crm}}</p>
</div>',
'{"paciente_nome": "", "paciente_cpf": "", "data_consulta": "", "hora_inicio": "", "hora_fim": "", "cidade": "", "data_emissao": "", "profissional_nome": "", "profissional_crm": ""}');
