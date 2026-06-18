import { useState } from "react";
import AuthShell from "../components/AuthShell";
import { useTheme } from "../hooks/useTheme";
import { registerUser as apiRegisterUser } from "../services/authApi";

function FormField({ label, ...props }) {
  return (
    <label className="block text-left">
      <span className="mb-1.5 block text-xs font-semibold text-[var(--text-secondary)]">
        {label}
      </span>
      <div className="flex items-center bg-[var(--surface-soft)] border border-[var(--surface-border)] rounded px-3.5 py-3 focus-within:border-[var(--accent-primary)] transition-colors">
        <input 
          {...props} 
          className="w-full bg-transparent text-sm outline-none text-[var(--text-primary)] placeholder-slate-500" 
        />
      </div>
    </label>
  );
}

export default function RegisterPage({ onAuthenticated, onNavigate, onSwitchToLogin }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    name: "",
    email: "",
    meterId: "",
    password: "",
    confirmPassword: "",
    showPassword: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field) {
    return (event) => {
      const { type, checked, value } = event.target;
      setForm((current) => ({
        ...current,
        [field]: type === "checkbox" ? checked : value,
      }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const name = form.name.trim();
    const email = form.email.trim();
    const meterId = form.meterId.trim();

    if (!name || !email || !meterId || !form.password || !form.confirmPassword) {
      setError("Please fill in all the required form fields.");
      return;
    }

    if (!meterId.startsWith("SC-")) {
      setError("Service Connection Number must start with 'SC-' prefix (e.g. SC-104829375).");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiRegisterUser({
        name,
        email,
        meterId,
        password: form.password,
      });

      onAuthenticated({
        token: response.token || "",
        user: response.user || { name, email, meterId },
        authSource: response.authSource || "database",
        authLabel: "Signed in",
      });
    } catch (submissionError) {
      setError(submissionError.message || "Unable to register connection right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell activePage="signup" onNavigate={onNavigate}>
      <div className="space-y-6">
        
        {/* Top Header */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Create Account</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Link your smart meter and start monitoring electricity usage.
          </p>
        </div>

        {error ? (
          <div className="rounded border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300 text-left">
            {error}
          </div>
        ) : null}

        {/* Register Form */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Full Name"
            type="text"
            name="name"
            placeholder="Enter your full name"
            autoComplete="name"
            value={form.name}
            onChange={updateField("name")}
          />

          <FormField
            label="Email Address"
            type="email"
            name="email"
            placeholder="name@domain.com"
            autoComplete="email"
            value={form.email}
            onChange={updateField("email")}
          />

          <FormField
            label="Service Connection Number"
            type="text"
            name="meterId"
            placeholder="SC-XXXXXXXXX (e.g. SC-104829375)"
            autoComplete="off"
            value={form.meterId}
            onChange={updateField("meterId")}
          />

          <FormField
            label="Password"
            type={form.showPassword ? "text" : "password"}
            name="password"
            placeholder="Min 8 chars"
            autoComplete="new-password"
            value={form.password}
            onChange={updateField("password")}
          />

          <FormField
            label="Confirm Password"
            type={form.showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Re-enter password"
            autoComplete="new-password"
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
          />

          <div className="flex items-center text-xs justify-between pt-0.5">
            <label className="inline-flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={form.showPassword}
                onChange={updateField("showPassword")}
                className="h-4 w-4 rounded border-[var(--surface-border-strong)] bg-[var(--surface-soft)] text-[var(--accent-primary)] focus:ring-0 cursor-pointer"
              />
              <span>Show passwords</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--accent-primary)] hover:opacity-90 py-2.5 text-xs font-semibold text-white transition active:scale-[0.98] shadow shadow-[var(--accent-primary)]/10"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <p className="text-[10px] text-center text-[var(--text-tertiary)] leading-normal px-2">
            By creating an account, you agree to our{" "}
            <a href="#" className="underline hover:text-[var(--text-secondary)] transition">Terms of Service</a>{" "}
            and{" "}
            <a href="#" className="underline hover:text-[var(--text-secondary)] transition">Privacy Policy</a>.
          </p>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)]">
          Already registered connection?{" "}
          <button 
            type="button" 
            onClick={onSwitchToLogin} 
            className="font-semibold text-[var(--accent-primary)] hover:opacity-80 transition"
          >
            Sign In
          </button>
        </p>

      </div>
    </AuthShell>
  );
}
