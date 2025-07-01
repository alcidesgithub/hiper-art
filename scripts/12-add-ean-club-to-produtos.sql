-- Adicionar colunas EAN e CLUB à tabela produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS ean VARCHAR(50),
ADD COLUMN IF NOT EXISTS club BOOLEAN DEFAULT false;

-- Criar índice para EAN para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_ean ON produtos(ean);

-- Comentários para documentação
COMMENT ON COLUMN produtos.ean IS 'Código EAN do produto para vinculação com imagens';
COMMENT ON COLUMN produtos.club IS 'Indica se o produto é do programa CLUB';
