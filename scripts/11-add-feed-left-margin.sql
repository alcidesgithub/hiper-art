-- Adicionar coluna para margem esquerda do feed
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS margem_esquerda_feed INTEGER DEFAULT 40;

-- Atualizar campanhas existentes com valor padrão
UPDATE campanhas 
SET margem_esquerda_feed = 40 
WHERE margem_esquerda_feed IS NULL;
