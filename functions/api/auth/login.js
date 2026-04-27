import { hashPasskey, generateToken } from '../_crypto.js';
import { buildSessionCookie } from './_cookies.js';

export async function onRequestPost(context) {
  const { env, request } = context;
  const { code } = await request.json();

  if (!code) {
    return Response.json({ error: 'Access code is required' }, { status: 400 });
  }

  const { results: passkeys } = await env.DB.prepare(
    'SELECT * FROM passkeys WHERE revoked = 0'
  ).all();

  let matched = null;
  for (const pk of passkeys) {
    const hash = await hashPasskey(code, pk.salt);
    if (hash === pk.hash) {
      matched = pk;
      break;
    }
  }

  if (!matched) {
    return Response.json({ error: 'Invalid access code' }, { status: 401 });
  }

  const token = generateToken();
  const now = new Date();
  const maxAge = 7 * 24 * 60 * 60;
  const expires = new Date(now.getTime() + maxAge * 1000);

  await env.DB.prepare(
    'INSERT INTO sessions (token, passkey_id, role, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(token, matched.id, matched.role, now.toISOString(), expires.toISOString()).run();

  return new Response(
    JSON.stringify({ ok: true, role: matched.role, name: matched.name }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': buildSessionCookie(token, request, maxAge),
      },
    },
  );
}
