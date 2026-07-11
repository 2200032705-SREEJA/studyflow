/**
 * Swappable LLM client.
 *
 * StudyFlow's core rule: the AI never produces the assignment content itself.
 * Every prompt below is written to explain, plan, review, or quiz — never to draft.
 * Defaults to Groq (free tier, OpenAI-compatible). Swap the fetch call in `callLLM`
 * for Lamatic AgentKit, the Anthropic API, or any other provider without touching
 * the route handlers that call these functions.
 */

const GUARDRAIL = `You are StudyFlow, a study assistant. You NEVER write, draft, or complete
the assignment for the student. You explain concepts, plan study steps, review the
student's own submitted work, or quiz them — always in service of the student doing
the work themselves. If asked to produce the assignment content itself, refuse in one
sentence and redirect to explaining or planning instead. Respond ONLY with valid JSON
matching the requested shape — no markdown fences, no preamble.`;

async function callLLM(prompt: string): Promise<string> {
  // Groq: free-tier, OpenAI-compatible chat completions endpoint.
  // Swap this block for Lamatic AgentKit, the Anthropic API, or any other
  // provider without touching the route handlers that call these functions.
  const key = process.env.GROQ_API_KEY;
  const model = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

  if (!key) {
    throw new Error(
      "LLM not configured. Set GROQ_API_KEY (get a free key at https://console.groq.com/keys), or swap the client in src/lib/llm.ts."
    );
  }

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: GUARDRAIL },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  if (!res.ok) {
    throw new Error(`LLM request failed: ${res.status} ${await res.text()}`);
  }

  const data = await res.json();
  // OpenAI-compatible shape, with fallbacks in case the provider is swapped later.
  return data.choices?.[0]?.message?.content ?? data.output ?? data.content?.[0]?.text ?? data.text ?? JSON.stringify(data);
}

function parseJSON<T>(raw: string): T {
  const cleaned = raw.trim().replace(/^```json\s*|```$/g, "");
  return JSON.parse(cleaned) as T;
}

export interface ExplainContent {
  whatIsAsked: string;
  keyConcepts: { name: string; explanation: string; example: string; diagram: string }[];
  commonMistakes: { mistake: string; whyItHappens: string; howToAvoid: string }[];
  resources: { title: string; note: string; searchQuery: string }[];
}

export async function generateExplain(input: {
  title: string;
  subject: string;
  question: string;
}): Promise<ExplainContent> {
  const prompt = `Explain this assignment to a student so they deeply understand it —
do not write any part of the assignment itself.

Title: ${input.title}
Subject: ${input.subject}
Assignment question: ${input.question}

Be specific and substantive, not generic. Ground everything in the actual wording of
the assignment question above rather than giving a textbook-overview answer that
would apply to any assignment on this topic. Avoid vague filler like "provides a
comprehensive overview" — every sentence should teach something concrete.

For "whatIsAsked": 3-5 sentences breaking down exactly what the teacher wants,
referencing specific phrases or requirements from the assignment question, and
naming what a strong answer would need to include.

For "keyConcepts": pick 4-6 concepts truly central to THIS assignment (not a generic
list for the subject). For each, give a clear explanation in your own words (2-3
sentences, precise, not a dictionary definition) AND a concrete example — a short
code snippet, worked scenario, or applied case — that makes the concept click.
Also give a "diagram" in Mermaid syntax (classDiagram for class/inheritance
relationships, flowchart for processes, sequenceDiagram for interactions over
time). AT LEAST HALF of the concepts (round up) MUST include a real, valid Mermaid
diagram — diagrams are a core part of this feature, do not skip them by default.
Only leave "diagram" as an empty string "" for concepts that are genuinely a single
flat idea with no relationships, hierarchy, or steps to show (e.g. a naming
convention). When in doubt, include a diagram. Keep any diagram small (under ~8
nodes/lines) and valid Mermaid syntax — no markdown fences around it.

For "commonMistakes": 3-4 mistakes specific to this kind of assignment. For each,
explain why students tend to make it (the misconception behind it) and one concrete
way to avoid it — not just a restatement of the mistake.

For "resources": exactly 3 resources. Every single one MUST include a non-empty
"searchQuery" — this field is required, never omit it or leave it blank. The note
must say what SPECIFIC section or aspect of the resource is relevant here, not
"gives an overview of X". Instead of guessing a URL (which is often wrong or dead),
"searchQuery" is the exact search phrase a student should type to find that
specific resource/section.

Return JSON:
{
  "whatIsAsked": "...",
  "keyConcepts": [{"name": "...", "explanation": "...", "example": "...", "diagram": "mermaid syntax or empty string"}],
  "commonMistakes": [{"mistake": "...", "whyItHappens": "...", "howToAvoid": "..."}],
  "resources": [{"title": "...", "note": "specific and non-generic", "searchQuery": "exact search phrase, required, never blank"}]
}`;
  const raw = await callLLM(prompt);
  return parseJSON<ExplainContent>(raw);
}

export interface ElaborationContent {
  deeperExplanation: string;
  additionalExample: string;
}

export async function generateElaboration(input: {
  title: string;
  subject: string;
  question: string;
  concept: string;
  currentExplanation: string;
}): Promise<ElaborationContent> {
  const prompt = `A student clicked "explain more" on one concept from an assignment
breakdown because the short explanation wasn't enough. Go deeper — do not just
repeat or rephrase what they already have.

Assignment title: ${input.title}
Subject: ${input.subject}
Assignment question: ${input.question}

Concept: ${input.concept}
What they've already been told: ${input.currentExplanation}

Return JSON:
{
  "deeperExplanation": "4-6 sentences going noticeably deeper than the short version above — cover the 'why', edge cases, or how it connects to the rest of the assignment. Do not repeat the short explanation.",
  "additionalExample": "a second, different example or scenario from the first one, showing the concept in a different context"
}`;
  const raw = await callLLM(prompt);
  return parseJSON<ElaborationContent>(raw);
}

export interface PlanContent {
  topicsToStudy: string[];
  steps: string[];
  estimatedHours: number;
  dailyChecklist: { day: string; task: string }[];
  timeline: { date: string; milestone: string }[];
}

export async function generatePlan(input: {
  title: string;
  subject: string;
  question: string;
  dueDate: string | null;
}): Promise<PlanContent> {
  const prompt = `Build a study and completion plan for this assignment — plan the
work, do not perform it.

Title: ${input.title}
Subject: ${input.subject}
Assignment question: ${input.question}
Due date: ${input.dueDate ?? "not set"}

Be concrete and grounded in THIS specific assignment question — not a generic plan
that would work for any assignment on this general subject. Avoid vague filler like
"Define concepts and their importance" or "Provide examples" — every step should
name the actual sub-topic, deliverable, or decision involved.

For "topicsToStudy": list the specific sub-topics this exact question requires,
in the order they should be learned (each building on the last where relevant).

For "steps": 5-8 concrete actions that add up to a finished submission — not
generic study advice. Each step should describe a specific thing to produce or
decide (e.g. "Write pseudocode for the [specific method from the question]", not
"Understand the concept"). The last 1-2 steps should be about assembling and
proofreading the actual submission.

For "dailyChecklist": one task per day mapped to specific steps above (reference
what's actually being done that day, not just a topic name) — split across a
sensible number of days given the scope of the question and the due date.

For "timeline": 3-5 checkpoints with concrete, verifiable milestones (e.g. "First
draft of [specific section] written", not "Complete studying").

Return JSON:
{
  "topicsToStudy": ["specific sub-topic 1", ...],
  "steps": ["concrete action producing something specific", ...],
  "estimatedHours": number,
  "dailyChecklist": [{"day": "Day 1", "task": "specific task tied to a step above"}],
  "timeline": [{"date": "YYYY-MM-DD or relative label", "milestone": "specific, verifiable milestone"}]
}
If no due date is set, build the timeline using relative day labels instead of dates.`;
  const raw = await callLLM(prompt);
  return parseJSON<PlanContent>(raw);
}

export type Rating = "GOOD" | "NEEDS_WORK" | "MISSING";

export interface ReviewContent {
  grammarRating: Rating;
  structureRating: Rating;
  formattingRating: Rating;
  referencesRating: Rating;
  feedback: string;
}

export async function generateReview(input: {
  title: string;
  subject: string;
  question: string;
  draftText: string;
}): Promise<ReviewContent> {
  const prompt = `Review the student's OWN draft below. Give a qualitative rating per
category — never a fabricated numeric score. Do not rewrite or complete their work;
only critique it.

Assignment title: ${input.title}
Subject: ${input.subject}
Assignment question: ${input.question}
Student draft:
"""
${input.draftText}
"""

Return JSON:
{
  "grammarRating": "GOOD" | "NEEDS_WORK" | "MISSING",
  "structureRating": "GOOD" | "NEEDS_WORK" | "MISSING",
  "formattingRating": "GOOD" | "NEEDS_WORK" | "MISSING",
  "referencesRating": "GOOD" | "NEEDS_WORK" | "MISSING",
  "feedback": "specific written feedback and concrete suggestions, 3-6 sentences"
}`;
  const raw = await callLLM(prompt);
  return parseJSON<ReviewContent>(raw);
}

export interface VivaContent {
  questions: { question: string; modelAnswer: string; difficulty: "foundational" | "applied" | "probing"; followUp: string }[];
  keyConcepts: string[];
}

export async function generateViva(input: {
  title: string;
  subject: string;
  question: string;
}): Promise<VivaContent> {
  const prompt = `Generate likely viva / oral exam questions for this assignment so
the student can prepare to defend their own work.

Title: ${input.title}
Subject: ${input.subject}
Assignment question: ${input.question}

Ground every question in what THIS assignment actually asks, not generic questions
that would apply to any assignment on this topic. An examiner probing this specific
submission would ask about the specific choices and concepts it requires.

Generate 6-8 questions ordered from foundational to probing, tagged by difficulty:
- "foundational": tests whether they understand the basic concept at all
- "applied": tests whether they can apply it to this assignment's specific scenario
- "probing": tests edge cases, tradeoffs, or "what if you changed X" — the kind of
  question that catches someone who memorized an answer but doesn't truly understand

For each question, also give a "followUp" — the natural next question an examiner
would ask if the student's answer was too shallow or textbook (pushes them one level
deeper than modelAnswer covers).

Return JSON:
{
  "questions": [{"question": "...", "modelAnswer": "concise model answer", "difficulty": "foundational" | "applied" | "probing", "followUp": "the next question if their answer is too shallow"}],
  "keyConcepts": ["concept the student should be able to explain unprompted", ...]
}`;
  const raw = await callLLM(prompt);
  return parseJSON<VivaContent>(raw);
}