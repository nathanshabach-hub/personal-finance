import sql, { type ConnectionPool, type Transaction } from "mssql";
import { getEnv } from "@/lib/config";

let poolPromise: Promise<ConnectionPool> | undefined;

function getPool(): Promise<ConnectionPool> {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(getEnv().DATABASE_CONNECTION_STRING)
      .connect()
      .then((pool: ConnectionPool) => pool)
      .catch((error: unknown) => {
        poolPromise = undefined;
        throw error;
      });
  }

  return poolPromise;
}

export async function executeQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  query: string,
  bind: Record<string, unknown> = {},
): Promise<T[]> {
  const pool = await getPool();
  const request = pool.request();

  Object.entries(bind).forEach(([key, value]) => {
    request.input(key, value as never);
  });

  const result = await request.query<T>(query);
  return result.recordset as T[];
}

export async function executeInTransaction<T>(
  callback: (transaction: Transaction) => Promise<T>,
): Promise<T> {
  const pool = await getPool();
  const transaction = new sql.Transaction(pool);
  await transaction.begin();

  try {
    const result = await callback(transaction);
    await transaction.commit();
    return result;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}

export async function executeTransactionQuery<T extends Record<string, unknown> = Record<string, unknown>>(
  transaction: Transaction,
  query: string,
  bind: Record<string, unknown> = {},
): Promise<T[]> {
  const request = new sql.Request(transaction);

  Object.entries(bind).forEach(([key, value]) => {
    request.input(key, value as never);
  });

  const result = await request.query<T>(query);
  return result.recordset as T[];
}
