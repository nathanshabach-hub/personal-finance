"use client";

import { FormEvent, useState } from "react";

export function CreateBudgetForm() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setMessage(response.ok ? "Budget created" : "Failed to create budget");
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-3">
      <input required name="name" placeholder="Budget Name" className="rounded border border-slate-300 px-3 py-2" />
      <input required name="budgetMonth" type="month" className="rounded border border-slate-300 px-3 py-2" />
      <button className="rounded bg-cyan-900 px-3 py-2 font-medium text-white">Create budget</button>
      {message ? <p className="text-sm text-slate-600 sm:col-span-3">{message}</p> : null}
    </form>
  );
}
