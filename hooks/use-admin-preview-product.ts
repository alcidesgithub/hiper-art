"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface AdminPreviewProduct {
  id: string
  nome: string
  descricao?: string
  preco: string
  imagem_url?: string
  imagem_path?: string
  ativo: boolean
  created_by?: string
  created_at: string
  updated_at: string
}

export function useAdminPreviewProduct() {
  const [product, setProduct] = useState<AdminPreviewProduct | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchActiveProduct = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("admin_preview_product")
        .select("*")
        .eq("ativo", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned
        throw error
      }

      setProduct(data || null)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produto de preview")
      console.error("Erro ao buscar produto de preview:", err)
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (productData: {
    nome: string
    descricao?: string
    preco: string
    imagem_url?: string
    imagem_path?: string
  }) => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "admin"

      // Desativar produto atual
      if (product) {
        await supabase.from("admin_preview_product").update({ ativo: false }).eq("id", product.id)
      }

      // Criar novo produto ativo
      const { data, error } = await supabase
        .from("admin_preview_product")
        .insert([
          {
            ...productData,
            ativo: true,
            created_by: userEmail,
          },
        ])
        .select()
        .single()

      if (error) throw error

      setProduct(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao atualizar produto de preview"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  const resetToDefault = async () => {
    try {
      const userEmail = localStorage.getItem("userEmail") || "admin"

      // Desativar produto atual
      if (product) {
        await supabase.from("admin_preview_product").update({ ativo: false }).eq("id", product.id)
      }

      // Criar produto padrão
      const defaultProduct = {
        nome: "Toalhas Umedecidas Mili",
        descricao: "Toalhas umedecidas para bebê com 100 unidades",
        preco: "R$ 12,90",
        imagem_url: "/assets/produto-exemplo-preview.png",
        ativo: true,
        created_by: userEmail,
      }

      const { data, error } = await supabase.from("admin_preview_product").insert([defaultProduct]).select().single()

      if (error) throw error

      setProduct(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Erro ao resetar produto de preview"
      setError(errorMessage)
      throw new Error(errorMessage)
    }
  }

  useEffect(() => {
    fetchActiveProduct()
  }, [])

  return {
    product,
    loading,
    error,
    updateProduct,
    resetToDefault,
    refetch: fetchActiveProduct,
  }
}
