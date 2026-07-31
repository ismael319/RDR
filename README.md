# RDR — BDR Segurança

Sistema de **Registro de Desvios e Reconhecimentos** (RDR) de segurança do trabalho, com gestão de indicadores, análise preliminar de riscos (APR) e exportação de documentos (PDF, Excel e DOCX).

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | React 18 (UMD via CDN) em arquivo único `index.html`, sem build |
| Backend | Supabase (PostgreSQL + Realtime) |
| Exportações | jsPDF, ExcelJS, docx (lazy-load via CDN) |

## Funcionalidades

- **Login por papel** — `gestor`, `gestorobra`, `tecnico` (TST), `engcivil`, `engplan`, `encarregado`, `adm`.
- **Registro de desvios (RDR)** — data/hora, local, 9 categorias, descrição, sugestão de correção, prazo, responsáveis e até 4 fotos (comprimidas no navegador).
- **Dashboard de indicadores** — totais, taxa de conclusão, desvios por categoria, por TST e evolução mensal; exportação em PDF e Excel (5 abas: Resumo, Detalhamento, Pendentes, Por Técnico, Por Categoria).
- **APR — Análise Preliminar de Riscos** — biblioteca de atividades com fases (riscos, consequências, medidas individuais/coletivas), histórico com desfazer, importação de JSON e geração de DOCX (A4 paisagem, com header/footer e tabela de equipe).
- **Sincronização em tempo real** via Realtime do Supabase.
- Layout mobile-first (PWA-style, tema escuro).

## Executar

Deploy estático: publique o arquivo `index.html` em qualquer hosting (Netlify, Vercel, GitHub Pages, etc.). É um app 100% client-side — não há servidor para rodar.

Pré-requisitos:

1. Projeto no Supabase com as tabelas de `supabase/schema.sql` criadas (SQL Editor).
2. Realtime habilitado nas 5 tabelas (Database > Replication).
3. A URL e a `anon key` do projeto são hardcoded no início do script (`SUPABASE_URL` / `SUPABASE_ANON_KEY`). Substitua pelas do seu projeto.

## Banco de dados

Schema completo em [`supabase/schema.sql`](supabase/schema.sql).

| Tabela | Finalidade |
|---|---|
| `rdr_users` | Usuários e papéis |
| `rdr_records` | Registros de desvio (fotos e categorias em `jsonb`) |
| `apr_atividades` | Biblioteca de atividades da APR |
| `apr_montagens` | APRs montadas |
| `apr_log` | Histórico de alterações |

Papéis (`role`): `gestor` (administrador), `gestorobra` (gerente de contrato), `tecnico` (TST), `engcivil`, `engplan`, `encarregado`, `adm`.

## Limitações e segurança (leia)

> ⚠️ **Estado atual é um protótipo funcional, não seguro para produção.**

- Senhas em **texto puro** no banco e comparadas por igualdade (sem hash).
- Autorização por papel feita **apenas no cliente** — a sessão em `sessionStorage` pode ser forjada e a `anon key` permite escrita. Qualquer pessoa pode acessar o REST API diretamente e virar administrador.
- Fotos armazenadas como base64 na própria tabela (inflam o banco e o tráfego).
- CDNs carregadas sem SRI e sem Content-Security-Policy.

O script de endurecimento (Supabase Auth + RLS + migração de dados) está em [`supabase/rls_fase2.sql`](supabase/rls_fase2.sql) e o roteiro completo de evolução em [`MIGRACAO.md`](MIGRACAO.md).

## Bugs conhecidos

- O DOCX da APR sempre baixa como `1234.docx` (ignora o número da APR).
- O botão "PDF" do formulário de RDR depende de o jsPDF já estar carregado na sessão (só o dashboard faz o carregamento sob demanda).
- Descrições muito longas podem estourar a página no PDF do RDR.
