-- Criar buckets para armazenamento de imagens
INSERT INTO storage.buckets (id, name, public) VALUES 
('selos', 'selos', true),
('fundos-campanhas', 'fundos-campanhas', true),
('produtos', 'produtos', true),
('artes-geradas', 'artes-geradas', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de acesso para o bucket de selos
CREATE POLICY "Permitir upload de selos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'selos');

CREATE POLICY "Permitir visualização de selos" ON storage.objects
FOR SELECT USING (bucket_id = 'selos');

CREATE POLICY "Permitir atualização de selos" ON storage.objects
FOR UPDATE USING (bucket_id = 'selos');

CREATE POLICY "Permitir exclusão de selos" ON storage.objects
FOR DELETE USING (bucket_id = 'selos');

-- Políticas de acesso para o bucket de fundos de campanhas
CREATE POLICY "Permitir upload de fundos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'fundos-campanhas');

CREATE POLICY "Permitir visualização de fundos" ON storage.objects
FOR SELECT USING (bucket_id = 'fundos-campanhas');

CREATE POLICY "Permitir atualização de fundos" ON storage.objects
FOR UPDATE USING (bucket_id = 'fundos-campanhas');

CREATE POLICY "Permitir exclusão de fundos" ON storage.objects
FOR DELETE USING (bucket_id = 'fundos-campanhas');

-- Políticas de acesso para o bucket de produtos
CREATE POLICY "Permitir upload de produtos" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'produtos');

CREATE POLICY "Permitir visualização de produtos" ON storage.objects
FOR SELECT USING (bucket_id = 'produtos');

CREATE POLICY "Permitir atualização de produtos" ON storage.objects
FOR UPDATE USING (bucket_id = 'produtos');

CREATE POLICY "Permitir exclusão de produtos" ON storage.objects
FOR DELETE USING (bucket_id = 'produtos');

-- Políticas de acesso para o bucket de artes geradas
CREATE POLICY "Permitir upload de artes" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'artes-geradas');

CREATE POLICY "Permitir visualização de artes" ON storage.objects
FOR SELECT USING (bucket_id = 'artes-geradas');

CREATE POLICY "Permitir atualização de artes" ON storage.objects
FOR UPDATE USING (bucket_id = 'artes-geradas');

CREATE POLICY "Permitir exclusão de artes" ON storage.objects
FOR DELETE USING (bucket_id = 'artes-geradas');
