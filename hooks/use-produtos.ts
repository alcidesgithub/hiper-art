"use client"

import { useState, useEffect } from "react"
import { supabase, type Produto } from "@/lib/supabase"
import type { ProdutoExcel } from "@/lib/excel-utils"

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("produtos").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProdutos(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  const createProduto = async (produto: Omit<Produto, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("produtos").insert([produto]).select().single()

      if (error) throw error
      setProdutos((prev) => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao criar produto")
    }
  }

  const updateProduto = async (id: string, updates: Partial<Produto>) => {
    try {
      const { data, error } = await supabase
        .from("produtos")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setProdutos((prev) => prev.map((produto) => (produto.id === id ? data : produto)))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao atualizar produto")
    }
  }

  const deleteProduto = async (id: string) => {
    try {
      const { error } = await supabase.from("produtos").delete().eq("id", id)

      if (error) throw error
      setProdutos((prev) => prev.filter((produto) => produto.id !== id))
      return true
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao excluir produto")
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

  const getProdutosByCampanha = async (campanhaId: string): Promise<Produto[]> => {
    return fetchProdutosByCampanha(campanhaId)
  }

  const createProdutosBatch = async (campanhaId: string, produtosExcel: ProdutoExcel[]) => {
    try {
      const produtosToInsert = produtosExcel.map((produto) => ({
        campanha_id: campanhaId,
        nome: produto.nome,
        descricao: produto.descricao || "",
        preco: produto.preco,
        ean: produto.ean || "",
        club: produto.club ?? false,
        imagem_url: produto.imagem_url || "",
        imagem_path: produto.imagem_path || "",
      }))

      const { data, error } = await supabase.from("produtos").insert(produtosToInsert).select()

      if (error) throw error
      setProdutos((prev) => [...(data ?? []), ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao criar produtos em lote")
    }
  }

  const getCampaignStats = async (campanhaId: string) => {
    try {
      const { data, error } = await supabase.from("produtos").select("id").eq("campanha_id", campanhaId)

      if (error) throw error

      return {
        totalProdutos: data?.length || 0,
        produtosComImagem: data?.filter((p) => p.imagem_url).length || 0,
      }
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao obter estatísticas da campanha")
    }
  }

  useEffect(() => {
    fetchProdutos()
  }, [])

  return {
    produtos,
    loading,
    error,
    createProduto,
    updateProduto,
    deleteProduto,
    fetchProdutosByCampanha,
    getProdutosByCampanha,
    createProdutosBatch,
    getCampaignStats,
    refetch: fetchProdutos,
  }
}
