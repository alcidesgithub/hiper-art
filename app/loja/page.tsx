"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Palette, Download, Loader2, Archive, ImageIcon, Maximize2, Info, FileSpreadsheet } from "lucide-react"
import { useCampanhas } from "@/hooks/use-campanhas"
import { useLojas } from "@/hooks/use-lojas"
import { useProdutos } from "@/hooks/use-produtos"
import { useArtGeneration } from "@/hooks/use-art-generation"
import { DownloadUtils } from "@/lib/download-utils"
import { ImageUpload } from "@/components/image-upload"
import type { Produto, ProdutoData } from "@/lib/supabase"

export default function GerarArte() {
  const { campanhas } = useCampanhas()
  const { lojas } = useLojas()
  const { fetchProdutosByCampanha } = useProdutos()

  const [campanhaId, setCampanhaId] = useState("")
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [produtosSelecionados, setProdutosSelecionados] = useState<string[]>([])
  const [produtoCustomizado, setProdutoCustomizado] = useState({
    nome: "",
    descricao: "",
    preco: "",
    imagem_url: "",
    imagem_path: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [selectedArte, setSelectedArte] = useState<string | null>(null)

  const campanhaAtual = campanhas.find((c) => c.id === campanhaId && c.status === "ativa")
  const lojaId = typeof window !== "undefined" ? localStorage.getItem("lojaId") : null
  const lojaAtual = lojas.find((l) => l.id === lojaId)

  const {
    isGenerating,
    artesGeradas,
    error: generationError,
    progress,
    generateArts,
    downloadArte,
    downloadAllArtes,
    downloadArtesByFormat,
    clearArtes,
  } = useArtGeneration({
    campanha: campanhaAtual || null,
    loja: lojaAtual || null,
  })

  useEffect(() => {
    if (campanhaAtual?.tipo === "fixa") {
      fetchProdutosByCampanha(campanhaAtual.id)
        .then(setProdutos)
        .catch((err) => setError(err.message))
    }
  }, [campanhaAtual, fetchProdutosByCampanha])

  useEffect(() => {
    clearArtes()
    setProdutosSelecionados([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campanhaId])

  const handleProdutoToggle = (produtoId: string) => {
    setProdutosSelecionados((prev) =>
      prev.includes(produtoId) ? prev.filter((id) => id !== produtoId) : [...prev, produtoId],
    )
  }

  const handleImagemUpload = (url: string, path: string) => {
    setProdutoCustomizado({
      ...produtoCustomizado,
      imagem_url: url,
      imagem_path: path,
    })
  }

  const handleImagemRemove = () => {
    setProdutoCustomizado({
      ...produtoCustomizado,
      imagem_url: "",
      imagem_path: "",
    })
  }

  const handleGerarArte = async () => {
    setError(null)

    try {
      if (!lojaId || !campanhaAtual || !lojaAtual) {
        throw new Error("Dados da sessão inválidos")
      }

      let produtosParaGerar: ProdutoData[] = []

      if (campanhaAtual.tipo === "fixa") {
        const produtosSelecionadosData = produtos.filter((p) => produtosSelecionados.includes(p.id))
        if (produtosSelecionadosData.length === 0) {
          throw new Error("Selecione pelo menos um produto")
        }
        produtosParaGerar = produtosSelecionadosData.map((p) => ({
          nome: p.nome,
          descricao: p.descricao,
          preco: p.preco,
          imagem_url: p.imagem_url,
        }))
      } else {
        if (!produtoCustomizado.nome || !produtoCustomizado.preco) {
          throw new Error("Nome e preço do produto são obrigatórios")
        }
        produtosParaGerar = [
          {
            nome: produtoCustomizado.nome,
            descricao: produtoCustomizado.descricao,
            preco: produtoCustomizado.preco,
            imagem_url: produtoCustomizado.imagem_url,
          },
        ]
      }

      // Gerar artes temporárias para download usando as configurações da campanha
      await generateArts(produtosParaGerar)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar artes")
    }
  }

  const getArtesGroupedByProduct = () => {
    const grouped: { [key: string]: typeof artesGeradas } = {}

    artesGeradas.forEach((arte) => {
      const produtoName = arte.filename.split("_")[1]?.replace(/_/g, " ") || "Produto"
      if (!grouped[produtoName]) {
        grouped[produtoName] = []
      }
      grouped[produtoName].push(arte)
    })

    return grouped
  }

  const getArtesByFormat = (formato: "feed" | "story" | "a4") => {
    return artesGeradas.filter((arte) => arte.formato === formato)
  }

  const getFormatAspectRatio = (formato: "feed" | "story" | "a4") => {
    switch (formato) {
      case "feed":
        return "aspect-[4/5]"
      case "story":
        return "aspect-[9/16]"
      case "a4":
        return "aspect-[595/842]"
      default:
        return "aspect-square"
    }
  }

  const getFormatLabel = (formato: "feed" | "story" | "a4") => {
    switch (formato) {
      case "feed":
        return "Feed (4:5)"
      case "story":
        return "Story (9:16)"
      case "a4":
        return "A4"
      default:
        return formato.toUpperCase()
    }
  }

  const campanhasAtivas = campanhas.filter((c) => c.status === "ativa")

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Gerar Arte</h1>
        <p className="text-muted-foreground">Crie materiais promocionais personalizados para sua loja</p>
      </div>

      {(error || generationError) && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error || generationError}</AlertDescription>
        </Alert>
      )}

      {campanhaAtual && (
        <Alert className="mb-6">
          <AlertDescription>
            <strong>Campanha Selecionada:</strong> {campanhaAtual.nome} -
            {campanhaAtual.tipo === "fixa"
              ? " Produtos pré-definidos pelo administrador com configurações de layout personalizadas"
              : " Configurações personalizadas de cores, fontes e layout serão aplicadas automaticamente"}
          </AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6">
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Artes Temporárias:</strong> As artes são geradas apenas para download imediato. Baixe todas as artes
          necessárias antes de sair da página.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Configuração
            </CardTitle>
            <CardDescription>Selecione a campanha e configure os produtos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="campanha">Campanha</Label>
              <Select value={campanhaId} onValueChange={setCampanhaId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma campanha" />
                </SelectTrigger>
                <SelectContent>
                  {campanhasAtivas.map((campanha) => (
                    <SelectItem key={campanha.id} value={campanha.id}>
                      <div className="flex items-center gap-2">
                        {campanha.nome}
                        <Badge variant={campanha.tipo === "fixa" ? "default" : "secondary"}>
                          {campanha.tipo === "fixa" ? "Fixa" : "Customizada"}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {campanhaAtual && (
              <>
                <Separator />

                {campanhaAtual.tipo === "fixa" ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      <Label>Produtos da Campanha</Label>
                    </div>

                    {produtos.length === 0 ? (
                      <Alert>
                        <AlertDescription>
                          Nenhum produto encontrado para esta campanha. O administrador precisa fazer upload dos
                          produtos.
                        </AlertDescription>
                      </Alert>
                    ) : (
                      <div className="space-y-3">
                        <Alert>
                          <AlertDescription>
                            ✨ <strong>Layout Personalizado:</strong> Esta campanha usa configurações específicas de
                            espaçamento, tipografia e cores definidas pelo administrador.
                          </AlertDescription>
                        </Alert>
                        {produtos.map((produto) => (
                          <div key={produto.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                            <Checkbox
                              id={produto.id}
                              checked={produtosSelecionados.includes(produto.id)}
                              onCheckedChange={() => handleProdutoToggle(produto.id)}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <div className="font-medium">{produto.nome}</div>
                                {produto.ean && (
                                  <Badge variant="outline" className="text-xs">
                                    EAN: {produto.ean}
                                  </Badge>
                                )}
                                {produto.club && (
                                  <Badge variant="secondary" className="text-xs">
                                    Club
                                  </Badge>
                                )}
                              </div>
                              {produto.descricao && (
                                <div className="text-sm text-muted-foreground">{produto.descricao}</div>
                              )}
                              <div className="text-sm font-semibold text-green-600">{produto.preco}</div>
                            </div>
                            {produto.imagem_url ? (
                              <img
                                src={produto.imagem_url || "/placeholder.svg"}
                                alt={produto.nome}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                                <ImageIcon className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Label>Dados do Produto</Label>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="nome-produto">Nome do Produto</Label>
                        <Input
                          id="nome-produto"
                          value={produtoCustomizado.nome}
                          onChange={(e) =>
                            setProdutoCustomizado({
                              ...produtoCustomizado,
                              nome: e.target.value,
                            })
                          }
                          placeholder="Ex: Vitamina C 1000mg"
                        />
                      </div>
                      <div>
                        <Label htmlFor="descricao-produto">Descrição (opcional)</Label>
                        <Textarea
                          id="descricao-produto"
                          value={produtoCustomizado.descricao}
                          onChange={(e) =>
                            setProdutoCustomizado({
                              ...produtoCustomizado,
                              descricao: e.target.value,
                            })
                          }
                          placeholder="Descrição do produto..."
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="preco-produto">Preço</Label>
                        <Input
                          id="preco-produto"
                          value={produtoCustomizado.preco}
                          onChange={(e) =>
                            setProdutoCustomizado({
                              ...produtoCustomizado,
                              preco: e.target.value,
                            })
                          }
                          placeholder="R$ 29,90"
                        />
                      </div>
                      <div>
                        <Label htmlFor="imagem-produto">Imagem do Produto</Label>
                        <div className="mt-2">
                          <ImageUpload
                            bucket="produtos"
                            folder={`${localStorage.getItem("lojaId") || "temp"}`}
                            currentImageUrl={produtoCustomizado.imagem_url}
                            currentImagePath={produtoCustomizado.imagem_path}
                            onUploadComplete={handleImagemUpload}
                            onRemove={handleImagemRemove}
                            placeholder="Selecione a imagem do produto"
                            className="max-w-md"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Gerando artes... {Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="w-full" />
                  </div>
                )}

                <Button
                  onClick={handleGerarArte}
                  className="w-full"
                  disabled={
                    isGenerating ||
                    (campanhaAtual.tipo === "fixa" && produtosSelecionados.length === 0) ||
                    (campanhaAtual.tipo === "customizada" && (!produtoCustomizado.nome || !produtoCustomizado.preco))
                  }
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gerando Artes...
                    </>
                  ) : (
                    <>
                      <Palette className="mr-2 h-4 w-4" />
                      Gerar Arte
                    </>
                  )}
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
            <CardDescription>Artes geradas para download</CardDescription>
          </CardHeader>
          <CardContent>
            {artesGeradas.length > 0 ? (
              <div className="space-y-6">
                <Alert>
                  <Download className="h-4 w-4" />
                  <AlertDescription>
                    <strong>{artesGeradas.length} artes geradas!</strong> Baixe todas as artes necessárias.
                    {campanhaAtual?.tipo === "fixa" && (
                      <span className="block mt-1 text-sm">
                        ✨ Usando configurações personalizadas da campanha: {campanhaAtual.nome}
                      </span>
                    )}
                  </AlertDescription>
                </Alert>

                {artesGeradas.length > 3 && (
                  <div className="flex gap-2">
                    <Button onClick={downloadAllArtes} className="flex-1">
                      <Archive className="mr-2 h-4 w-4" />
                      Baixar Todas (.zip)
                    </Button>
                  </div>
                )}

                <Tabs defaultValue="produtos" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="produtos">Por Produto</TabsTrigger>
                    <TabsTrigger value="feed">Feed ({getArtesByFormat("feed").length})</TabsTrigger>
                    <TabsTrigger value="story">Story ({getArtesByFormat("story").length})</TabsTrigger>
                    <TabsTrigger value="a4">A4 ({getArtesByFormat("a4").length})</TabsTrigger>
                  </TabsList>

                  <TabsContent value="produtos" className="space-y-6">
                    {Object.entries(getArtesGroupedByProduct()).map(([produtoName, artesProduto]) => (
                      <div key={produtoName} className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{produtoName}</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => DownloadUtils.downloadMultiple(artesProduto)}
                          >
                            <Download className="mr-2 h-3 w-3" />
                            Baixar Produto
                          </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {artesProduto.map((arte) => (
                            <div key={`${arte.formato}-${produtoName}`} className="space-y-2">
                              <div className="relative group">
                                <div
                                  className={`${getFormatAspectRatio(arte.formato)} bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105`}
                                  onClick={() => setSelectedArte(arte.dataUrl)}
                                >
                                  <img
                                    src={arte.dataUrl || "/placeholder.svg"}
                                    alt={`${produtoName} - ${arte.formato}`}
                                    className="w-full h-full object-contain"
                                  />
                                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                    <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </div>
                                <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                                  {getFormatLabel(arte.formato)}
                                </Badge>
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full bg-transparent"
                                onClick={() => downloadArte(arte)}
                              >
                                <Download className="mr-2 h-3 w-3" />
                                {arte.formato.toUpperCase()}
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Separator />
                      </div>
                    ))}
                  </TabsContent>

                  {(["feed", "story", "a4"] as const).map((formato) => (
                    <TabsContent key={formato} value={formato} className="space-y-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">
                          {getArtesByFormat(formato).length} arte(s) no formato {getFormatLabel(formato)}
                        </p>
                        {getArtesByFormat(formato).length > 1 && (
                          <Button variant="outline" onClick={() => downloadArtesByFormat(formato)}>
                            <Archive className="mr-2 h-4 w-4" />
                            Baixar {formato.toUpperCase()} (.zip)
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {getArtesByFormat(formato).map((arte, index) => (
                          <div key={index} className="space-y-3">
                            <div className="relative group">
                              <div
                                className={`${getFormatAspectRatio(formato)} bg-gray-100 rounded-lg overflow-hidden cursor-pointer transition-transform hover:scale-105`}
                                onClick={() => setSelectedArte(arte.dataUrl)}
                              >
                                <img
                                  src={arte.dataUrl || "/placeholder.svg"}
                                  alt={`Arte ${formato}`}
                                  className="w-full h-full object-contain"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                                  <Maximize2 className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                              </div>
                              <Badge variant="secondary" className="absolute top-2 left-2 text-xs">
                                {getFormatLabel(formato)}
                              </Badge>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full bg-transparent"
                              onClick={() => downloadArte(arte)}
                            >
                              <Download className="mr-2 h-3 w-3" />
                              Download
                            </Button>
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <ImageIcon className="mx-auto h-12 w-12 mb-4 opacity-50" />
                <p>Selecione uma campanha e configure os produtos para gerar as artes</p>
                <p className="text-xs mt-2">As artes serão geradas temporariamente para download</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modal para visualização em tela cheia */}
      {selectedArte && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedArte(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={selectedArte || "/placeholder.svg"}
              alt="Arte em tela cheia"
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            <Button
              variant="secondary"
              size="sm"
              className="absolute top-4 right-4"
              onClick={() => setSelectedArte(null)}
            >
              ✕
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
