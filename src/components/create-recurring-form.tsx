"use client";

import { FormEvent, useState } from "react";

export function CreateRecurringForm() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());

    const response = await fetch("/api/recurring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, isActive: true }),
    });

    setMessage(response.ok ? "Recurring transaction created" : "Failed to create recurring transaction");
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-6">
      <input required name="accountId" placeholder="Account ID" className="rounded border border-slate-300 px-3 py-2" />
      <input name="categoryId" placeholder="Category ID" className="rounded border border-slate-300 px-3 py-2" />
      <input required name="amount" placeholder="Amount" className="rounded border border-slate-300 px-3 py-2" />
      <select name="transactionType" defaultValue="Expense" className="rounded border border-slate-300 px-3 py-2">
        <option>Income</option>
        <option>Expense</option>
        <option>Transfer</option>
      </select>
      <select name="frequency" defaultValue="Fortnightly" className="rounded border border-slate-300 px-3 py-2">
        <option>Daily</option>
        <option>Weekly</option>
        <option>Fortnightly</option>
        <option>Monthly</option>
        <option>Quarterly</option>
        <option>Yearly</option>
      </select>
      <button className="rounded bg-cyan-900 px-3 py-2 font-medium text-white">Create</button>
      <input required name="nextOccurrence" type="date" className="rounded border border-slate-300 px-3 py-2" />
      <input required name="startDate" type="date" className="rounded border border-slate-300 px-3 py-2" />
      <input name="endDate" type="date" className="rounded border border-slate-300 px-3 py-2" />
      <input name="description" placeholder="Description" className="rounded border border-slate-300 px-3 py-2 md:col-span-3" />
      {message ? <p className="text-sm text-slate-600 md:col-span-6">{message}</p> : null}
    </form>
  );
}
