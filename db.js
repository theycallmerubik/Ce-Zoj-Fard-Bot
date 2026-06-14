const { Pool } = require('pg');

// Support either a DATABASE_URL string or individual DB_/PG_ env vars
function createPool() {
  if (process.env.DATABASE_URL && typeof process.env.DATABASE_URL === 'string') {
    return new Pool({ connectionString: process.env.DATABASE_URL });
  }

  const config = {
    user: process.env.DB_USER || process.env.PGUSER,
    host: process.env.DB_HOST || process.env.PGHOST,
    database: process.env.DB_NAME || process.env.PGDATABASE,
    password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
    port: process.env.DB_PORT || process.env.PGPORT ? parseInt(process.env.DB_PORT || process.env.PGPORT) : undefined,
  };

  return new Pool(config);
}

const pool = createPool();


async function init() {
  // Ensure settings table exists and insert defaults if missing
  await pool.query(`CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT)`);
  const defaults = {
    isWeekTypeReversed: 'false',
    botstatus: 'true',
    custommessage: ''
  };
  for (const k of Object.keys(defaults)) {
    await pool.query(
      `INSERT INTO settings(key, value) VALUES ($1, $2) ON CONFLICT (key) DO NOTHING`,
      [k, defaults[k]]
    );
  }
}

async function getSetting(key, defaultValue = null) {
  const res = await pool.query('SELECT value FROM settings WHERE key = $1', [key]);
  if (res.rows.length === 0) return defaultValue;
  return res.rows[0].value;
}

async function setSetting(key, value) {
  await pool.query(
    `INSERT INTO settings(key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
    [key, value]
  );
}

module.exports = { init, getSetting, setSetting };
