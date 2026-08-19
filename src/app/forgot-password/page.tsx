export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4">
      <form
        action="/api/auth/forgot-password"
        method="post"
        className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-2xl font-semibold text-slate-900">Forgot password</h1>
        <p className="text-sm text-slate-600">Enter your email to request a reset link.</p>
        <input required type="email" name="email" className="w-full rounded-lg border border-slate-300 px-3 py-2" />
        <button className="w-full rounded-lg bg-cyan-900 px-3 py-2 font-medium text-white">Send reset request</button>
      </form>
    </div>
  );
}
