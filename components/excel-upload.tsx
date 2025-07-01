"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileSpreadsheet, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { parseExcelFile, type ProdutoExcel } from "@/lib/excel-utils"

interface ExcelUploadProps {
  onUpload: (produtos: ProdutoExcel[]) => void
  isUploading?: boolean
}

export function ExcelUpload({ onUpload, isUploading = false }: ExcelUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Verificar se é um arquivo Excel
    const validTypes = ["application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"]

    if (!validTypes.includes(file.type)) {
      setError("Por favor, selecione um arquivo Excel (.xls ou .xlsx)")
      return
    }

    setUploading(true)
    setError(null)

    try {
      const produtos = await parseExcelFile(file)

      if (produtos.length === 0) {
        setError(
          "Nenhum produto válido encontrado na planilha. Verifique se as colunas estão preenchidas corretamente.",
        )
        return
      }

      console.log("Produtos processados:", produtos)
      onUpload(produtos)
    } catch (error) {
      console.error("Erro ao processar arquivo:", error)
      setError(
        "Erro ao processar arquivo. Verifique se o formato está correto e se as colunas estão nomeadas como: EAN, TITULO, DESCRICAO, PRECO, CLUB",
      )
    } finally {
      setUploading(false)
      // Limpar o input para permitir upload do mesmo arquivo novamente
      event.target.value = ""
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="excel-file">Arquivo Excel</Label>
        <div className="flex items-center gap-2">
          <Input
            id="excel-file"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            disabled={isUploading}
            onClick={() => document.getElementById("excel-file")?.click()}
          >
            {uploading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="text-sm text-muted-foreground space-y-1">
        <p className="flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4" />
          Formato esperado: EAN | TITULO | DESCRICAO | PRECO | CLUB
        </p>
        <p>
          • <strong>EAN:</strong> Código de barras do produto (obrigatório para imagens)
        </p>
        <p>
          • <strong>TITULO:</strong> Nome/título do produto (obrigatório)
        </p>
        <p>
          • <strong>DESCRICAO:</strong> Descrição do produto (opcional)
        </p>
        <p>
          • <strong>PRECO:</strong> Preço no formato "29,90" ou "29.90" (obrigatório)
        </p>
        <p>
          • <strong>CLUB:</strong> true/false para produtos CLUB (opcional)
        </p>
      </div>
    </div>
  )
}
