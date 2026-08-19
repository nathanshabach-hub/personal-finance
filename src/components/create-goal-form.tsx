"use client";

import { FormEvent, useState } from "react";

export function CreateGoalForm() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...body, currentAmount: "0.00" }),
    });

    setMessage(response.ok ? "Goal created" : "Failed to create goal");
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:grid-cols-4">
      <input required name="name" placeholder="Goal Name" className="rounded border border-slate-300 px-3 py-2" />
      <input required name="targetAmount" placeholder="Target Amount" className="rounded border border-slate-300 px-3 py-2" />
      <input name="targetDate" type="date" className="rounded border border-slate-300 px-3 py-2" />
      <button className="rounded bg-cyan-900 px-3 py-2 font-medium text-white">Create goal</button>
      {message ? <p className="text-sm text-slate-600 sm:col-span-4">{message}</p> : null}
    </form>
  );
}
