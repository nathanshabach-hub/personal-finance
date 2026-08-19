"use client";

import { useEffect, useState } from "react";

export function ResourceTable({
  title,
  endpoint,
}: {
  title: string;
  endpoint: string;
}) {
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const res = await fetch(endpoint, { cache: "no-store" });
      if (!res.ok) {
        setError("Failed to load data");
        setLoading(false);
        return;
      }
      const payload = (await res.json()) as { data: Record<string, unknown>[] };
      setData(payload.data ?? []);
      setLoading(false);
    };

    run().catch(() => {
      setError("Failed to load data");
      setLoading(false);
    });
  }, [endpoint]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-lg font-semibold text-slate-900">{title}</h2>
      {loading ? <p className="text-slate-500">Loading...</p> : null}
      {error ? <p className="text-rose-700">{error}</p> : null}
      {!loading && !error && data.length === 0 ? <p className="text-slate-500">No records yet.</p> : null}
      {!loading && data.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600">
                {Object.keys(data[0] ?? {}).slice(0, 6).map((key) => (
                  <th key={key} className="px-2 py-2 font-medium">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.slice(0, 25).map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100">
                  {Object.values(row).slice(0, 6).map((value, valueIdx) => (
                    <td key={valueIdx} className="px-2 py-2 text-slate-800">
                      {String(value ?? "")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}
