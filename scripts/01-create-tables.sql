-- Criar tabela de administradores
CREATE TABLE IF NOT EXISTS administradores (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de lojas
CREATE TABLE IF NOT EXISTS lojas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  nome VARCHAR(255) NOT NULL,
  endereco TEXT NOT NULL,
  usuario VARCHAR(255) UNIQUE NOT NULL,
  senha VARCHAR(255) NOT NULL,
  selo_url TEXT,
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de campanhas
CREATE TABLE IF NOT EXISTS campanhas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('fixa', 'customizada')),
  status VARCHAR(20) DEFAULT 'ativa' CHECK (status IN ('ativa', 'inativa')),
  cores JSONB NOT NULL DEFAULT '{"titulo": "#1a365d", "descricao": "#4a5568", "preco": "#e53e3e"}',
  fundos JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de produtos (para campanhas fixas)
CREATE TABLE IF NOT EXISTS produtos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  preco VARCHAR(50) NOT NULL,
  imagem_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de artes geradas
CREATE TABLE IF NOT EXISTS artes_geradas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  loja_id UUID REFERENCES lojas(id) ON DELETE CASCADE,
  campanha_id UUID REFERENCES campanhas(id) ON DELETE CASCADE,
  produto_nome VARCHAR(255) NOT NULL,
  produto_descricao TEXT,
  produto_preco VARCHAR(50) NOT NULL,
  formato VARCHAR(20) NOT NULL CHECK (formato IN ('feed', 'story', 'a4')),
  imagem_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_administradores_email ON administradores(email);
CREATE INDEX IF NOT EXISTS idx_lojas_codigo ON lojas(codigo);
CREATE INDEX IF NOT EXISTS idx_lojas_usuario ON lojas(usuario);
CREATE INDEX IF NOT EXISTS idx_campanhas_status ON campanhas(status);
CREATE INDEX IF NOT EXISTS idx_produtos_campanha ON produtos(campanha_id);
CREATE INDEX IF NOT EXISTS idx_artes_loja ON artes_geradas(loja_id);
CREATE INDEX IF NOT EXISTS idx_artes_campanha ON artes_geradas(campanha_id);
