function parseCookies(cookieHeader) {
  const cookies = {};
  if (!cookieHeader) return cookies;
  for (const pair of cookieHeader.split(';')) {
    const [name, ...rest] = pair.trim().split('=');
    if (name) cookies[name] = rest.join('=');
  }
  return cookies;
}

export async function onRequest(context) {
  const { request, env, data } = context;
  const cookies = parseCookies(request.headers.get('Cookie'));
  const token = cookies['session'];

  data.session = null;

  if (token && env.DB) {
    const now = new Date().toISOString();
    const row = await env.DB.prepare(
      'SELECT s.passkey_id, s.role, p.name as passkey_name FROM sessions s JOIN passkeys p ON s.passkey_id = p.id WHERE s.token = ? AND s.expires_at > ? AND p.revoked = 0'
    ).bind(token, now).first();

    if (row) {
      data.session = {
        passkeyId: row.passkey_id,
        role: row.role,
        passkeyName: row.passkey_name,
      };
    }
  }

  return context.next();
}
