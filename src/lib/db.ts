import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import "dotenv/config";
const globalForPool = global as unknown as { pool?: Pool };

// Create a singleton pool
const pool =
  globalForPool.pool ||
  new Pool({
    connectionString: process.env.DATABASE_URL,
    // Optional: configure pool size for personal use
    max: 5, // default is 10; reduce for low-traffic apps
  });

if (process.env.NODE_ENV !== "production") globalForPool.pool = pool;

// Create a singleton Drizzle instance
const globalForDrizzle = global as unknown as {
  drizzle?: ReturnType<typeof drizzle>;
};

export const db = globalForDrizzle.drizzle || drizzle({ client: pool });

if (process.env.NODE_ENV !== "production") globalForDrizzle.drizzle = db;
