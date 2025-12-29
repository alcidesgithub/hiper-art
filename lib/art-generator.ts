export interface ProdutoData {
  nome: string
  descricao: string
  preco: string | number
  imagem_url?: string
}

export interface Campanha {
  id: string
  nome: string
  tipo: "fixa" | "customizada"
  status: "ativa" | "inativa"
  cores: {
    titulo: string
    descricao: string
    preco: string
  }
  fundos?: {
    feed?: string
    story?: string
    a4?: string
  }
  tamanho_selo_feed?: number
  tamanho_selo_story?: number
  tamanho_selo_a4?: number
  altura_imagem_feed?: number
  altura_imagem_story?: number
  altura_imagem_a4?: number
  espacamento_superior_feed?: number
  espacamento_superior_story?: number
  espacamento_superior_a4?: number
  created_at: string
  tamanho_titulo_feed?: number
  tamanho_descricao_feed?: number
  tamanho_preco_feed?: number
  tamanho_titulo_story?: number
  tamanho_descricao_story?: number
  tamanho_preco_story?: number
  tamanho_titulo_a4?: number
  tamanho_descricao_a4?: number
  tamanho_preco_a4?: number
  updated_at: string
}

export interface Loja {
  id: string
  nome: string
  cidade: string
  telefone: string
  status: "ativa" | "inativa"
  codigo?: string
  selo_url?: string
}

export interface ArtGenerationParams {
  campanha: Campanha
  produto: ProdutoData
  loja: Loja
  formato: "feed" | "story" | "a4"
}

export interface ArteGeradaResult {
  formato: "feed" | "story" | "a4"
  dataUrl: string
  blob: Blob
  filename: string
}

export class ArtGenerator {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D

  constructor() {
    this.canvas = document.createElement("canvas")
    this.ctx = this.canvas.getContext("2d")!
  }

  static async generateArt(config: ArtGenerationParams): Promise<ArteGeradaResult> {
    const generator = new ArtGenerator()

    console.log("🎨 Gerando arte:", {
      formato: config.formato,
      produto: config.produto.nome,
      campanha: config.campanha.nome,
      loja: config.loja.nome,
    })

    // 1️⃣ render to DataURL
    const dataUrl = await generator.renderArt(config)

    // 2️⃣ convert DataURL → Blob
    const res = await fetch(dataUrl)
    const blob = await res.blob()

    // 3️⃣ build filename
    const safe = (str: string) =>
      str
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "")

    const lojaCode = config.loja?.codigo ?? "loja"
    const prod = safe(config.produto?.nome ?? "produto")
    const file = `${lojaCode}_${prod}_${config.formato}.png`

    return {
      formato: config.formato,
      dataUrl: dataUrl,
      blob: blob,
      filename: file,
    }
  }

  private async renderArt(params: ArtGenerationParams): Promise<string> {
    const { campanha, produto, loja, formato } = params

    // Configurar dimensões do canvas baseado no formato
    const dimensions = this.getCanvasDimensions(formato)
    this.canvas.width = dimensions.width
    this.canvas.height = dimensions.height

    console.log("📐 Dimensões do canvas:", dimensions)

    // Limpar canvas com branco primeiro
    this.ctx.fillStyle = "#FFFFFF"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

    // Desenhar fundo com formato específico
    await this.drawBackground(campanha, formato)

    // Desenhar conteúdo baseado no formato
    if (formato === "feed") {
      await this.drawFeedLayout(campanha, produto, loja)
    } else if (formato === "story") {
      await this.drawStoryLayout(campanha, produto, loja)
    } else if (formato === "a4") {
      await this.drawA4Layout(campanha, produto, loja)
    }

    console.log("✅ Arte gerada com sucesso")
    return this.canvas.toDataURL("image/png")
  }

  private getCanvasDimensions(formato: "feed" | "story" | "a4") {
    switch (formato) {
      case "feed":
        return { width: 1080, height: 1350 }
      case "story":
        return { width: 1080, height: 1920 }
      case "a4":
        return { width: 595, height: 842 }
      default:
        return { width: 1080, height: 1350 }
    }
  }

  private async drawBackground(campanha: Campanha, formato: "feed" | "story" | "a4") {
    console.log("🎨 Desenhando fundo:", { formato, fundos: campanha.fundos })

    // Cor de fundo padrão (branco)
    const corFundo = "#FFFFFF"

    // Tentar obter imagem de fundo baseada no formato
    let imagemFundo: string | undefined

    if (campanha.fundos) {
      switch (formato) {
        case "feed":
          imagemFundo = campanha.fundos.feed
          break
        case "story":
          imagemFundo = campanha.fundos.story
          break
        case "a4":
          imagemFundo = campanha.fundos.a4
          break
      }
    }

    if (imagemFundo) {
      try {
        const img = await this.loadImage(imagemFundo)
        this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height)
        console.log("✅ Imagem de fundo carregada:", imagemFundo)
        return
      } catch (error) {
        console.error("❌ Erro ao carregar imagem de fundo:", error)
      }
    }

    // Fallback para cor sólida
    this.ctx.fillStyle = corFundo
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    console.log("✅ Cor de fundo aplicada:", corFundo)
  }

  private wrapText(text: string, maxWidth: number): string[] {
    const words = text.split(" ")
    const lines: string[] = []
    let currentLine = words[0]

    for (let i = 1; i < words.length; i++) {
      const word = words[i]
      const width = this.ctx.measureText(currentLine + " " + word).width
      if (width < maxWidth) {
        currentLine += " " + word
      } else {
        lines.push(currentLine)
        currentLine = word
      }
    }
    lines.push(currentLine)
    return lines
  }

  private async drawFeedLayout(campanha: Campanha, produto: ProdutoData, loja: Loja) {
    console.log("📱 Desenhando layout Feed")

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    // Configurações para Feed
    const titleFontSize = campanha.tamanho_titulo_feed || 65
    const descriptionFontSize = campanha.tamanho_descricao_feed || 55
    const priceFontSize = campanha.tamanho_preco_feed || 70
    const seloMaxHeight = campanha.tamanho_selo_feed || 120

    // Cores da campanha
    const corTitulo = this.validateColor(campanha.cores?.titulo) || "#000000"
    const corDescricao = this.validateColor(campanha.cores?.descricao) || "#000000"
    const corPreco = this.validateColor(campanha.cores?.preco) || "#000000"

    // Calcular posições para centralização vertical
    let totalContentHeight = 0

    // Altura da imagem
    let imageHeight = 0
    if (produto.imagem_url) {
      try {
        const img = await this.loadImage(produto.imagem_url)
        const maxHeight = campanha.altura_imagem_feed || 580 // Use configured height or default
        const { height } = this.calculateImageDimensionsForFeed(img, maxHeight)
        imageHeight = height
        totalContentHeight += height
        console.log("📸 Imagem do produto carregada:", { width: img.width, height: img.height, usingMaxHeight: maxHeight })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", error, produto.imagem_url)
      }
    }

    // Espaçamentos proporcionais
    const spacingAfterImage = 40
    const spacingAfterTitle = 30
    const spacingAfterDescription = 30

    // Altura dos textos (estimativa)
    this.ctx.font = `bold ${titleFontSize}px Arial`
    const titleLines = this.wrapText(produto.nome, 900)
    const titleHeight = titleLines.length * titleFontSize * 1.2

    this.ctx.font = `${descriptionFontSize}px Arial`
    const descriptionLines = produto.descricao ? this.wrapText(produto.descricao, 900) : []
    const descriptionHeight = descriptionLines.length * descriptionFontSize * 1.2
    const priceHeight = priceFontSize * 1.2

    totalContentHeight += spacingAfterImage + titleHeight + spacingAfterTitle
    if (produto.descricao) {
      totalContentHeight += descriptionHeight + spacingAfterDescription
    }
    totalContentHeight += priceHeight

    // Posição inicial (centralizada verticalmente)
    let currentY = centerY - totalContentHeight / 2

    // Desenhar imagem do produto
    console.log("🖼️ Tentando carregar imagem do produto:", {
      produto: produto.nome,
      imagem_url: produto.imagem_url,
      temImagem: !!produto.imagem_url,
      urlValida: produto.imagem_url && produto.imagem_url.length > 0,
    })

    if (produto.imagem_url && produto.imagem_url.trim().length > 0) {
      try {
        console.log("📥 Carregando imagem:", produto.imagem_url)
        const img = await this.loadImage(produto.imagem_url)
        const maxHeight = campanha.altura_imagem_feed || 580
        const { width, height } = this.calculateImageDimensionsForFeed(img, maxHeight)
        const imageX = centerX - width / 2
        const imageY = currentY

        this.ctx.drawImage(img, imageX, imageY, width, height)
        currentY += height + spacingAfterImage
        console.log("✅ Imagem do produto desenhada com sucesso:", { width, height, imageX, imageY })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", {
          error: (error as Error).message,
          url: produto.imagem_url,
          produto: produto.nome,
        })
        currentY += spacingAfterImage
      }
    } else {
      console.log("⚠️ Produto sem imagem válida:", {
        produto: produto.nome,
        imagem_url: produto.imagem_url,
      })
      currentY += spacingAfterImage
    }

    // Desenhar título (quebrado a cada duas palavras)
    this.ctx.fillStyle = corTitulo
    this.ctx.font = `bold ${titleFontSize}px Arial`
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "top"

    const titleLines2 = this.wrapText(produto.nome, 900)
    const lineHeight = titleFontSize * 1.2
    const titleCurrentY = currentY

    titleLines2.forEach((line, index) => {
      this.ctx.fillText(line, centerX, titleCurrentY + index * lineHeight)
    })

    currentY += titleLines2.length * lineHeight + spacingAfterTitle
    console.log("✅ Título desenhado com quebras:", titleLines2)

    // Desenhar descrição (se existir, quebrada a cada duas palavras)
    if (produto.descricao) {
      this.ctx.fillStyle = corDescricao
      this.ctx.font = `${descriptionFontSize}px Arial`

      const descriptionLines = this.wrapText(produto.descricao, 900)
      const descLineHeight = descriptionFontSize * 1.2
      const descCurrentY = currentY

      descriptionLines.forEach((line, index) => {
        this.ctx.fillText(line, centerX, descCurrentY + index * descLineHeight)
      })

      currentY += descriptionLines.length * descLineHeight + spacingAfterDescription
      console.log("✅ Descrição desenhada com quebras:", descriptionLines)
    }

    // Desenhar preço com R$ menor
    // Desenhar preço complexo
    this.drawComplexPrice(centerX, currentY, produto.preco, priceFontSize, corPreco)

    // Desenhar selo/logo da loja no canto superior direito (mantendo proporções)
    if (loja.selo_url && seloMaxHeight > 0) {
      try {
        const logo = await this.loadImage(loja.selo_url)
        const { width: logoWidth, height: logoHeight } = this.calculateLogoDimensions(logo, seloMaxHeight)
        const logoX = this.canvas.width - logoWidth - 40
        const logoY = 40
        this.ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
        console.log("✅ Logo da loja desenhado no canto superior direito com proporções mantidas")
      } catch (error) {
        console.error("❌ Erro ao carregar logo da loja:", error)
      }
    }
  }

  private async drawStoryLayout(campanha: Campanha, produto: ProdutoData, loja: Loja) {
    console.log("📱 Desenhando layout Story")

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    // Configurações para Story
    const titleFontSize = campanha.tamanho_titulo_story || 85
    const descriptionFontSize = campanha.tamanho_descricao_story || 80
    const priceFontSize = campanha.tamanho_preco_story || 90
    const seloMaxHeight = campanha.tamanho_selo_story || 120

    // Cores da campanha
    const corTitulo = this.validateColor(campanha.cores?.titulo) || "#000000"
    const corDescricao = this.validateColor(campanha.cores?.descricao) || "#000000"
    const corPreco = this.validateColor(campanha.cores?.preco) || "#000000"

    // Calcular posições para centralização vertical
    let totalContentHeight = 0

    // Altura da imagem
    let imageHeight = 0
    if (produto.imagem_url) {
      try {
        const img = await this.loadImage(produto.imagem_url)
        const maxHeight = campanha.altura_imagem_story || 580 // Use configured height or default
        const { height } = this.calculateImageDimensionsForStory(img, maxHeight)
        imageHeight = height
        totalContentHeight += height
        console.log("📸 Imagem do produto carregada:", { width: img.width, height: img.height })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", error, produto.imagem_url)
      }
    }

    // Espaçamentos proporcionais
    const spacingAfterImage = 60
    const spacingAfterTitle = 45
    const spacingAfterDescription = 45

    // Altura dos textos (estimativa)
    this.ctx.font = `bold ${titleFontSize}px Arial`
    const titleLines = this.wrapText(produto.nome, 900)
    const titleHeight = titleLines.length * titleFontSize * 1.2

    this.ctx.font = `${descriptionFontSize}px Arial`
    const descriptionLines = produto.descricao ? this.wrapText(produto.descricao, 900) : []
    const descriptionHeight = descriptionLines.length * descriptionFontSize * 1.2
    const priceHeight = priceFontSize * 1.2

    totalContentHeight += spacingAfterImage + titleHeight + spacingAfterTitle
    if (produto.descricao) {
      totalContentHeight += descriptionHeight + spacingAfterDescription
    }
    totalContentHeight += priceHeight

    // Posição inicial (centralizada verticalmente)
    let currentY = centerY - totalContentHeight / 2

    // Desenhar imagem do produto
    console.log("🖼️ Tentando carregar imagem do produto:", {
      produto: produto.nome,
      imagem_url: produto.imagem_url,
      temImagem: !!produto.imagem_url,
      urlValida: produto.imagem_url && produto.imagem_url.length > 0,
    })

    if (produto.imagem_url && produto.imagem_url.trim().length > 0) {
      try {
        console.log("📥 Carregando imagem:", produto.imagem_url)
        const img = await this.loadImage(produto.imagem_url)
        const maxHeight = campanha.altura_imagem_story || 580
        const { width, height } = this.calculateImageDimensionsForStory(img, maxHeight)
        const imageX = centerX - width / 2
        const imageY = currentY

        this.ctx.drawImage(img, imageX, imageY, width, height)
        currentY += height + spacingAfterImage
        console.log("✅ Imagem do produto desenhada com sucesso:", { width, height, imageX, imageY })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", {
          error: (error as Error).message,
          url: produto.imagem_url,
          produto: produto.nome,
        })
        currentY += spacingAfterImage
      }
    } else {
      console.log("⚠️ Produto sem imagem válida:", {
        produto: produto.nome,
        imagem_url: produto.imagem_url,
      })
      currentY += spacingAfterImage
    }

    // Desenhar título (quebrado a cada duas palavras)
    this.ctx.fillStyle = corTitulo
    this.ctx.font = `bold ${titleFontSize}px Arial`
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "top"

    const titleLines2 = this.wrapText(produto.nome, 900)
    const lineHeight = titleFontSize * 1.2
    const titleCurrentY = currentY

    titleLines2.forEach((line, index) => {
      this.ctx.fillText(line, centerX, titleCurrentY + index * lineHeight)
    })

    currentY += titleLines2.length * lineHeight + spacingAfterTitle
    console.log("✅ Título desenhado com quebras:", titleLines2)

    // Desenhar descrição (se existir, quebrada a cada duas palavras)
    if (produto.descricao) {
      this.ctx.fillStyle = corDescricao
      this.ctx.font = `${descriptionFontSize}px Arial`

      const descriptionLines = this.wrapText(produto.descricao, 900)
      const descLineHeight = descriptionFontSize * 1.2
      const descCurrentY = currentY

      descriptionLines.forEach((line, index) => {
        this.ctx.fillText(line, centerX, descCurrentY + index * descLineHeight)
      })

      currentY += descriptionLines.length * descLineHeight + spacingAfterDescription
      console.log("✅ Descrição desenhada com quebras:", descriptionLines)
    }

    // Desenhar preço com R$ menor
    // Desenhar preço complexo
    this.drawComplexPrice(centerX, currentY, produto.preco, priceFontSize, corPreco)

    // Desenhar selo/logo da loja no canto superior direito (mantendo proporções)
    if (loja.selo_url && seloMaxHeight > 0) {
      try {
        const logo = await this.loadImage(loja.selo_url)
        const { width: logoWidth, height: logoHeight } = this.calculateLogoDimensions(logo, seloMaxHeight)
        const logoX = this.canvas.width - logoWidth - 40
        const logoY = 40
        this.ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
        console.log("✅ Logo da loja desenhado no canto superior direito com proporções mantidas")
      } catch (error) {
        console.error("❌ Erro ao carregar logo da loja:", error)
      }
    }
  }

  private async drawA4Layout(campanha: Campanha, produto: ProdutoData, loja: Loja) {
    console.log("📄 Desenhando layout A4")

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    // Configurações para A4
    const titleFontSize = campanha.tamanho_titulo_a4 || 40
    const descriptionFontSize = campanha.tamanho_descricao_a4 || 35
    const priceFontSize = campanha.tamanho_preco_a4 || 50
    const seloMaxHeight = campanha.tamanho_selo_a4 || 80

    // Cores da campanha
    const corTitulo = this.validateColor(campanha.cores?.titulo) || "#000000"
    const corDescricao = this.validateColor(campanha.cores?.descricao) || "#000000"
    const corPreco = this.validateColor(campanha.cores?.preco) || "#000000"

    // Calcular posições para centralização vertical
    let totalContentHeight = 0

    // Altura da imagem
    let imageHeight = 0
    if (produto.imagem_url) {
      try {
        const img = await this.loadImage(produto.imagem_url)
        const maxHeight = campanha.altura_imagem_a4 || 355 // Use configured height or default
        const { height } = this.calculateImageDimensionsForA4(img, maxHeight)
        imageHeight = height
        totalContentHeight += height
        console.log("📸 Imagem do produto carregada:", { width: img.width, height: img.height })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", error, produto.imagem_url)
      }
    }

    // Espaçamentos proporcionais
    const spacingAfterImage = 30
    const spacingAfterTitle = 25
    const spacingAfterDescription = 25

    // Altura dos textos (estimativa)
    this.ctx.font = `bold ${titleFontSize}px Arial`
    const titleLines = this.wrapText(produto.nome, 500)
    const titleHeight = titleLines.length * titleFontSize * 1.2

    this.ctx.font = `${descriptionFontSize}px Arial`
    const descriptionLines = produto.descricao ? this.wrapText(produto.descricao, 500) : []
    const descriptionHeight = descriptionLines.length * descriptionFontSize * 1.2
    const priceHeight = priceFontSize * 1.2

    totalContentHeight += spacingAfterImage + titleHeight + spacingAfterTitle
    if (produto.descricao) {
      totalContentHeight += descriptionHeight + spacingAfterDescription
    }
    totalContentHeight += priceHeight

    // Posição inicial (centralizada verticalmente)
    let currentY = centerY - totalContentHeight / 2

    // Desenhar imagem do produto
    console.log("🖼️ Tentando carregar imagem do produto:", {
      produto: produto.nome,
      imagem_url: produto.imagem_url,
      temImagem: !!produto.imagem_url,
      urlValida: produto.imagem_url && produto.imagem_url.length > 0,
    })

    if (produto.imagem_url && produto.imagem_url.trim().length > 0) {
      try {
        console.log("📥 Carregando imagem:", produto.imagem_url)
        const img = await this.loadImage(produto.imagem_url)
        const maxHeight = campanha.altura_imagem_a4 || 355
        const { width, height } = this.calculateImageDimensionsForA4(img, maxHeight)
        const imageX = centerX - width / 2
        const imageY = currentY

        this.ctx.drawImage(img, imageX, imageY, width, height)
        currentY += height + spacingAfterImage
        console.log("✅ Imagem do produto desenhada com sucesso:", { width, height, imageX, imageY })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", {
          error: (error as Error).message,
          url: produto.imagem_url,
          produto: produto.nome,
        })
        currentY += spacingAfterImage
      }
    } else {
      console.log("⚠️ Produto sem imagem válida:", {
        produto: produto.nome,
        imagem_url: produto.imagem_url,
      })
      currentY += spacingAfterImage
    }

    // Desenhar título (quebrado a cada duas palavras)
    this.ctx.fillStyle = corTitulo
    this.ctx.font = `bold ${titleFontSize}px Arial`
    this.ctx.textAlign = "center"
    this.ctx.textBaseline = "top"

    const titleLines2 = this.wrapText(produto.nome, 500)
    const lineHeight = titleFontSize * 1.2
    const titleCurrentY = currentY

    titleLines2.forEach((line, index) => {
      this.ctx.fillText(line, centerX, titleCurrentY + index * lineHeight)
    })

    currentY += titleLines2.length * lineHeight + spacingAfterTitle
    console.log("✅ Título desenhado com quebras:", titleLines2)

    // Desenhar descrição (se existir, quebrada a cada duas palavras)
    if (produto.descricao) {
      this.ctx.fillStyle = corDescricao
      this.ctx.font = `${descriptionFontSize}px Arial`

      const descriptionLines = this.wrapText(produto.descricao, 500)
      const descLineHeight = descriptionFontSize * 1.2
      const descCurrentY = currentY

      descriptionLines.forEach((line, index) => {
        this.ctx.fillText(line, centerX, descCurrentY + index * descLineHeight)
      })

      currentY += descriptionLines.length * descLineHeight + spacingAfterDescription
      console.log("✅ Descrição desenhada com quebras:", descriptionLines)
    }

    // Desenhar preço com R$ menor
    // Desenhar preço complexo
    this.drawComplexPrice(centerX, currentY, produto.preco, priceFontSize, corPreco)

    // Desenhar selo/logo da loja no canto superior direito (mantendo proporções)
    if (loja.selo_url && seloMaxHeight > 0) {
      try {
        const logo = await this.loadImage(loja.selo_url)
        const { width: logoWidth, height: logoHeight } = this.calculateLogoDimensions(logo, seloMaxHeight)
        const logoX = this.canvas.width - logoWidth - 20
        const logoY = 20
        this.ctx.drawImage(logo, logoX, logoY, logoWidth, logoHeight)
        console.log("✅ Logo da loja desenhado no canto superior direito com proporções mantidas")
      } catch (error) {
        console.error("❌ Erro ao carregar logo da loja:", error)
      }
    }
  }

  // Novo método para calcular dimensões do logo mantendo proporções
  private calculateLogoDimensions(logo: HTMLImageElement, maxHeight: number) {
    const aspectRatio = logo.width / logo.height

    // Se a altura original é menor que o máximo, usar tamanho original
    if (logo.height <= maxHeight) {
      return { width: logo.width, height: logo.height }
    }

    // Caso contrário, redimensionar mantendo proporção
    const height = maxHeight
    const width = height * aspectRatio

    return { width, height }
  }

  private calculateImageDimensionsForFeed(img: HTMLImageElement, maxHeight: number) {
    const aspectRatio = img.width / img.height

    if (img.height > img.width) {
      // Imagem retrato
      const height = Math.min(img.height, maxHeight)
      const width = height * aspectRatio
      return { width, height }
    } else {
      // Imagem paisagem - largura máxima 400px
      const width = Math.min(img.width, 400)
      const height = width / aspectRatio
      return { width, height }
    }
  }

  private calculateImageDimensionsForStory(img: HTMLImageElement, maxHeight: number) {
    const aspectRatio = img.width / img.height

    if (img.height > img.width) {
      // Imagem retrato
      const height = Math.min(img.height, maxHeight)
      const width = height * aspectRatio
      return { width, height }
    } else {
      // Imagem paisagem - largura máxima 480px
      const width = Math.min(img.width, 480)
      const height = width / aspectRatio
      return { width, height }
    }
  }

  private calculateImageDimensionsForA4(img: HTMLImageElement, maxHeight: number) {
    const aspectRatio = img.width / img.height

    if (img.height > img.width) {
      // Imagem retrato
      const height = Math.min(img.height, maxHeight)
      const width = height * aspectRatio
      return { width, height }
    } else {
      // Imagem paisagem - largura máxima 240px
      const width = Math.min(img.width, 240)
      const height = width / aspectRatio
      return { width, height }
    }
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  // Novo método para desenhar preço complexo (Stack Cents)
  private drawComplexPrice(centerX: number, currentY: number, price: string | number, fontSize: number, color: string) {
    // 1. Format parts
    let priceStr = ""
    if (typeof price === "number") {
      priceStr = price.toFixed(2).replace(".", ",")
    } else {
      priceStr = price.toString().trim().replace(/^R\$\s?/, "").trim()
    }

    const parts = priceStr.split(",")
    const integerPart = parts[0]
    // Centavos com vírgula antes (Ex: ",90")
    const centsWithComma = "," + (parts.length > 1 ? parts[1] : "00")

    // 2. Configure Sizes
    const symbolSize = fontSize * 0.4
    const integerSize = fontSize
    const decimalSize = fontSize * 0.45 // Tamanho dos centavos e da vírgula
    const suffixSize = fontSize * 0.3 // Tamanho do "cada"

    // 3. Measure Widths
    this.ctx.font = `bold ${symbolSize}px Arial`
    const symbolWidth = this.ctx.measureText("R$").width

    this.ctx.font = `bold ${integerSize}px Arial`
    const integerWidth = this.ctx.measureText(integerPart).width

    this.ctx.font = `bold ${decimalSize}px Arial`
    const centsWidth = this.ctx.measureText(centsWithComma).width

    this.ctx.font = `bold ${suffixSize}px Arial`
    const suffixWidth = this.ctx.measureText("cada").width

    const rightColumnWidth = Math.max(centsWidth, suffixWidth)

    const padding = fontSize * 0.1
    const totalWidth = symbolWidth + padding + integerWidth + padding + rightColumnWidth

    // 4. Draw
    const startX = centerX - (totalWidth / 2)
    const baselineY = currentY + (integerSize * 0.85) // Linha de base principal

    this.ctx.fillStyle = color
    this.ctx.textAlign = "left"
    this.ctx.textBaseline = "alphabetic"

    let currentX = startX

    // R$ - Base/Bottom aligned
    this.ctx.font = `bold ${symbolSize}px Arial`
    this.ctx.fillText("R$", currentX, baselineY)
    currentX += symbolWidth + padding

    // Integer - Baseline aligned
    this.ctx.font = `bold ${integerSize}px Arial`
    this.ctx.fillText(integerPart, currentX, baselineY)
    currentX += integerWidth + padding

    // Right Column
    const columnStartX = currentX

    // Centavos com vírgula (Ex: ",90") - Top aligned
    // Centralizar na largura da coluna
    const centsStartX = columnStartX + (rightColumnWidth - centsWidth) / 2
    this.ctx.font = `bold ${decimalSize}px Arial`
    // Alinhar o topo dos centavos com o topo do Inteiro
    const centsBaselineY = currentY + (decimalSize * 0.85)
    this.ctx.fillText(centsWithComma, centsStartX, centsBaselineY)

    // Bottom Row: "cada" - Base/Bottom (Alinhado com a baseline do Inteiro)
    // Centralizar "cada" na largura da coluna
    const suffixStartX = columnStartX + (rightColumnWidth - suffixWidth) / 2
    this.ctx.font = `bold ${suffixSize}px Arial`
    this.ctx.fillText("cada", suffixStartX, baselineY)

    console.log("✅ Preço complexo (R$ Base, Comma Base, Cents Top) desenhado:", priceStr)
  }

  private validateColor(color: string): string | null {
    if (!color) return null

    // Verificar se é uma cor hexadecimal válida
    if (/^#([0-9A-F]{3}){1,2}$/i.test(color)) {
      return color
    }

    // Verificar se é uma cor CSS válida
    const s = new Option().style
    s.color = color
    if (s.color) {
      return color
    }

    console.warn("⚠️ Cor inválida detectada:", color)
    return null
  }
}
