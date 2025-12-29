-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create tables

-- Administradores
create table if not exists administradores (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  email text not null unique,
  senha text not null, -- Plain text as per app logic requirements
  status text not null default 'ativo' check (status in ('ativo', 'inativo')),
  ultimo_login timestamp with time zone,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Lojas
create table if not exists lojas (
  id uuid primary key default uuid_generate_v4(),
  codigo text not null,
  nome text not null,
  endereco text not null,
  usuario text not null unique,
  senha text not null, -- Plain text as per app logic requirements
  selo_url text,
  status text not null default 'ativa' check (status in ('ativa', 'inativa')),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Campanhas
create table if not exists campanhas (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  tipo text not null check (tipo in ('fixa', 'customizada')),
  status text not null default 'ativa' check (status in ('ativa', 'inativa')),
  cores jsonb not null default '{}'::jsonb,
  fundos jsonb not null default '{}'::jsonb,
  -- Formatting fields
  espacamento_superior_feed integer,
  espacamento_superior_story integer,
  espacamento_superior_a4 integer,
  espacamento_produto_textos_feed integer,
  espacamento_produto_textos_story integer,
  espacamento_produto_textos_a4 integer,
  tamanho_titulo_feed integer,
  tamanho_descricao_feed integer,
  tamanho_preco_feed integer,
  tamanho_titulo_story integer,
  tamanho_descricao_story integer,
  tamanho_preco_story integer,
  tamanho_titulo_a4 integer,
  tamanho_descricao_a4 integer,
  tamanho_preco_a4 integer,
  quebra_linha_titulo_feed integer,
  quebra_linha_descricao_feed integer,
  quebra_linha_titulo_story integer,
  quebra_linha_descricao_story integer,
  quebra_linha_titulo_a4 integer,
  quebra_linha_descricao_a4 integer,
  tamanho_selo_feed integer,
  tamanho_selo_story integer,
  tamanho_selo_a4 integer,
  margem_esquerda_feed integer,
  
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Produtos
create table if not exists produtos (
  id uuid primary key default uuid_generate_v4(),
  campanha_id uuid references campanhas(id) on delete cascade not null,
  nome text not null,
  descricao text,
  preco text not null,
  ean text,
  club boolean default false,
  imagem_url text,
  imagem_path text,
  ordem integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Artes Geradas
create table if not exists artes_geradas (
  id uuid primary key default uuid_generate_v4(),
  campanha_id uuid references campanhas(id) on delete cascade not null,
  imagem_url text not null,
  imagem_path text,
  created_at timestamp with time zone default now()
);

-- Admin Preview Product (for temporary previews)
create table if not exists admin_preview_product (
  id uuid primary key default uuid_generate_v4(),
  nome text not null,
  descricao text,
  preco text not null,
  ativo boolean default true,
  imagem_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- 2. Storage Buckets
insert into storage.buckets (id, name, public) 
values 
  ('produtos', 'produtos', true),
  ('fundos-campanhas', 'fundos-campanhas', true),
  ('artes-geradas', 'artes-geradas', true),
  ('selos', 'selos', true)
on conflict (id) do nothing;

-- 3. RLS Policies (Open availability for demo purposes, restrict in production)
alter table administradores enable row level security;
create policy "Enable all access for all users" on administradores for all using (true) with check (true);

alter table lojas enable row level security;
create policy "Enable all access for all users" on lojas for all using (true) with check (true);

alter table campanhas enable row level security;
create policy "Enable all access for all users" on campanhas for all using (true) with check (true);

alter table produtos enable row level security;
create policy "Enable all access for all users" on produtos for all using (true) with check (true);

alter table artes_geradas enable row level security;
create policy "Enable all access for all users" on artes_geradas for all using (true) with check (true);

alter table admin_preview_product enable row level security;
create policy "Enable all access for all users" on admin_preview_product for all using (true) with check (true);

-- Storage Policies
create policy "Give users access to own folder 1qnj5h_0" on storage.objects for select to public using (bucket_id = 'produtos');
create policy "Give users access to own folder 1qnj5h_1" on storage.objects for insert to public with check (bucket_id = 'produtos');
create policy "Give users access to own folder 1qnj5h_2" on storage.objects for delete to public using (bucket_id = 'produtos');

create policy "Give users access to fundos 1qnj5h_0" on storage.objects for select to public using (bucket_id = 'fundos-campanhas');
create policy "Give users access to fundos 1qnj5h_1" on storage.objects for insert to public with check (bucket_id = 'fundos-campanhas');
create policy "Give users access to fundos 1qnj5h_2" on storage.objects for delete to public using (bucket_id = 'fundos-campanhas');

create policy "Give users access to artes 1qnj5h_0" on storage.objects for select to public using (bucket_id = 'artes-geradas');
create policy "Give users access to artes 1qnj5h_1" on storage.objects for insert to public with check (bucket_id = 'artes-geradas');
create policy "Give users access to artes 1qnj5h_2" on storage.objects for delete to public using (bucket_id = 'artes-geradas');

create policy "Give users access to selos 1qnj5h_0" on storage.objects for select to public using (bucket_id = 'selos');
create policy "Give users access to selos 1qnj5h_1" on storage.objects for insert to public with check (bucket_id = 'selos');
create policy "Give users access to selos 1qnj5h_2" on storage.objects for delete to public using (bucket_id = 'selos');


-- 4. Initial Data
insert into administradores (nome, email, senha, status)
values ('Administrador', 'admin@hiperfarma.com', 'admin123', 'ativo')
on conflict (email) do nothing;

insert into lojas (codigo, nome, endereco, usuario, senha, status)
values ('001', 'Loja Matriz', 'Rua Principal, 123', 'loja@hiperfarma.com', 'loja123', 'ativa')
on conflict (usuario) do nothing;
