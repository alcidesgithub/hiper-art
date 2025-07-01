-- Adicionar funções auxiliares para verificar colunas

-- Função para verificar colunas de uma tabela
CREATE OR REPLACE FUNCTION get_table_columns(table_name text)
RETURNS TABLE(column_name text, data_type text, is_nullable text) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.column_name::text,
    c.data_type::text,
    c.is_nullable::text
  FROM information_schema.columns c
  WHERE c.table_name = $1
  AND c.table_schema = 'public';
END;
$$ LANGUAGE plpgsql;

-- Função para verificar se uma coluna existe
CREATE OR REPLACE FUNCTION column_exists(table_name text, column_name text)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = $1
    AND column_name = $2
    AND table_schema = 'public'
  );
END;
$$ LANGUAGE plpgsql;
