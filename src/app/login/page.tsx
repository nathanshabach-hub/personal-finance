import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-4xl place-items-center px-4 py-10">
      <div className="grid w-full gap-8 rounded-3xl border border-cyan-200 bg-gradient-to-b from-cyan-50 to-white p-8 shadow-xl md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Ledger Atlas</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-slate-600">Track every dollar with secure, real-time budgeting.</p>
          <p className="mt-6 text-sm text-slate-600">
            No account? <Link href="/register" className="text-cyan-800 underline">Create one</Link>
          </p>
        </div>
        <AuthForm mode="login" />
      </div>
    </div>
  );
}
