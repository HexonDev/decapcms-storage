const MAX_FILE_SIZE = 5 * 1024 * 1024;
const EXTENSIONS = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
};

function allowedOrigins(env) {
  return (env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function corsHeaders(request, env) {
  const headers = new Headers({
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  });
  const origin = request.headers.get('Origin');
  if (origin && allowedOrigins(env).includes(origin)) {
    headers.set('Access-Control-Allow-Origin', origin);
  }
  return headers;
}

function json(request, env, data, status = 200) {
  const headers = corsHeaders(request, env);
  headers.set('Content-Type', 'application/json; charset=utf-8');
  headers.set('Cache-Control', 'no-store');
  return new Response(JSON.stringify(data), { status, headers });
}

function constantTimeEquals(left, right) {
  if (typeof left !== 'string' || typeof right !== 'string' || left.length !== right.length) return false;
  let mismatch = 0;
  for (let index = 0; index < left.length; index += 1) {
    mismatch |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return mismatch === 0;
}

function hasValidSignature(mimeType, bytes) {
  if (mimeType === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === 'image/png') return [137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value);
  if (mimeType === 'image/gif') {
    const signature = String.fromCharCode(...bytes.slice(0, 6));
    return signature === 'GIF87a' || signature === 'GIF89a';
  }
  if (mimeType === 'image/webp') {
    return bytes.length >= 12 && String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP';
  }
  return false;
}

function validImageKey(key) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(jpg|png|gif|webp)$/.test(key);
}

async function upload(request, env) {
  const origin = request.headers.get('Origin');
  const headers = corsHeaders(request, env);
  if (!origin || !allowedOrigins(env).includes(origin)) {
    return json(request, env, { error: 'Erről a webhelyről nem engedélyezett a feltöltés.' }, 403);
  }

  const authorization = request.headers.get('Authorization') || '';
  const suppliedToken = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
  if (!env.UPLOAD_TOKEN) return json(request, env, { error: 'A feltöltési Worker titka nincs beállítva.' }, 503);
  if (!constantTimeEquals(suppliedToken, env.UPLOAD_TOKEN)) {
    return json(request, env, { error: 'Hibás feltöltési jelszó.' }, 401);
  }

  const mimeType = (request.headers.get('Content-Type') || '').split(';')[0].trim().toLowerCase();
  if (!EXTENSIONS[mimeType]) return json(request, env, { error: 'Csak JPEG, PNG, GIF és WebP képek tölthetők fel.' }, 415);

  const contentLength = Number(request.headers.get('Content-Length') || 0);
  if (contentLength > MAX_FILE_SIZE) return json(request, env, { error: 'A kép legfeljebb 5 MB lehet.' }, 413);

  const body = await request.arrayBuffer();
  if (!body.byteLength || body.byteLength > MAX_FILE_SIZE) {
    return json(request, env, { error: 'Üres vagy 5 MB-nál nagyobb képfájl.' }, 413);
  }

  const bytes = new Uint8Array(body);
  if (!hasValidSignature(mimeType, bytes)) return json(request, env, { error: 'A fájl tartalma nem egyezik a képformátummal.' }, 415);

  const key = `${crypto.randomUUID()}.${EXTENSIONS[mimeType]}`;
  await env.IMAGES.put(key, body, {
    httpMetadata: {
      contentType: mimeType,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });

  const publicUrl = `${new URL(request.url).origin}/images/${key}`;
  return json(request, env, { url: publicUrl });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/upload' && request.method === 'OPTIONS') {
      const origin = request.headers.get('Origin');
      if (!origin || !allowedOrigins(env).includes(origin)) return new Response(null, { status: 403 });
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }

    if (url.pathname === '/api/upload' && request.method === 'POST') {
      return upload(request, env);
    }

    if (url.pathname.startsWith('/images/') && request.method === 'GET') {
      const key = url.pathname.slice('/images/'.length);
      if (!validImageKey(key)) return new Response('Not found', { status: 404 });
      const object = await env.IMAGES.get(key);
      if (!object) return new Response('Not found', { status: 404 });
      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('ETag', object.httpEtag);
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      headers.set('X-Content-Type-Options', 'nosniff');
      return new Response(object.body, { headers });
    }

    return new Response('Not found', { status: 404 });
  },
};
