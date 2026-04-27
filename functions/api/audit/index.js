export async function onRequestGet(context) {
  const { env, data, request } = context;

  if (!data.session || data.session.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const url = new URL(request.url);
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '50', 10), 200);
  const offset = parseInt(url.searchParams.get('offset') || '0', 10);

  const { results } = await env.DB.prepare(
    'SELECT * FROM audit_log ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).bind(limit, offset).all();

  return Response.json({ entries: results });
}
