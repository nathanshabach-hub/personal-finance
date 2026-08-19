import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <div className="mx-auto grid min-h-screen w-full max-w-4xl place-items-center px-4 py-10">
      <div className="grid w-full gap-8 rounded-3xl border border-cyan-200 bg-gradient-to-b from-cyan-50 to-white p-8 shadow-xl md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-700">Personal Budgeting</p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-900">Create your account</h1>
          <p className="mt-2 text-slate-600">Australian-first budgeting with global-ready architecture.</p>
          <p className="mt-6 text-sm text-slate-600">
            Already have one? <Link href="/login" className="text-cyan-800 underline">Sign in</Link>
          </p>
        </div>
        <AuthForm mode="register" />
      </div>
    </div>
  );
}
