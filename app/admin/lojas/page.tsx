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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Edit, Trash2, Loader2, ImageIcon } from "lucide-react"
import { useLojas } from "@/hooks/use-lojas"
import { ImageUpload } from "@/components/image-upload"
import type { Loja } from "@/lib/supabase"

export default function GerenciarLojas() {
  const { lojas, loading, error, createLoja, updateLoja, deleteLoja } = useLojas()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingLoja, setEditingLoja] = useState<Loja | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dados")
  const [formData, setFormData] = useState({
    codigo: "",
    nome: "",
    endereco: "",
    usuario: "",
    senha: "",
    status: "ativa" as "ativa" | "inativa",
    selo_url: "",
    selo_path: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const dataToSave = {
        codigo: formData.codigo,
        nome: formData.nome,
        endereco: formData.endereco,
        usuario: formData.usuario,
        senha: formData.senha,
        status: formData.status,
        selo_url: formData.selo_url || null,
      }

      if (editingLoja) {
        await updateLoja(editingLoja.id, dataToSave)
      } else {
        await createLoja(dataToSave)
      }
      resetForm()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar loja")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      codigo: "",
      nome: "",
      endereco: "",
      usuario: "",
      senha: "",
      status: "ativa",
      selo_url: "",
      selo_path: "",
    })
    setEditingLoja(null)
    setIsDialogOpen(false)
    setSubmitError(null)
    setActiveTab("dados")
  }

  const handleEdit = (loja: Loja) => {
    setEditingLoja(loja)
    setFormData({
      codigo: loja.codigo,
      nome: loja.nome,
      endereco: loja.endereco,
      usuario: loja.usuario,
      senha: loja.senha,
      status: loja.status,
      selo_url: loja.selo_url || "",
      selo_path: "", // Não temos o path salvo, será extraído da URL se necessário
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (loja: Loja) => {
    if (confirm(`Tem certeza que deseja excluir a loja ${loja.nome}?`)) {
      try {
        await deleteLoja(loja.id)
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir loja")
      }
    }
  }

  const handleSeloUpload = (url: string, path: string) => {
    setFormData({
      ...formData,
      selo_url: url,
      selo_path: path,
    })
  }

  const handleSeloRemove = () => {
    setFormData({
      ...formData,
      selo_url: "",
      selo_path: "",
    })
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
          <h1 className="text-3xl font-bold">Gerenciar Lojas</h1>
          <p className="text-muted-foreground">Cadastre e gerencie as lojas da rede</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingLoja(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingLoja ? "Editar Loja" : "Nova Loja"}</DialogTitle>
              <DialogDescription>
                {editingLoja ? "Edite as informações da loja" : "Preencha os dados para cadastrar uma nova loja"}
              </DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="dados">Dados</TabsTrigger>
                <TabsTrigger value="selo">Selo</TabsTrigger>
              </TabsList>

              <form onSubmit={handleSubmit}>
                <TabsContent value="dados" className="space-y-4">
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="codigo" className="text-right">
                        Código
                      </Label>
                      <Input
                        id="codigo"
                        value={formData.codigo}
                        onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
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
                      <Label htmlFor="endereco" className="text-right">
                        Endereço
                      </Label>
                      <Input
                        id="endereco"
                        value={formData.endereco}
                        onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                        className="col-span-3"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="usuario" className="text-right">
                        Usuário
                      </Label>
                      <Input
                        id="usuario"
                        type="email"
                        value={formData.usuario}
                        onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
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
                </TabsContent>

                <TabsContent value="selo" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">Selo da Loja</Label>
                      <p className="text-sm text-muted-foreground mb-4">
                        Faça upload do selo/logo da loja que será usado nas artes geradas
                      </p>
                      <ImageUpload
                        bucket="selos"
                        folder={formData.codigo || "temp"}
                        currentImageUrl={formData.selo_url}
                        currentImagePath={formData.selo_path}
                        onUploadComplete={handleSeloUpload}
                        onRemove={handleSeloRemove}
                        placeholder="Selecione o selo da loja"
                        className="max-w-md"
                      />
                    </div>
                  </div>
                </TabsContent>

                {submitError && (
                  <Alert variant="destructive" className="mt-4">
                    <AlertDescription>{submitError}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter className="mt-6">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingLoja ? "Salvar" : "Cadastrar"}
                  </Button>
                </DialogFooter>
              </form>
            </Tabs>
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
          <CardTitle>Lojas Cadastradas</CardTitle>
          <CardDescription>Lista de todas as lojas da rede Hiperfarma</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Selo</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {lojas.map((loja) => (
                <TableRow key={loja.id}>
                  <TableCell className="font-medium">{loja.codigo}</TableCell>
                  <TableCell>{loja.nome}</TableCell>
                  <TableCell>{loja.endereco}</TableCell>
                  <TableCell>{loja.usuario}</TableCell>
                  <TableCell>
                    <Badge variant={loja.status === "ativa" ? "default" : "secondary"}>{loja.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {loja.selo_url ? (
                      <div className="flex items-center gap-2">
                        <img
                          src={loja.selo_url || "/placeholder.svg"}
                          alt="Selo"
                          className="w-8 h-8 object-cover rounded"
                        />
                        <span className="text-sm text-green-600">✓</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ImageIcon className="w-4 h-4" />
                        <span className="text-sm">Sem selo</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(loja)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(loja)}>
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
