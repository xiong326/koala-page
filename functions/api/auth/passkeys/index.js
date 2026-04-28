import { generateSalt, hashPasskey, generateAccessCode } from '../../_crypto.js';

export async function onRequestGet(context) {
  const { env, data } = context;

  if (!data.session || data.session.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { results } = await env.DB.prepare(
    'SELECT id, name, role, created_at, revoked FROM passkeys ORDER BY created_at DESC'
  ).all();

  return Response.json({ passkeys: results });
}

export async function onRequestPost(context) {
  const { env, data, request } = context;

  if (!data.session || data.session.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }

  const { name, role } = await request.json();

  if (!name) {
    return Response.json({ error: 'name is required' }, { status: 400 });
  }

  const validRole = role === 'admin' ? 'admin' : 'editor';
  const code = generateAccessCode();
  const salt = await generateSalt();
  const hash = await hashPasskey(code, salt);

  await env.DB.prepare(
    'INSERT INTO passkeys (name, hash, salt, role) VALUES (?, ?, ?, ?)'
  ).bind(name, hash, salt, validRole).run();

  const row = await env.DB.prepare(
    'SELECT id, name, role, created_at FROM passkeys WHERE hash = ?'
  ).bind(hash).first();

  return Response.json({
    passkey: { id: row.id, name: row.name, role: row.role, createdAt: row.created_at },
    code,
  }, { status: 201 });
}
