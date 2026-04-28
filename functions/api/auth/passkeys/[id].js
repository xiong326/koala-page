export async function onRequestDelete(context) {
  const { env, data, params } = context;

  if (!data.session || data.session.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const passkey = await env.DB.prepare('SELECT * FROM passkeys WHERE id = ?').bind(params.id).first();
  if (!passkey) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  await env.DB.prepare('UPDATE passkeys SET revoked = 1 WHERE id = ?').bind(params.id).run();

  await env.DB.prepare('DELETE FROM sessions WHERE passkey_id = ?').bind(params.id).run();

  return Response.json({ ok: true });
}
