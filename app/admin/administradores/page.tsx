"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Shield, Loader2 } from "lucide-react"
import { useAdministradores } from "@/hooks/use-administradores"
import type { Administrador } from "@/lib/supabase"

export default function GerenciarAdministradores() {
  const { administradores, loading, error, createAdministrador, updateAdministrador, deleteAdministrador } =
    useAdministradores()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<Administrador | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    status: "ativo" as "ativo" | "inativo",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (editingAdmin) {
        await updateAdministrador(editingAdmin.id, formData)
      } else {
        await createAdministrador(formData)
      }
      resetForm()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar administrador")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      email: "",
      senha: "",
      status: "ativo",
    })
    setEditingAdmin(null)
    setIsDialogOpen(false)
    setSubmitError(null)
  }

  const handleEdit = (admin: Administrador) => {
    setEditingAdmin(admin)
    setFormData({
      nome: admin.nome,
      email: admin.email,
      senha: admin.senha,
      status: admin.status,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (admin: Administrador) => {
    if (admin.email === "admin@hiperfarma.com") {
      alert("Não é possível excluir o administrador principal")
      return
    }

    if (confirm(`Tem certeza que deseja excluir o administrador ${admin.nome}?`)) {
      try {
        await deleteAdministrador(admin.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir administrador")
      }
    }
  }

  const formatarData = (data?: string) => {
    if (!data) return "Nunca"
    return new Date(data).toLocaleString("pt-BR")
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Administradores</h1>
          <p className="text-muted-foreground">Controle o acesso de administradores ao sistema</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingAdmin(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Administrador
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{editingAdmin ? "Editar Administrador" : "Novo Administrador"}</DialogTitle>
              <DialogDescription>
                {editingAdmin
                  ? "Edite as informações do administrador"
                  : "Preencha os dados para cadastrar um novo administrador"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nome" className="text-right">
                    Nome
                  </Label>
                  <Input
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="email" className="text-right">
                    E-mail
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="senha" className="text-right">
                    Senha
                  </Label>
                  <Input
                    id="senha"
                    type="password"
                    value={formData.senha}
                    onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                    className="col-span-3"
                    required
                  />
                </div>
              </div>
              {submitError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{submitError}</AlertDescription>
                </Alert>
              )}
              <DialogFooter>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingAdmin ? "Salvar" : "Cadastrar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Administradores do Sistema
          </CardTitle>
          <CardDescription>Lista de todos os administradores com acesso ao painel</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {administradores.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.nome}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>
                    <Badge variant={admin.status === "ativo" ? "default" : "secondary"}>{admin.status}</Badge>
                  </TableCell>
                  <TableCell>{formatarData(admin.ultimo_login)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(admin)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(admin)}
                        disabled={admin.email === "admin@hiperfarma.com"}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
