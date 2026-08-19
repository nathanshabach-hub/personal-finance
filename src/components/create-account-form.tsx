"use client";

import { FormEvent, useState } from "react";

export function CreateAccountForm() {
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(event.currentTarget).entries());

    const res = await fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setMessage(res.ok ? "Account created" : "Failed to create account");
    if (res.ok) {
      event.currentTarget.reset();
      window.dispatchEvent(new CustomEvent("resource:refresh", { detail: { endpoint: "/api/accounts" } }));
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-5">
      <input required name="name" placeholder="Name" className="rounded border border-slate-300 px-3 py-2" />
      <select name="accountType" defaultValue="Checking" className="rounded border border-slate-300 px-3 py-2">
        <option>Checking</option>
        <option>Savings</option>
        <option>CreditCard</option>
        <option>Cash</option>
        <option>Investment</option>
        <option>Loan</option>
        <option>Other</option>
      </select>
      <input name="institutionName" placeholder="Institution" className="rounded border border-slate-300 px-3 py-2" />
      <input name="openingBalance" defaultValue="0.00" className="rounded border border-slate-300 px-3 py-2" />
      <button className="rounded bg-cyan-900 px-3 py-2 font-medium text-white">Add account</button>
      {message ? <p className="text-sm text-slate-600 md:col-span-5">{message}</p> : null}
    </form>
  );
}
