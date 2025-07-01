"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabase"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Verificar se é administrador
      const { data: adminData, error: adminError } = await supabase
        .from("administradores")
        .select("*")
        .eq("email", email)
        .eq("senha", password)
        .eq("status", "ativo")
        .single()

      if (adminData && !adminError) {
        // Atualizar último login
        await supabase.from("administradores").update({ ultimo_login: new Date().toISOString() }).eq("id", adminData.id)

        localStorage.setItem("userType", "admin")
        localStorage.setItem("userEmail", email)
        localStorage.setItem("userName", adminData.nome)
        router.push("/admin")
        return
      }

      // Verificar se é loja
      const { data: lojaData, error: lojaError } = await supabase
        .from("lojas")
        .select("*")
        .eq("usuario", email)
        .eq("senha", password)
        .eq("status", "ativa")
        .single()

      if (lojaData && !lojaError) {
        localStorage.setItem("userType", "loja")
        localStorage.setItem("userEmail", email)
        localStorage.setItem("lojaId", lojaData.id)
        localStorage.setItem("lojaNome", lojaData.nome)
        router.push("/loja")
        return
      }

      setError("Credenciais inválidas ou usuário inativo")
    } catch (err) {
      setError("Erro ao fazer login. Tente novamente.")
      console.error("Erro no login:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fazer Login</CardTitle>
        <CardDescription>Entre com suas credenciais para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-mail</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Entrar
          </Button>
        </form>
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-sm">
          <p className="font-medium mb-2">Credenciais de teste:</p>
          <p>
            <strong>Admin:</strong> admin@hiperfarma.com / admin123
          </p>
          <p>
            <strong>Loja:</strong> loja@hiperfarma.com / loja123
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
