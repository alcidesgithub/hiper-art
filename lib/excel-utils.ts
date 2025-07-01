import * as XLSX from "xlsx"

export interface ProdutoExcel {
  ean: string
  nome: string // Mapeado de TITULO
  descricao?: string
  preco: string
  club?: boolean
  imagem_url?: string
  imagem_path?: string
}

export function parseExcelFile(file: File): Promise<ProdutoExcel[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const data = e.target?.result
        const workbook = XLSX.read(data, { type: "binary" })
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const jsonData = XLSX.utils.sheet_to_json(worksheet)

        console.log("Dados brutos da planilha:", jsonData.slice(0, 2)) // Debug

        const produtos: ProdutoExcel[] = jsonData
          .map((row: any) => {
            const produto = {
              ean: String(row.EAN || row.ean || "").trim(),
              nome: String(row.TITULO || row.titulo || row.NOME || row.nome || "").trim(), // Mapear TITULO para nome
              descricao: String(row.DESCRICAO || row.descricao || "").trim(),
              preco: String(row.PRECO || row.preco || "0").trim(),
              club: Boolean(row.CLUB || row.club || false),
            }

            console.log("Produto mapeado:", produto) // Debug
            return produto
          })
          .filter((produto) => produto.nome && produto.nome !== "") // Filtrar produtos sem título

        console.log(`${produtos.length} produtos válidos encontrados`)
        resolve(produtos)
      } catch (error) {
        console.error("Erro ao processar planilha:", error)
        reject(error)
      }
    }

    reader.onerror = () => reject(new Error("Erro ao ler arquivo"))
    reader.readAsBinaryString(file)
  })
}

export function downloadExcelTemplate() {
  const templateData = [
    {
      EAN: "7891234567890",
      TITULO: "Produto Exemplo",
      DESCRICAO: "Descrição do produto",
      PRECO: "29.90",
      CLUB: false,
    },
    {
      EAN: "7891234567891",
      TITULO: "Vitamina C 1000mg",
      DESCRICAO: "Suplemento vitamínico com 60 cápsulas",
      PRECO: "35.50",
      CLUB: true,
    },
  ]

  const worksheet = XLSX.utils.json_to_sheet(templateData)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "Produtos")

  XLSX.writeFile(workbook, "template-produtos-hiperfarma.xlsx")
}

export function validateProdutoExcel(produto: any): string[] {
  const errors: string[] = []

  if (!produto.nome || produto.nome.trim() === "") {
    errors.push("Título é obrigatório")
  }

  if (!produto.preco || isNaN(Number(produto.preco.replace(",", ".")))) {
    errors.push("Preço deve ser um número válido")
  }

  if (!produto.ean || produto.ean.trim() === "") {
    errors.push("EAN é obrigatório para vinculação com imagens")
  }

  return errors
}
