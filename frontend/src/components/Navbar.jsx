import { useState } from "react";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

function getInitials(name = "") {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "SM"
  );
}

function HeaderLink({ children, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="nav-link-pill"
    >
      {children}
    </button>
  );
}

export default function Navbar({
  user,
  onMenuClick,
  onNavigatePublic,
  onNavigatePrivate,
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--surface-border)] bg-[var(--surface-glass)] px-3 py-1.5 backdrop-blur lg:px-4">
      <div className="flex min-h-[44px] items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="focus-ring inline-flex h-9 w-9 items-center justify-center rounded-lg text-[var(--text-primary)] hover:bg-[var(--surface-soft)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M3.5 5.5h13" strokeLinecap="round" />
            <path d="M3.5 10h13" strokeLinecap="round" />
            <path d="M3.5 14.5h13" strokeLinecap="round" />
          </svg>
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-7">
          <button
            type="button"
            onClick={() => onNavigatePrivate?.("dashboard")}
            className="flex min-w-0 items-center gap-2.5 rounded-lg py-1 pr-2 text-left transition hover:bg-[var(--surface-soft)]"
            aria-label="Go to dashboard"
          >
            <BrandMark className="h-8 w-8 rounded-lg" iconClassName="h-4 w-4" />
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium leading-none text-[var(--text-primary)]">Smart Meter</p>
            </div>
          </button>
        </div>

        <div className="relative flex shrink-0 items-center justify-end gap-1.5">
          <nav className="hidden items-center gap-1 md:flex" aria-label="Primary navigation">
            <HeaderLink onClick={() => onNavigatePublic?.("home")}>Home</HeaderLink>
            <HeaderLink onClick={() => onNavigatePublic?.("about")}>About</HeaderLink>
          </nav>

          <ThemeToggle />

          <button
            type="button"
            className="nav-profile-button"
            onClick={() => setProfileOpen((current) => !current)}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
            aria-label="Open profile menu"
          >
            <span className="nav-profile-avatar">{getInitials(user?.name)}</span>
            <span className="hidden text-sm font-medium lg:inline">Profile</span>
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m6 8 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {profileOpen ? (
            <div className="nav-profile-menu" role="menu">
              <button
                type="button"
                className="nav-profile-menu-item"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigatePrivate?.("settings");
                }}
                role="menuitem"
              >
                Settings
              </button>
              <button
                type="button"
                className="nav-profile-menu-item"
                onClick={() => {
                  setProfileOpen(false);
                  onNavigatePrivate?.("devices");
                }}
                role="menuitem"
              >
                Device profile
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
