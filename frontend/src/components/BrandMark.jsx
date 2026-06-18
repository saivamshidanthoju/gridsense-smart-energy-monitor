export default function BrandMark({ className = "", iconClassName = "h-5 w-5" }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--surface-border)] bg-[var(--surface-soft)] text-[var(--accent-primary)] ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={iconClassName}
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Modern smart hexagonal grid cell node */}
        <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" />
        {/* Sleek integrated lightning energy bolt */}
        <path d="M12 6l-3 5.5h5l-2.5 6.5" />
      </svg>
    </span>
  );
}
