export default function BrandMark({ className = "", iconClassName = "h-5 w-5" }) {
  return (
    <span
      className={`inline-flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/18 bg-cyan-500/10 text-cyan-700 dark:text-cyan-100 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        className={iconClassName}
        stroke="currentColor"
        strokeWidth="1.9"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M6 15.5V10.5" />
        <path d="M11.5 18V7" />
        <path d="M17 13.5v-3" />
        <path d="m6 15.5 5.5-4.5 3.5 2.5 3-3" />
      </svg>
    </span>
  );
}
