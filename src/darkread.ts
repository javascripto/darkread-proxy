import FormData from 'form-data';
import { fetchNextActionHash, invalidateCache } from './hash';
import { ONE_SECOND_MS } from './config';

const DARKREAD_URL = 'https://www.darkread.io';
const FETCH_TIMEOUT_MS = 10 * ONE_SECOND_MS;

const ROUTER_STATE =
  '%5B%22%22%2C%7B%22children%22%3A%5B%22(home)%22%2C%7B%22children%22%3A%5B%22__PAGE__%22%2C%7B%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%5D%7D%2Cnull%2Cnull%2Ctrue%5D';

export async function getDarkreadUrl(articleUrl: string): Promise<string> {
  const hash = await fetchNextActionHash();

  const form = new FormData();
  form.append('1_$ACTION_REF_1', '');
  form.append('1_$ACTION_1:0', JSON.stringify({ id: hash, bound: '$@1' }));
  form.append('1_$ACTION_1:1', JSON.stringify([{ url: '', error: '' }]));
  form.append('1_$ACTION_KEY', 'k1777296769');
  form.append('1_url', articleUrl);
  form.append('0', JSON.stringify([{ url: '', error: '' }, '$K1']));

  const bodyBuffer = form.getBuffer();
  const body = bodyBuffer.buffer.slice(
    bodyBuffer.byteOffset,
    bodyBuffer.byteOffset + bodyBuffer.byteLength,
  ) as ArrayBuffer;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let response;
  try {
    response = await fetch(DARKREAD_URL, {
      signal: controller.signal,
      method: 'POST',
      headers: {
        ...form.getHeaders(),
        'content-length': String(bodyBuffer.byteLength),
        'next-action': hash,
        'next-router-state-tree': ROUTER_STATE,
        accept: 'text/x-component',
        origin: DARKREAD_URL,
        referer: `${DARKREAD_URL}/`,
        'sec-fetch-dest': 'empty',
        'sec-fetch-mode': 'cors',
        'sec-fetch-site': 'same-origin',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
      },
      body,
      redirect: 'manual',
    });
  } finally {
    clearTimeout(timeout);
  }

  const redirect = response.headers.get('x-action-redirect');

  if (!redirect) {
    invalidateCache();
    throw new Error(
      `darkread não retornou redirect (status ${response.status}) — hash pode ter expirado, tente novamente`,
    );
  }

  const id = redirect.split(';')[0];
  return `${DARKREAD_URL}${id}`;
}
