import { URL } from 'node:url';
import { Request, Response } from 'express';
import { getDarkreadUrl } from '../darkread.js';
import { HttpStatus } from '../http-status.js';
import { getCached, setCached } from '../url-cache.js';

export async function darkreadHandler(
  req: Request,
  res: Response,
): Promise<void> {
  const url = extractUrl(req.query);

  if (!url) {
    res
      .status(HttpStatus.BadRequest)
      .json({ error: 'Parâmetro ?url= obrigatório' });
    return;
  }

  if (!isValidUrl(url)) {
    res.status(HttpStatus.BadRequest).json({ error: 'URL inválida' });
    return;
  }

  try {
    const cached = getCached(url);
    const darkreadUrl = cached ?? (await getDarkreadUrl(url));
    if (!cached) setCached(url, darkreadUrl);
    sendResult(res, darkreadUrl);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(message);
    res.status(HttpStatus.BadGateway).json({ error: message });
  }
}

function extractUrl(query: Request['query']): string | null {
  const { url } = query;
  return url && typeof url === 'string' ? url : null;
}

function isValidUrl(url: string): boolean {
  try {
    const { protocol } = new URL(url);
    return protocol === 'http:' || protocol === 'https:';
  } catch {
    return false;
  }
}

function sendResult(res: Response, darkreadUrl: string): void {
  if (process.env.NODE_ENV === 'production') {
    res.redirect(HttpStatus.Found, darkreadUrl);
  } else {
    res.json({ url: darkreadUrl });
  }
}
