import { Pool, type PoolClient } from "pg";
import { getEnv } from "@/lib/config";

let poolPromise: Promise<Pool> | undefined;

function getPool(): Promise<Pool> {
  if (!poolPromise) {
    const pool = new Pool({
      connectionString: getEnv().DATABASE_URL,
      ssl:
        process.env.NODE_ENV === "production"
          ? { rejectUnauthorized: false }
          : false,
      max: 10,
    });

    poolPromise = pool
      .connect()
      .then((client) => {
        client.release();
        return pool;
      })
      .catch((error: unknown) => {
        poolPromise = undefined;
        void pool.end();
        throw error;
      });
  }

  return poolPromise;
}

function rewriteSqlServerSyntax(query: string) {
  return query
    .replace(/\bNEWID\s*\(\s*\)/gi, "gen_random_uuid()")
    .replace(/\bSYSUTCDATETIME\s*\(\s*\)/gi, "CURRENT_TIMESTAMP")
    .replace(/OUTPUT\s+inserted\.([A-Za-z0-9_]+(?:\s*,\s*inserted\.[A-Za-z0-9_]+)*)/gi, (_, columns: string) => {
      const cleaned = columns
        .split(/\s*,\s*/i)
        .map((column) => column.replace(/^inserted\./i, "").trim())
        .filter(Boolean)
        .map((column) => `"${column}"`)
        .join(", ");

      return `RETURNING ${cleaned}`;
    })
    .replace(/\bSELECT\s+TOP\s+\d+\s+/gi, "SELECT ")
    .replace(/\bOFFSET\s+@([A-Za-z_][A-Za-z0-9_]*)\s+ROWS\s+FETCH\s+NEXT\s+@([A-Za-z_][A-Za-z0-9_]*)\s+ROWS\s+ONLY/gi, "LIMIT @${2} OFFSET @${1}");
}

function toPgQuery(query: string, bind: Record<string, unknown>) {
  const orderedParams: unknown[] = [];
  const normalized = rewriteSqlServerSyntax(query).replace(/@([A-Za-z_][A-Za-z0-9_]*)/gi, (_, key: string) => {
    const value = bind[key] ?? bind[key.toLowerCase()];
    if (value === undefined) {
      return `@${key}`;
    }

    orderedParams.push(value);
    return `$${orderedParams.length}`;
  });

  return { text: normalized, values: orderedParams };
}

export async function executeQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  bind: Record<string, unknown> = {},
): Promise<T[]> {
  const pool = await getPool();
  const { text, values } = toPgQuery(query, bind);
  const result = await pool.query<T>(text, values);
  return result.rows as T[];
}

export async function executeInTransaction<T>(
  callback: (transaction: PoolClient) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function executeTransactionQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  transaction: PoolClient,
  query: string,
  bind: Record<string, unknown> = {},
): Promise<T[]> {
  const { text, values } = toPgQuery(query, bind);
  const result = await transaction.query<T>(text, values);
  return result.rows as T[];
}
