# StudyFlow

An AI-powered study assistant that helps students **understand, plan, improve, and
prepare** for their own assignments.

StudyFlow is explicitly **not** an assignment generator. It never writes the
assignment for the student. Every AI call in the product is scoped to one of four
jobs: explain the question, plan the work, review the student's own draft, or quiz
them to prepare for a viva. That boundary is enforced in the system prompt for every
LLM call (see `src/lib/llm.ts`) and is the product's actual differentiator.

## The core pipeline

```
Assignment → Explain → Plan → Review → Viva
```

Each assignment moves through this pipeline once, and every stage's output is saved
permanently in its own table (`ExplainResult`, `PlanResult`, `ReviewResult`,
`VivaResult`) so a student can reopen any past result instantly without paying for
regeneration. Status on the assignment (`Not Started → Planning → Draft Ready →
Reviewed → Completed`) is advanced manually by the student as they move through the
tabs — there's no automatic overdue detection or reminder system in v1, by design.

## Why the structure looks like this

- **Route-based feature grouping.** Authenticated pages live under `src/app/(app)`
  behind one shared layout (`(app)/layout.tsx`) that does the session check once and
  renders the sidebar — pages don't repeat auth logic.
- **One API route per AI job.** `POST /api/assignments/[id]/explain|plan|review|viva`
  each call a single function in `src/lib/llm.ts` and persist straight to that
  stage's table. This keeps the "never generate the assignment" rule enforceable in
  one place instead of scattered across UI code.
- **`src/lib/llm.ts` is swappable.** It's a thin wrapper — swap the `callLLM` fetch
  call for Lamatic AgentKit, the Anthropic API, or any other provider without
  touching a single route handler.
- **Qualitative review, not fabricated scores.** `ReviewResult` stores an enum
  (`GOOD | NEEDS_WORK | MISSING`) per category, never a numeric percentage, matching
  the product's honesty principle.

## Tech stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS (custom "Fieldnotes" design tokens — see `tailwind.config.ts`)
- PostgreSQL (Neon or Supabase) via Prisma ORM
- NextAuth.js (Auth.js), credentials provider
- Swappable LLM client (Lamatic AgentKit by default)

## Design direction

The visual identity ("Fieldnotes") treats the app like an annotated study notebook
rather than a generic SaaS dashboard: ink-navy structure, warm paper surfaces, an
amber "highlighter" accent used sparingly for the one actionable thing per screen,
and a correction-pen teal for completed states. Display type is Fraunces (editorial,
notebook-like headers), body is Inter, and IBM Plex Mono is used for labels, stepper
text, and timestamps — the "handwritten margin note" utility layer. The status
Stepper is styled as a ticked-off checklist rather than a generic progress bar; it's
the one recurring signature element across every assignment page.

## Folder structure

```
src/
  app/
    page.tsx                     # Landing page
    (auth)/login, register       # Public auth pages
    (app)/layout.tsx             # Shared authenticated layout (sidebar + auth guard)
    (app)/dashboard              # Assignment cards + stats
    (app)/assignments/new        # Create assignment form
    (app)/assignments/[id]       # Workspace: Stepper + 4 tabs (Explain/Plan/Review/Viva)
    (app)/workspace              # History list with per-stage completion
    (app)/profile                # Editable profile fields
    api/
      auth/register, auth/[...nextauth]
      assignments, assignments/[id], assignments/[id]/status
      assignments/[id]/explain|plan|review|viva
      upload
      profile
  components/
    ui/                          # Button, Card, Badge, Tabs, Stepper, FileUpload, EmptyState, Loader
    Sidebar.tsx, ThemeToggle.tsx, SessionProvider.tsx
  lib/
    prisma.ts, auth.ts, llm.ts, getOwnedAssignment.ts, clsx.ts
prisma/
  schema.prisma, seed.ts
```

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment variables** — copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` — a Neon or Supabase Postgres connection string
   - `NEXTAUTH_SECRET` — generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` — `http://localhost:3000` in development
   - `LAMATIC_AGENT_URL` / `LAMATIC_API_KEY` — or swap the client in `src/lib/llm.ts`
     for your preferred LLM provider
   - File storage keys (e.g. `BLOB_READ_WRITE_TOKEN` for Vercel Blob) — wire up
     `storeFile` in `src/app/api/upload/route.ts` for your provider

3. **Push the schema and generate the client**
   ```bash
   npm run db:push
   ```

4. **(Optional) seed demo data**
   ```bash
   npm run db:seed
   ```
   Creates `demo@studyflow.app` / `password123` with two example assignments.

5. **Run the dev server**
   ```bash
   npm run dev
   ```

## PDF handling notes

- Assignment PDF upload and draft PDF upload both go through `POST /api/upload`,
  which is a minimal scaffold — replace `storeFile` with a real provider (Vercel
  Blob, Supabase Storage, S3) before deploying.
- The Review tab currently takes the student's draft as pasted text. For PDF drafts,
  extract text server-side (e.g. with `pdf-parse`) before calling
  `POST /api/assignments/[id]/review` — kept out of the route by default to avoid
  locking the API to one PDF parsing library.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add all variables from `.env.example` under Project Settings → Environment
   Variables.
4. Set the Postgres `DATABASE_URL` to your Neon/Supabase production connection
   string (use the pooled connection string if using Prisma with serverless
   functions).
5. Vercel runs `next build`, which triggers `postinstall` → `prisma generate`
   automatically. Run `npx prisma db push` once locally (or via a one-off Vercel
   deploy hook) against the production database before first use.
6. Deploy.

## What's intentionally not in v1

No admin dashboard, no notification/reminder system, no automatic overdue detection,
no analytics charts, no multi-role auth, no profile picture upload, no fabricated
percentage scores. The Explain → Plan → Review → Viva pipeline is the product;
everything else stays deliberately simple around it.
