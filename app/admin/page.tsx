"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, PlayIcon as Campaign, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

const dashboardCards = [
  {
    title: "Gerenciar Lojas",
    description: "Cadastrar e gerenciar lojas da rede",
    icon: Building2,
    href: "/admin/lojas",
    color: "bg-hiperfarma-blue",
  },
  {
    title: "Gerenciar Campanhas",
    description: "Criar e configurar campanhas promocionais",
    icon: Campaign,
    href: "/admin/campanhas",
    color: "bg-hiperfarma-yellow",
  },
  {
    title: "Gerenciar Administradores",
    description: "Controlar acesso de administradores",
    icon: Users,
    href: "/admin/administradores",
    color: "bg-hiperfarma-red",
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalLojas: 0,
    campanhasAtivas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Buscar total de lojas
        const { count: lojasCount } = await supabase.from("lojas").select("*", { count: "exact", head: true })

        // Buscar campanhas ativas
        const { count: campanhasCount } = await supabase
          .from("campanhas")
          .select("*", { count: "exact", head: true })
          .eq("status", "ativa")

        setStats({
          totalLojas: lojasCount || 0,
          campanhasAtivas: campanhasCount || 0,
        })
      } catch (error) {
        console.error("Erro ao buscar estatísticas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground mt-2">Bem-vindo ao painel de controle do Hiperfarma ArtGen</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center mb-3`}>
                  <card.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-lg">{card.title}</CardTitle>
                <CardDescription>{card.description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Total de Lojas:</span>
                <span className="font-semibold">{stats.totalLojas}</span>
              </div>
              <div className="flex justify-between">
                <span>Campanhas Ativas:</span>
                <span className="font-semibold">{stats.campanhasAtivas}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
