"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", { username, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Incorrect username or password.");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper dark:bg-ink px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <span className="font-display text-2xl font-semibold text-ink dark:text-paper">StudyFlow</span>
          <p className="mt-1 text-sm text-ink/60 dark:text-paper/60">Welcome back — let's get you studying.</p>
        </div>
        <Card className="p-7">
          <h1 className="font-display text-2xl text-ink dark:text-paper">Log in</h1>
          <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
            <div>
              <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">Username</label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
        </Card>
        <p className="mt-5 text-center text-xs text-ink/60 dark:text-paper/60">
          No account?{" "}
          <Link href="/register" className="text-amber-dark dark:text-amber-light">
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}