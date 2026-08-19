import { AppShell } from "@/components/app-shell";
import { ResourceTable } from "@/components/resource-table";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="grid gap-4">
        <ResourceTable title="Spending by Category" endpoint="/api/reports/spending-by-category" />
        <ResourceTable title="Budget Performance" endpoint="/api/budgets/performance?budgetMonth=2026-08" />
      </div>
    </AppShell>
  );
}
