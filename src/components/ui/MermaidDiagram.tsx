"use client";

import { useEffect, useId, useRef, useState } from "react";

/**
 * Renders a Mermaid diagram definition (classDiagram, flowchart, sequenceDiagram,
 * etc — whatever the AI generated) as inline SVG. Renders nothing if `code` is
 * empty, and fails quietly (no broken layout) if the syntax is invalid, since
 * this is AI-generated and occasionally malformed.
 *
 * IMPORTANT: mermaid.render() creates a temporary DOM node appended directly to
 * document.body to do its measurement/rendering work. On a parse failure it can
 * throw WITHOUT removing that node, which leaves mermaid's own default error
 * graphic (the "bomb" + "Syntax error in text" SVG) visibly stuck on the page,
 * completely outside this component's own container. To avoid that:
 *   1. Validate with mermaid.parse() first — it has no such DOM side effect —
 *      and only call render() once we know the syntax is valid.
 *   2. As a backstop, explicitly remove any stray node render() may have left
 *      behind if it still fails for some other reason.
 */
export function MermaidDiagram({ code }: { code: string }) {
  const id = useId().replace(/:/g, "-");
  const containerRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!code?.trim()) return;
    let cancelled = false;
    const renderId = `mermaid-${id}`;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({ startOnLoad: false, theme: "neutral", securityLevel: "strict" });

        // Validate first. This does not append anything to the DOM, so an
        // invalid diagram fails silently here instead of leaking mermaid's
        // own error graphic onto the page.
        const isValid = await mermaid.parse(code.trim(), { suppressErrors: true });
        if (!isValid) {
          if (!cancelled) setFailed(true);
          return;
        }

        const { svg } = await mermaid.render(renderId, code.trim());
        if (!cancelled && containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch {
        if (!cancelled) setFailed(true);
      } finally {
        // Backstop: mermaid.render() sometimes leaves a temporary node
        // (id `d${renderId}`) attached to document.body even on success or
        // failure — remove it explicitly so it never becomes visible.
        document.getElementById(`d${renderId}`)?.remove();
        document.getElementById(renderId)?.remove();
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