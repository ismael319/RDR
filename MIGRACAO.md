# Plano de Migração — RDR

Roteiro para tirar o RDR do estado de protótipo (arquivo único, senhas em texto
puro) e transformá-lo em um projeto com build, código organizado e autenticação
de verdade. Cada fase é independente e pode ser feita em etapas separadas.

---

## Fase 1 — Documentação e schema (✅ já feita)

- [x] `README.md` com visão geral, stack e instruções.
- [x] `supabase/schema.sql` para recriar o banco.
- [x] `supabase/rls_fase2.sql` com o endurecimento de segurança.

---

## Fase 2 — Build e separação de arquivos

Objetivo: sair do `index.html` monolítico para um projeto React com build.

**Passos:**

1. Scaffold com Vite:
   ```bash
   npm create vite@latest rdr -- --template react
   npm i @supabase/supabase-js jspdf exceljs docx
   ```
2. Migrar o código do `<script>` atual para módulos, nesta ordem de dependência:
   ```
   src/
   ├── config.js              # SUPABASE_URL, SUPABASE_ANON_KEY
   ├── lib/
   │   ├── supabase.js        # createClient
   │   ├── session.js         # gestão de sessão (sessionStorage)
   │   ├── db.js              # fsdb + aprDb (funções de acesso a dados)
   │   └── mappers.js         # mapRecord, mapAtividade, mapMontagem, mapLog
   ├── lib/exports/
   │   ├── pdf.js             # gerarPDF (RDR)
   │   ├── pdfDashboard.js    # gerarPDFDashboard
   │   ├── excel.js           # exportarExcel
   │   └── docxApr.js         # gerarDocxAPR
   ├── components/
   │   ├── icons.jsx          # todos os ícones SVG
   │   ├── ui.jsx             # SectionLabel, Field, Header, Spinner, FolderTile
   │   ├── LoginScreen.jsx
   │   ├── HomeScreen.jsx
   │   ├── CampoHubScreen.jsx
   │   ├── FormScreen.jsx
   │   ├── RegistrosScreen.jsx
   │   ├── GestorScreen.jsx
   │   ├── DashboardScreen.jsx
   │   ├── AprScreen.jsx      # tela + edição de atividade + montar APR
   │   └── app.jsx            # roteador (App)
   ├── constants.js           # CATEGORIAS, ROLES_LIMITADAS, ROLE_LABELS
   └── main.jsx               # ReactDOM.render
   ```
3. Converter `React.createElement(...)` em JSX (Vite já compila).
4. Adicionar ESLint + Prettier para pegar erros antes de publicar.
5. Env vars: mover `SUPABASE_URL` e a key para `.env` (`import.meta.env.VITE_...`).

**Ganhos:** erro de sintaxe deixa de derrubar o app inteiro; dá para testar cada
módulo; base pronta para TypeScript e testes unitários.

---

## Fase 3 — Autenticação e RLS (segurança)

Objetivo: eliminar senha em texto puro, autorização no cliente e escrita aberta.

1. **Criar usuários via Auth** — substituir a tabela `rdr_users` por
   `auth.users` + `public.profiles` (o trigger de criação já está em
   `supabase/rls_fase2.sql`). Migrar os usuários existentes com o script de
   migração do mesmo arquivo.
2. **Login** — trocar `findUser` (query de senha) por `sb.auth.signInWithPassword`.
   Sessão passa a ser o JWT do Supabase (persistSession), não um objeto forjável
   em `sessionStorage`.
3. **Autorização** — o roteador (`App`) deve buscar o papel em
   `public.profiles` via `auth.uid()`, não no `user.role` da sessão. Mantenha as
   regras atuais:
   - `gestor`: tudo (gestão de usuários, APR, dashboard, hub de campo);
   - demais papéis: formulário, registros;
   - `tecnico`: sem dashboard (ver `index.html:8590`).
4. **Aplicar RLS** — rodar `supabase/rls_fase2.sql`. Depois disso, a `anon key`
   perde o poder de escrita e cada linha só pode ser lida/alterada por usuários
   autenticados (gestores, autores, etc.).
5. **Gestão de usuários** — o CRUD do `GestorScreen` deve chamar uma Edge
   Function (com `service_role`) para criar/editar/desativar contas — ou, no
   mínimo, operar sobre `profiles` com policies de gestor.
6. **Não expor `senha`** em nenhuma leitura; remover a coluna quando a migração
   terminar.

**Verificação:** após a fase, tente via `curl` um `select` anônimo em
`/rest/v1/rdr_records` e um `insert` em `rdr_users` — ambos devem falhar.

---

## Fase 4 — Fotos no Storage

Objetivo: tirar o base64 do banco.

1. Criar bucket privado (ex.: `rdr-fotos`) com policies por `auth.uid()`
   (leitura para autenticados, escrita apenas para o dono do registro).
2. `comprimirImagem` continua igual; em vez de gravar a data URL, fazer upload
   para o Storage e salvar apenas o `path` no `rdr_records.fotos`.
3. `gerarPDF`/pré-visualização: baixar o blob (`sb.storage.from(...).createSignedUrl`)
   antes de embutir no PDF.
4. Criar rotina de limpeza (ex.: Edge Function) para apagar fotos de registros
   excluídos.

**Ganhos:** banco pequeno, Realtime leve, tráfego reduzido.

---

## Fase 5 — Correção de bugs conhecidos

- [x] **DOCX `1234.docx`** — usar `montagem.numero` no `a.download` de
  `gerarDocxAPR` (agora em `src/docx-apr.js`).
- [x] **PDF do formulário** — `gerarPDF` já chama `await carregarJsPDF()` no
  início (`src/pdf.js`).
- [x] **Overflow no PDF do RDR** — quebra de página durante descrição e
  sugestão de correção via helper `boxTexto` (`src/pdf.js`).

---

## Fase 6 — (Opcional) Qualidade e operação

- Adicionar testes unitários para `mappers` e geração de PDF/Excel.
- Configurar GitHub Actions: lint + build + deploy estático.
- Variáveis de ambiente no deploy (não commitar keys).
- Remover o `seed` de gestor do código do cliente (hoje em `index.html:448`) e
  manter apenas no SQL.
