import { buildSessionCookie } from './_cookies.js';

function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  }
  return cookies;
}

export async function onRequestPost(context) {
  const { env, request } = context;
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies['session'];

  if (token) {
    await env.DB.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run();
  }

  return new Response(
    JSON.stringify({ ok: true }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': buildSessionCookie('', request, 0),
      },
    },
  );
}
