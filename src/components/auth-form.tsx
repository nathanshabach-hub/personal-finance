"use client";

import { FormEvent, useState } from "react";

interface AuthFormProps {
  mode: "login" | "register";
}

export function AuthForm({ mode }: AuthFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const body = Object.fromEntries(formData.entries());

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setLoading(false);

    if (!response.ok) {
      const payload = (await response.json()) as { error?: { message?: string } };
      setError(payload.error?.message ?? "Request failed");
      return;
    }

    window.location.href = "/dashboard";
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {mode === "register" ? (
        <>
          <input required name="firstName" placeholder="First name" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <input required name="lastName" placeholder="Last name" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <input name="defaultCurrency" defaultValue="AUD" placeholder="Currency" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
          <input name="timeZone" defaultValue="Australia/Sydney" placeholder="Time zone" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        </>
      ) : null}
      <input required name="email" type="email" placeholder="Email" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
      <input required name="password" type="password" placeholder="Password" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
      {error ? <p className="text-sm text-rose-700">{error}</p> : null}
      <button disabled={loading} className="w-full rounded-lg bg-cyan-900 px-3 py-2 font-medium text-white disabled:opacity-50">
        {loading ? "Please wait..." : mode === "login" ? "Log in" : "Create account"}
      </button>
    </form>
  );
}
