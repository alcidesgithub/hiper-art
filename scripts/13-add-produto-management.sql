-- Adicionar campo ordem aos produtos para permitir reordenação
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- Atualizar produtos existentes com ordem baseada na data de criação
UPDATE produtos 
SET ordem = (
  SELECT ROW_NUMBER() OVER (PARTITION BY campanha_id ORDER BY created_at) - 1
  FROM produtos p2 
  WHERE p2.id = produtos.id
)
WHERE ordem = 0;

-- Adicionar campo imagem_path se não existir
ALTER TABLE produtos ADD COLUMN IF NOT EXISTS imagem_path TEXT;

-- Criar índice para melhor performance na ordenação
CREATE INDEX IF NOT EXISTS idx_produtos_campanha_ordem ON produtos(campanha_id, ordem);

-- Comentários para documentação
COMMENT ON COLUMN produtos.ordem IS 'Ordem de exibição dos produtos na campanha (0 = primeiro)';
COMMENT ON COLUMN produtos.imagem_path IS 'Caminho da imagem no storage do Supabase';
