"use client";

import { useEffect, useState } from "react";
import { ChartCard } from "@/components/chart-card";

interface DashboardData {
  TotalAssets: number;
  TotalLiabilities: number;
  NetWorth: number;
  MonthlyIncome: number;
  MonthlyExpenses: number;
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">${Number(value ?? 0).toFixed(2)}</p>
    </div>
  );
}

export function DashboardView() {
  const [summary, setSummary] = useState<DashboardData | null>(null);
  const [spending, setSpending] = useState<{ CategoryName: string; Amount: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [summaryRes, spendingRes] = await Promise.all([
        fetch("/api/reports/dashboard", { cache: "no-store" }),
        fetch("/api/reports/spending-by-category", { cache: "no-store" }),
      ]);

      if (summaryRes.ok) {
        const summaryPayload = (await summaryRes.json()) as { data: DashboardData };
        setSummary(summaryPayload.data);
      }

      if (spendingRes.ok) {
        const spendingPayload = (await spendingRes.json()) as {
          data: Array<{ CategoryName: string; Amount: number }>;
        };
        setSpending(spendingPayload.data);
      }
    };

    load().catch(() => undefined);
  }, []);

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Total Assets" value={summary?.TotalAssets ?? 0} />
        <Stat label="Total Liabilities" value={summary?.TotalLiabilities ?? 0} />
        <Stat label="Net Worth" value={summary?.NetWorth ?? 0} />
        <Stat label="Monthly Income" value={summary?.MonthlyIncome ?? 0} />
        <Stat label="Monthly Expenses" value={summary?.MonthlyExpenses ?? 0} />
      </div>
      <ChartCard data={spending} />
    </div>
  );
}
