export async function onRequestPost(context) {
  const { env, data, request } = context;

  if (!data.session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const formData = await request.formData();
  const thumb = formData.get('thumb');
  const medium = formData.get('medium');
  const filename = formData.get('filename');

  if (!thumb || !medium || !filename) {
    return Response.json({ error: 'thumb, medium, and filename are required' }, { status: 400 });
  }

  const safeName = filename.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
  const thumbKey = `koalas/thumb/${safeName}.webp`;
  const mediumKey = `koalas/medium/${safeName}.webp`;

  await Promise.all([
    env.IMAGES.put(thumbKey, thumb, { httpMetadata: { contentType: 'image/webp' } }),
    env.IMAGES.put(mediumKey, medium, { httpMetadata: { contentType: 'image/webp' } }),
  ]);

  return Response.json({
    photo: `r2://${safeName}`,
    thumbKey,
    mediumKey,
  }, { status: 201 });
}
