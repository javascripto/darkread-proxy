import fetch from 'node-fetch';
import { ONE_MINUTE_MS } from './config';

const CACHE_TTL_MS = 30 * ONE_MINUTE_MS;
const DARKREAD_URL = 'https://www.darkread.io';

// O minificador do Next.js gera: (0,a.createServerReference)("hash",...)
// ou: createServerReference)("hash",...) após tree-shaking
const HASH_PATTERNS: RegExp[] = [
  /createServerReference\)?[\s(]*["']([a-f0-9]{40,})["']/,
  /\$ACTION_ID_([a-f0-9]{40,})/,
  /data-action(?:-id)?=["']([a-f0-9]{40,})["']/,
  /"id"\s*:\s*"([a-f0-9]{40,})"/,
];

let cachedHash: string | null = null;
let cacheTime = 0;

function extractHash(text: string): string | null {
  for (const pattern of HASH_PATTERNS) {
    const match = text.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchNextActionHash(): Promise<string> {
  const now = Date.now();
  if (cachedHash && now - cacheTime < CACHE_TTL_MS) {
    return cachedHash;
  }

  console.log('Buscando next-action hash...');

  const res = await fetch(DARKREAD_URL, {
    headers: { 'user-agent': 'Mozilla/5.0 (compatible)' },
  });
  const html = await res.text();

  // Tenta extrair do HTML direto
  const hashFromHtml = extractHash(html);
  if (hashFromHtml) {
    return setCache(hashFromHtml, 'HTML');
  }

  // Busca o chunk da página home — é onde o Server Action fica definido
  const pageChunkMatch = html.match(
    /\/_next\/static\/chunks\/app\/(?:%28home%29|\(home\))\/page-[a-f0-9]+\.js/,
  );
  if (pageChunkMatch) {
    // Decodifica caso venha percent-encoded na URL
    const chunkPath = pageChunkMatch[0].replace('%28home%29', '(home)');
    const chunkUrl = `${DARKREAD_URL}${chunkPath}`;
    console.log(`Tentando page chunk: ${chunkUrl}`);
    const chunkRes = await fetch(chunkUrl, {
      headers: { 'user-agent': 'Mozilla/5.0 (compatible)' },
    });
    const js = await chunkRes.text();
    const hashFromChunk = extractHash(js);
    if (hashFromChunk) {
      return setCache(hashFromChunk, 'page chunk');
    }
  }

  throw new Error('Não foi possível extrair o next-action hash');
}

function setCache(hash: string, source: string): string {
  cachedHash = hash;
  cacheTime = Date.now();
  console.log(`Hash extraído (${source}): ${hash}`);
  return hash;
}

export function invalidateCache(): void {
  cachedHash = null;
  cacheTime = 0;
}
