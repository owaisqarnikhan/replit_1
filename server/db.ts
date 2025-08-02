import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Configure Neon with better connection handling
neonConfig.webSocketConstructor = ws;
neonConfig.poolQueryViaFetch = true;
neonConfig.fetchConnectionCache = false; // Disable caching to avoid prepared statement conflicts

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Create pool with simpler configuration for Neon
export const pool = new Pool({ 
  connectionString: process.env.DATABASE_URL,
  max: 1 // Limit to single connection to avoid conflicts
});

// Add connection error handling
pool.on('error', (err) => {
  console.error('Database pool error:', err);
});

export const db = drizzle({ client: pool, schema });