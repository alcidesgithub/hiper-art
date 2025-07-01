-- Adicionar campos de configuração de quebra de linha para títulos e descrições
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS quebra_linha_titulo_feed INTEGER DEFAULT 30,
ADD COLUMN IF NOT EXISTS quebra_linha_descricao_feed INTEGER DEFAULT 40,
ADD COLUMN IF NOT EXISTS quebra_linha_titulo_story INTEGER DEFAULT 25,
ADD COLUMN IF NOT EXISTS quebra_linha_descricao_story INTEGER DEFAULT 35,
ADD COLUMN IF NOT EXISTS quebra_linha_titulo_a4 INTEGER DEFAULT 35,
ADD COLUMN IF NOT EXISTS quebra_linha_descricao_a4 INTEGER DEFAULT 45;

-- Atualizar campanhas existentes com valores padrão
UPDATE campanhas 
SET 
  quebra_linha_titulo_feed = 30,
  quebra_linha_descricao_feed = 40,
  quebra_linha_titulo_story = 25,
  quebra_linha_descricao_story = 35,
  quebra_linha_titulo_a4 = 35,
  quebra_linha_descricao_a4 = 45
WHERE quebra_linha_titulo_feed IS NULL;

-- Comentário: Os valores representam o número máximo de caracteres por linha
-- Valores menores = mais quebras de linha (texto mais vertical)
-- Valores maiores = menos quebras de linha (texto mais horizontal)
-- Valor 0 = sem quebra automática (uma linha só)
