"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, Download, Eye } from "lucide-react"
import { ArtGenerator, type ProdutoData, type ArteConfig } from "@/lib/art-generator"
import { useAdminPreviewProduct } from "@/hooks/use-admin-preview-product"
import type { Campanha, Loja } from "@/lib/supabase"

interface CampaignPreviewProps {
  campanha: Campanha
  loja: Loja
  onClose?: () => void
}

export function CampaignPreview({ campanha, loja, onClose }: CampaignPreviewProps) {
  const [previews, setPreviews] = useState<Record<string, string>>({})
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedFormat, setSelectedFormat] = useState<"feed" | "story" | "a4" | null>(null)

  const { produto: previewProduct, loading: loadingProduct } = useAdminPreviewProduct()

  const formatos: ("feed" | "story" | "a4")[] = ["feed", "story", "a4"]

  useEffect(() => {
    if (previewProduct && !loadingProduct) {
      generatePreviews()
    }
  }, [previewProduct, campanha, loja, loadingProduct])

  const generatePreviews = async () => {
    if (!previewProduct) return

    setIsGenerating(true)
    const newPreviews: Record<string, string> = {}

    try {
      const produtoData: ProdutoData = {
        nome: previewProduct.nome,
        descricao: previewProduct.descricao || undefined,
        preco: `R$ ${previewProduct.preco.toFixed(2).replace(".", ",")}`,
        imagem_url: previewProduct.imagem_url || undefined,
      }

      for (const formato of formatos) {
        try {
          const config: ArteConfig = {
            formato,
            produto: produtoData,
            campanha,
            loja,
          }

          const result = await ArtGenerator.generateArt(config)
          newPreviews[formato] = result.dataUrl
        } catch (error) {
          console.error(`Erro ao gerar preview ${formato}:`, error)
        }
      }

      setPreviews(newPreviews)
    } catch (error) {
      console.error("Erro ao gerar previews:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const downloadPreview = async (formato: "feed" | "story" | "a4") => {
    if (!previews[formato] || !previewProduct) return

    try {
      const response = await fetch(previews[formato])
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `preview_${loja.codigo}_${previewProduct.nome.replace(/[^a-zA-Z0-9]/g, "_")}_${formato}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error("Erro ao baixar preview:", error)
    }
  }

  const getFormatAspect = (formato: "feed" | "story" | "a4") => {
    switch (formato) {
      case "feed":
        return "aspect-[4/5]"
      case "story":
        return "aspect-[9/16]"
      case "a4":
        return "aspect-[1/1.414]"
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
    }
  }

  const getFontSizes = (formato: "feed" | "story" | "a4") => {
    switch (formato) {
      case "feed":
        return {
          titulo: campanha.tamanho_titulo_feed || 65, // 65pt padrão para Feed
          descricao: campanha.tamanho_descricao_feed || 55, // 55pt padrão para Feed
          preco: campanha.tamanho_preco_feed || 70, // 70pt padrão para Feed
        }
      case "story":
        return {
          titulo: campanha.tamanho_titulo_story || 85, // 85pt padrão para Story
          descricao: campanha.tamanho_descricao_story || 80, // 80pt padrão para Story
          preco: campanha.tamanho_preco_story || 90, // 90pt padrão para Story
        }
      case "a4":
        return {
          titulo: campanha.tamanho_titulo_a4 || 40, // 40pt padrão para A4
          descricao: campanha.tamanho_descricao_a4 || 35, // 35pt padrão para A4
          preco: campanha.tamanho_preco_a4 || 50, // 50pt padrão para A4
        }
    }
  }

  const getFormatDimensions = (formato: "feed" | "story" | "a4") => {
    const seloSize = getSeloSize(formato)
    const seloText = seloSize > 0 ? `• Selo: ${seloSize}px` : "• Selo: Oculto"

    switch (formato) {
      case "feed":
        return `1080x1350 ${seloText} • Img: máx 580px • Layout: Centralizado`
      case "story":
        return `1080x1920 ${seloText} • Img: máx 750px • Layout: Centralizado`
      case "a4":
        return `595x842 ${seloText} • Img: máx 355px • Layout: Centralizado`
    }
  }

  const getSeloSize = (formato: "feed" | "story" | "a4") => {
    switch (formato) {
      case "feed":
        return campanha.tamanho_selo_feed || 0
      case "story":
        return campanha.tamanho_selo_story || 0
      case "a4":
        return campanha.tamanho_selo_a4 || 0
    }
  }

  if (loadingProduct) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Carregando produto de preview...</span>
      </div>
    )
  }

  if (!previewProduct) {
    return (
      <div className="text-center p-8">
        <p className="text-gray-500">Nenhum produto de preview configurado</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {onClose && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Preview da Campanha</h3>
          <Button variant="outline" onClick={onClose}>
            Fechar Preview
          </Button>
        </div>
      )}

      <Card>
        <CardContent className="p-6">
          <div className="mb-4">
            <h4 className="font-medium text-gray-900">{campanha.nome}</h4>
            <p className="text-sm text-gray-500">{campanha.tipo}</p>
          </div>

          <div className="mb-4">
            <Badge variant="outline">Produto: {previewProduct.nome}</Badge>
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Gerando previews...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {formatos.map((formato) => {
                const fontSizes = getFontSizes(formato)
                const seloSize = getSeloSize(formato)

                return (
                  <div key={formato} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h5 className="font-medium">{getFormatLabel(formato)}</h5>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedFormat(formato)}
                          disabled={!previews[formato]}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => downloadPreview(formato)}
                          disabled={!previews[formato]}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div
                      className={`${getFormatAspect(formato)} w-full max-w-xs bg-gray-100 rounded-lg overflow-hidden`}
                    >
                      {previews[formato] ? (
                        <img
                          src={previews[formato] || "/placeholder.svg"}
                          alt={`Preview ${formato}`}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span>Preview não disponível</span>
                        </div>
                      )}
                    </div>

                    {formato === "feed" ? (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="font-medium">Tipografia (Feed):</div>
                          <div>Título: {fontSizes.titulo}pt (padrão: 65pt)</div>
                          <div>Descrição: {fontSizes.descricao}pt (padrão: 55pt)</div>
                          <div>Preço: {fontSizes.preco}pt (padrão: 70pt)</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Layout Feed:</div>
                          <div>Imagem: máx 580px altura</div>
                          <div>Centralização: Vertical + Horizontal</div>
                          <div>Selo: {seloSize > 0 ? `${seloSize}px` : "Oculto"}</div>
                        </div>
                      </div>
                    ) : formato === "story" ? (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="font-medium">Tipografia (Story):</div>
                          <div>Título: {fontSizes.titulo}pt (padrão: 85pt)</div>
                          <div>Descrição: {fontSizes.descricao}pt (padrão: 80pt)</div>
                          <div>Preço: {fontSizes.preco}pt (padrão: 90pt)</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Layout Story:</div>
                          <div>Imagem: máx 750px altura</div>
                          <div>Centralização: Vertical + Horizontal</div>
                          <div>Selo: {seloSize > 0 ? `${seloSize}px` : "Oculto"}</div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div className="space-y-1">
                          <div className="font-medium">Tipografia (A4):</div>
                          <div>Título: {fontSizes.titulo}pt (padrão: 40pt)</div>
                          <div>Descrição: {fontSizes.descricao}pt (padrão: 35pt)</div>
                          <div>Preço: {fontSizes.preco}pt (padrão: 50pt)</div>
                        </div>
                        <div className="space-y-1">
                          <div className="font-medium">Layout A4:</div>
                          <div>Imagem: máx 355px altura</div>
                          <div>Centralização: Vertical + Horizontal</div>
                          <div>Selo: {seloSize > 0 ? `${seloSize}px` : "Oculto"}</div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <Button onClick={generatePreviews} disabled={isGenerating}>
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                "Regenerar Previews"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal para visualização ampliada */}
      {selectedFormat && previews[selectedFormat] && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFormat(null)}
        >
          <div
            className="bg-white rounded-lg p-4 max-w-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">{getFormatLabel(selectedFormat)} - Preview Ampliado</h3>
              <Button variant="outline" onClick={() => setSelectedFormat(null)}>
                Fechar
              </Button>
            </div>

            <div className="flex justify-center">
              <img
                src={previews[selectedFormat] || "/placeholder.svg"}
                alt={`Preview ${selectedFormat} ampliado`}
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>

            <div className="mt-4 flex justify-center">
              <Button onClick={() => downloadPreview(selectedFormat)}>
                <Download className="h-4 w-4 mr-2" />
                Baixar Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
