import { supabase } from "./supabase"

export type UploadBucket = "selos" | "fundos-campanhas" | "produtos" | "artes-geradas"

export interface UploadResult {
  url: string
  path: string
  error?: string
}

export class ImageUploader {
  static async uploadImage(
    file: File,
    bucket: UploadBucket,
    folder?: string,
    fileName?: string,
  ): Promise<UploadResult> {
    try {
      console.log("Iniciando upload:", { bucket, folder, fileName, fileSize: file.size, fileType: file.type })

      // Validar tipo de arquivo
      if (!file.type.startsWith("image/")) {
        throw new Error("Apenas arquivos de imagem são permitidos")
      }

      // Validar tamanho (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Arquivo muito grande. Máximo 5MB permitido")
      }

      // Gerar nome único se não fornecido
      const timestamp = Date.now()
      const extension = file.name.split(".").pop()?.toLowerCase() || "jpg"
      const finalFileName = fileName || `${timestamp}.${extension}`

      // Construir caminho do arquivo
      const filePath = folder ? `${folder}/${finalFileName}` : finalFileName

      console.log("Fazendo upload para:", filePath)

      // Fazer upload
      const { data, error } = await supabase.storage.from(bucket).upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
      })

      if (error) {
        console.error("Erro no upload do Supabase:", error)
        throw new Error(`Erro no upload: ${error.message}`)
      }

      console.log("Upload realizado com sucesso:", data)

      // Obter URL pública
      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(data.path)

      console.log("URL pública gerada:", urlData.publicUrl)

      return {
        url: urlData.publicUrl,
        path: data.path,
      }
    } catch (error) {
      console.error("Erro completo no upload:", error)
      return {
        url: "",
        path: "",
        error: error instanceof Error ? error.message : "Erro desconhecido no upload",
      }
    }
  }

  static async deleteImage(bucket: UploadBucket, path: string): Promise<boolean> {
    try {
      console.log("Deletando imagem:", { bucket, path })
      const { error } = await supabase.storage.from(bucket).remove([path])
      if (error) {
        console.error("Erro ao deletar:", error)
        return false
      }
      console.log("Imagem deletada com sucesso")
      return true
    } catch (error) {
      console.error("Erro ao deletar imagem:", error)
      return false
    }
  }

  static async updateImage(
    file: File,
    bucket: UploadBucket,
    oldPath: string,
    folder?: string,
    fileName?: string,
  ): Promise<UploadResult> {
    console.log("Atualizando imagem:", { bucket, oldPath, folder })

    // Deletar imagem antiga
    await this.deleteImage(bucket, oldPath)

    // Fazer upload da nova
    return this.uploadImage(file, bucket, folder, fileName)
  }

  static getImageUrl(bucket: UploadBucket, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)
    return data.publicUrl
  }
}

// Utilitários para validação de imagens
export const validateImageFile = (file: File): string | null => {
  if (!file.type.startsWith("image/")) {
    return "Apenas arquivos de imagem são permitidos"
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Arquivo muito grande. Máximo 5MB permitido"
  }

  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  if (!allowedTypes.includes(file.type)) {
    return "Formato não suportado. Use JPEG, PNG ou WebP"
  }

  return null
}

// Utilitário para redimensionar imagens (opcional)
export const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality = 0.8): Promise<File> => {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas")
    const ctx = canvas.getContext("2d")!
    const img = new Image()

    img.onload = () => {
      // Calcular novas dimensões mantendo proporção
      let { width, height } = img

      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Desenhar imagem redimensionada
      ctx.drawImage(img, 0, 0, width, height)

      // Converter para blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            })
            resolve(resizedFile)
          } else {
            resolve(file)
          }
        },
        file.type,
        quality,
      )
    }

    img.src = URL.createObjectURL(file)
  })
}
