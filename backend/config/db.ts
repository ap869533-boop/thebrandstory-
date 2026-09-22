import mysql, { Pool } from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

let pool: Pool | null = null;
let isConnected = false;

export async function getDbPool(): Promise<Pool | null> {
  if (pool) return pool;

  try {
    const host = process.env.DB_HOST || 'localhost';
    const user = process.env.DB_USER || 'root';
    const password = process.env.DB_PASSWORD || '';
    const database = process.env.DB_NAME || 'brand_db';
    const port = process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306;

    pool = mysql.createPool({
      host,
      user,
      password,
      database,
      port,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
    });

    // Test connection
    const connection = await pool.getConnection();
    console.log(`✅ [MySQL Database] Connected successfully to "${database}" on ${host}:${port}`);
    connection.release();
    isConnected = true;
    return pool;
  } catch (error: any) {
    console.warn(`⚠️ [MySQL Database] Notice: Could not connect to MySQL server (${error.message || error.code}). Operating in resilient Hybrid Memory Mode.`);
    pool = null;
    isConnected = false;
    return null;
  }
}

export function isDbConnected(): boolean {
  return isConnected;
}

export async function dbQuery<T = any>(sql: string, params: any[] = []): Promise<T[] | null> {
  try {
    const currentPool = await getDbPool();
    if (!currentPool) return null;
    const [rows] = await currentPool.query(sql, params);
    return rows as T[];
  } catch (err) {
    console.warn('MySQL Query Error:', err);
    return null;
  }
}
