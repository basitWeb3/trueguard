import { useEffect, useRef } from "react";
import type { Evidence } from "../types";

type Props = { evidence?: Evidence; onClose: () => void };

export default function EvidenceDrawer({ evidence, onClose }: Props) {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!evidence) return;
    const previousOverflow = document.body.style.overflow;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKey);
      previouslyFocused?.focus();
    };
  }, [evidence, onClose]);

  if (!evidence) return null;
  return (
    <div className="drawer-backdrop" role="presentation" onMouseDown={onClose}>
      <aside className="evidence-drawer" role="dialog" aria-modal="true" aria-labelledby="evidence-title" onMouseDown={(event) => event.stopPropagation()}>
        <button ref={closeButton} className="drawer-close" type="button" onClick={onClose} aria-label="Close evidence">×</button>
        <p className="eyebrow">Source record</p>
        <span className="source-badge">{evidence.sourceType.replace("_", " ")}</span>
        <h2 id="evidence-title">{evidence.title}</h2>
        <p className="source-publisher">Published by {evidence.publisher}</p>
        <div className="evidence-quote"><span>What the source supports</span><p>{evidence.extract}</p></div>
        <dl className="evidence-meta">
          <div><dt>Confidence</dt><dd>{evidence.confidence}</dd></div>
          <div><dt>Last checked</dt><dd>{evidence.retrievedAt}</dd></div>
          <div><dt>Content hash</dt><dd>{evidence.contentHash.slice(0, 14)}…</dd></div>
        </dl>
        <a className="primary-link" href={evidence.url} target="_blank" rel="noreferrer">Open official source ↗</a>
      </aside>
    </div>
  );
}
