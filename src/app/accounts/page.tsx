import { AppShell } from "@/components/app-shell";
import { CreateAccountForm } from "@/components/create-account-form";
import { ResourceTable } from "@/components/resource-table";

export default function AccountsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <CreateAccountForm />
        <ResourceTable
          title="Your Accounts"
          endpoint="/api/accounts"
          columns={[
            { key: "name", label: "Name" },
            { key: "account_type", label: "Type" },
            { key: "institution_name", label: "Institution" },
            { key: "currency_code", label: "Currency" },
            { key: "opening_balance", label: "Opening Balance" },
          ]}
        />
      </div>
    </AppShell>
  );
}
