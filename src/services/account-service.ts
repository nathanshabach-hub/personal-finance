import { executeQuery } from "@/lib/db";

export async function listAccounts(userId: string) {
  return executeQuery(
    `SELECT AccountId, UserId, Name, AccountType, InstitutionName, CurrencyCode, OpeningBalance, IsActive, CreatedAt, UpdatedAt
     FROM dbo.FinancialAccounts
     WHERE UserId = @userId
     ORDER BY CreatedAt DESC`,
    { userId },
  );
}

export async function createAccount(
  userId: string,
  input: {
    name: string;
    accountType: string;
    institutionName?: string | null;
    currencyCode: string;
    openingBalance: string;
  },
) {
  const rows = await executeQuery(
    `INSERT INTO dbo.FinancialAccounts
      (AccountId, UserId, Name, AccountType, InstitutionName, CurrencyCode, OpeningBalance, CreatedAt, UpdatedAt, IsActive)
     OUTPUT inserted.AccountId
     VALUES (NEWID(), @userId, @name, @accountType, @institutionName, @currencyCode, @openingBalance, SYSUTCDATETIME(), SYSUTCDATETIME(), 1)`,
    {
      userId,
      name: input.name,
      accountType: input.accountType,
      institutionName: input.institutionName ?? null,
      currencyCode: input.currencyCode.toUpperCase(),
      openingBalance: input.openingBalance,
    },
  );

  return rows[0];
}

export async function updateAccount(
  userId: string,
  accountId: string,
  input: {
    name?: string;
    accountType?: string;
    institutionName?: string | null;
    currencyCode?: string;
    openingBalance?: string;
    isActive?: boolean;
  },
) {
  await executeQuery(
    `UPDATE dbo.FinancialAccounts
      SET Name = COALESCE(@name, Name),
          AccountType = COALESCE(@accountType, AccountType),
          InstitutionName = COALESCE(@institutionName, InstitutionName),
          CurrencyCode = COALESCE(@currencyCode, CurrencyCode),
          OpeningBalance = COALESCE(@openingBalance, OpeningBalance),
          IsActive = COALESCE(@isActive, IsActive),
          UpdatedAt = SYSUTCDATETIME()
     WHERE AccountId = @accountId AND UserId = @userId`,
    {
      userId,
      accountId,
      name: input.name ?? null,
      accountType: input.accountType ?? null,
      institutionName: input.institutionName ?? null,
      currencyCode: input.currencyCode?.toUpperCase() ?? null,
      openingBalance: input.openingBalance ?? null,
      isActive: input.isActive ?? null,
    },
  );
}

export async function softDeleteAccount(userId: string, accountId: string) {
  await executeQuery(
    `UPDATE dbo.FinancialAccounts
      SET IsActive = 0, UpdatedAt = SYSUTCDATETIME()
     WHERE AccountId = @accountId AND UserId = @userId`,
    { accountId, userId },
  );
}
