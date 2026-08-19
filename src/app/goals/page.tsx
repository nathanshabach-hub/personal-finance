import { AppShell } from "@/components/app-shell";
import { CreateGoalForm } from "@/components/create-goal-form";
import { ResourceTable } from "@/components/resource-table";

export default function GoalsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <CreateGoalForm />
        <ResourceTable title="Savings Goals" endpoint="/api/goals" />
      </div>
    </AppShell>
  );
}
