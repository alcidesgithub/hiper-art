-- Adicionar campos de configuração de tamanho do selo para cada formato
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS tamanho_selo_feed INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS tamanho_selo_story INTEGER DEFAULT 100,
ADD COLUMN IF NOT EXISTS tamanho_selo_a4 INTEGER DEFAULT 100;

-- Atualizar campanhas existentes com valores padrão
UPDATE campanhas 
SET 
  tamanho_selo_feed = 100,
  tamanho_selo_story = 100,
  tamanho_selo_a4 = 100
WHERE tamanho_selo_feed IS NULL;

-- Comentário: Os valores representam o tamanho em pixels do selo
-- Valores menores = selo menor
-- Valores maiores = selo maior
-- Valor 0 = selo oculto (não será exibido)

-- Adicionar campo de configuração de margem esquerda para o Feed
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS margem_esquerda_feed INTEGER DEFAULT 40;

-- Atualizar campanhas existentes com valor padrão
UPDATE campanhas 
SET margem_esquerda_feed = 40
WHERE margem_esquerda_feed IS NULL;

-- Comentário: A margem esquerda controla o espaçamento da borda esquerda da tela
-- Valores menores = conteúdo mais próximo da borda
-- Valores maiores = conteúdo mais afastado da borda
-- Valor 0 = sem margem (conteúdo colado na borda)
