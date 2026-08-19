import { AppShell } from "@/components/app-shell";
import { CreateAccountForm } from "@/components/create-account-form";
import { ResourceTable } from "@/components/resource-table";

export default function AccountsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <CreateAccountForm />
        <ResourceTable title="Your Accounts" endpoint="/api/accounts" />
      </div>
    </AppShell>
  );
}
