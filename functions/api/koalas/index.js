function normalizeTags(tags) {
  if (!Array.isArray(tags)) return [];
  return tags.map(tag => String(tag || '').trim()).filter(Boolean);
}

function dbRowToKoala(row) {
  const tags = row.tags || row.nicknames;
  return {
    id: row.id,
    name: row.name,
    tags: tags ? normalizeTags(JSON.parse(tags)) : [],
    birthDate: row.birth_date,
    sex: row.sex,
    photo: row.photo,
    mother: row.mother,
    father: row.father,
    deceased: !!row.deceased,
    ...(row.date_of_death ? { dateOfDeath: row.date_of_death } : {}),
  };
}

const BOARD_ID_PREFIX = {
  board1: 'k',
  board2: 'b2k',
};

async function getNextKoalaId(env, board) {
  const prefix = BOARD_ID_PREFIX[board] || 'k';
  const numericStart = prefix.length + 1;
  const row = await env.DB.prepare(
    'SELECT MAX(CAST(SUBSTR(id, ?) AS INTEGER)) AS max_num FROM koalas WHERE board = ? AND id LIKE ?'
  ).bind(numericStart, board, `${prefix}%`).first();
  const nextNum = (row?.max_num || 0) + 1;
  return `${prefix}${String(nextNum).padStart(3, '0')}`;
}

function isUniqueIdError(error) {
  return String(error?.message || error).toLowerCase().includes('unique');
}

export async function onRequestGet(context) {
  const { env, request } = context;
  const url = new URL(request.url);
  const board = url.searchParams.get('board') || 'board2';

  const { results } = await env.DB.prepare(
    'SELECT * FROM koalas WHERE board = ?'
  ).bind(board).all();

  return Response.json({ koalas: results.map(dbRowToKoala) });
}

export async function onRequestPost(context) {
  const { env, data, request } = context;

  if (!data.session) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { board, name, tags, birthDate, sex, photo, mother, father, deceased, dateOfDeath } = body;

  if (!board || !name || !sex) {
    return Response.json({ error: 'Missing required fields: board, name, sex' }, { status: 400 });
  }

  if (!['male', 'female'].includes(sex)) {
    return Response.json({ error: 'sex must be "male" or "female"' }, { status: 400 });
  }

  const now = new Date().toISOString();
  let id = null;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    id = await getNextKoalaId(env, board);
    try {
      await env.DB.prepare(
        `INSERT INTO koalas (id, board, name, tags, birth_date, sex, photo, mother, father, deceased, date_of_death, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id, board, name,
        normalizeTags(tags).length > 0 ? JSON.stringify(normalizeTags(tags)) : null,
        birthDate || null, sex, photo || null,
        mother || null, father || null,
        deceased ? 1 : 0, dateOfDeath || null,
        now, now,
      ).run();
      break;
    } catch (error) {
      if (attempt === 4 || !isUniqueIdError(error)) {
        throw error;
      }
    }
  }

  await env.DB.prepare(
    'INSERT INTO audit_log (passkey_id, passkey_name, action, koala_id, koala_name, details) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(data.session.passkeyId, data.session.passkeyName, 'create', id, name, JSON.stringify({ ...body, id })).run();

  const row = await env.DB.prepare('SELECT * FROM koalas WHERE id = ?').bind(id).first();
  return Response.json(dbRowToKoala(row), { status: 201 });
}
