import { AppShell } from "@/components/app-shell";
import { CreateBudgetForm } from "@/components/create-budget-form";
import { ResourceTable } from "@/components/resource-table";

export default function BudgetPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <CreateBudgetForm />
        <ResourceTable title="Monthly Budgets" endpoint="/api/budgets" />
      </div>
    </AppShell>
  );
}
