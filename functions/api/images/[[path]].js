export async function onRequestGet(context) {
  const { env, params } = context;
  const imagePath = Array.isArray(params.path) ? params.path.join('/') : params.path;

  if (!imagePath) {
    return new Response('Not found', { status: 404 });
  }

  const path = `koalas/${imagePath}`;

  const object = await env.IMAGES.get(path);
  if (!object) {
    return new Response('Not found', { status: 404 });
  }

  const headers = {
    'Content-Type': object.httpMetadata?.contentType || 'image/webp',
    'Cache-Control': 'public, max-age=86400',
  };
  if (object.etag) {
    headers['ETag'] = object.etag;
  }

  return new Response(object.body, { headers });
}
