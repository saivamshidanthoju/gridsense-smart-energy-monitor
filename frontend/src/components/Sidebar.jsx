import BrandMark from "./BrandMark";

const NAV_ICON_MAP = {
  dashboard: (
    <>
      <path d="M4.5 11.5 12 5l7.5 6.5" />
      <path d="M6.5 10.5V19h11v-8.5" />
      <path d="M10 19v-5h4v5" />
    </>
  ),
  predictions: (
    <>
      <path d="M6 16c1.5-4 4-6 8-8" />
      <path d="m12 8 2-2 4 1-1 4-2 2" />
    </>
  ),
  analytics: (
    <>
      <path d="M5 18h14" />
      <path d="M8 18v-5" />
      <path d="M12 18V8" />
      <path d="M16 18v-8" />
    </>
  ),
  billing: (
    <>
      <path d="M7 5.5h10v13H7z" />
      <path d="M9.5 9.5h5" />
      <path d="M9.5 13h5" />
    </>
  ),
  payments: (
    <>
      <rect x="4.5" y="6.5" width="15" height="11" rx="2" />
      <path d="M4.5 10h15" />
      <path d="M8 14h3.5" />
    </>
  ),
  alerts: (
    <>
      <path d="M12 6v5" />
      <path d="M12 15.5h.01" />
      <path d="M10.2 4.6 4.8 14a1.2 1.2 0 0 0 1.04 1.8h12.32A1.2 1.2 0 0 0 19.2 14l-5.4-9.4a1.2 1.2 0 0 0-2.08 0Z" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.7a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7 7 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
    </>
  ),
};

function NavigationIcon({ itemId, active }) {
  return (
    <span
      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border transition-colors ${
        active
          ? "border-transparent bg-[var(--sidebar-active-bg)] text-[var(--sidebar-active-text)]"
          : "border-transparent text-[var(--sidebar-muted)]"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-[18px] w-[18px]"
      >
        {NAV_ICON_MAP[itemId]}
      </svg>
    </span>
  );
}

export default function Sidebar({
  user,
  navItems,
  activePage,
  onNavigate,
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
}) {
  if (isCollapsed && !isOpen) {
    return (
      <aside className="sidebar-shell hidden w-[4.25rem] shrink-0 flex-col items-center border-r border-[var(--sidebar-border)] px-2 py-4 shadow-[var(--shadow-soft)] lg:flex">
        <button
          type="button"
          onClick={onToggleCollapse}
          className="focus-ring flex h-12 w-12 items-center justify-center rounded-[14px] border border-[var(--sidebar-border)] bg-[var(--surface-soft)]"
          aria-label="Show Power Console"
        >
          <BrandMark className="h-9 w-9 shrink-0" iconClassName="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={onToggleCollapse}
          className="mt-3 flex h-9 w-9 items-center justify-center rounded-[10px] text-lg font-normal text-[var(--sidebar-muted)] transition hover:bg-[var(--sidebar-hover)] hover:text-[var(--sidebar-text)]"
          aria-label="Expand navigation"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="m7.5 4.5 5 5.5-5 5.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </aside>
    );
  }

  return (
    <aside
      className={`fixed inset-y-3 left-3 z-40 flex h-[calc(100vh-1.5rem)] w-[11rem] shrink-0 flex-col border transition-transform duration-300 lg:relative lg:inset-auto lg:h-auto lg:translate-x-0 lg:border-y-0 lg:border-l-0 ${
        isOpen ? "translate-x-0" : "-translate-x-[115%]"
      } sidebar-shell rounded-[14px] shadow-[var(--shadow-panel)] lg:rounded-none lg:rounded-l-[16px]`}
    >
      <div className="flex h-full flex-col px-3 py-4">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onToggleCollapse}
            className="focus-ring flex min-w-0 flex-1 items-center gap-3 rounded-[12px] text-left transition hover:bg-[var(--sidebar-hover)]"
            aria-label="Hide Power Console"
          >
            <BrandMark className="h-9 w-9 shrink-0" iconClassName="h-[18px] w-[18px]" />
            <div className="min-w-0">
              <p className="truncate text-[11px] font-medium uppercase text-[var(--sidebar-muted)]">Smart Meter</p>
              <p className="truncate text-sm font-medium text-[var(--sidebar-text)]">Power Console</p>
            </div>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-[var(--sidebar-border)] px-2.5 py-1.5 text-[11px] text-[var(--sidebar-muted)] lg:hidden"
          >
            Close
          </button>
        </div>



        <div className="mt-5 px-2 text-[11px] font-medium uppercase text-[var(--sidebar-muted)]">Menu</div>
        <nav className="mt-2 space-y-1">
          {navItems.map((item) => {
            const active = activePage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`flex w-full items-center gap-2 rounded-[10px] px-2 py-2 text-left transition-colors ${
                  active ? "bg-[var(--sidebar-active-bg)]" : "hover:bg-[var(--sidebar-hover)]"
                }`}
              >
                <NavigationIcon itemId={item.id} active={active} />
                <span
                  className={`min-w-0 truncate text-sm ${
                    active
                      ? "font-medium text-[var(--sidebar-active-text)]"
                      : "font-normal text-[var(--sidebar-text)]"
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>


      </div>
    </aside>
  );
}
