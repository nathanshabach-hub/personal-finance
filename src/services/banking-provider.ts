export interface BankingAccount {
  externalId: string;
  name: string;
  accountType: string;
  currencyCode: string;
}

export interface BankingTransaction {
  externalId: string;
  accountExternalId: string;
  amount: string;
  currencyCode: string;
  bookedAt: string;
  description?: string;
  merchant?: string;
}

export interface BankingProvider {
  connectAccount(userId: string): Promise<{ connectionId: string }>;
  getAccounts(userId: string, connectionId: string): Promise<BankingAccount[]>;
  getTransactions(userId: string, connectionId: string): Promise<BankingTransaction[]>;
  refreshTransactions(userId: string, connectionId: string): Promise<BankingTransaction[]>;
  disconnectAccount(userId: string, connectionId: string): Promise<void>;
}

export class MockBankingProvider implements BankingProvider {
  async connectAccount(userId: string) {
    return { connectionId: `mock-${userId}` };
  }

  async getAccounts() {
    return [
      {
        externalId: "mock-checking-1",
        name: "Mock Everyday Account",
        accountType: "Checking",
        currencyCode: "AUD",
      },
    ];
  }

  async getTransactions() {
    return [];
  }

  async refreshTransactions() {
    return [];
  }

  async disconnectAccount() {
    return;
  }
}
