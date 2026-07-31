-- ============================================================================
-- RDR — BDR Segurança · Schema do Supabase (PostgreSQL)
-- ----------------------------------------------------------------------------
-- Como usar: abra o projeto em https://supabase.com/dashboard, acesse
-- "SQL Editor" e execute este arquivo.
--
-- Este script espelha o estado ATUAL do app (v0): 100% client-side, login por
-- texto puro, acesso via anon key. Por isso o RLS fica DESABILITADO nas
-- tabelas (necessário para o app funcionar hoje).
--
-- O script de endurecimento (RLS + Auth) está em: supabase/rls_fase2.sql
-- Aplique-o SOMENTE após concluir a Fase 3 do plano de migração (MIGRACAO.md),
-- caso contrário o app atual para de funcionar.
-- ============================================================================

-- ============================================================================
-- 1) TABELAS
-- ============================================================================

-- ----------------------------------------------------------------------------
-- rdr_users — usuários do sistema
-- Valores de role: 'gestor' | 'gestorobra' | 'tecnico' | 'engcivil'
--                  | 'engplan' | 'encarregado' | 'adm'
-- ----------------------------------------------------------------------------
create table if not exists public.rdr_users (
  id      uuid primary key default gen_random_uuid(),
  nome    text not null,
  usuario text not null unique,
  senha   text not null,          -- AVISO: texto puro na v0. Sem hash até a
                                  -- migração para Supabase Auth (fase 3).
  role    text not null default 'tecnico',
  ativo   boolean not null default true
);

-- ----------------------------------------------------------------------------
-- rdr_records — registros de desvio e reconhecimento
-- categorias: jsonb (array de strings)
-- fotos:      jsonb (array de {url: dataURL base64, name: string}), máx. 4
-- concluido:  text ('SIM' | 'NÃO' | '') — NÃO é boolean no app
-- ----------------------------------------------------------------------------
create table if not exists public.rdr_records (
  id                   uuid primary key default gen_random_uuid(),
  data_ocorrido        date not null,
  hora                 text default '',
  autor_id             uuid,
  autor_nome           text not null,
  local                text default '',
  categorias           jsonb not null default '[]'::jsonb,
  concluido            text default '',
  nome_colaborador     text default '',
  responsavel_setor    text default '',
  responsavel_registro text default '',
  descricao            text not null,
  sugestao_correcao    text default '',
  prazo                date,
  fotos                jsonb not null default '[]'::jsonb,
  saved_at             timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- apr_atividades — biblioteca de atividades da APR
-- fases: jsonb (array de objetos)
--   { fase, riscos[], consequencias[], medidasIndividuais[], medidasColetivas[] }
-- ordem: bigint (o app grava Date.now(), que estoura int4)
-- ----------------------------------------------------------------------------
create table if not exists public.apr_atividades (
  id                   uuid primary key default gen_random_uuid(),
  nome                 text not null,
  area                 text default '',
  assunto              text default '',
  equipamentos         text default '',
  epis                 text default '',
  recomendacoes_gerais text default '',
  fases                jsonb not null default '[]'::jsonb,
  ordem                bigint not null default 0
);

-- ----------------------------------------------------------------------------
-- apr_montagens — APRs montadas / salvas
-- criada_em: precisa de default now(): o upsert de edição NÃO envia a coluna.
-- ----------------------------------------------------------------------------
create table if not exists public.apr_montagens (
  id                   uuid primary key default gen_random_uuid(),
  nome                 text not null,
  numero               text default '',
  area                 text default '',
  responsavel_sesmt    text default '',
  funcao               text default '',
  assunto              text default '',
  local                text default '',
  data_inicio          date,
  data_termino         date,
  equipamentos         text default '',
  epis                 text default '',
  recomendacoes_gerais text default '',
  fases                jsonb not null default '[]'::jsonb,
  autor_id             uuid,
  autor_nome           text default '',
  criada_em            timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- apr_log — histórico de alterações nas atividades da APR
-- dados: jsonb (objeto com tipo, atividadeNome, faseNome, autorNome, antes,
--        depois, etc.)
-- ----------------------------------------------------------------------------
create table if not exists public.apr_log (
  id           uuid primary key default gen_random_uuid(),
  tipo         text not null,
  atividade_id text,
  dados        jsonb not null default '{}'::jsonb,
  revertido    boolean not null default false,
  criada_em    timestamptz not null default now()
);

-- ============================================================================
-- 2) ÍNDICES (desempenho das listagens e do Realtime)
-- ============================================================================

create index if not exists rdr_records_autor_id_idx  on public.rdr_records (autor_id);
create index if not exists rdr_records_saved_at_idx  on public.rdr_records (saved_at desc);
create index if not exists apr_atividades_ordem_idx  on public.apr_atividades (ordem);
create index if not exists apr_montagens_criada_idx  on public.apr_montagens (criada_em desc);
create index if not exists apr_log_criada_idx        on public.apr_log (criada_em desc);

-- ============================================================================
-- 3) SEED — usuário administrador inicial
-- ----------------------------------------------------------------------------
-- A senha '1234' é a mesma que o app cria automaticamente quando a tabela
-- está vazia. Troque-a pelo SQL abaixo (ATENÇÃO: texto puro — veja fase 3).
--
-- update public.rdr_users
--    set senha = 'senha-forte-temporaria'
--  where usuario = 'gestor';
-- ============================================================================

insert into public.rdr_users (nome, usuario, senha, role, ativo)
values ('Administrador', 'gestor', '1234', 'gestor', true)
on conflict (usuario) do nothing;

-- ============================================================================
-- 4) REALTIME (opcional — pode ser feito pelo dashboard)
-- ----------------------------------------------------------------------------
-- No dashboard: Database > Replication > habilite as 5 tabelas.
-- Via SQL (requer privilégio de owner):
--
-- alter publication supabase_realtime add table public.rdr_users;
-- alter publication supabase_realtime add table public.rdr_records;
-- alter publication supabase_realtime add table public.apr_atividades;
-- alter publication supabase_realtime add table public.apr_montagens;
-- alter publication supabase_realtime add table public.apr_log;
-- ============================================================================
