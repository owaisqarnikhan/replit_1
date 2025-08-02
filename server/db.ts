import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "@shared/schema";

// Configure Neon for HTTP connection (more stable)
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use HTTP connection instead of WebSocket for better stability
const sql = neon(process.env.DATABASE_URL);
export const db = drizzle(sql, { schema });

// Create a simple connection for session store
export const pool = sql;