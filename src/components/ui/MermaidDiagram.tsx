"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram definition (classDiagram, flowchart, sequenceDiagram,
 * etc — whatever the AI generated) as inline SVG. Renders nothing if `code` is
 * empty, and fails quietly (no broken layout) if the syntax is invalid, since
 * this is AI-generated and occasionally malformed.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const id = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!code?.trim()) return;
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });
        const { svg } = await mermaid.render(`mermaid-${id}`, code.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [code, id]);

  if (!code?.trim() || failed) return null;

  return (
    <div
      ref={containerRef}
      className="mt-2 overflow-x-auto rounded border border-ink/10 bg-paper p-3 dark:border-paper/10 dark:bg-ink/40"
    />
  );
}