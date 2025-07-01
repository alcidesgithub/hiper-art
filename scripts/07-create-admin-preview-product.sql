-- Criar tabela para armazenar o produto de preview global dos administradores
CREATE TABLE IF NOT EXISTS admin_preview_product (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco VARCHAR(50) NOT NULL,
  imagem_url TEXT,
  imagem_path TEXT,
  ativo BOOLEAN DEFAULT true,
  created_by VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir produto padrão (Toalhas Umedecidas Mili)
INSERT INTO admin_preview_product (nome, descricao, preco, imagem_url, created_by, ativo) VALUES
('Toalhas Umedecidas Mili', 'Toalhas umedecidas para bebê com 100 unidades', 'R$ 12,90', '/assets/produto-exemplo-preview.png', 'sistema', true)
ON CONFLICT DO NOTHING;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_admin_preview_product_ativo ON admin_preview_product(ativo);
