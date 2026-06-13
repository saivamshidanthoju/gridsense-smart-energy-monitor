import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

function NavButton({ active, children, onClick, variant = "plain" }) {
  const variantClass =
    variant === "primary"
      ? "bg-[var(--accent-primary)] text-white hover:bg-[#0d655f] dark:hover:bg-[#14b8a6]"
      : active
        ? "bg-[var(--surface-soft)] text-[var(--text-primary)]"
        : "text-tonal hover:bg-[var(--surface-soft)] hover:text-[var(--text-primary)]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[10px] px-3 py-2 text-sm font-semibold transition ${variantClass}`}
    >
      {children}
    </button>
  );
}

export default function PublicShell({ activePage, children, isAuthenticated = false, onNavigate, onDashboard }) {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--bg-deep)_0%,var(--bg-base)_100%)]">
      <header className="sticky top-0 z-30 border-b border-[var(--surface-border)] bg-[var(--surface-glass)] backdrop-blur">
        <div className="mx-auto flex max-w-[1180px] items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <button type="button" onClick={() => onNavigate?.("home")} className="flex min-w-0 items-center gap-3 text-left">
            <BrandMark className="h-9 w-9 shrink-0" iconClassName="h-[18px] w-[18px]" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-[var(--text-primary)]">Smart Electricity Meter</p>
              <p className="truncate text-[11px] text-tonal">Live usage and billing made simple</p>
            </div>
          </button>

          <nav className="flex shrink-0 items-center gap-1.5">
            <div className="hidden items-center gap-1.5 sm:flex">
              <NavButton active={activePage === "home"} onClick={() => onNavigate?.("home")}>
                Home
              </NavButton>
              <NavButton active={activePage === "about"} onClick={() => onNavigate?.("about")}>
                About
              </NavButton>
            </div>

            {isAuthenticated ? (
              <NavButton variant="primary" onClick={onDashboard}>
                Dashboard
              </NavButton>
            ) : (
              <>
                <NavButton active={activePage === "login"} onClick={() => onNavigate?.("login")}>
                  Login
                </NavButton>
                <NavButton variant="primary" onClick={() => onNavigate?.("signup")}>
                  Sign Up
                </NavButton>
              </>
            )}

            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  );
}
