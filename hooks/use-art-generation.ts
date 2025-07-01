"use client"

import { useState, useCallback } from "react"
import { ArtGenerator, type ArteGeradaResult, type ProdutoData } from "@/lib/art-generator"
import { DownloadUtils } from "@/lib/download-utils"
import type { Campanha, Loja } from "@/lib/supabase"

interface UseArtGenerationProps {
  campanha: Campanha | null
  loja: Loja | null
}

export function useArtGeneration({ campanha, loja }: UseArtGenerationProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [artesGeradas, setArtesGeradas] = useState<ArteGeradaResult[]>([])
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)

  const generateArts = useCallback(
    async (produtos: ProdutoData[]) => {
      if (!campanha || !loja) {
        throw new Error("Campanha e loja são obrigatórias")
      }

      setIsGenerating(true)
      setError(null)
      setProgress(0)
      setArtesGeradas([])

      try {
        console.log("🏪 Gerando artes para loja", loja.nome, "com campanha", campanha.nome + ":", {
          campanha,
          loja,
          produtos,
        })

        console.log(
          "🔍 Debug produtos para geração:",
          produtos.map((p) => ({
            nome: p.nome,
            imagem_url: p.imagem_url,
            temImagem: !!p.imagem_url,
            urlValida: p.imagem_url && p.imagem_url.trim().length > 0,
          })),
        )

        const formatos: ("feed" | "story" | "a4")[] = ["feed", "story", "a4"]
        const totalArtes = produtos.length * formatos.length
        let artesProcessadas = 0

        const novasArtes: ArteGeradaResult[] = []

        for (const produto of produtos) {
          console.log(`🎨 Processando produto: ${produto.nome}`)
          console.log(`🖼️ URL da imagem do produto: ${produto.imagem_url || "SEM IMAGEM"}`)

          for (const formato of formatos) {
            try {
              console.log(`🎨 Gerando arte ${formato} para produto ${produto.nome}`)

              const arte = await ArtGenerator.generateArt({
                campanha,
                produto,
                loja,
                formato,
              })

              novasArtes.push(arte)
              console.log(`✅ Arte ${formato} gerada para ${produto.nome}`)

              artesProcessadas++
              setProgress((artesProcessadas / totalArtes) * 100)
            } catch (err) {
              console.error(`❌ Erro ao gerar arte ${formato} para ${produto.nome}:`, err)
              // Continuar com as outras artes mesmo se uma falhar
            }
          }
        }

        setArtesGeradas(novasArtes)
        console.log(`🎉 Geração concluída: ${novasArtes.length} artes geradas`)

        if (novasArtes.length === 0) {
          throw new Error("Nenhuma arte foi gerada com sucesso")
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : "Erro ao gerar artes"
        setError(message)
        console.error("❌ Erro na geração de artes:", err)
        throw new Error(message)
      } finally {
        setIsGenerating(false)
        setProgress(100)
      }
    },
    [campanha, loja],
  )

  const downloadArte = useCallback((arte: ArteGeradaResult) => {
    DownloadUtils.downloadSingle(arte)
  }, [])

  const downloadAllArtes = useCallback(() => {
    if (artesGeradas.length === 0) return
    DownloadUtils.downloadMultiple(artesGeradas)
  }, [artesGeradas])

  const downloadArtesByFormat = useCallback(
    (formato: "feed" | "story" | "a4") => {
      const artesFiltradas = artesGeradas.filter((arte) => arte.formato === formato)
      if (artesFiltradas.length === 0) return
      DownloadUtils.downloadMultiple(artesFiltradas)
    },
    [artesGeradas],
  )

  const clearArtes = useCallback(() => {
    setArtesGeradas([])
    setError(null)
    setProgress(0)
  }, [])

  return {
    isGenerating,
    artesGeradas,
    error,
    progress,
    generateArts,
    downloadArte,
    downloadAllArtes,
    downloadArtesByFormat,
    clearArtes,
  }
}
