"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Plus,
  Edit,
  Trash2,
  ImageIcon,
  Package,
  Loader2,
  ArrowUp,
  ArrowDown,
  Save,
  X,
  Copy,
  BarChart3,
  FileSpreadsheet,
  Download,
} from "lucide-react"
import { ImageUpload } from "@/components/image-upload"
import { useProdutos } from "@/hooks/use-produtos"
import { ExcelUpload } from "@/components/excel-upload"
import { ProductImagesUpload } from "@/components/product-images-upload"
import { downloadExcelTemplate } from "@/lib/excel-utils"
import type { Produto } from "@/lib/supabase"
import type { ProdutoExcel } from "@/lib/excel-utils"

interface ProdutoManagementProps {
  campanhaId: string
  campanhaName: string
  onProdutosChange?: () => void
}

export function ProdutoManagement({ campanhaId, campanhaName, onProdutosChange }: ProdutoManagementProps) {
  const {
    getProdutosByCampanha,
    createProduto,
    createProdutosBatch,
    updateProduto,
    deleteProduto,
    duplicateProduto,
    reorderProdutos,
    getCampaignStats,
  } = useProdutos()

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
  const [editingProduto, setEditingProduto] = useState<Produto | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Estados para upload em lote
  const [produtosExcel, setProdutosExcel] = useState<ProdutoExcel[]>([])

  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    ean: "",
    club: false,
    imagem_url: "",
    imagem_path: "",
  })

  const fetchProdutos = async () => {
    try {
      setLoading(true)
      setError(null)
      const [produtosList, statsData] = await Promise.all([
        getProdutosByCampanha(campanhaId),
        getCampaignStats(campanhaId),
      ])
      setProdutos(produtosList)
      setStats(statsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar produtos")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (campanhaId) {
      fetchProdutos()
    }
  }, [campanhaId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const produtoData = {
        campanha_id: campanhaId,
        nome: formData.nome,
        descricao: formData.descricao || "",
        preco: formData.preco,
        ean: formData.ean || "",
        club: formData.club,
        imagem_url: formData.imagem_url || "",
        imagem_path: formData.imagem_path || "",
        ordem: editingProduto ? editingProduto.ordem : produtos.length,
      }

      if (editingProduto) {
        await updateProduto(editingProduto.id, produtoData)
      } else {
        await createProduto(produtoData)
      }

      await fetchProdutos()
      resetForm()
      onProdutosChange?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar produto")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBulkUpload = async () => {
    if (produtosExcel.length === 0) {
      setSubmitError("Nenhum produto para importar")
      return
    }

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      await createProdutosBatch(campanhaId, produtosExcel)
      await fetchProdutos()
      setProdutosExcel([])
      setIsBulkDialogOpen(false)
      onProdutosChange?.()
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Erro ao importar produtos")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      descricao: "",
      preco: "",
      ean: "",
      club: false,
      imagem_url: "",
      imagem_path: "",
    })
    setEditingProduto(null)
    setIsDialogOpen(false)
    setSubmitError(null)
  }

  const handleEdit = (produto: Produto) => {
    setEditingProduto(produto)
    setFormData({
      nome: produto.nome,
      descricao: produto.descricao || "",
      preco: produto.preco,
      ean: produto.ean || "",
      club: produto.club || false,
      imagem_url: produto.imagem_url || "",
      imagem_path: produto.imagem_path || "",
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (produto: Produto) => {
    if (
      confirm(
        `Tem certeza que deseja excluir o produto "${produto.nome}"?\n\nEsta ação também removerá a imagem do produto do sistema.`,
      )
    ) {
      try {
        await deleteProduto(produto.id)
        await fetchProdutos()
        onProdutosChange?.()
      } catch (err) {
        alert(err instanceof Error ? err.message : "Erro ao excluir produto")
      }
    }
  }

  const handleDuplicate = async (produto: Produto) => {
    try {
      await duplicateProduto(produto.id)
      await fetchProdutos()
      onProdutosChange?.()
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao duplicar produto")
    }
  }

  const handleImageUpload = (url: string, path: string) => {
    setFormData((prev) => ({
      ...prev,
      imagem_url: url,
      imagem_path: path,
    }))
  }

  const handleImageRemove = () => {
    setFormData((prev) => ({
      ...prev,
      imagem_url: "",
      imagem_path: "",
    }))
  }

  const moveProduct = async (produto: Produto, direction: "up" | "down") => {
    const currentIndex = produtos.findIndex((p) => p.id === produto.id)
    if ((direction === "up" && currentIndex === 0) || (direction === "down" && currentIndex === produtos.length - 1)) {
      return
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1
    const otherProduct = produtos[newIndex]

    try {
      await updateProduto(produto.id, { ordem: otherProduct.ordem })
      await updateProduto(otherProduct.id, { ordem: produto.ordem })

      await fetchProdutos()
      onProdutosChange?.()
    } catch (err) {
      alert("Erro ao reordenar produtos")
    }
  }

  const handleProdutosExcelLoaded = (produtos: ProdutoExcel[]) => {
    setProdutosExcel(produtos)
  }

  const handleImagesUploaded = (produtosComImagens: ProdutoExcel[]) => {
    setProdutosExcel(produtosComImagens)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas da Campanha
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total_produtos}</div>
                <div className="text-sm text-muted-foreground">Total de Produtos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.produtos_com_imagem}</div>
                <div className="text-sm text-muted-foreground">Com Imagem</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.produtos_com_ean}</div>
                <div className="text-sm text-muted-foreground">Com EAN</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.produtos_club}</div>
                <div className="text-sm text-muted-foreground">CLUB</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gerenciamento de Produtos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Produtos da Campanha: {campanhaName}
            </CardTitle>
            <div className="flex gap-2">
              <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    Importar Excel
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Importar Produtos via Excel</DialogTitle>
                    <DialogDescription>Faça upload de uma planilha Excel com os produtos da campanha</DialogDescription>
                  </DialogHeader>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Template Excel</h4>
                      <Button type="button" variant="outline" onClick={() => downloadExcelTemplate()}>
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Template
                      </Button>
                    </div>

                    <ExcelUpload onUpload={handleProdutosExcelLoaded} isUploading={isSubmitting} />

                    {produtosExcel.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{produtosExcel.length} produtos carregados</Badge>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3 flex items-center gap-2">
                            <ImageIcon className="h-4 w-4" />
                            Upload das Imagens (Opcional)
                          </h4>
                          <ProductImagesUpload produtos={produtosExcel} onImagesUploaded={handleImagesUploaded} />
                        </div>
                      </div>
                    )}

                    {submitError && (
                      <Alert variant="destructive">
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleBulkUpload} disabled={isSubmitting || produtosExcel.length === 0}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Importar {produtosExcel.length} Produtos
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingProduto(null)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>{editingProduto ? "Editar Produto" : "Novo Produto"}</DialogTitle>
                    <DialogDescription>
                      {editingProduto ? "Edite as informações do produto" : "Adicione um novo produto à campanha fixa"}
                    </DialogDescription>
                  </DialogHeader>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome do Produto *</Label>
                          <Input
                            id="nome"
                            value={formData.nome}
                            onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                            placeholder="Ex: Vitamina C 1000mg"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="preco">Preço *</Label>
                          <Input
                            id="preco"
                            value={formData.preco}
                            onChange={(e) => setFormData((prev) => ({ ...prev, preco: e.target.value }))}
                            placeholder="R$ 29,90"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="ean">Código EAN</Label>
                          <Input
                            id="ean"
                            value={formData.ean}
                            onChange={(e) => setFormData((prev) => ({ ...prev, ean: e.target.value }))}
                            placeholder="7891234567890"
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="club"
                            checked={formData.club}
                            onCheckedChange={(checked) =>
                              setFormData((prev) => ({ ...prev, club: checked as boolean }))
                            }
                          />
                          <Label htmlFor="club">Produto CLUB</Label>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="descricao">Descrição</Label>
                          <Textarea
                            id="descricao"
                            value={formData.descricao}
                            onChange={(e) => setFormData((prev) => ({ ...prev, descricao: e.target.value }))}
                            placeholder="Descrição do produto..."
                            rows={3}
                          />
                        </div>

                        <div>
                          <Label>Imagem do Produto</Label>
                          <div className="mt-2">
                            <ImageUpload
                              bucket="produtos"
                              folder={`campanha-${campanhaId}`}
                              currentImageUrl={formData.imagem_url}
                              currentImagePath={formData.imagem_path}
                              onUploadComplete={handleImageUpload}
                              onRemove={handleImageRemove}
                              placeholder="Selecione a imagem do produto"
                              className="max-w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {submitError && (
                      <Alert variant="destructive">
                        <AlertDescription>{submitError}</AlertDescription>
                      </Alert>
                    )}

                    <DialogFooter>
                      <Button type="button" variant="outline" onClick={resetForm}>
                        <X className="mr-2 h-4 w-4" />
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {editingProduto ? "Salvar" : "Adicionar"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {produtos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Nenhum produto cadastrado nesta campanha</p>
              <p className="text-sm mt-2">Adicione produtos para que as lojas possam gerar artes</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{produtos.length} produto(s) cadastrado(s)</p>
                <Badge variant="outline">Campanha Fixa</Badge>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">Ordem</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>EAN</TableHead>
                    <TableHead>CLUB</TableHead>
                    <TableHead>Imagem</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {produtos.map((produto, index) => (
                    <TableRow key={produto.id}>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveProduct(produto, "up")}
                            disabled={index === 0}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowUp className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveProduct(produto, "down")}
                            disabled={index === produtos.length - 1}
                            className="h-6 w-6 p-0"
                          >
                            <ArrowDown className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{produto.nome}</div>
                          {produto.descricao && (
                            <div className="text-sm text-muted-foreground line-clamp-2">{produto.descricao}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-green-600">{produto.preco}</TableCell>
                      <TableCell>
                        {produto.ean ? (
                          <Badge variant="outline" className="text-xs">
                            {produto.ean}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {produto.club ? (
                          <Badge variant="secondary" className="text-xs">
                            CLUB
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {produto.imagem_url ? (
                          <img
                            src={produto.imagem_url || "/placeholder.svg"}
                            alt={produto.nome}
                            className="w-12 h-12 object-cover rounded border"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded border flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-gray-400" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleDuplicate(produto)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(produto)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(produto)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
