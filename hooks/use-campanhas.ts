"use client"

import { useState, useEffect } from "react"
import { supabase, type Campanha, type Produto } from "@/lib/supabase"

export function useCampanhas() {
  const [campanhas, setCampanhas] = useState<Campanha[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCampanhas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("campanhas").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setCampanhas(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar campanhas")
    } finally {
      setLoading(false)
    }
  }

  const createCampanha = async (campanha: Omit<Campanha, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("campanhas").insert([campanha]).select().single()

      if (error) throw error
      setCampanhas((prev) => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao criar campanha")
    }
  }

  const updateCampanha = async (id: string, updates: Partial<Campanha>) => {
    try {
      const { data, error } = await supabase
        .from("campanhas")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setCampanhas((prev) => prev.map((campanha) => (campanha.id === id ? data : campanha)))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao atualizar campanha")
    }
  }

  const deleteCampanha = async (id: string) => {
    try {
      console.log("Iniciando exclusão completa da campanha:", id)

      // 1. Buscar a campanha para obter informações das imagens de fundo
      const { data: campanha, error: campanhaError } = await supabase
        .from("campanhas")
        .select("*")
        .eq("id", id)
        .single()

      if (campanhaError) {
        console.error("Erro ao buscar campanha:", campanhaError)
        throw campanhaError
      }

      console.log("Campanha encontrada:", campanha.nome)

      // 2. Buscar todos os produtos da campanha para obter imagens
      const { data: produtos, error: produtosError } = await supabase.from("produtos").select("*").eq("campanha_id", id)

      if (produtosError) {
        console.error("Erro ao buscar produtos:", produtosError)
        throw produtosError
      }

      console.log(`Encontrados ${produtos?.length || 0} produtos para exclusão`)

      // 3. Deletar imagens dos produtos do storage
      if (produtos && produtos.length > 0) {
        const imagensProdutos = produtos.filter((produto) => produto.imagem_path).map((produto) => produto.imagem_path)

        if (imagensProdutos.length > 0) {
          console.log("Deletando imagens dos produtos:", imagensProdutos)
          const { error: deleteImagensError } = await supabase.storage.from("produtos").remove(imagensProdutos)

          if (deleteImagensError) {
            console.warn("Erro ao deletar algumas imagens de produtos:", deleteImagensError)
            // Não falhar a operação por causa de imagens
          } else {
            console.log("Imagens dos produtos deletadas com sucesso")
          }
        }
      }

      // 4. Deletar imagens de fundo da campanha do storage
      const imagensFundo: string[] = []

      if (campanha.fundos?.feed_path) {
        imagensFundo.push(campanha.fundos.feed_path)
      }
      if (campanha.fundos?.story_path) {
        imagensFundo.push(campanha.fundos.story_path)
      }
      if (campanha.fundos?.a4_path) {
        imagensFundo.push(campanha.fundos.a4_path)
      }

      if (imagensFundo.length > 0) {
        console.log("Deletando imagens de fundo:", imagensFundo)
        const { error: deleteFundosError } = await supabase.storage.from("fundos-campanhas").remove(imagensFundo)

        if (deleteFundosError) {
          console.warn("Erro ao deletar algumas imagens de fundo:", deleteFundosError)
          // Não falhar a operação por causa de imagens
        } else {
          console.log("Imagens de fundo deletadas com sucesso")
        }
      }

      // 5. Deletar todos os produtos da campanha (cascade deve cuidar disso, mas vamos garantir)
      if (produtos && produtos.length > 0) {
        console.log("Deletando produtos da campanha")
        const { error: deleteProdutosError } = await supabase.from("produtos").delete().eq("campanha_id", id)

        if (deleteProdutosError) {
          console.error("Erro ao deletar produtos:", deleteProdutosError)
          throw deleteProdutosError
        }
        console.log("Produtos deletados com sucesso")
      }

      // 6. Deletar artes geradas relacionadas à campanha (se existirem)
      console.log("Verificando artes geradas da campanha")
      const { data: artes, error: artesError } = await supabase.from("artes_geradas").select("*").eq("campanha_id", id)

      if (!artesError && artes && artes.length > 0) {
        console.log(`Encontradas ${artes.length} artes geradas para exclusão`)

        // Deletar imagens das artes do storage
        const imagensArtes = artes.filter((arte) => arte.imagem_path).map((arte) => arte.imagem_path)

        if (imagensArtes.length > 0) {
          console.log("Deletando imagens das artes geradas:", imagensArtes)
          const { error: deleteArtesImagensError } = await supabase.storage.from("artes-geradas").remove(imagensArtes)

          if (deleteArtesImagensError) {
            console.warn("Erro ao deletar algumas imagens de artes:", deleteArtesImagensError)
          }
        }

        // Deletar registros das artes
        const { error: deleteArtesError } = await supabase.from("artes_geradas").delete().eq("campanha_id", id)

        if (deleteArtesError) {
          console.warn("Erro ao deletar registros de artes:", deleteArtesError)
        } else {
          console.log("Artes geradas deletadas com sucesso")
        }
      }

      // 7. Finalmente, deletar a campanha
      console.log("Deletando campanha do banco de dados")
      const { error: deleteCampanhaError } = await supabase.from("campanhas").delete().eq("id", id)

      if (deleteCampanhaError) {
        console.error("Erro ao deletar campanha:", deleteCampanhaError)
        throw deleteCampanhaError
      }

      console.log("Campanha deletada com sucesso!")

      // 8. Atualizar estado local
      setCampanhas((prev) => prev.filter((campanha) => campanha.id !== id))

      return true
    } catch (err) {
      console.error("Erro completo na exclusão da campanha:", err)
      throw new Error(err instanceof Error ? err.message : "Erro ao excluir campanha")
    }
  }

  const fetchProdutosByCampanha = async (campanhaId: string): Promise<Produto[]> => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .select("*")
        .eq("campanha_id", campanhaId)
        .order("created_at", { ascending: true })

      if (error) throw error
      return data || []
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao carregar produtos")
    }
  }

  useEffect(() => {
    fetchCampanhas()
  }, [])

  return {
    campanhas,
    loading,
    error,
    createCampanha,
    updateCampanha,
    deleteCampanha,
    fetchProdutosByCampanha,
    refetch: fetchCampanhas,
  }
}
