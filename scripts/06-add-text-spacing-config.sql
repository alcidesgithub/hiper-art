-- Adicionar campos de configuração de espaçamento entre produto e textos
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS espacamento_produto_textos_feed INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS espacamento_produto_textos_story INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS espacamento_produto_textos_a4 INTEGER DEFAULT 20;

-- Adicionar campos de configuração de tamanhos de fonte para Feed
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS tamanho_titulo_feed INTEGER DEFAULT 48,
ADD COLUMN IF NOT EXISTS tamanho_descricao_feed INTEGER DEFAULT 32,
ADD COLUMN IF NOT EXISTS tamanho_preco_feed INTEGER DEFAULT 56;

-- Adicionar campos de configuração de tamanhos de fonte para Story
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS tamanho_titulo_story INTEGER DEFAULT 52,
ADD COLUMN IF NOT EXISTS tamanho_descricao_story INTEGER DEFAULT 36,
ADD COLUMN IF NOT EXISTS tamanho_preco_story INTEGER DEFAULT 64;

-- Adicionar campos de configuração de tamanhos de fonte para A4
ALTER TABLE campanhas 
ADD COLUMN IF NOT EXISTS tamanho_titulo_a4 INTEGER DEFAULT 36,
ADD COLUMN IF NOT EXISTS tamanho_descricao_a4 INTEGER DEFAULT 24,
ADD COLUMN IF NOT EXISTS tamanho_preco_a4 INTEGER DEFAULT 48;

-- Atualizar campanhas existentes com valores padrão
UPDATE campanhas 
SET 
  espacamento_produto_textos_feed = 20,
  espacamento_produto_textos_story = 20,
  espacamento_produto_textos_a4 = 20,
  tamanho_titulo_feed = 48,
  tamanho_descricao_feed = 32,
  tamanho_preco_feed = 56,
  tamanho_titulo_story = 52,
  tamanho_descricao_story = 36,
  tamanho_preco_story = 64,
  tamanho_titulo_a4 = 36,
  tamanho_descricao_a4 = 24,
  tamanho_preco_a4 = 48
WHERE espacamento_produto_textos_feed IS NULL;

-- Comentário: Os valores padrão permanecem os mesmos, mas agora 0 é um valor válido
-- Não é necessário alterar os valores padrão, apenas a validação no frontend
