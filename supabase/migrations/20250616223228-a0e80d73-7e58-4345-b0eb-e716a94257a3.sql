
-- Corrigir políticas RLS para a tabela clinicas
-- Remover políticas existentes que podem estar conflitando
DROP POLICY IF EXISTS "Users can view their clinic" ON public.clinicas;
DROP POLICY IF EXISTS "Admins can manage clinics" ON public.clinicas;

-- Criar políticas mais permissivas para permitir inserção
CREATE POLICY "Authenticated users can create clinics" ON public.clinicas
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Users can view their clinic" ON public.clinicas
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = clinicas.id
  ) OR public.is_admin()
);

CREATE POLICY "Users can update their clinic" ON public.clinicas
FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() AND profiles.clinic_id = clinicas.id
  ) OR public.is_admin()
);

CREATE POLICY "Admins can manage all clinics" ON public.clinicas
FOR ALL USING (public.is_admin());
