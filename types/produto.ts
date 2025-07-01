// Tipos relacionados a produtos
export interface Produto {
  id: string
  campanha_id: string
  nome: string
  descricao?: string | null
  preco: string
  ean?: string | null
  club?: boolean
  imagem_url?: string | null
  imagem_path?: string | null
  ordem?: number | null
  created_at: string
  updated_at: string
}

export interface ProdutoCreate extends Omit<Produto, "id" | "created_at" | "updated_at"> {}

export interface ProdutoUpdate extends Partial<Omit<Produto, "id" | "created_at">> {
  updated_at?: string
}

// Interface para produtos vindos do Excel
export interface ProdutoExcel {
  nome: string
  descricao?: string
  preco: string
  ean?: string
  club?: boolean
  imagem_url?: string
  imagem_path?: string
}

// Interface para estatísticas de produtos
export interface ProdutoStats {
  total: number
  com_imagem: number
  sem_imagem: number
  com_ean: number
  sem_ean: number
}

export default Produto
