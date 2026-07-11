"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    gender: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error?.formErrors?.[0] ?? data.error ?? "Registration failed.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      username: form.username,
      password: form.password,
      redirect: false
    });
    setLoading(false);
    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08070d] px-4 py-10 text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-violet-700/20 blur-[120px]" />
      </div>

      <div className="relative w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 text-sm font-bold">
            S
          </span>
          <span className="mt-3 text-xl font-semibold">StudyFlow</span>
          <p className="mt-1 max-w-xs text-sm text-white/50">
            Understand, plan, and prepare — without the AI doing your assignment for you.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm">
          <h1 className="text-xl font-semibold">Create your account</h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <Field label="Name" value={form.name} onChange={(v) => update("name", v)} required />
            <Field label="Username" value={form.username} onChange={(v) => update("username", v)} required />
            <Field label="Email" type="email" value={form.email} onChange={(v) => update("email", v)} required />
            <Field
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => update("password", v)}
              required
            />
            <div>
              <label className="mb-1.5 block text-xs font-medium text-white/60">Gender (optional)</label>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-400/50"
              >
                <option className="bg-[#0d0d14]" value="">Prefer not to say</option>
                <option className="bg-[#0d0d14]" value="female">Female</option>
                <option className="bg-[#0d0d14]" value="male">Male</option>
                <option className="bg-[#0d0d14]" value="non-binary">Non-binary</option>
                <option className="bg-[#0d0d14]" value="self-described">Self-described</option>
              </select>
            </div>
            {error && <p className="text-xs text-rose-400">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium shadow-lg shadow-violet-900/40 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs text-white/50">
          Already have an account?{" "}
          <Link href="/login" className="text-violet-300 hover:text-violet-200">
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-400/50"
      />
    </div>
  );
}