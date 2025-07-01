import JSZip from "jszip"
import type { ArteGeradaResult } from "./art-generator"

export class DownloadUtils {
  static downloadFile(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  static async downloadAsZip(artes: ArteGeradaResult[], zipFilename: string) {
    const zip = new JSZip()

    // Organizar por produto e formato
    const produtoFolders: { [key: string]: ArteGeradaResult[] } = {}

    artes.forEach((arte) => {
      const produtoName = arte.filename.split("_")[1] || "produto"
      if (!produtoFolders[produtoName]) {
        produtoFolders[produtoName] = []
      }
      produtoFolders[produtoName].push(arte)
    })

    // Adicionar arquivos ao ZIP organizados por pasta
    for (const [produtoName, artesProduct] of Object.entries(produtoFolders)) {
      const folder = zip.folder(produtoName)

      artesProduct.forEach((arte) => {
        folder?.file(arte.filename, arte.blob)
      })
    }

    // Gerar e baixar ZIP
    try {
      const zipBlob = await zip.generateAsync({ type: "blob" })
      this.downloadFile(zipBlob, zipFilename)
    } catch (error) {
      console.error("Erro ao gerar ZIP:", error)
      throw new Error("Erro ao gerar arquivo ZIP")
    }
  }

  static async downloadMultiple(artes: ArteGeradaResult[]) {
    if (artes.length === 1) {
      // Download individual
      this.downloadFile(artes[0].blob, artes[0].filename)
    } else {
      // Download como ZIP
      const timestamp = new Date().toISOString().slice(0, 10)
      const zipFilename = `artes_hiperfarma_${timestamp}.zip`
      await this.downloadAsZip(artes, zipFilename)
    }
  }

  static downloadSingle(arte: ArteGeradaResult) {
    // Faz download de um único arquivo usando o helper genérico
    this.downloadFile(arte.blob, arte.filename)
  }
}
