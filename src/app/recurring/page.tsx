import { AppShell } from "@/components/app-shell";
import { CreateRecurringForm } from "@/components/create-recurring-form";
import { ResourceTable } from "@/components/resource-table";

export default function RecurringPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <CreateRecurringForm />
        <ResourceTable title="Recurring Transactions" endpoint="/api/recurring" />
      </div>
    </AppShell>
  );
}
