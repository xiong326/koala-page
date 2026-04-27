function dbRowToKoala(row) {
  return {
    id: row.id,
    name: row.name,
    nicknames: row.nicknames ? JSON.parse(row.nicknames) : [],
    birthDate: row.birth_date,
    sex: row.sex,
    photo: row.photo,
    mother: row.mother,
    father: row.father,
    deceased: !!row.deceased,
    ...(row.date_of_death ? { dateOfDeath: row.date_of_death } : {}),
  };
}

export async function onRequestGet(context) {
  const { env, params } = context;
  const row = await env.DB.prepare('SELECT * FROM koalas WHERE id = ?').bind(params.id).first();

  if (!row) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(dbRowToKoala(row));
}

export async function onRequestPut(context) {
  const { env, data, params, request } = context;

  if (!data.session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await env.DB.prepare('SELECT * FROM koalas WHERE id = ?').bind(params.id).first();
  if (!existing) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  const body = await request.json();
  const { name, nicknames, birthDate, sex, photo, mother, father, deceased, dateOfDeath } = body;

  if (name !== undefined && !name) {
    return Response.json({ error: 'name cannot be empty' }, { status: 400 });
  }
  if (sex !== undefined && !['male', 'female'].includes(sex)) {
    return Response.json({ error: 'sex must be "male" or "female"' }, { status: 400 });
  }

  const updates = {};
  if (name !== undefined) updates.name = name;
  if (nicknames !== undefined) updates.nicknames = nicknames && nicknames.length > 0 ? JSON.stringify(nicknames) : null;
  if (birthDate !== undefined) updates.birth_date = birthDate || null;
  if (sex !== undefined) updates.sex = sex;
  if (photo !== undefined) updates.photo = photo || null;
  if (mother !== undefined) updates.mother = mother || null;
  if (father !== undefined) updates.father = father || null;
  if (deceased !== undefined) updates.deceased = deceased ? 1 : 0;
  if (dateOfDeath !== undefined) updates.date_of_death = dateOfDeath || null;

  if (Object.keys(updates).length === 0) {
    return Response.json(dbRowToKoala(existing));
  }

  const changes = {};
  for (const [key, val] of Object.entries(updates)) {
    const oldVal = existing[key];
    if (String(oldVal) !== String(val)) {
      changes[key] = { from: oldVal, to: val };
    }
  }

  if (Object.keys(changes).length === 0) {
    return Response.json(dbRowToKoala(existing));
  }

  updates.updated_at = new Date().toISOString();
  const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
  const values = Object.values(updates);

  await env.DB.prepare(
    `UPDATE koalas SET ${setClauses} WHERE id = ?`
  ).bind(...values, params.id).run();

  await env.DB.prepare(
    'INSERT INTO audit_log (passkey_id, passkey_name, action, koala_id, koala_name, details) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    data.session.passkeyId, data.session.passkeyName, 'update',
    params.id, name || existing.name,
    JSON.stringify(changes),
  ).run();

  const row = await env.DB.prepare('SELECT * FROM koalas WHERE id = ?').bind(params.id).first();
  return Response.json(dbRowToKoala(row));
}

export async function onRequestDelete(context) {
  const { env, data, params } = context;

  if (!data.session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await env.DB.prepare('SELECT * FROM koalas WHERE id = ?').bind(params.id).first();
  if (!existing) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  await env.DB.prepare('DELETE FROM koalas WHERE id = ?').bind(params.id).run();

  await env.DB.prepare(
    'INSERT INTO audit_log (passkey_id, passkey_name, action, koala_id, koala_name, details) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(
    data.session.passkeyId, data.session.passkeyName, 'delete',
    params.id, existing.name,
    JSON.stringify(dbRowToKoala(existing)),
  ).run();

  return Response.json({ ok: true });
}
