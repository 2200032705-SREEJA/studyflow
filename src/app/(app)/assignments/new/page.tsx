"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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
      <h1 className="font-display text-3xl text-ink dark:text-paper">Create assignment</h1>
      <p className="mt-1 text-ink/60 dark:text-paper/60">
        Add the question as given by your teacher. StudyFlow explains and plans from it — it never writes it for
        you.
      </p>

      <Card className="mt-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <LabeledInput label="Title" value={title} onChange={setTitle} required />
          <LabeledInput label="Subject" value={subject} onChange={setSubject} required />
          <div>
            <label className="mb-1 block text-xs font-mono text-ink/60 dark:text-paper/60">Assignment question</label>
            <textarea
              required
              rows={5}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="w-full rounded-card border border-ink/15 dark:border-paper/20 bg-transparent px-3 py-2 text-sm outline-none focus:border-amber"
            />
          </div>
          {error && <p className="text-xs text-pen-rose">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create assignment"}
          </Button>
        </form>
      </Card>
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