export async function onRequestGet(context) {
  const { data } = context;

  if (!data.session) {
    return Response.json({ authenticated: false });
  }

  return Response.json({
    authenticated: true,
    role: data.session.role,
    name: data.session.passkeyName,
  });
}
