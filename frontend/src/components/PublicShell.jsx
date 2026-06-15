import { useState, useEffect } from "react";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

function NavButton({ active, children, onClick, variant = "plain" }) {
  const variantClass =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm"
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

export default function PublicShell({ activePage, children, isAuthenticated = false, onNavigate, onDashboard, hideHeaderFooter = false }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY >= 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  function handleContactClick() {
    if (activePage === "about") {
      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
    } else {
      onNavigate?.("about");
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[linear-gradient(180deg,var(--bg-deep)_0%,var(--bg-base)_100%)]">
      {/* Background glowing lights */}
      <div className="absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 filter blur-[120px] pointer-events-none" />
      <div className="absolute top-[30vh] right-1/4 h-[400px] w-[400px] rounded-full bg-purple-500/5 filter blur-[100px] pointer-events-none" />
      
      {!hideHeaderFooter && (
        <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-2 bg-[var(--surface-glass)] backdrop-blur-xl border-b border-indigo-500/10 shadow-lg shadow-indigo-500/5 dark:shadow-black/20" : "py-4 bg-transparent border-b border-transparent shadow-none"}`}>
          <div className={`mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 lg:px-6 transition-all duration-300 ${scrolled ? "py-0" : "py-1"}`}>
            <button type="button" onClick={() => onNavigate?.("home")} className="flex min-w-0 items-center gap-3 text-left">
              <BrandMark className="h-9 w-9 shrink-0 text-indigo-600" iconClassName="h-[18px] w-[18px]" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--text-primary)]">GridSense</p>
                <p className="truncate text-[10px] text-tonal font-medium">Smart Electricity Monitoring Platform</p>
              </div>
            </button>

            <nav className="flex shrink-0 items-center gap-1">
              <div className="hidden items-center gap-1 sm:flex mr-2">
                <NavButton active={activePage === "home"} onClick={() => onNavigate?.("home")}>
                  Home
                </NavButton>
                <NavButton active={activePage === "about"} onClick={() => onNavigate?.("about")}>
                  About
                </NavButton>
                <NavButton active={false} onClick={handleContactClick}>
                  Contact Us
                </NavButton>
              </div>

              {isAuthenticated ? (
                <NavButton variant="primary" onClick={onDashboard}>
                  Dashboard
                </NavButton>
              ) : (
                <NavButton variant="primary" onClick={() => onNavigate?.("login")}>
                  Login
                </NavButton>
              )}

              <div className="ml-1 pl-1 border-l border-[var(--surface-border)]">
                <ThemeToggle />
              </div>
            </nav>
          </div>
        </header>
      )}

      <main className={hideHeaderFooter ? "" : "pt-20 lg:pt-24"}>{children}</main>

      {!hideHeaderFooter && (
        <footer className="border-t border-[var(--surface-border)] bg-[var(--surface-strong)] py-12 mt-16 transition-colors">
          <div className="mx-auto max-w-[1280px] px-4 lg:px-6">
            <div className="grid gap-8 md:grid-cols-3 text-xs text-tonal">
              {/* Brand Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BrandMark className="h-8 w-8 shrink-0 text-indigo-600" iconClassName="h-4 w-4" />
                  <span className="font-semibold text-sm text-[var(--text-primary)]">GridSense</span>
                </div>
                <p className="text-[11px] leading-relaxed max-w-xs">
                  GridSense is a smart electricity monitoring platform that helps homeowners track usage, estimate billing slabs, and manage utilities in real-time.
                </p>
              </div>

              {/* Quick Links */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">Quick Links</h4>
                <ul className="space-y-2 flex flex-col items-start">
                  <li>
                    <button type="button" onClick={() => onNavigate?.("home")} className="hover:text-[var(--text-primary)] transition">Home</button>
                  </li>
                  <li>
                    <button type="button" onClick={() => onNavigate?.("about")} className="hover:text-[var(--text-primary)] transition">About</button>
                  </li>
                  <li>
                    <button type="button" onClick={handleContactClick} className="hover:text-[var(--text-primary)] transition">Contact Us</button>
                  </li>
                  <li>
                    <button type="button" onClick={() => onNavigate?.("login")} className="hover:text-[var(--text-primary)] transition">Login</button>
                  </li>
                </ul>
              </div>

              {/* Contact Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[var(--text-primary)]">Contact Information</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span>📞</span>
                    <span>+91 8374170152</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>✉️</span>
                    <a href="mailto:saivamshidanthoju@gmail.com" className="hover:text-[var(--text-primary)] transition">saivamshidanthoju@gmail.com</a>
                  </li>
                  <li className="flex items-center gap-2">
                    <span>📍</span>
                    <span>Hyderabad, India</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border-t border-[var(--surface-border)] mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-tonal">
              <span>&copy; 2026 GridSense. All Rights Reserved.</span>
              <div className="flex gap-4">
                <a href="#" className="hover:text-[var(--text-primary)] transition">Privacy Policy</a>
                <a href="#" className="hover:text-[var(--text-primary)] transition">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
