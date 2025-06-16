
-- Primeiro, vamos criar uma tabela de perfis de usuário para gerenciar os profissionais e administradores
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL DEFAULT 'professional', -- 'admin' ou 'professional'
  specialty text,
  crm text,
  phone text,
  clinic_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Criar tabela de clínicas
CREATE TABLE public.clinicas (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  cnpj text,
  address text,
  phone text,
  email text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Adicionar foreign key na tabela profiles para clinicas
ALTER TABLE public.profiles ADD CONSTRAINT profiles_clinic_id_fkey 
FOREIGN KEY (clinic_id) REFERENCES public.clinicas(id);

-- Adicionar user_id nas tabelas existentes se não existir
ALTER TABLE public.pacientes ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.atendimentos ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.cobrancas ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.documentos ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.profiles(id);
ALTER TABLE public.tarefas ADD COLUMN IF NOT EXISTS professional_id uuid REFERENCES public.profiles(id);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.atendimentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cobrancas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarefas ENABLE ROW LEVEL SECURITY;

-- Função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Função para verificar se o usuário tem acesso aos dados
CREATE OR REPLACE FUNCTION public.has_access_to_data(professional_user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    CASE 
      WHEN public.is_admin() THEN true
      WHEN auth.uid() = professional_user_id THEN true
      ELSE false
    END;
$$;

-- Políticas para profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON public.profiles
FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can create profiles" ON public.profiles
FOR INSERT WITH CHECK (public.is_admin());

-- Políticas para clínicas
CREATE POLICY "Users can view their clinic" ON public.clinicas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = clinicas.id
  )
);

CREATE POLICY "Admins can manage clinics" ON public.clinicas
FOR ALL USING (public.is_admin());

-- Políticas para pacientes
CREATE POLICY "Professionals can view their patients" ON public.pacientes
FOR SELECT USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can create patients" ON public.pacientes
FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their patients" ON public.pacientes
FOR UPDATE USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can delete their patients" ON public.pacientes
FOR DELETE USING (public.has_access_to_data(professional_id));

-- Políticas para atendimentos
CREATE POLICY "Professionals can view their appointments" ON public.atendimentos
FOR SELECT USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can create appointments" ON public.atendimentos
FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their appointments" ON public.atendimentos
FOR UPDATE USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can delete their appointments" ON public.atendimentos
FOR DELETE USING (public.has_access_to_data(professional_id));

-- Políticas para cobranças
CREATE POLICY "Professionals can view their charges" ON public.cobrancas
FOR SELECT USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can create charges" ON public.cobrancas
FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their charges" ON public.cobrancas
FOR UPDATE USING (public.has_access_to_data(professional_id));

-- Políticas para documentos
CREATE POLICY "Professionals can view their documents" ON public.documentos
FOR SELECT USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can create documents" ON public.documentos
FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their documents" ON public.documentos
FOR UPDATE USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can delete their documents" ON public.documentos
FOR DELETE USING (public.has_access_to_data(professional_id));

-- Políticas para tarefas
CREATE POLICY "Professionals can view their tasks" ON public.tarefas
FOR SELECT USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can create tasks" ON public.tarefas
FOR INSERT WITH CHECK (auth.uid() = professional_id);

CREATE POLICY "Professionals can update their tasks" ON public.tarefas
FOR UPDATE USING (public.has_access_to_data(professional_id));

CREATE POLICY "Professionals can delete their tasks" ON public.tarefas
FOR DELETE USING (public.has_access_to_data(professional_id));

-- Trigger para criar perfil automaticamente quando usuário se cadastra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', 'Usuário'),
    new.email,
    'professional'
  );
  RETURN new;
END;
$$;

-- Trigger que executa quando um novo usuário é criado
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers para atualizar updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.clinicas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.pacientes
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.atendimentos
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.cobrancas
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Criar bucket para documentos no storage
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documentos', 'documentos', false)
ON CONFLICT (id) DO NOTHING;

-- Política para o bucket documentos
CREATE POLICY "Authenticated users can upload documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'documentos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can view their documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'documentos' AND 
  auth.role() = 'authenticated'
);

CREATE POLICY "Users can delete their documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'documentos' AND 
  auth.role() = 'authenticated'
);
