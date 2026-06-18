import PublicShell from "./PublicShell";
import BrandMark from "./BrandMark";

export default function AuthShell({ activePage, children, onNavigate }) {
  return (
    <PublicShell activePage={activePage} onNavigate={onNavigate} hideHeaderFooter={true}>
      <section className="min-h-screen w-screen relative bg-[var(--bg-base)] py-16 px-4 sm:px-6">
        
        {/* Floating Back Button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20">
          <button
            type="button"
            onClick={() => onNavigate?.("home")}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--surface-border)] bg-[var(--surface-solid)] px-3.5 py-1.5 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-soft)] shadow-md transition"
          >
            <span>← Back to Home</span>
          </button>
        </div>

        {/* Simple, clean background pattern for support, not distraction */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none z-0">
          <svg className="w-full h-full stroke-slate-500" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="simple-grid-pattern" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M 60 0 L 0 0 0 60" fill="none" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#simple-grid-pattern)" />
          </svg>
        </div>

        {/* Clean, Centered Card Wrapper */}
        <div className="relative z-10 mx-auto w-full max-w-[640px] bg-[var(--surface-solid)] border border-[var(--surface-border)] rounded-lg p-6 sm:p-10 shadow-2xl my-8">
          
          {/* Top Bar Navigation */}
          <div className="flex justify-between items-center pb-4 mb-5 border-b border-[var(--surface-border)]">
            <div className="flex items-center gap-2">
              <BrandMark className="h-7 w-7" iconClassName="h-3.5 w-3.5" />
              <span className="text-sm font-bold text-[var(--text-primary)]">GridSense</span>
            </div>
          </div>

          {children}
        </div>

      </section>
    </PublicShell>
  );
}
