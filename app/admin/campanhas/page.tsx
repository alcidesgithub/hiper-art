"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Edit, Trash2, Loader2, FileSpreadsheet, ImageIcon, Download, Package } from "lucide-react"
import { useCampanhas } from "@/hooks/use-campanhas"
import { useLojas } from "@/hooks/use-lojas"
import { useProdutos } from "@/hooks/use-produtos"
import { ImageUpload } from "@/components/image-upload"
import { ExcelUpload } from "@/components/excel-upload"
import { ProductImagesUpload } from "@/components/product-images-upload"
import { ProdutoManagement } from "@/components/produto-management"
import { downloadExcelTemplate } from "@/lib/excel-utils"
import type { Campanha } from "@/lib/supabase"
import type { ProdutoExcel } from "@/lib/excel-utils"

interface FormDataState {
  nome: string
  tipo: "fixa" | "customizada"
  status: "ativa" | "inativa"
  cores: {
    titulo: string
    descricao: string
    preco: string
  }
  fundos: {
    feed: string
    story: string
    a4: string
    feed_path: string
    story_path: string
    story_path: string
    a4_path: string
  }
  espacamento_superior_feed: number
  espacamento_superior_story: number
  espacamento_superior_a4: number
  tamanho_titulo_feed: number
  tamanho_descricao_feed: number
  tamanho_preco_feed: number
  tamanho_titulo_story: number
  tamanho_descricao_story: number
  tamanho_preco_story: number
  tamanho_titulo_a4: number
  tamanho_descricao_a4: number
  tamanho_preco_a4: number
  tamanho_selo_feed: number
  tamanho_selo_story: number
  tamanho_selo_a4: number
  altura_imagem_feed: number
  altura_imagem_story: number
  altura_imagem_a4: number
}

export default function GerenciarCampanhas() {
  const { campanhas, loading, error, createCampanha, updateCampanha, deleteCampanha } = useCampanhas()
  const { lojas } = useLojas()
  const { createProdutosBatch } = useProdutos()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCampanha, setEditingCampanha] = useState<Campanha | null>(null)
  const [activeTab, setActiveTab] = useState("dados")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Estados para gerenciamento de produtos
  const [showProdutoManagement, setShowProdutoManagement] = useState<string | null>(null)

  // Estados para campanha fixa
  const [produtosExcel, setProdutosExcel] = useState<ProdutoExcel[]>([])
  const [uploadedImages, setUploadedImages] = useState<any[]>([])

  const [formData, setFormData] = useState<FormDataState>({
    nome: "",
    tipo: "customizada",
    status: "ativa",
    cores: {
      titulo: "#1a365d",
      descricao: "#4a5568",
      preco: "#e53e3e",
    },
    fundos: {
      feed: "",
      story: "",
      a4: "",
      feed_path: "",
      story_path: "",
      a4_path: "",
    },
    espacamento_superior_feed: 0,
    espacamento_superior_story: 0,
    espacamento_superior_a4: 0,
    tamanho_titulo_feed: 65, // 65pt padrão para Feed
    tamanho_descricao_feed: 55, // 55pt padrão para Feed
    tamanho_preco_feed: 70, // 70pt padrão para Feed
    tamanho_titulo_story: 85, // 85pt padrão para Story
    tamanho_descricao_story: 80, // 80pt padrão para Story
    tamanho_preco_story: 90, // 90pt padrão para Story
    tamanho_titulo_a4: 40, // 40pt padrão para A4
    tamanho_descricao_a4: 35, // 35pt padrão para A4
    tamanho_preco_a4: 50, // 50pt padrão para A4
    tamanho_selo_feed: 200,
    tamanho_selo_story: 200,
    tamanho_selo_a4: 120,
    altura_imagem_feed: 580,
    altura_imagem_story: 580,
    altura_imagem_a4: 355,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const dataToSave = {
        nome: formData.nome,
        tipo: formData.tipo,
        status: formData.status,
        cores: formData.cores,
        fundos: formData.fundos,
        espacamento_superior_feed: formData.espacamento_superior_feed,
        espacamento_superior_story: formData.espacamento_superior_story,
        espacamento_superior_a4: formData.espacamento_superior_a4,
        tamanho_titulo_feed: formData.tamanho_titulo_feed,
        tamanho_descricao_feed: formData.tamanho_descricao_feed,
        tamanho_preco_feed: formData.tamanho_preco_feed,
        tamanho_titulo_story: formData.tamanho_titulo_story,
        tamanho_descricao_story: formData.tamanho_descricao_story,
        tamanho_preco_story: formData.tamanho_preco_story,
        tamanho_titulo_a4: formData.tamanho_titulo_a4,
        tamanho_descricao_a4: formData.tamanho_descricao_a4,
        tamanho_preco_a4: formData.tamanho_preco_a4,
        tamanho_selo_feed: formData.tamanho_selo_feed,
        tamanho_selo_story: formData.tamanho_selo_story,
        tamanho_selo_a4: formData.tamanho_selo_a4,
        altura_imagem_feed: formData.altura_imagem_feed,
        altura_imagem_story: formData.altura_imagem_story,
        altura_imagem_a4: formData.altura_imagem_a4,
      }

      let campanhaId: string

      if (editingCampanha) {
        const updatedCampanha = await updateCampanha(editingCampanha.id, dataToSave)
        campanhaId = updatedCampanha.id
      } else {
        const newCampanha = await createCampanha(dataToSave)
        campanhaId = newCampanha.id
      }

      // Se for campanha fixa e tiver produtos do Excel, criar os produtos
      if (formData.tipo === "fixa" && produtosExcel.length > 0) {
        await createProdutosBatch(campanhaId, produtosExcel)
      }

      resetForm()
    } catch (err) {
      console.error("Erro ao salvar campanha:", err)
      setSubmitError(err instanceof Error ? err.message : "Erro ao salvar campanha")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      nome: "",
      tipo: "customizada",
      status: "ativa",
      cores: {
        titulo: "#1a365d",
        descricao: "#4a5568",
        preco: "#e53e3e",
      },
      fundos: {
        feed: "",
        story: "",
        a4: "",
        feed_path: "",
        story_path: "",
        a4_path: "",
      },
      espacamento_superior_feed: 0,
      espacamento_superior_story: 0,
      espacamento_superior_a4: 0,
      tamanho_titulo_feed: 65, // 65pt padrão para Feed
      tamanho_descricao_feed: 55, // 55pt padrão para Feed
      tamanho_preco_feed: 70, // 70pt padrão para Feed
      tamanho_titulo_story: 85, // 85pt padrão para Story
      tamanho_descricao_story: 80, // 80pt padrão para Story
      tamanho_preco_story: 90, // 90pt padrão para Story
      tamanho_titulo_a4: 40, // 40pt padrão para A4
      tamanho_descricao_a4: 35, // 35pt padrão para A4
      tamanho_preco_a4: 50, // 50pt padrão para A4
      tamanho_selo_feed: 200,
      tamanho_selo_story: 200,
      tamanho_selo_a4: 120,
      altura_imagem_feed: 580,
      altura_imagem_story: 580,
      altura_imagem_a4: 355,
    })
    setProdutosExcel([])
    setUploadedImages([])
    setEditingCampanha(null)
    setIsDialogOpen(false)
    setActiveTab("dados")
    setSubmitError(null)
  }

  const handleEdit = (campanha: Campanha) => {
    setEditingCampanha(campanha)
    setFormData({
      nome: campanha.nome,
      tipo: campanha.tipo,
      status: campanha.status,
      cores: campanha.cores,
      fundos: {
        feed: campanha.fundos?.feed || "",
        story: campanha.fundos?.story || "",
        a4: campanha.fundos?.a4 || "",
        feed_path: campanha.fundos?.feed_path || "",
        story_path: campanha.fundos?.story_path || "",
        a4_path: campanha.fundos?.a4_path || "",
      },
      espacamento_superior_feed: campanha.espacamento_superior_feed || 0,
      espacamento_superior_story: campanha.espacamento_superior_story || 0,
      espacamento_superior_a4: campanha.espacamento_superior_a4 || 0,
      tamanho_titulo_feed: campanha.tamanho_titulo_feed || 65, // 65pt padrão para Feed
      tamanho_descricao_feed: campanha.tamanho_descricao_feed || 55, // 55pt padrão para Feed
      tamanho_preco_feed: campanha.tamanho_preco_feed || 70, // 70pt padrão para Feed
      tamanho_titulo_story: campanha.tamanho_titulo_story || 85, // 85pt padrão para Story
      tamanho_descricao_story: campanha.tamanho_descricao_story || 80, // 80pt padrão para Story
      tamanho_preco_story: campanha.tamanho_preco_story || 90, // 90pt padrão para Story
      tamanho_titulo_a4: campanha.tamanho_titulo_a4 || 40, // 40pt padrão para A4
      tamanho_descricao_a4: campanha.tamanho_descricao_a4 || 35, // 35pt padrão para A4
      tamanho_preco_a4: campanha.tamanho_preco_a4 || 50, // 50pt padrão para A4
      tamanho_selo_feed: campanha.tamanho_selo_feed || 200,
      tamanho_selo_story: campanha.tamanho_selo_story || 200,
      tamanho_selo_a4: campanha.tamanho_selo_a4 || 120,
      altura_imagem_feed: campanha.altura_imagem_feed || 580,
      altura_imagem_story: campanha.altura_imagem_story || 580,
      altura_imagem_a4: campanha.altura_imagem_a4 || 355,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (campanha: Campanha) => {
    const confirmMessage = `⚠️ ATENÇÃO: Esta ação é IRREVERSÍVEL!

Ao excluir a campanha "${campanha.nome}", os seguintes dados serão PERMANENTEMENTE removidos:

🗂️ Todos os produtos da campanha
🖼️ Todas as imagens dos produtos
🎨 Todas as imagens de fundo (Feed, Story, A4)
📊 Todas as artes geradas pelas lojas
💾 Todos os dados relacionados no sistema

Tem certeza que deseja continuar?`

    if (confirm(confirmMessage)) {
      try {
        setIsSubmitting(true)
        await deleteCampanha(campanha.id)
        alert(
          `✅ Campanha "${campanha.nome}" foi excluída com sucesso!\n\nTodos os dados relacionados foram removidos do sistema.`,
        )
      } catch (err) {
        console.error("Erro ao excluir campanha:", err)
        alert(`❌ Erro ao excluir campanha: ${err instanceof Error ? err.message : "Erro desconhecido"}`)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const handleFundoUpload = (formato: "feed" | "story" | "a4", url: string, path: string) => {
    setFormData((prev) => ({
      ...prev,
      fundos: {
        ...prev.fundos,
        [formato]: url,
        [`${formato}_path`]: path,
      },
    }))
  }

  const handleFundoRemove = (formato: "feed" | "story" | "a4") => {
    setFormData((prev) => ({
      ...prev,
      fundos: {
        ...prev.fundos,
        [formato]: "",
        [`${formato}_path`]: "",
      },
    }))
  }

  const getFundoFolder = (formato: "feed" | "story" | "a4") => {
    const campanhaSlug = formData.nome.toLowerCase().replace(/[^a-z0-9]/g, "-") || "temp"
    return `${campanhaSlug}/${formato}`
  }

  const handleProdutosExcelLoaded = (produtos: ProdutoExcel[]) => {
    setProdutosExcel(produtos)
  }

  const handleImagesUploaded = (produtosComImagens: any[]) => {
    // salva a lista completa (com urls & paths) na planilha em memória
    setProdutosExcel(produtosComImagens)

    // apenas para exibir quantidade de imagens enviadas
    const imgs = produtosComImagens.filter((p) => p.imagem_url)
    setUploadedImages(imgs)
  }

  const handleDownloadTemplate = () => {
    try {
      downloadExcelTemplate()
    } catch (error) {
      console.error("Erro ao baixar template:", error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Se estiver mostrando gerenciamento de produtos
  if (showProdutoManagement) {
    const campanha = campanhas.find((c) => c.id === showProdutoManagement)
    if (campanha) {
      return (
        <div className="p-6">
          <div className="mb-6">
            <Button variant="outline" onClick={() => setShowProdutoManagement(null)} className="mb-4 text-foreground">
              ← Voltar para Campanhas
            </Button>
          </div>
          <ProdutoManagement
            campanhaId={campanha.id}
            campanhaName={campanha.nome}
            onProdutosChange={() => {
              // Callback para atualizar dados se necessário
            }}
          />
        </div>
      )
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Campanhas</h1>
          <p className="text-muted-foreground">Crie e configure campanhas promocionais</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCampanha(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingCampanha ? "Editar Campanha" : "Nova Campanha"}</DialogTitle>
              <DialogDescription>Configure os dados e a identidade visual da campanha</DialogDescription>
            </DialogHeader>

            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="cores">Cores</TabsTrigger>
                  <TabsTrigger value="fundos">Fundos</TabsTrigger>
                  <TabsTrigger value="layout">Layout</TabsTrigger>
                  <TabsTrigger value="selo">Selo</TabsTrigger>
                  {formData.tipo === "fixa" && <TabsTrigger value="produtos">Produtos</TabsTrigger>}
                </TabsList>

                <form onSubmit={handleSubmit}>
                  <TabsContent value="dados" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="nome" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="nome"
                          value={formData.nome}
                          onChange={(e) => setFormData((prev) => ({ ...prev, nome: e.target.value }))}
                          className="col-span-3"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="tipo" className="text-right">
                          Tipo
                        </Label>
                        <Select
                          value={formData.tipo}
                          onValueChange={(value: "fixa" | "customizada") =>
                            setFormData((prev) => ({ ...prev, tipo: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="customizada">Customizada</SelectItem>
                            <SelectItem value="fixa">Fixa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right">
                          Status
                        </Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value: "ativa" | "inativa") =>
                            setFormData((prev) => ({ ...prev, status: value }))
                          }
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="ativa">Ativa</SelectItem>
                            <SelectItem value="inativa">Inativa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="cores" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cor-titulo" className="text-right">
                          Cor do Título
                        </Label>
                        <Input
                          id="cor-titulo"
                          type="color"
                          value={formData.cores.titulo}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cores: { ...prev.cores, titulo: e.target.value },
                            }))
                          }
                          className="col-span-3 h-10"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cor-descricao" className="text-right">
                          Cor da Descrição
                        </Label>
                        <Input
                          id="cor-descricao"
                          type="color"
                          value={formData.cores.descricao}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cores: { ...prev.cores, descricao: e.target.value },
                            }))
                          }
                          className="col-span-3 h-10"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="cor-preco" className="text-right">
                          Cor do Preço
                        </Label>
                        <Input
                          id="cor-preco"
                          type="color"
                          value={formData.cores.preco}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              cores: { ...prev.cores, preco: e.target.value },
                            }))
                          }
                          className="col-span-3 h-10"
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="fundos" className="space-y-4">
                    <div className="grid gap-6">
                      <div>
                        <Label className="text-sm font-medium">Fundo Feed (1080x1350)</Label>
                        <ImageUpload
                          bucket="fundos-campanhas"
                          folder={getFundoFolder("feed")}
                          currentImageUrl={formData.fundos.feed}
                          currentImagePath={formData.fundos.feed_path}
                          onUploadComplete={(url, path) => handleFundoUpload("feed", url, path)}
                          onRemove={() => handleFundoRemove("feed")}
                          accept="image/*"
                          maxSizeMB={5}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Fundo Story (1080x1920)</Label>
                        <ImageUpload
                          bucket="fundos-campanhas"
                          folder={getFundoFolder("story")}
                          currentImageUrl={formData.fundos.story}
                          currentImagePath={formData.fundos.story_path}
                          onUploadComplete={(url, path) => handleFundoUpload("story", url, path)}
                          onRemove={() => handleFundoRemove("story")}
                          accept="image/*"
                          maxSizeMB={5}
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">Fundo A4 (595x842)</Label>
                        <ImageUpload
                          bucket="fundos-campanhas"
                          folder={getFundoFolder("a4")}
                          currentImageUrl={formData.fundos.a4}
                          currentImagePath={formData.fundos.a4_path}
                          onUploadComplete={(url, path) => handleFundoUpload("a4", url, path)}
                          onRemove={() => handleFundoRemove("a4")}
                          accept="image/*"
                          maxSizeMB={5}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="layout" className="space-y-4">
                    <div className="grid gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Feed (1080x1350)</h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="margin-feed">Margem Top (px)</Label>
                            <Input
                              id="margin-feed"
                              type="number"
                              min="0"
                              max="1000"
                              value={formData.espacamento_superior_feed}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  espacamento_superior_feed: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Espaço do topo</p>
                          </div>
                          <div>
                            <Label htmlFor="titulo-feed">Título (pt)</Label>
                            <Input
                              id="titulo-feed"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_titulo_feed}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_titulo_feed: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 65pt</p>
                          </div>
                          <div>
                            <Label htmlFor="descricao-feed">Descrição (pt)</Label>
                            <Input
                              id="descricao-feed"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_descricao_feed}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_descricao_feed: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 55pt</p>
                          </div>
                          <div>
                            <Label htmlFor="preco-feed">Preço (pt)</Label>
                            <Input
                              id="preco-feed"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_preco_feed}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_preco_feed: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 70pt</p>
                          </div>
                          <div>
                            <Label htmlFor="altura-feed">Altura Imagem (px)</Label>
                            <Input
                              id="altura-feed"
                              type="number"
                              min="100"
                              max="1000"
                              value={formData.altura_imagem_feed}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  altura_imagem_feed: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Max: 580px</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Story (1080x1920)</h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="margin-story">Margem Top (px)</Label>
                            <Input
                              id="margin-story"
                              type="number"
                              min="0"
                              max="1000"
                              value={formData.espacamento_superior_story}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  espacamento_superior_story: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Espaço do topo</p>
                          </div>
                          <div>
                            <Label htmlFor="titulo-story">Título (pt)</Label>
                            <Input
                              id="titulo-story"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_titulo_story}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_titulo_story: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 85pt</p>
                          </div>
                          <div>
                            <Label htmlFor="descricao-story">Descrição (pt)</Label>
                            <Input
                              id="descricao-story"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_descricao_story}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_descricao_story: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 80pt</p>
                          </div>
                          <div>
                            <Label htmlFor="preco-story">Preço (pt)</Label>
                            <Input
                              id="preco-story"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_preco_story}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_preco_story: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 90pt</p>
                          </div>
                          <div>
                            <Label htmlFor="altura-story">Altura Imagem (px)</Label>
                            <Input
                              id="altura-story"
                              type="number"
                              min="100"
                              max="1000"
                              value={formData.altura_imagem_story}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  altura_imagem_story: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Max: 580px</p>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">A4 (595x842)</h4>
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <Label htmlFor="margin-a4">Margem Top (px)</Label>
                            <Input
                              id="margin-a4"
                              type="number"
                              min="0"
                              max="1000"
                              value={formData.espacamento_superior_a4}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  espacamento_superior_a4: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Espaço do topo</p>
                          </div>
                          <div>
                            <Label htmlFor="titulo-a4">Título (pt)</Label>
                            <Input
                              id="titulo-a4"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_titulo_a4}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_titulo_a4: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 40pt</p>
                          </div>
                          <div>
                            <Label htmlFor="descricao-a4">Descrição (pt)</Label>
                            <Input
                              id="descricao-a4"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_descricao_a4}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_descricao_a4: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 35pt</p>
                          </div>
                          <div>
                            <Label htmlFor="preco-a4">Preço (pt)</Label>
                            <Input
                              id="preco-a4"
                              type="number"
                              min="1"
                              max="200"
                              value={formData.tamanho_preco_a4}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  tamanho_preco_a4: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Padrão: 50pt</p>
                          </div>
                          <div>
                            <Label htmlFor="altura-a4">Altura Imagem (px)</Label>
                            <Input
                              id="altura-a4"
                              type="number"
                              min="100"
                              max="1000"
                              value={formData.altura_imagem_a4}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  altura_imagem_a4: Number(e.target.value),
                                }))
                              }
                            />
                            <p className="text-xs text-muted-foreground mt-1">Max: 355px</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="selo" className="space-y-4">
                    <div className="grid gap-4">
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="selo-feed">Selo Feed (px)</Label>
                          <Input
                            id="selo-feed"
                            type="number"
                            min="0"
                            max="300"
                            value={formData.tamanho_selo_feed}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                tamanho_selo_feed: Number(e.target.value),
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">0 = oculto</p>
                        </div>
                        <div>
                          <Label htmlFor="selo-story">Selo Story (px)</Label>
                          <Input
                            id="selo-story"
                            type="number"
                            min="0"
                            max="300"
                            value={formData.tamanho_selo_story}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                tamanho_selo_story: Number(e.target.value),
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">0 = oculto</p>
                        </div>
                        <div>
                          <Label htmlFor="selo-a4">Selo A4 (px)</Label>
                          <Input
                            id="selo-a4"
                            type="number"
                            min="0"
                            max="300"
                            value={formData.tamanho_selo_a4}
                            onChange={(e) =>
                              setFormData((prev) => ({
                                ...prev,
                                tamanho_selo_a4: Number(e.target.value),
                              }))
                            }
                          />
                          <p className="text-xs text-muted-foreground mt-1">0 = oculto</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {formData.tipo === "fixa" && (
                    <TabsContent value="produtos" className="space-y-4">
                      <div className="space-y-6">
                        <div>
                          <h4 className="font-medium mb-3">1. Baixar Template Excel</h4>
                          <Button type="button" variant="outline" onClick={handleDownloadTemplate}>
                            <Download className="mr-2 h-4 w-4" />
                            Baixar Template Excel
                          </Button>
                          <p className="text-sm text-muted-foreground mt-2">
                            Baixe o template, preencha com os dados dos produtos e faça o upload abaixo.
                          </p>
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">2. Upload da Planilha Excel</h4>
                          <ExcelUpload onUpload={handleProdutosExcelLoaded} />
                          {produtosExcel.length > 0 && (
                            <Alert className="mt-4">
                              <FileSpreadsheet className="h-4 w-4" />
                              <AlertDescription>
                                {produtosExcel.length} produtos carregados da planilha Excel.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>

                        <div>
                          <h4 className="font-medium mb-3">3. Upload das Imagens dos Produtos</h4>
                          <ProductImagesUpload produtos={produtosExcel} onImagesUploaded={handleImagesUploaded} />
                          {uploadedImages.length > 0 && (
                            <Alert className="mt-4">
                              <ImageIcon className="h-4 w-4" />
                              <AlertDescription>
                                {uploadedImages.length} imagens de produtos carregadas.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </TabsContent>
                  )}

                  {submitError && (
                    <Alert className="mt-4">
                      <AlertDescription className="text-red-600">{submitError}</AlertDescription>
                    </Alert>
                  )}

                  <DialogFooter className="mt-6">
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : editingCampanha ? (
                        "Atualizar"
                      ) : (
                        "Criar"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </Tabs>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertDescription className="text-red-600">{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Campanhas</CardTitle>
          <CardDescription>Lista de todas as campanhas criadas</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criada em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campanhas.map((campanha) => (
                <TableRow key={campanha.id}>
                  <TableCell className="font-medium">{campanha.nome}</TableCell>
                  <TableCell>
                    <Badge variant={campanha.tipo === "fixa" ? "default" : "secondary"}>{campanha.tipo}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={campanha.status === "ativa" ? "default" : "secondary"}>{campanha.status}</Badge>
                  </TableCell>
                  <TableCell>{new Date(campanha.created_at).toLocaleDateString("pt-BR")}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(campanha)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {campanha.tipo === "fixa" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowProdutoManagement(campanha.id)}
                          title="Gerenciar Produtos"
                        >
                          <Package className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(campanha)}
                        disabled={isSubmitting}
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
