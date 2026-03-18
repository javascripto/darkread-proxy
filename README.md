# darkread-proxy

Proxy HTTP que recebe uma URL por query string e retorna o link correspondente no [darkread.io](https://www.darkread.io) — um serviço de leitura sem distrações.

## Instalação e uso

```bash
npm install
npm run dev
```

```
GET http://localhost:3000/darkread?url=https://exemplo.com/artigo
→ { "url": "https://www.darkread.io/ox_dmKRxYtR0" }
```

Em produção (`NODE_ENV=production`), o endpoint faz redirect 302. Com `cors=true`, o redirect aponta para o proxy CORS interno que serve o conteúdo com `Access-Control-Allow-Origin: *`.

## Rotas

| Rota | Descrição |
|---|---|
| `GET /` | Redireciona para `/darkread` repassando a query string |
| `GET /darkread?url=<url>` | Converte uma URL para o link darkread correspondente |
| `GET /proxy/<url>` | Proxy CORS — serve qualquer URL com `Access-Control-Allow-Origin: *` |
| `GET /health` | Health check |

### `GET /darkread`

**Parâmetros:**

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `url` | sim | URL do artigo (`http` ou `https`) |
| `cors` | não | `true` para retornar o conteúdo via proxy CORS |

**Respostas:**

| Status | Descrição |
|---|---|
| `200` | `{ "url": "...", "corsUrl": "/proxy/..." }` (dev) |
| `302` | Redirect para a URL do darkread (produção, sem `cors=true`) |
| `302` | Redirect para `/proxy/<darkreadUrl>` (produção, com `cors=true`) |
| `400` | URL ausente, inválida ou com protocolo não permitido |
| `429` | Rate limit excedido (30 req/min por IP) |
| `502` | Falha na comunicação com o darkread.io |

### `GET /proxy/<url>`

Proxy baseado em [cors-anywhere](https://www.npmjs.com/package/cors-anywhere). Busca a URL alvo e devolve o conteúdo com o header `Access-Control-Allow-Origin: *`, permitindo consumo direto pelo browser.

```
GET /proxy/https://www.darkread.io/abc123
→ conteúdo da página com Access-Control-Allow-Origin: *
```

## Como funciona

1. Na primeira request (ou após 30 min de cache expirado), faz um GET no darkread.io e extrai o `next-action` hash do HTML ou do page chunk do Next.js
2. Submete a URL via POST usando o protocolo de Server Actions do Next.js (timeout de 10s)
3. Extrai o ID gerado do header `x-action-redirect` da resposta
4. Armazena o resultado em cache por 10 min e retorna a URL final do darkread

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia com hot-reload (`tsx watch`) |
| `npm start` | Inicia em modo produção |
| `npm run build` | Compila TypeScript |
| `npm run lint` | Lint com Biome |
| `npm run format` | Formata com Biome |
| `npm run biome:check` | Lint + format com Biome |

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3000` | Porta do servidor |
| `NODE_ENV` | — | `production` ativa redirect 302 no `/darkread` |
| `VERCEL_URL` | — | Definida automaticamente pelo Vercel; usada para montar a `BASE_URL` |

## Deploy (Vercel)

O projeto já está configurado para deploy no Vercel via `vercel.json`. Basta conectar o repositório na plataforma — nenhuma configuração adicional é necessária.
