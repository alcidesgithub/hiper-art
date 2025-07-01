-- Script para adicionar imagens placeholder aos produtos que não têm imagem
-- Isso resolve o problema das artes geradas não mostrarem produtos

-- Primeiro, vamos verificar quantos produtos não têm imagem
SELECT 
  COUNT(*) as total_produtos,
  COUNT(imagem_url) as com_imagem,
  COUNT(*) - COUNT(imagem_url) as sem_imagem
FROM produtos;

-- Adicionar imagens placeholder para produtos sem imagem
-- Usando imagens de exemplo do Unsplash para diferentes categorias de produtos

UPDATE produtos 
SET 
  imagem_url = CASE 
    WHEN nome ILIKE '%sabonete%' OR nome ILIKE '%shampoo%' OR nome ILIKE '%condicionador%' 
      THEN 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400&h=400&fit=crop'
    WHEN nome ILIKE '%fralda%' OR nome ILIKE '%baby%' OR nome ILIKE '%bebê%' 
      THEN 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop'
    WHEN nome ILIKE '%remédio%' OR nome ILIKE '%medicamento%' OR nome ILIKE '%vitamina%'
      THEN 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&h=400&fit=crop'
    WHEN nome ILIKE '%creme%' OR nome ILIKE '%loção%' OR nome ILIKE '%hidratante%'
      THEN 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=400&h=400&fit=crop'
    WHEN nome ILIKE '%perfume%' OR nome ILIKE '%desodorante%' OR nome ILIKE '%colônia%'
      THEN 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop'
    ELSE 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=400&h=400&fit=crop'
  END,
  updated_at = NOW()
WHERE imagem_url IS NULL OR imagem_url = '';

-- Verificar o resultado
SELECT 
  COUNT(*) as total_produtos,
  COUNT(imagem_url) as com_imagem,
  COUNT(*) - COUNT(imagem_url) as sem_imagem
FROM produtos;

-- Mostrar alguns exemplos dos produtos atualizados
SELECT 
  nome,
  imagem_url,
  created_at
FROM produtos 
WHERE imagem_url IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- Comentário: 
-- Este script adiciona imagens placeholder para todos os produtos que não têm imagem.
-- As imagens são categorizadas por tipo de produto para maior realismo.
-- Após executar este script, as artes geradas devem mostrar as imagens dos produtos.
