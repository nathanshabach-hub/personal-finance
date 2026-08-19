import { executeQuery } from "@/lib/db";

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  default_currency: string;
  time_zone: string;
  is_active: boolean;
}

export async function findUserByEmail(email: string) {
  const rows = await executeQuery<UserRow & Record<string, unknown>>(
    `SELECT id, email, password_hash, first_name, last_name, default_currency, time_zone, is_active
     FROM users
     WHERE LOWER(email) = LOWER(@email)
     LIMIT 1`,
    { email },
  );

  return rows[0] ?? null;
}

export async function findUserById(userId: string) {
  const rows = await executeQuery<(Omit<UserRow, "password_hash"> & Record<string, unknown>)>(
    `SELECT id, email, first_name, last_name, default_currency, time_zone, is_active
     FROM users
     WHERE id = @userId
     LIMIT 1`,
    { userId },
  );

  return rows[0] ?? null;
}

export async function createUser(input: {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  defaultCurrency: string;
  timeZone: string;
}) {
  const rows = await executeQuery<{ id: string; email: string }>(
    `INSERT INTO users
      (email, password_hash, first_name, last_name, default_currency, time_zone, is_active)
     VALUES
      (@email, @passwordHash, @firstName, @lastName, @defaultCurrency, @timeZone, true)
     RETURNING id, email`,
    {
      email: input.email.toLowerCase(),
      passwordHash: input.passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      defaultCurrency: input.defaultCurrency.toUpperCase(),
      timeZone: input.timeZone,
    },
  );

  return rows[0];
}
