import { executeQuery } from "@/lib/db";

interface UserRow {
  UserId: string;
  Email: string;
  PasswordHash: string;
  FirstName: string;
  LastName: string;
  DefaultCurrency: string;
  TimeZone: string;
  IsActive: boolean;
}

export async function findUserByEmail(email: string) {
  const rows = await executeQuery<UserRow & Record<string, unknown>>(
    `SELECT TOP 1 UserId, Email, PasswordHash, FirstName, LastName, DefaultCurrency, TimeZone, IsActive
     FROM dbo.Users
     WHERE Email = @email`,
    { email: email.toLowerCase() },
  );

  return rows[0] ?? null;
}

export async function findUserById(userId: string) {
  const rows = await executeQuery<(Omit<UserRow, "PasswordHash"> & Record<string, unknown>)>(
    `SELECT TOP 1 UserId, Email, FirstName, LastName, DefaultCurrency, TimeZone, IsActive
     FROM dbo.Users
     WHERE UserId = @userId`,
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
  const rows = await executeQuery<{ UserId: string; Email: string }>(
    `INSERT INTO dbo.Users
      (UserId, Email, PasswordHash, FirstName, LastName, DefaultCurrency, TimeZone, CreatedAt, UpdatedAt, IsActive)
     OUTPUT inserted.UserId, inserted.Email
     VALUES
      (NEWID(), @email, @passwordHash, @firstName, @lastName, @defaultCurrency, @timeZone, SYSUTCDATETIME(), SYSUTCDATETIME(), 1)`,
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
