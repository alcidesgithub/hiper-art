-- scripts/14-add-imagem-path-to-produtos.sql
-- Adiciona a coluna imagem_path à tabela produtos

ALTER TABLE produtos
ADD COLUMN IF NOT EXISTS imagem_path TEXT;

COMMENT ON COLUMN produtos.imagem_path IS 'Caminho interno da imagem do produto no Supabase Storage';

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_imagem_path ON produtos(imagem_path);
