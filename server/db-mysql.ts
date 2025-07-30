import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema-mysql";

// Create MySQL connection
const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'innovanceorbit',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Alternative: Use DATABASE_URL format
let db: ReturnType<typeof drizzle>;

if (process.env.DATABASE_URL) {
  // Parse MySQL URL format: mysql://user:password@host:port/database
  const url = new URL(process.env.DATABASE_URL);
  
  const mysqlConnection = mysql.createConnection({
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading slash
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  
  db = drizzle(mysqlConnection, { schema, mode: 'default' });
} else {
  db = drizzle(connection, { schema, mode: 'default' });
}

export { db };
export { connection };

// Connection test
export async function testConnection() {
  try {
    await connection.execute('SELECT 1');
    console.log('✅ MySQL database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    return false;
  }
}