-- Completar funcionalidades de campanhas fixas
-- Adicionar todas as colunas necessárias para produtos

-- 1. Adicionar coluna ordem para reordenação de produtos
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS ordem INTEGER DEFAULT 0;

-- 2. Adicionar coluna imagem_path para armazenar caminho no storage
ALTER TABLE produtos 
ADD COLUMN IF NOT EXISTS imagem_path TEXT;

-- 3. Adicionar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_produtos_campanha_ordem ON produtos(campanha_id, ordem);
CREATE INDEX IF NOT EXISTS idx_produtos_ean ON produtos(ean);
CREATE INDEX IF NOT EXISTS idx_produtos_imagem_path ON produtos(imagem_path);

-- 4. Atualizar produtos existentes com ordem baseada na data de criação
UPDATE produtos 
SET ordem = (
  SELECT ROW_NUMBER() OVER (PARTITION BY campanha_id ORDER BY created_at) - 1
  FROM produtos p2 
  WHERE p2.id = produtos.id
)
WHERE ordem = 0 OR ordem IS NULL;

-- 5. Adicionar função para reordenar produtos automaticamente
CREATE OR REPLACE FUNCTION reorder_produtos_after_delete()
RETURNS TRIGGER AS $$
BEGIN
  -- Reordenar produtos restantes da mesma campanha
  UPDATE produtos 
  SET ordem = new_ordem - 1
  FROM (
    SELECT id, ROW_NUMBER() OVER (ORDER BY ordem, created_at) as new_ordem
    FROM produtos 
    WHERE campanha_id = OLD.campanha_id
  ) as reordered
  WHERE produtos.id = reordered.id;
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- 6. Criar trigger para reordenação automática após exclusão
DROP TRIGGER IF EXISTS trigger_reorder_produtos_after_delete ON produtos;
CREATE TRIGGER trigger_reorder_produtos_after_delete
  AFTER DELETE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION reorder_produtos_after_delete();

-- 7. Adicionar comentários para documentação
COMMENT ON COLUMN produtos.ordem IS 'Ordem de exibição dos produtos na campanha (0 = primeiro)';
COMMENT ON COLUMN produtos.imagem_path IS 'Caminho da imagem no storage do Supabase';
COMMENT ON COLUMN produtos.ean IS 'Código EAN do produto para vinculação com imagens';
COMMENT ON COLUMN produtos.club IS 'Indica se o produto é do programa CLUB';

-- 8. Criar view para facilitar consultas de produtos com informações da campanha
CREATE OR REPLACE VIEW produtos_with_campaign AS
SELECT 
  p.*,
  c.nome as campanha_nome,
  c.tipo as campanha_tipo,
  c.status as campanha_status
FROM produtos p
JOIN campanhas c ON p.campanha_id = c.id;

-- 9. Adicionar função para validar dados de produtos
CREATE OR REPLACE FUNCTION validate_produto_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Validar nome obrigatório
  IF NEW.nome IS NULL OR trim(NEW.nome) = '' THEN
    RAISE EXCEPTION 'Nome do produto é obrigatório';
  END IF;
  
  -- Validar preço obrigatório
  IF NEW.preco IS NULL OR trim(NEW.preco) = '' THEN
    RAISE EXCEPTION 'Preço do produto é obrigatório';
  END IF;
  
  -- Validar EAN único por campanha (se fornecido)
  IF NEW.ean IS NOT NULL AND trim(NEW.ean) != '' THEN
    IF EXISTS (
      SELECT 1 FROM produtos 
      WHERE campanha_id = NEW.campanha_id 
      AND ean = NEW.ean 
      AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
    ) THEN
      RAISE EXCEPTION 'EAN já existe nesta campanha: %', NEW.ean;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Criar trigger para validação de dados
DROP TRIGGER IF EXISTS trigger_validate_produto_data ON produtos;
CREATE TRIGGER trigger_validate_produto_data
  BEFORE INSERT OR UPDATE ON produtos
  FOR EACH ROW
  EXECUTE FUNCTION validate_produto_data();

-- 11. Adicionar estatísticas para campanhas fixas
CREATE OR REPLACE VIEW campaign_stats AS
SELECT 
  c.id,
  c.nome,
  c.tipo,
  c.status,
  COUNT(p.id) as total_produtos,
  COUNT(CASE WHEN p.imagem_url IS NOT NULL THEN 1 END) as produtos_com_imagem,
  COUNT(CASE WHEN p.ean IS NOT NULL AND trim(p.ean) != '' THEN 1 END) as produtos_com_ean,
  COUNT(CASE WHEN p.club = true THEN 1 END) as produtos_club,
  c.created_at,
  c.updated_at
FROM campanhas c
LEFT JOIN produtos p ON c.id = p.campanha_id
GROUP BY c.id, c.nome, c.tipo, c.status, c.created_at, c.updated_at;
