import postgres, { type Sql } from "postgres";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getEnv } from "@/lib/config";

type QueryExecutor = Pick<Sql, "unsafe">;
type DatabaseConnection = {
  connectionString: string;
  ssl: false | "require";
};

function shouldUseSsl(connectionString: string) {
  const host = new URL(connectionString).hostname;
  return !["localhost", "127.0.0.1", "::1"].includes(host);
}

function getDatabaseConnection(): DatabaseConnection {
  try {
    const { env } = getCloudflareContext();
    const hyperdrive = (env as { HYPERDRIVE?: { connectionString: string } }).HYPERDRIVE;
    if (hyperdrive?.connectionString) {
      return { connectionString: hyperdrive.connectionString, ssl: false };
    }
  } catch {
    // Cloudflare bindings are only available in the Worker runtime.
  }

  const connectionString = getEnv().DATABASE_URL;
  return { connectionString, ssl: shouldUseSsl(connectionString) ? "require" : false };
}

function createSql() {
  const { connectionString, ssl } = getDatabaseConnection();
  return postgres(connectionString, {
    ssl,
    max: 1,
    prepare: false,
    connect_timeout: 10,
  });
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
  const sql = createSql();
  const { text, values } = toPgQuery(query, bind);

  try {
    const result = await sql.unsafe<T[]>(text, values as never[]);
    return result as T[];
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function executeInTransaction<T>(
  callback: (transaction: QueryExecutor) => Promise<T>,
): Promise<T> {
  const sql = createSql();

  try {
    const result = await sql.begin(async (transaction) => callback(transaction));
    return result as T;
  } finally {
    await sql.end({ timeout: 5 });
  }
}

export async function executeTransactionQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  transaction: QueryExecutor,
  query: string,
  bind: Record<string, unknown> = {},
): Promise<T[]> {
  const { text, values } = toPgQuery(query, bind);
  const result = await transaction.unsafe<T[]>(text, values as never[]);
  return result as T[];
}
