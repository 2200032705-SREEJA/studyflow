"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect email or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper dark:bg-ink px-4">
      <Card className="w-full max-w-sm">
        <h1 className="font-display text-2xl text-ink dark:text-paper">Log in</h1>
        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          <div>
            <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
            />
          </div>
          {error && <p className="text-xs text-pen-rose">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Logging in…" : "Log in"}
          </Button>
        </form>
        <p className="mt-4 text-center text-xs text-ink/60 dark:text-paper/60">
          No account?{" "}
          <Link href="/register" className="text-amber-dark dark:text-amber-light">
            Register
          </Link>
        </p>
      </Card>
    </main>
  );
}
