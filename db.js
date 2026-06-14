const { Pool } = require('pg');

const connectionString = {
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
};

const pool = new Pool({ connectionString });


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
