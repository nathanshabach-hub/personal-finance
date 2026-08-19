import { AppShell } from "@/components/app-shell";
import { ResourceTable } from "@/components/resource-table";

export default function SettingsPage() {
  return (
    <AppShell>
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">Settings</h2>
          <p className="mt-2 text-sm text-slate-600">
            Profile, currency, categories, accounts, notifications, security, and data export are managed via the APIs on this page and companion endpoints.
          </p>
          <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
            <li>Profile: /api/settings/profile</li>
            <li>Categories: /api/categories</li>
            <li>Accounts: /api/accounts</li>
            <li>Notifications: /api/notifications</li>
            <li>Data export: /api/csv/export</li>
          </ul>
        </section>
        <ResourceTable title="Profile" endpoint="/api/settings/profile" />
        <ResourceTable title="Notifications" endpoint="/api/notifications" />
      </div>
    </AppShell>
  );
}
