-- Remover comentários sobre limitações e atualizar valores padrão
-- Os administradores agora têm controle total sobre espaçamentos

-- Comentário: Valores podem ser negativos para sobreposição
-- Valores muito altos podem fazer elementos saírem da tela
-- Valores muito baixos podem causar sobreposição indesejada

-- Atualizar campanhas existentes para garantir que não tenham valores NULL
UPDATE campanhas 
SET 
  espacamento_superior_feed = COALESCE(espacamento_superior_feed, 150),
  espacamento_superior_story = COALESCE(espacamento_superior_story, 200),
  espacamento_superior_a4 = COALESCE(espacamento_superior_a4, 100),
  espacamento_produto_textos_feed = COALESCE(espacamento_produto_textos_feed, 20),
  espacamento_produto_textos_story = COALESCE(espacamento_produto_textos_story, 20),
  espacamento_produto_textos_a4 = COALESCE(espacamento_produto_textos_a4, 20),
  tamanho_titulo_feed = COALESCE(tamanho_titulo_feed, 48),
  tamanho_descricao_feed = COALESCE(tamanho_descricao_feed, 32),
  tamanho_preco_feed = COALESCE(tamanho_preco_feed, 56),
  tamanho_titulo_story = COALESCE(tamanho_titulo_story, 52),
  tamanho_descricao_story = COALESCE(tamanho_descricao_story, 36),
  tamanho_preco_story = COALESCE(tamanho_preco_story, 64),
  tamanho_titulo_a4 = COALESCE(tamanho_titulo_a4, 36),
  tamanho_descricao_a4 = COALESCE(tamanho_descricao_a4, 24),
  tamanho_preco_a4 = COALESCE(tamanho_preco_a4, 48)
WHERE 
  espacamento_superior_feed IS NULL OR
  espacamento_superior_story IS NULL OR
  espacamento_superior_a4 IS NULL OR
  espacamento_produto_textos_feed IS NULL OR
  espacamento_produto_textos_story IS NULL OR
  espacamento_produto_textos_a4 IS NULL OR
  tamanho_titulo_feed IS NULL OR
  tamanho_descricao_feed IS NULL OR
  tamanho_preco_feed IS NULL OR
  tamanho_titulo_story IS NULL OR
  tamanho_descricao_story IS NULL OR
  tamanho_preco_story IS NULL OR
  tamanho_titulo_a4 IS NULL OR
  tamanho_descricao_a4 IS NULL OR
  tamanho_preco_a4 IS NULL;
