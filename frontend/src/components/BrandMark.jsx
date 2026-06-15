export default function BrandMark({ className = "", iconClassName = "h-5 w-5" }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={iconClassName}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {/* Modern Smart Meter body */}
        <rect x="5" y="3" width="14" height="18" rx="2.5" />
        {/* Meter screen */}
        <line x1="8" y1="7" x2="16" y2="7" />
        {/* Lightning energy bolt */}
        <path d="m13 10-3 3.5h4l-3 3.5" />
      </svg>
    </span>
  );
}
