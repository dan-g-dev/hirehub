import mysql from 'mysql2/promise';

// Prefer discrete DB_* variables; fall back to parsing DATABASE_URL
// (mysql://user:pass@host:port/dbname) if that's what's set instead.
function resolveConfig() {
  if (process.env.DB_HOST) {
    return {
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'hirehub_user',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'hirehub_ethiopia',
    };
  }

  const url = process.env.DATABASE_URL;
  if (url) {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: Number(parsed.port) || 3306,
      user: decodeURIComponent(parsed.username),
      password: decodeURIComponent(parsed.password),
      database: parsed.pathname.replace(/^\//, ''),
    };
  }

  // Sensible local default so `npm run dev` works out of the box
  // after running database/schema.sql with the default credentials.
  return {
    host: 'localhost',
    port: 3306,
    user: 'hirehub_user',
    password: 'secure_password',
    database: 'hirehub_ethiopia',
  };
}

export const pool = mysql.createPool({
  ...resolveConfig(),
  waitForConnections: true,
  connectionLimit: 10,
  namedPlaceholders: false,
  dateStrings: true,
});

export async function checkDatabaseConnection(): Promise<boolean> {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    return true;
  } catch (err) {
    console.error('[Database] Connection check failed:', (err as Error).message);
    return false;
  }
}
