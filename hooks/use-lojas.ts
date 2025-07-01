"use client"

import { useState, useEffect } from "react"
import { supabase, type Loja } from "@/lib/supabase"

export function useLojas() {
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchLojas = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("lojas").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setLojas(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar lojas")
    } finally {
      setLoading(false)
    }
  }

  const createLoja = async (loja: Omit<Loja, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("lojas").insert([loja]).select().single()

      if (error) throw error
      setLojas((prev) => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao criar loja")
    }
  }

  const updateLoja = async (id: string, updates: Partial<Loja>) => {
    try {
      const { data, error } = await supabase
        .from("lojas")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setLojas((prev) => prev.map((loja) => (loja.id === id ? data : loja)))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao atualizar loja")
    }
  }

  const deleteLoja = async (id: string) => {
    try {
      const { error } = await supabase.from("lojas").delete().eq("id", id)

      if (error) throw error
      setLojas((prev) => prev.filter((loja) => loja.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao excluir loja")
    }
  }

  useEffect(() => {
    fetchLojas()
  }, [])

  return {
    lojas,
    loading,
    error,
    createLoja,
    updateLoja,
    deleteLoja,
    refetch: fetchLojas,
  }
}
