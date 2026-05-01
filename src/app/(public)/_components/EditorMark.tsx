/**
 * Tiny inline ornament. Three dots in a triangle - reusable as a section break,
 * a label decoration, or an end-of-content mark.
 */
export function EditorMark({
  size = 12,
  className = "",
}: {
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      fill="currentColor"
      aria-hidden
      className={className}
    >
      <circle cx="2.5" cy="9" r="1.2" />
      <circle cx="9.5" cy="9" r="1.2" />
      <circle cx="6" cy="2.7" r="1.2" />
    </svg>
  );
}

/**
 * Section break ornament: rule + mark + rule.
 */
export function SectionBreak({ className = "" }: { className?: string }) {
  return (
    <div className={`my-12 flex items-center gap-4 text-[var(--color-forest)] ${className}`}>
      <span className="h-px flex-1 bg-[var(--color-rule)]" />
      <EditorMark size={10} />
      <span className="h-px flex-1 bg-[var(--color-rule)]" />
    </div>
  );
}
