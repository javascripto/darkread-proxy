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

Em produção (`NODE_ENV=production`), o endpoint faz redirect 302 direto para a URL do darkread em vez de retornar JSON.

## Rotas

| Rota | Descrição |
|---|---|
| `GET /` | Página inicial com instruções de uso |
| `GET /darkread?url=<url>` | Converte uma URL para o link darkread correspondente |
| `GET /health` | Health check |

### `GET /darkread`

**Parâmetros:**

| Parâmetro | Obrigatório | Descrição |
|---|---|---|
| `url` | sim | URL do artigo (`http` ou `https`) |

**Respostas:**

| Status | Descrição |
|---|---|
| `200` | `{ "url": "https://www.darkread.io/..." }` (dev) |
| `302` | Redirect para a URL do darkread (produção) |
| `400` | URL ausente, inválida ou com protocolo não permitido |
| `429` | Rate limit excedido (30 req/min por IP) |
| `502` | Falha na comunicação com o darkread.io |

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
