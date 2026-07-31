-- ============================================================================
-- RDR — FASE 3: Endurecimento de segurança (Supabase Auth + RLS)
-- ----------------------------------------------------------------------------
-- ⚠️  APLIQUE ESTE SCRIPT SOMENTE APÓS migrar o código para usar
--     sb.auth (login via Supabase Auth) e reescrever fsdb/aprDb com
--     a sessão JWT. Enquanto o app usar senha em texto puro + anon key,
--     aplicar este script QUEBRA o login e as escritas.
--
-- O que este script faz:
--   1. Cria public.profiles (perfil do usuário autenticado, com role);
--   2. Migra os usuários existentes de rdr_users para auth.users/profiles;
--   3. Ativa RLS em todas as tabelas com policies baseadas em auth.uid();
--   4. Bloqueia escrita anônima (anon key passa a ser somente leitura nas
--      exceções abaixo) — todo dado sensível exige login.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1) PROFILES — perfil público ligado a auth.users
-- ----------------------------------------------------------------------------
create table if not exists public.profiles (
  id      uuid primary key references auth.users (id) on delete cascade,
  nome    text not null,
  role    text not null default 'tecnico',
  ativo   boolean not null default true
);

-- trigger: cria o perfil automaticamente no signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, nome, role, ativo)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'nome', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data ->> 'role', 'tecnico'),
    true
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 2) MIGRAÇÃO dos usuários antigos (rdr_users -> auth.users + profiles)
--    Rodar UMA VEZ, antes de desativar a tabela rdr_users.
--    O código migrado deverá trocar a senha (Supabase envia e-mail de
--    "password recovery" — ou use a senha temporária definida aqui).
-- ----------------------------------------------------------------------------
do $$
declare
  u record;
begin
  for u in select * from public.rdr_users loop
    -- garante que a senha chega hasheada (o client do Supabase exige hash bcrypt)
    insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
    values (
      u.id,
      u.usuario || '@rdr.bdr.local',
      crypt(u.senha, gen_salt('bf')),
      now(),
      jsonb_build_object('nome', u.nome, 'role', u.role)
    )
    on conflict (id) do update
      set raw_user_meta_data = jsonb_build_object('nome', u.nome, 'role', u.role);

    insert into public.profiles (id, nome, role, ativo)
    values (u.id, u.nome, u.role, u.ativo)
    on conflict (id) do update
      set nome = u.nome, role = u.role, ativo = u.ativo;
  end loop;
end $$;

-- ============================================================================
-- 3) RLS + POLICIES
-- ============================================================================

-- ---------- profiles ---------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles_select_autenticado" on public.profiles
  for select to authenticated using (true);

create policy "profiles_update_proprio" on public.profiles
  for update to authenticated
  using (id = auth.uid());

create policy "profiles_update_gestor" on public.profiles
  for update to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'gestor');

create policy "profiles_insert_autenticado" on public.profiles
  for insert to authenticated with check (id = auth.uid());

-- ---------- rdr_records ------------------------------------------------------
alter table public.rdr_records enable row level security;

create policy "records_select_autenticado" on public.rdr_records
  for select to authenticated using (true);

create policy "records_insert_autor" on public.rdr_records
  for insert to authenticated with check (autor_id = auth.uid());

create policy "records_update_gestor_ou_autor" on public.rdr_records
  for update to authenticated
  using (autor_id = auth.uid()
         or (select role from public.profiles where id = auth.uid()) = 'gestor');

create policy "records_delete_gestor" on public.rdr_records
  for delete to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'gestor');

-- ---------- apr_atividades ---------------------------------------------------
alter table public.apr_atividades enable row level security;

create policy "apr_ativ_select_autenticado" on public.apr_atividades
  for select to authenticated using (true);

create policy "apr_ativ_write_autenticado" on public.apr_atividades
  for all to authenticated using (true) with check (true);

-- ---------- apr_montagens ----------------------------------------------------
alter table public.apr_montagens enable row level security;

create policy "apr_mont_select_autenticado" on public.apr_montagens
  for select to authenticated using (true);

create policy "apr_mont_write_gestor_ou_autor" on public.apr_montagens
  for all to authenticated
  using (autor_id = auth.uid()
         or (select role from public.profiles where id = auth.uid()) = 'gestor')
  with check (autor_id = auth.uid()
              or (select role from public.profiles where id = auth.uid()) = 'gestor');

-- ---------- apr_log ----------------------------------------------------------
alter table public.apr_log enable row level security;

create policy "apr_log_select_autenticado" on public.apr_log
  for select to authenticated using (true);

create policy "apr_log_write_autenticado" on public.apr_log
  for all to authenticated using (true) with check (true);

-- ---------- rdr_users (legado) ------------------------------------------------
-- Após a migração, o app NÃO deve mais ler/escrever rdr_users. Bloqueie:
alter table public.rdr_users enable row level security;

create policy "rdr_users_select_gestor" on public.rdr_users
  for select to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'gestor');

create policy "rdr_users_write_gestor" on public.rdr_users
  for all to authenticated
  using ((select role from public.profiles where id = auth.uid()) = 'gestor')
  with check ((select role from public.profiles where id = auth.uid()) = 'gestor');

-- ============================================================================
-- 4) TAREFAS PENDENTES (fora do SQL)
-- ----------------------------------------------------------------------------
--  a) Migre fsdb.updateUser/addUser/deleteUser/findUser para usar
--     sb.auth.admin (service role, somente no backend/Edge Function) ou
--     reduza o client a: sb.auth.signInWithPassword + update do profile.
--
--  b) Em cada createClient, use persistSession (JWT) em vez de
--     sessionStorage manual; remova o campo 'senha' de qualquer select.
--
--  c) Rota do app: substitua user.role lido da sessão por
--     (await sb.auth.getUser()) + consulta a public.profiles.
--
--  d) Fotos: migrar para Storage (bucket privado) antes de remover a
--     coluna fotos (ver MIGRACAO.md, fase 4).
-- ============================================================================
