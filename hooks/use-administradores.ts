"use client"

import { useState, useEffect } from "react"
import { supabase, type Administrador } from "@/lib/supabase"

export function useAdministradores() {
  const [administradores, setAdministradores] = useState<Administrador[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchAdministradores = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("administradores")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) throw error
      setAdministradores(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar administradores")
    } finally {
      setLoading(false)
    }
  }

  const createAdministrador = async (admin: Omit<Administrador, "id" | "created_at" | "updated_at">) => {
    try {
      const { data, error } = await supabase.from("administradores").insert([admin]).select().single()

      if (error) throw error
      setAdministradores((prev) => [data, ...prev])
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao criar administrador")
    }
  }

  const updateAdministrador = async (id: string, updates: Partial<Administrador>) => {
    try {
      const { data, error } = await supabase
        .from("administradores")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      setAdministradores((prev) => prev.map((admin) => (admin.id === id ? data : admin)))
      return data
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao atualizar administrador")
    }
  }

  const deleteAdministrador = async (id: string) => {
    try {
      const { error } = await supabase.from("administradores").delete().eq("id", id)

      if (error) throw error
      setAdministradores((prev) => prev.filter((admin) => admin.id !== id))
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : "Erro ao excluir administrador")
    }
  }

  useEffect(() => {
    fetchAdministradores()
  }, [])

  return {
    administradores,
    loading,
    error,
    createAdministrador,
    updateAdministrador,
    deleteAdministrador,
    refetch: fetchAdministradores,
  }
}
