import { useState } from "react";
import BrandMark from "./BrandMark";
import ThemeToggle from "./ThemeToggle";

const PAGE_MAP = {
  dashboard: { title: "Dashboard", subtitle: "Real-time consumption & active energy parameters" },
  predictions: { title: "Electricity Forecast", subtitle: "AI-powered electricity bill forecast & analytics" },
  billing: { title: "Billing & Tariffs", subtitle: "Telangana slab charges, estimates & cycle data" },
  payments: { title: "Payments", subtitle: "Manage transactional records & invoices" },
  alerts: { title: "Alert Center", subtitle: "Manage active hardware alerts & critical grid events" },
  devices: { title: "Device Profile", subtitle: "Hardware configurations & device health monitoring" },
  settings: { title: "System Settings", subtitle: "Account details, billing regions & log audits" },
};

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

export default function Navbar({
  user,
  activePage = "dashboard",
  alerts = [],
  onMenuClick,
  onNavigatePublic,
  onNavigatePrivate,
  onLogout,
  onUpdateUser,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Modal form states
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editProfilePic, setEditProfilePic] = useState("");
  const [currPassword, setCurrPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toastMessage, setToastMessage] = useState("");

  const initials = getInitials(user?.name);

  const handleOpenEditProfile = () => {
    setEditName(user?.name || "");
    setEditEmail(user?.email || "");
    setEditProfilePic(user?.profilePicture || "");
    setCurrPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setEditProfileOpen(true);
    setProfileOpen(false);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditProfilePic(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveChanges = (e) => {
    e.preventDefault();

    if (newPassword || confirmPassword) {
      if (newPassword !== confirmPassword) {
        alert("New passwords do not match. Please verify.");
        return;
      }
      if (!currPassword) {
        alert("Please enter your current password to verify updates.");
        return;
      }
    }

    onUpdateUser?.({
      name: editName,
      email: editEmail,
      profilePicture: editProfilePic,
      ...(newPassword ? { password: newPassword } : {}),
    });

    setEditProfileOpen(false);
    setToastMessage("Profile updated successfully!");
    setTimeout(() => {
      setToastMessage("");
    }, 3000);
  };

  const pageInfo = PAGE_MAP[activePage] || {
    title: "Dashboard",
    subtitle: "Real-time consumption & analytics",
  };

  return (
    <header className="sticky top-0 z-20 border-b border-[var(--surface-border)] bg-[var(--surface-glass)] px-4 py-2 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Side: Dynamic Page Headings */}
        <div className="flex items-center gap-3">
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

          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">{pageInfo.subtitle}</p>
            <h1 className="text-xl font-semibold text-[var(--text-primary)] leading-tight mt-0.5">{pageInfo.title}</h1>
          </div>
        </div>

        {/* Right Side: Theme Toggle, Profile */}
        <div className="flex flex-wrap items-center gap-3">
          <ThemeToggle />

          {/* User Profile Menu */}
          <div className="relative">
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] font-medium text-[var(--text-primary)] text-sm overflow-hidden transition hover:bg-[var(--surface-muted)]"
              onClick={() => {
                setProfileOpen((prev) => !prev);
              }}
              aria-expanded={profileOpen}
              aria-haspopup="menu"
              aria-label="Open profile menu"
            >
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt={user.name} className="h-full w-full object-cover rounded-full" />
              ) : (
                initials?.[0] || "V"
              )}
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 mt-2 z-30 w-[280px] overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-1.5 shadow-[var(--shadow-shell)] backdrop-blur-md transition-all duration-200 fade-rise"
                role="menu"
              >
                {/* Header User Details */}
                <div className="px-3 py-2.5 flex items-center gap-3 select-none">
                  {user?.profilePicture ? (
                    <img src={user.profilePicture} alt={user.name} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl object-cover border border-[var(--surface-border)]" />
                  ) : (
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 text-sm font-semibold border border-indigo-500/20">
                      {initials}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{user?.name || "User"}</p>
                    <p className="text-[10px] text-tonal truncate mt-0.5">{user?.email || "No email"}</p>
                  </div>
                </div>

                <div className="h-[1px] bg-[var(--surface-border)] my-1" />

                {/* Edit Profile Item */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-all duration-150"
                  onClick={handleOpenEditProfile}
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-tonal">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span>Edit Profile</span>
                </button>

                {/* Settings Item */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-all duration-150"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigatePrivate?.("settings");
                  }}
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-tonal">
                    <circle cx="12" cy="12" r="3" />
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                  </svg>
                  <span>System Settings</span>
                </button>

                {/* Device Profile Item */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--sidebar-hover)] transition-all duration-150"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigatePrivate?.("devices");
                  }}
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-tonal">
                    <rect x="4" y="4" width="16" height="16" rx="2" />
                    <rect x="9" y="9" width="6" height="6" />
                    <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
                  </svg>
                  <span>Device Profile</span>
                </button>

                <div className="h-[1px] bg-[var(--surface-border)] my-1" />

                {/* Logout Action (Destructive) */}
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-xs font-medium text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 transition-all duration-150"
                  onClick={() => {
                    setProfileOpen(false);
                    onLogout?.();
                  }}
                  role="menuitem"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-rose-500">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

    {/* Edit Profile Modal */}
    {editProfileOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-modal-backdrop">
        <div className="surface-panel w-full max-w-md overflow-hidden rounded-2xl border border-[var(--surface-border)] bg-[var(--surface-glass)] p-5 shadow-[var(--shadow-shell)] backdrop-blur-md animate-modal-content">
          <div className="flex justify-between items-center pb-3 border-b border-[var(--surface-border)]">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">Edit Profile</h3>
            <button
              type="button"
              onClick={() => setEditProfileOpen(false)}
              className="text-tonal hover:text-[var(--text-primary)] transition"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSaveChanges} className="mt-4 space-y-3.5">
            {/* Profile Picture Upload */}
            <div className="flex items-center gap-4">
              <div className="relative h-14 w-14 shrink-0 rounded-full border border-[var(--surface-border)] bg-[var(--surface-soft)] flex items-center justify-center overflow-hidden">
                {editProfilePic ? (
                  <img src={editProfilePic} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-base font-semibold text-indigo-500">{initials}</span>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-tonal file:mr-2.5 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-indigo-500/10 file:text-indigo-500 hover:file:bg-indigo-500/20 file:cursor-pointer"
                />
              </div>
            </div>

            {/* Name field */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">Full Name</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-soft)] py-1.5 px-3 text-xs text-[var(--text-primary)] transition focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            {/* Email field */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">Email Address</label>
              <input
                type="email"
                required
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-soft)] py-1.5 px-3 text-xs text-[var(--text-primary)] transition focus:border-indigo-500/50 focus:outline-none"
              />
            </div>

            {/* Meter ID field (Read-only) */}
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">Service Connection / Meter Number</label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value={user?.meterId || "N/A"}
                  className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-muted)] py-1.5 pl-8 pr-3 text-xs text-tonal cursor-not-allowed select-none focus:outline-none opacity-60"
                />
                <span className="absolute inset-y-0 left-2.5 flex items-center text-tonal">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
              </div>
            </div>

            {/* Password update section */}
            <div className="border-t border-[var(--surface-border)] pt-3.5 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500">Update Password (Optional)</p>
              
              <div>
                <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">Current Password</label>
                <input
                  type="password"
                  value={currPassword}
                  onChange={(e) => setCurrPassword(e.target.value)}
                  className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-soft)] py-1.5 px-3 text-xs text-[var(--text-primary)] transition focus:border-indigo-500/50 focus:outline-none"
                />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-soft)] py-1.5 px-3 text-xs text-[var(--text-primary)] transition focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold uppercase tracking-wider text-tonal mb-1">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-soft)] py-1.5 px-3 text-xs text-[var(--text-primary)] transition focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-2.5 pt-3 border-t border-[var(--surface-border)]">
              <button
                type="button"
                onClick={() => setEditProfileOpen(false)}
                className="secondary-button text-xs font-semibold px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="primary-button text-xs font-semibold px-4 py-2"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    )}

    {/* Success Toast */}
    {toastMessage && (
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-50 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-400 shadow-lg backdrop-blur-md animate-modal-backdrop flex items-center gap-2">
        <span>✓</span>
        <span>{toastMessage}</span>
      </div>
    )}
    </header>
  );
}
