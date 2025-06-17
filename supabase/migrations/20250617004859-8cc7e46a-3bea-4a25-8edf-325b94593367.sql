
-- Verificar e corrigir a política de INSERT para clinicas
-- Remover a política de INSERT existente se houver
DROP POLICY IF EXISTS "Authenticated users can create clinics" ON public.clinicas;

-- Criar política de INSERT mais simples para usuários autenticados
CREATE POLICY "Authenticated users can create clinics" ON public.clinicas
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Verificar se RLS está ativado (caso não esteja)
ALTER TABLE public.clinicas ENABLE ROW LEVEL SECURITY;
