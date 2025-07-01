"use client"

import type React from "react"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, X, Check } from "lucide-react"
import { supabase } from "@/lib/supabase"

interface ProductImagesUploadProps {
  produtos: any[]
  onImagesUploaded: (produtosComImagens: any[]) => void
}

export function ProductImagesUpload({ produtos, onImagesUploaded }: ProductImagesUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadedCount, setUploadedCount] = useState(0)

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files
      if (!files || files.length === 0) return

      setUploading(true)
      setProgress(0)
      setUploadedCount(0)

      const produtosAtualizados = [...produtos]
      const totalFiles = files.length

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const fileName = file.name.split(".")[0] // Remove extensão

        // Encontrar produto pelo EAN (agora mapeado corretamente)
        const produtoIndex = produtosAtualizados.findIndex((p) => p.ean === fileName)

        if (produtoIndex !== -1) {
          try {
            // Upload para Supabase Storage
            const fileExt = file.name.split(".").pop()
            const filePath = `produtos/${fileName}.${fileExt}`

            const { data, error } = await supabase.storage.from("produtos").upload(filePath, file, {
              cacheControl: "3600",
              upsert: true,
            })

            if (error) throw error

            // Obter URL pública
            const {
              data: { publicUrl },
            } = supabase.storage.from("produtos").getPublicUrl(filePath)

            // Atualizar produto com imagem
            produtosAtualizados[produtoIndex] = {
              ...produtosAtualizados[produtoIndex],
              imagem_url: publicUrl,
              imagem_path: filePath,
            }

            setUploadedCount((prev) => prev + 1)
            console.log(`✅ Imagem vinculada: ${fileName} → ${produtosAtualizados[produtoIndex].nome}`)
          } catch (error) {
            console.error(`❌ Erro ao fazer upload da imagem ${fileName}:`, error)
          }
        } else {
          console.warn(`⚠️ Produto não encontrado para EAN: ${fileName}`)
        }

        setProgress(((i + 1) / totalFiles) * 100)
      }

      setUploading(false)
      onImagesUploaded(produtosAtualizados)
    },
    [produtos, onImagesUploaded],
  )

  const produtosComImagem = produtos.filter((p) => p.imagem_url)
  const produtosSemImagem = produtos.filter((p) => !p.imagem_url)

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
        <div className="text-center">
          <Upload className="mx-auto h-12 w-12 text-gray-400" />
          <div className="mt-4">
            <label htmlFor="images-upload" className="cursor-pointer">
              <span className="mt-2 block text-sm font-medium text-gray-900">Selecione as imagens dos produtos</span>
              <span className="mt-1 block text-xs text-gray-500">
                PNG, JPG até 10MB cada. <strong>Nome do arquivo deve ser igual ao EAN</strong> (ex: 7891234567890.jpg).
              </span>
            </label>
            <input
              id="images-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </div>
          <Button
            type="button"
            variant="outline"
            className="mt-4 bg-transparent"
            disabled={uploading}
            onClick={() => document.getElementById("images-upload")?.click()}
          >
            {uploading ? "Fazendo upload..." : "Selecionar Imagens"}
          </Button>
        </div>
      </div>

      {uploading && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Fazendo upload das imagens...</span>
            <span>
              {uploadedCount} de {produtos.length}
            </span>
          </div>
          <Progress value={progress} className="w-full" />
        </div>
      )}

      {produtos.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-4">
            <Badge variant="outline" className="text-green-600">
              <Check className="w-3 h-3 mr-1" />
              {produtosComImagem.length} com imagem
            </Badge>
            <Badge variant="outline" className="text-orange-600">
              <X className="w-3 h-3 mr-1" />
              {produtosSemImagem.length} sem imagem
            </Badge>
          </div>

          {produtosSemImagem.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="font-medium text-orange-800 mb-2">Produtos sem imagem:</h4>
              <div className="space-y-1">
                {produtosSemImagem.slice(0, 5).map((produto, index) => (
                  <div key={index} className="text-sm text-orange-700">
                    EAN: <strong>{produto.ean}</strong> - {produto.nome}
                  </div>
                ))}
                {produtosSemImagem.length > 5 && (
                  <div className="text-sm text-orange-600">... e mais {produtosSemImagem.length - 5} produtos</div>
                )}
              </div>
              <div className="mt-3 text-xs text-orange-600">
                💡 <strong>Dica:</strong> Nomeie as imagens com o EAN correspondente (ex: 7891234567890.jpg)
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
