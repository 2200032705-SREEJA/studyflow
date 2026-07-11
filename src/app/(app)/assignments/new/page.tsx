"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewAssignmentPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const res = await fetch("/api/assignments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, subject, question })
    });

    if (!res.ok) {
      setError("Could not create assignment. Check the required fields.");
      setLoading(false);
      return;
    }

    const assignment = await res.json();
    router.push(`/assignments/${assignment.id}`);
  }

  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-semibold">Create assignment</h1>
      <p className="mt-1 text-sm text-white/50">
        Add the question as given by your teacher. StudyFlow explains and plans from it — it never writes it for
        you.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <LabeledInput label="Title" value={title} onChange={setTitle} required />
          <LabeledInput label="Subject" value={subject} onChange={setSubject} required />
          <div>
            <label className="mb-1.5 block text-xs font-medium text-white/60">Assignment question</label>
            <textarea
              required
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-violet-400/50"
            />
          </div>
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2.5 text-sm font-medium shadow-lg shadow-violet-900/40 transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Creating…" : "Create assignment"}
          </button>
        </form>
      </div>
    </div>
  );
}

function LabeledInput({
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