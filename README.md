# MegaZap

Interface de uma plataforma de atendimento multicanal, com uma primeira estrutura local para testar a API e o webhook da Gupshup. Os dados das conversas ainda são demonstrativos e ficam em memória no navegador.

## Executar localmente

```bash
npm install
```

Inicie o backend de teste e o front-end em terminais separados:

```bash
npm run api
npm run dev
```

Por padrão, `GUPSHUP_MODE=simulation` registra mensagens enviadas localmente, sem chamar a API externa. Para enviar mensagens da caixa de entrada ao sandbox, defina `GUPSHUP_MODE=sandbox` no `.env` e preencha as credenciais.

## Publicar no Cloudflare Pages

Crie um projeto Pages conectado ao repositório e configure:

- **Build command:** `npm run build`
- **Build output directory:** `dist`
- **Root directory:** diretório que contém este `package.json`

As rotas serverless ficam em `functions/`, incluindo `POST /webhooks/gupshup`, `GET /api/inbox`, `POST /api/messages` e `GET /health`.

Para que a caixa de entrada e o webhook compartilhem mensagens entre requisições, crie um namespace **Workers KV** e adicione ao projeto Pages em **Settings → Bindings → Add → KV namespace**. Use `MEGAZAP_STORE` como nome do binding e selecione o namespace. Faça um novo deploy após configurar o binding. Sem ele, as rotas de API não conseguem armazenar o estado.

Em **Settings → Variables and Secrets**, configure `GUPSHUP_MODE` como `sandbox` para enviar mensagens reais pelo sandbox. Adicione `GUPSHUP_API_KEY` como secret e configure `GUPSHUP_SOURCE` e `GUPSHUP_APP_NAME` como variáveis. Para apenas receber webhooks, mantenha o modo `simulation`; as credenciais de envio não são necessárias.

Depois do deploy, configure na Gupshup o webhook de mensagens recebidas para `https://<seu-projeto>.pages.dev/webhooks/gupshup`. A URL `/health` deve responder `{"status":"ok"}`. No Pages, mudanças em variáveis, secrets ou bindings podem exigir um novo deploy para surtirem efeito.

O armazenamento de teste é um único registro KV compartilhado e não substitui um banco de dados de produção. Use um namespace separado para cada ambiente. Para testar envio pela API, as credenciais do sandbox e o número de origem precisam estar autorizados pela configuração da Gupshup.

### Deploy usando Workers e `workers.dev`

Se o projeto foi criado no fluxo novo de Workers e a URL pública termina em `workers.dev`, publique também o Worker de roteamento deste repositório. O arquivo `wrangler.toml` aponta para `worker.js`, que encaminha `/webhooks/gupshup` e `/api/*` às Functions e serve o front-end pelos assets de `dist`.

Na raiz deste projeto, execute `npm run deploy:cloudflare` após autenticar o Wrangler com `npx wrangler login`. O deploy exige que o projeto Workers possa publicar o Worker `megazap`. O estado da caixa de entrada fica em um Durable Object para que uma mensagem recebida apareça logo após o webhook gravá-la; a primeira leitura importa automaticamente o estado anterior do KV. O endpoint GET do webhook deve responder `{"status":"ok","endpoint":"gupshup-webhook"}`.

## Teste inicial da Gupshup

1. Copie `.env.example` para `.env` e preencha as credenciais do sandbox localmente. Nunca coloque a API key em arquivos `src/` nem a envie pelo chat.
2. Em um terminal, inicie o receptor de webhook:

   ```bash
   npm run api
   ```

3. Configure o webhook de mensagens recebidas da Gupshup para `https://<dominio-publico>/webhooks/gupshup`. Para testes locais, exponha o Vite (porta 5173) por uma URL HTTPS pública; o proxy encaminha `/webhooks` ao backend local.
4. Em outro terminal, envie uma única mensagem fixa (`Mensagem teste`) para o destinatário de sandbox configurado em `GUPSHUP_TEST_DESTINATION`:

   ```bash
   npm run gupshup:test
   ```

Mensagens enviadas pela caixa de entrada e recebidas como eventos `message` no webhook criam/atualizam conversas e ficam em memória enquanto o backend estiver ativo. A interface consulta o backend periodicamente. Eventos de status são reconhecidos e ignorados; o conteúdo não é persistido em disco nem registrado em logs. A confirmação de envio da API indica que a Gupshup aceitou a mensagem para processamento; a entrega deve ser verificada pelo webhook. O teste de envio fixo só é executado quando `npm run gupshup:test` é chamado explicitamente.

Para validar a aplicação:

```bash
npm run lint
npm run build
```

## Organização

- `src/components/`: componentes reutilizáveis da navegação, caixa de entrada, cadastros, ícones e formulários.
- `src/data/initialData.js`: dados de demonstração para a interface.
- `src/App.jsx`: composição da aplicação e estado dos cadastros.
- `src/App.css` e `src/index.css`: estilos da interface e estilos globais.
- `backend/server.js`: receptor local de webhook Gupshup.
- `scripts/send-gupshup-test.js`: envio explícito de uma mensagem de teste pelo servidor.

## Funcionalidades da interface

- Caixa de entrada com busca, filas de conversas em andamento/espera, histórico, transferência entre setores ou operadores e encerramento de atendimento.
- Caixa de entrada de teste sincronizada com mensagens enviadas e eventos recebidos pelo webhook da Gupshup.
- Cadastros de contatos, filas, setores, operadores, mensagens rápidas e templates.
- Templates ficam como rascunho até a futura conexão com o WhatsApp.
