declare module "mssql" {
  export class ConnectionPool {
    constructor(connectionString?: string);
    request(): Request;
    connect(): Promise<ConnectionPool>;
    close(): Promise<void>;
  }

  export class Request {
    constructor(transaction?: unknown);
    input(name: string, value: unknown): void;
    query<T = unknown>(sql: string): Promise<{ recordset: T[] }>;
  }

  export class Transaction {
    constructor(pool: ConnectionPool);
    begin(): Promise<void>;
    commit(): Promise<void>;
    rollback(): Promise<void>;
  }

  const sql: {
    ConnectionPool: typeof ConnectionPool;
    Request: typeof Request;
    Transaction: typeof Transaction;
  };

  export default sql;
}
