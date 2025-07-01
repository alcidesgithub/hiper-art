-- Adicionar colunas para armazenar os paths das imagens de fundo
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS fundo_feed_path TEXT,
ADD COLUMN IF NOT EXISTS fundo_story_path TEXT,
ADD COLUMN IF NOT EXISTS fundo_a4_path TEXT;

-- Atualizar a estrutura do campo fundos para incluir os paths
UPDATE campanhas 
SET fundos = jsonb_build_object(
  'feed', COALESCE(fundos->>'feed', ''),
  'story', COALESCE(fundos->>'story', ''),
  'a4', COALESCE(fundos->>'a4', ''),
  'feed_path', COALESCE(fundo_feed_path, ''),
  'story_path', COALESCE(fundo_story_path, ''),
  'a4_path', COALESCE(fundo_a4_path, '')
)
WHERE fundos IS NOT NULL;

-- Para campanhas sem fundos, inicializar com estrutura vazia
UPDATE campanhas 
SET fundos = jsonb_build_object(
  'feed', '',
  'story', '',
  'a4', '',
  'feed_path', '',
  'story_path', '',
  'a4_path', ''
)
WHERE fundos IS NULL;
