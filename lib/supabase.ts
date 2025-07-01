import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos do banco de dados
export interface Administrador {
  id: string
  nome: string
  email: string
  senha: string
  status: "ativo" | "inativo"
  ultimo_login?: string
  created_at: string
  updated_at: string
}

export interface Loja {
  id: string
  codigo: string
  nome: string
  endereco: string
  usuario: string
  senha: string
  selo_url?: string
  status: "ativa" | "inativa"
  created_at: string
  updated_at: string
}

export interface Campanha {
  id: string
  nome: string
  tipo: "fixa" | "customizada"
  status: "ativa" | "inativa"
  cores: {
    titulo: string
    descricao: string
    preco: string
  }
  fundos?: {
    feed?: string
    story?: string
    a4?: string
    feed_path?: string
    story_path?: string
    a4_path?: string
  }
  espacamento_superior_feed?: number
  espacamento_superior_story?: number
  espacamento_superior_a4?: number
  espacamento_produto_textos_feed?: number
  espacamento_produto_textos_story?: number
  espacamento_produto_textos_a4?: number
  tamanho_titulo_feed?: number
  tamanho_descricao_feed?: number
  tamanho_preco_feed?: number
  tamanho_titulo_story?: number
  tamanho_descricao_story?: number
  tamanho_preco_story?: number
  tamanho_titulo_a4?: number
  tamanho_descricao_a4?: number
  tamanho_preco_a4?: number
  quebra_linha_titulo_feed?: number
  quebra_linha_descricao_feed?: number
  quebra_linha_titulo_story?: number
  quebra_linha_descricao_story?: number
  quebra_linha_titulo_a4?: number
  quebra_linha_descricao_a4?: number
  tamanho_selo_feed?: number
  tamanho_selo_story?: number
  tamanho_selo_a4?: number
  margem_esquerda_feed?: number
  created_at: string
  updated_at: string
}

export interface Produto {
  id: string
  campanha_id: string
  nome: string
  descricao?: string
  preco: string
  ean?: string
  club?: boolean
  imagem_url?: string
  imagem_path?: string // Opcional - só existe após migração
  ordem?: number
  created_at: string
  updated_at: string
}

export interface AdminPreviewProduct {
  id: string
  nome: string
  descricao?: string
  preco: string
  imagem_url?: string
  created_at: string
  updated_at: string
}

// Tipos para geração de arte
export interface ProdutoData {
  nome: string
  descricao?: string
  preco: string
  imagem_url?: string
  ean?: string
  club?: boolean
}
