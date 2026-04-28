export function buildSessionCookie(value, request, maxAge) {
  const url = new URL(request.url);
  const parts = [
    `session=${value}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${maxAge}`,
  ];

  if (url.protocol === 'https:') {
    parts.push('Secure');
  }

  return parts.join('; ');
}
