"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

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
    <main className="flex min-h-screen items-center justify-center bg-paper dark:bg-ink px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold text-ink dark:text-paper">StudyFlow</span>
          <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">
            Understand, plan, and prepare — without the AI doing your assignment for you.
          </p>
        </div>
        <Card className="p-7">
          <h1 className="font-display text-2xl text-ink dark:text-paper">Create your account</h1>
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
              <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">
                Gender (optional)
              </label>
              <select
                value={form.gender}
                onChange={(e) => update("gender", e.target.value)}
                className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
              >
                <option value="">Prefer not to say</option>
                <option value="female">Female</option>
                <option value="male">Male</option>
                <option value="non-binary">Non-binary</option>
                <option value="self-described">Self-described</option>
              </select>
            </div>
            {error && <p className="text-xs text-pen-rose">{error}</p>}
            <Button type="submit" disabled={loading}>
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </form>
        </Card>
        <p className="mt-5 text-center text-xs text-ink/60 dark:text-paper/60">
          Already have an account?{" "}
          <Link href="/login" className="text-amber-dark dark:text-amber-light">
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
      <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
      />
    </div>
  );
}