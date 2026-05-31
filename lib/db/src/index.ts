import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

type DbInstance = { pool: pg.Pool; db: ReturnType<typeof drizzle<typeof schema>> };

let _instance: DbInstance | null = null;

function getInstance(): DbInstance {
  if (_instance) return _instance;
  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL must be set. Did you forget to provision a database?",
    );
  }
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  _instance = { pool, db: drizzle(pool, { schema }) };
  return _instance;
}

export const pool: pg.Pool = new Proxy({} as pg.Pool, {
  get(_, prop) {
    return (getInstance().pool as unknown as Record<string | symbol, unknown>)[prop as string];
  },
});

export const db: ReturnType<typeof drizzle<typeof schema>> = new Proxy(
  {} as ReturnType<typeof drizzle<typeof schema>>,
  {
    get(_, prop) {
      return (getInstance().db as unknown as Record<string | symbol, unknown>)[prop as string];
    },
  },
);

export * from "./schema";
