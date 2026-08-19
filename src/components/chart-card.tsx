"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

const COLORS = ["#0e7490", "#0891b2", "#0284c7", "#0369a1", "#0c4a6e", "#67e8f9"];

interface Item {
  CategoryName: string;
  Amount: number;
}

export function ChartCard({ data }: { data: Item[] }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-700">Spending by Category</h3>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="Amount" nameKey="CategoryName" outerRadius={110} innerRadius={60}>
              {data.map((entry, index) => (
                <Cell key={entry.CategoryName} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value: string | number | readonly (string | number)[] | undefined) => {
                const rawValue = Array.isArray(value) ? value[0] : value;
                const numericValue = Number(rawValue ?? 0);
                return `$${Number.isFinite(numericValue) ? numericValue.toFixed(2) : "0.00"}`;
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
