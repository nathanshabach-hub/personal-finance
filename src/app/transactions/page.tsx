import { AppShell } from "@/components/app-shell";
import { CreateTransactionForm } from "@/components/create-transaction-form";
import { ResourceTable } from "@/components/resource-table";

export default function TransactionsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <CreateTransactionForm />
        <ResourceTable title="Transactions" endpoint="/api/transactions?page=1&pageSize=25" />
      </div>
    </AppShell>
  );
}
