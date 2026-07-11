"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

interface Profile {
  name: string;
  email: string;
  university: string;
  course: string;
  semester: string;
  gender: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then(setProfile);
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    setSaved(false);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile)
    });
    setSaving(false);
    setSaved(true);
  }

  if (!profile) return <p className="text-sm text-ink/50 dark:text-paper/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="font-display text-3xl text-ink dark:text-paper">Profile</h1>
      <Card className="mt-6">
        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <Field label="Name" value={profile.name} onChange={(v) => setProfile({ ...profile, name: v })} />
          <Field label="Email" value={profile.email} disabled onChange={() => {}} />
          <Field
            label="University (optional)"
            value={profile.university}
            onChange={(v) => setProfile({ ...profile, university: v })}
          />
          <Field label="Course (optional)" value={profile.course} onChange={(v) => setProfile({ ...profile, course: v })} />
          <Field
            label="Semester (optional)"
            value={profile.semester}
            onChange={(v) => setProfile({ ...profile, semester: v })}
          />
          <div>
            <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">Gender (optional)</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non-binary">Non-binary</option>
              <option value="self-described">Self-described</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
            {saved && <span className="text-xs text-pen-teal">Saved</span>}
          </div>
        </form>
      </Card>
      <Button variant="ghost" className="mt-4" onClick={() => signOut({ callbackUrl: "/" })}>
        Log out
      </Button>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  disabled
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber disabled:opacity-50"
      />
    </div>
  );
}
