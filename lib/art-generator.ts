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
  created_at: string
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

  private breakTextEveryTwoWords(text: string): string[] {
    const words = text.split(" ")
    const lines: string[] = []

    for (let i = 0; i < words.length; i += 2) {
      const line = words.slice(i, i + 2).join(" ")
      lines.push(line)
    }

    return lines
  }

  private async drawFeedLayout(campanha: Campanha, produto: ProdutoData, loja: Loja) {
    console.log("📱 Desenhando layout Feed")

    const centerX = this.canvas.width / 2
    const centerY = this.canvas.height / 2

    // Configurações fixas para Feed
    const titleFontSize = 65
    const descriptionFontSize = 55
    const priceFontSize = 70
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
        const { height } = this.calculateImageDimensionsForFeed(img)
        imageHeight = height
        totalContentHeight += height
        console.log("📸 Imagem do produto carregada:", { width: img.width, height: img.height })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", error, produto.imagem_url)
      }
    }

    // Espaçamentos proporcionais
    const spacingAfterImage = 40
    const spacingAfterTitle = 30
    const spacingAfterDescription = 30

    // Altura dos textos (estimativa)
    const titleLines = this.breakTextEveryTwoWords(produto.nome)
    const titleHeight = titleLines.length * titleFontSize * 1.2
    const descriptionLines = produto.descricao ? this.breakTextEveryTwoWords(produto.descricao) : []
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
        const { width, height } = this.calculateImageDimensionsForFeed(img)
        const imageX = centerX - width / 2
        const imageY = currentY

        this.ctx.drawImage(img, imageX, imageY, width, height)
        currentY += height + spacingAfterImage
        console.log("✅ Imagem do produto desenhada com sucesso:", { width, height, imageX, imageY })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", {
          error: error.message,
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

    const titleLines2 = this.breakTextEveryTwoWords(produto.nome)
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

      const descriptionLines = this.breakTextEveryTwoWords(produto.descricao)
      const descLineHeight = descriptionFontSize * 1.2
      const descCurrentY = currentY

      descriptionLines.forEach((line, index) => {
        this.ctx.fillText(line, centerX, descCurrentY + index * descLineHeight)
      })

      currentY += descriptionLines.length * descLineHeight + spacingAfterDescription
      console.log("✅ Descrição desenhada com quebras:", descriptionLines)
    }

    // Desenhar preço
    this.ctx.fillStyle = corPreco
    this.ctx.font = `bold ${priceFontSize}px Arial`
    let precoTexto: string
    if (typeof produto.preco === "number") {
      precoTexto = `R$ ${produto.preco.toFixed(2).replace(".", ",")}`
    } else {
      const clean = produto.preco.toString().trim()
      precoTexto = clean.startsWith("R") ? clean : `R$ ${clean}`
    }
    this.ctx.fillText(precoTexto, centerX, currentY)
    console.log("✅ Preço desenhado:", precoTexto)

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

    // Configurações fixas para Story
    const titleFontSize = 85
    const descriptionFontSize = 80
    const priceFontSize = 90
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
        const { height } = this.calculateImageDimensionsForStory(img)
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
    const titleLines = this.breakTextEveryTwoWords(produto.nome)
    const titleHeight = titleLines.length * titleFontSize * 1.2
    const descriptionLines = produto.descricao ? this.breakTextEveryTwoWords(produto.descricao) : []
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
        const { width, height } = this.calculateImageDimensionsForStory(img)
        const imageX = centerX - width / 2
        const imageY = currentY

        this.ctx.drawImage(img, imageX, imageY, width, height)
        currentY += height + spacingAfterImage
        console.log("✅ Imagem do produto desenhada com sucesso:", { width, height, imageX, imageY })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", {
          error: error.message,
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

    const titleLines2 = this.breakTextEveryTwoWords(produto.nome)
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

      const descriptionLines = this.breakTextEveryTwoWords(produto.descricao)
      const descLineHeight = descriptionFontSize * 1.2
      const descCurrentY = currentY

      descriptionLines.forEach((line, index) => {
        this.ctx.fillText(line, centerX, descCurrentY + index * descLineHeight)
      })

      currentY += descriptionLines.length * descLineHeight + spacingAfterDescription
      console.log("✅ Descrição desenhada com quebras:", descriptionLines)
    }

    // Desenhar preço
    this.ctx.fillStyle = corPreco
    this.ctx.font = `bold ${priceFontSize}px Arial`
    let precoTexto: string
    if (typeof produto.preco === "number") {
      precoTexto = `R$ ${produto.preco.toFixed(2).replace(".", ",")}`
    } else {
      const clean = produto.preco.toString().trim()
      precoTexto = clean.startsWith("R") ? clean : `R$ ${clean}`
    }
    this.ctx.fillText(precoTexto, centerX, currentY)
    console.log("✅ Preço desenhado:", precoTexto)

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

    // Configurações fixas para A4
    const titleFontSize = 40
    const descriptionFontSize = 35
    const priceFontSize = 50
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
        const { height } = this.calculateImageDimensionsForA4(img)
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
    const titleLines = this.breakTextEveryTwoWords(produto.nome)
    const titleHeight = titleLines.length * titleFontSize * 1.2
    const descriptionLines = produto.descricao ? this.breakTextEveryTwoWords(produto.descricao) : []
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
        const { width, height } = this.calculateImageDimensionsForA4(img)
        const imageX = centerX - width / 2
        const imageY = currentY

        this.ctx.drawImage(img, imageX, imageY, width, height)
        currentY += height + spacingAfterImage
        console.log("✅ Imagem do produto desenhada com sucesso:", { width, height, imageX, imageY })
      } catch (error) {
        console.error("❌ Erro ao carregar imagem do produto:", {
          error: error.message,
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

    const titleLines2 = this.breakTextEveryTwoWords(produto.nome)
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

      const descriptionLines = this.breakTextEveryTwoWords(produto.descricao)
      const descLineHeight = descriptionFontSize * 1.2
      const descCurrentY = currentY

      descriptionLines.forEach((line, index) => {
        this.ctx.fillText(line, centerX, descCurrentY + index * descLineHeight)
      })

      currentY += descriptionLines.length * descLineHeight + spacingAfterDescription
      console.log("✅ Descrição desenhada com quebras:", descriptionLines)
    }

    // Desenhar preço
    this.ctx.fillStyle = corPreco
    this.ctx.font = `bold ${priceFontSize}px Arial`
    let precoTexto: string
    if (typeof produto.preco === "number") {
      precoTexto = `R$ ${produto.preco.toFixed(2).replace(".", ",")}`
    } else {
      const clean = produto.preco.toString().trim()
      precoTexto = clean.startsWith("R") ? clean : `R$ ${clean}`
    }
    this.ctx.fillText(precoTexto, centerX, currentY)
    console.log("✅ Preço desenhado:", precoTexto)

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

  // Método específico para calcular dimensões no formato Feed
  private calculateImageDimensionsForFeed(img: HTMLImageElement) {
    const aspectRatio = img.width / img.height

    if (img.height > img.width) {
      // Imagem retrato - altura máxima 580px
      const height = Math.min(img.height, 580)
      const width = height * aspectRatio
      return { width, height }
    } else {
      // Imagem paisagem - largura máxima 400px
      const width = Math.min(img.width, 400)
      const height = width / aspectRatio
      return { width, height }
    }
  }

  // Método específico para calcular dimensões no formato Story
  private calculateImageDimensionsForStory(img: HTMLImageElement) {
    const aspectRatio = img.width / img.height

    if (img.height > img.width) {
      // Imagem retrato - altura máxima 580px
      const height = Math.min(img.height, 580)
      const width = height * aspectRatio
      return { width, height }
    } else {
      // Imagem paisagem - largura máxima 480px
      const width = Math.min(img.width, 480)
      const height = width / aspectRatio
      return { width, height }
    }
  }

  // Método específico para calcular dimensões no formato A4
  private calculateImageDimensionsForA4(img: HTMLImageElement) {
    const aspectRatio = img.width / img.height

    if (img.height > img.width) {
      // Imagem retrato - altura máxima 355px
      const height = Math.min(img.height, 355)
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
