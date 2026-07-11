"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";

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

  if (!profile) return <p className="text-sm text-white/50">Loading…</p>;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
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
            <label className="mb-1.5 block text-xs font-medium text-white/60">Gender (optional)</label>
            <select
              value={profile.gender}
              onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-400/50"
            >
              <option className="bg-[#0d0d14]" value="">Prefer not to say</option>
              <option className="bg-[#0d0d14]" value="female">Female</option>
              <option className="bg-[#0d0d14]" value="male">Male</option>
              <option className="bg-[#0d0d14]" value="non-binary">Non-binary</option>
              <option className="bg-[#0d0d14]" value="self-described">Self-described</option>
            </select>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium shadow-lg shadow-violet-900/40 transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
            {saved && <span className="text-xs text-emerald-300">Saved</span>}
          </div>
        </form>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="mt-4 text-sm text-white/60 hover:text-white"
      >
        Log out
      </button>
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
      <label className="mb-1.5 block text-xs font-medium text-white/60">{label}</label>
      <input
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-400/50 disabled:opacity-50"
      />
    </div>
  );
}