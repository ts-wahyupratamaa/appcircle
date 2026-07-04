export interface Env {
  MEDIA: R2Bucket;
}

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, X-Scope, X-Ext',
};

function withCors(response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(CORS)) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

function json(data: unknown, status = 200): Response {
  return withCors(
    Response.json(data, {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function safeExt(raw: string | null): string {
  const ext = (raw ?? 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '');
  if (ext === 'png' || ext === 'webp' || ext === 'gif' || ext === 'jpeg' || ext === 'jpg') {
    return ext === 'jpeg' ? 'jpg' : ext;
  }
  return 'jpg';
}

function contentTypeFor(ext: string): string {
  if (ext === 'png') return 'image/png';
  if (ext === 'webp') return 'image/webp';
  if (ext === 'gif') return 'image/gif';
  return 'image/jpeg';
}

function objectKey(scope: string, ext: string): string {
  const folder = scope.replace(/[^a-zA-Z0-9/_-]/g, '').replace(/^\/+/, '') || 'misc';
  const id = crypto.randomUUID().slice(0, 8);
  return `${folder}/${Date.now()}-${id}.${ext}`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'OPTIONS') {
      return withCors(new Response(null, { status: 204 }));
    }

    if (url.pathname === '/' && request.method === 'GET') {
      return json({ ok: true, service: 'innerly-api', bucket: 'innerly-media' });
    }

    if (url.pathname === '/upload' && request.method === 'POST') {
      if (!request.body) {
        return json({ error: 'empty body' }, 400);
      }

      const scope = request.headers.get('X-Scope') ?? 'misc';
      const ext = safeExt(request.headers.get('X-Ext'));
      const contentType = request.headers.get('Content-Type') || contentTypeFor(ext);
      const key = objectKey(scope, ext);

      await env.MEDIA.put(key, request.body, {
        httpMetadata: { contentType },
      });

      const fileUrl = `${url.origin}/files/${key}`;
      return json({ key, url: fileUrl });
    }

    if (url.pathname.startsWith('/files/') && request.method === 'GET') {
      const key = decodeURIComponent(url.pathname.slice('/files/'.length));
      const object = await env.MEDIA.get(key);
      if (!object) {
        return withCors(new Response('Not found', { status: 404 }));
      }

      const headers = new Headers();
      headers.set(
        'Content-Type',
        object.httpMetadata?.contentType ?? contentTypeFor(safeExt(key.split('.').pop() ?? null)),
      );
      headers.set('Cache-Control', 'public, max-age=31536000, immutable');
      for (const [k, v] of Object.entries(CORS)) {
        headers.set(k, v);
      }

      return new Response(object.body, { headers });
    }

    if (url.pathname.startsWith('/files/') && request.method === 'DELETE') {
      const key = decodeURIComponent(url.pathname.slice('/files/'.length));
      await env.MEDIA.delete(key);
      return json({ ok: true, deleted: key });
    }

    return json({ error: 'not found' }, 404);
  },
};
