import { executeQuery } from "@/lib/db";

export async function listAccounts(userId: string) {
  return executeQuery(
    `SELECT id, user_id, name, account_type, institution_name, currency_code, opening_balance, is_active, created_at, updated_at
     FROM financial_accounts
     WHERE user_id = @userId
     ORDER BY created_at DESC`,
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
    `INSERT INTO financial_accounts
      (user_id, name, account_type, institution_name, currency_code, opening_balance, is_active)
     VALUES (@userId, @name, @accountType, @institutionName, @currencyCode, @openingBalance, true)
     RETURNING id`,
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
    `UPDATE financial_accounts
      SET name = COALESCE(@name, name),
          account_type = COALESCE(@accountType, account_type),
          institution_name = COALESCE(@institutionName, institution_name),
          currency_code = COALESCE(@currencyCode, currency_code),
          opening_balance = COALESCE(@openingBalance, opening_balance),
          is_active = COALESCE(@isActive, is_active),
          updated_at = CURRENT_TIMESTAMP
     WHERE id = @accountId AND user_id = @userId`,
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
    `UPDATE financial_accounts
      SET is_active = false, updated_at = CURRENT_TIMESTAMP
     WHERE id = @accountId AND user_id = @userId`,
    { accountId, userId },
  );
}
