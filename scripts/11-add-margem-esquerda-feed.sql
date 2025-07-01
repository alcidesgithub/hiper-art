-- Adicionar coluna margem_esquerda_feed na tabela campanhas
ALTER TABLE campanhas 
ADD COLUMN margem_esquerda_feed INTEGER DEFAULT 40;

-- Comentário explicativo
COMMENT ON COLUMN campanhas.margem_esquerda_feed IS 'Margem esquerda em pixels para o formato Feed (padrão: 40px)';
