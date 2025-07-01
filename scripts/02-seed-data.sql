-- Inserir dados iniciais de administradores
INSERT INTO administradores (nome, email, senha, ultimo_login) VALUES
('João Silva', 'admin@hiperfarma.com', 'admin123', NOW() - INTERVAL '2 hours'),
('Maria Santos', 'maria@hiperfarma.com', 'maria123', NOW() - INTERVAL '1 day')
ON CONFLICT (email) DO NOTHING;

-- Inserir dados iniciais de lojas
INSERT INTO lojas (codigo, nome, endereco, usuario, senha) VALUES
('HF001', 'Hiperfarma Centro', 'Rua Principal, 123 - Centro', 'loja@hiperfarma.com', 'loja123'),
('HF002', 'Hiperfarma Shopping', 'Shopping Center, Loja 45', 'shopping@hiperfarma.com', 'shop123')
ON CONFLICT (codigo) DO NOTHING;

-- Inserir campanhas iniciais
INSERT INTO campanhas (nome, tipo, cores) VALUES
('Promoção de Verão', 'customizada', '{"titulo": "#1a365d", "descricao": "#4a5568", "preco": "#e53e3e"}'),
('Mix Vitaminas', 'fixa', '{"titulo": "#2d3748", "descricao": "#718096", "preco": "#38a169"}')
ON CONFLICT DO NOTHING;

-- Inserir produtos para campanha fixa
INSERT INTO produtos (campanha_id, nome, descricao, preco, imagem_url)
SELECT 
  c.id,
  p.nome,
  p.descricao,
  p.preco,
  p.imagem_url
FROM campanhas c
CROSS JOIN (VALUES
  ('Vitamina C 1000mg', 'Suplemento vitamínico', 'R$ 29,90', '/placeholder.svg'),
  ('Complexo B', 'Vitaminas do complexo B', 'R$ 35,50', '/placeholder.svg'),
  ('Vitamina D3', 'Suplemento de vitamina D', 'R$ 42,00', '/placeholder.svg')
) AS p(nome, descricao, preco, imagem_url)
WHERE c.nome = 'Mix Vitaminas'
ON CONFLICT DO NOTHING;
