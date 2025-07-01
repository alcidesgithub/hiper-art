-- Adicionar campos de configuração de espaçamento para cada formato
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS espacamento_superior_feed INTEGER DEFAULT 150,
ADD COLUMN IF NOT EXISTS espacamento_superior_story INTEGER DEFAULT 200,
ADD COLUMN IF NOT EXISTS espacamento_superior_a4 INTEGER DEFAULT 100;

-- Atualizar campanhas existentes com valores padrão
UPDATE campanhas 
SET 
  espacamento_superior_feed = 150,
  espacamento_superior_story = 200,
  espacamento_superior_a4 = 100
WHERE espacamento_superior_feed IS NULL;
