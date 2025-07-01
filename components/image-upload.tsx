"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUploader, validateImageFile, type UploadBucket } from "@/lib/upload"
import { Upload, X, ImageIcon, Loader2 } from "lucide-react"

interface ImageUploadProps {
  bucket: UploadBucket
  folder?: string
  currentImageUrl?: string
  currentImagePath?: string
  onUploadComplete: (url: string, path: string) => void
  onRemove?: () => void
  accept?: string
  maxSizeMB?: number
  placeholder?: string
  className?: string
}

export function ImageUpload({
  bucket,
  folder,
  currentImageUrl,
  currentImagePath,
  onUploadComplete,
  onRemove,
  accept = "image/*",
  maxSizeMB = 5,
  placeholder = "Selecione uma imagem",
  className = "",
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validar arquivo
    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    try {
      setUploading(true)

      // Se já existe uma imagem, deletar a anterior
      if (currentImagePath) {
        await ImageUploader.deleteImage(bucket, currentImagePath)
      }

      // Fazer upload da nova imagem
      const result = await ImageUploader.uploadImage(file, bucket, folder)

      if (result.error) {
        throw new Error(result.error)
      }

      onUploadComplete(result.url, result.path)
    } catch (err) {
      console.error("Erro no upload:", err)
      setError(err instanceof Error ? err.message : "Erro no upload")
    } finally {
      setUploading(false)
      // Limpar o input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleRemove = async () => {
    if (!currentImagePath || !onRemove) return

    try {
      setUploading(true)
      await ImageUploader.deleteImage(bucket, currentImagePath)
      onRemove()
    } catch (err) {
      console.error("Erro ao remover imagem:", err)
      setError("Erro ao remover imagem")
    } finally {
      setUploading(false)
    }
  }

  const triggerFileSelect = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {currentImageUrl ? (
        <div className="space-y-4">
          <div className="relative border rounded-lg overflow-hidden bg-gray-50">
            <img src={currentImageUrl || "/placeholder.svg"} alt="Imagem atual" className="w-full h-48 object-cover" />
            {uploading && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={triggerFileSelect}
              disabled={uploading}
              className="flex-1 bg-transparent"
            >
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Alterar
                </>
              )}
            </Button>
            {onRemove && (
              <Button type="button" variant="outline" onClick={handleRemove} disabled={uploading}>
                <X className="mr-2 h-4 w-4" />
                Remover
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div
            onClick={triggerFileSelect}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-gray-400 transition-colors"
          >
            <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-sm text-gray-600 mb-2">{placeholder}</p>
            <p className="text-xs text-gray-500">Formatos aceitos: JPEG, PNG, WebP (máx. {maxSizeMB}MB)</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={triggerFileSelect}
            disabled={uploading}
            className="w-full bg-transparent"
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Selecionar Imagem
              </>
            )}
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  )
}
