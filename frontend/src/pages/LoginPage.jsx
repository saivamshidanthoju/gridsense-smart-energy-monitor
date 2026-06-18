import { useState } from "react";
import AuthShell from "../components/AuthShell";
import { useTheme } from "../hooks/useTheme";
import { loginUser as apiLoginUser } from "../services/authApi";

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

export default function LoginPage({ onAuthenticated, onNavigate, onSwitchToRegister }) {
  const { isDark } = useTheme();
  const [form, setForm] = useState({
    email: "",
    meterId: "",
    password: "",
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

    const email = form.email.trim();
    const meterId = form.meterId.trim();

    if (!email || !meterId || !form.password) {
      setError("Please enter your email, Service Connection number, and password.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    try {
      const response = await apiLoginUser({
        email,
        meterId,
        password: form.password,
      });

      onAuthenticated({
        token: response.token,
        user: response.user,
        authSource: response.authSource || "database",
        authLabel: "Signed in",
      });
    } catch (submissionError) {
      setError(submissionError.message || "Unable to sign in right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell activePage="login" onNavigate={onNavigate}>
      <div className="space-y-6">
        
        {/* Top: Customer Portal Header */}
        <div className="text-left space-y-1">
          <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Welcome Back</h1>
          <p className="text-xs text-[var(--text-secondary)]">
            Sign in to access your energy dashboard.
          </p>
        </div>

        {error ? (
          <div className="rounded border border-rose-500/20 bg-rose-500/10 px-3 py-2.5 text-xs text-rose-300 text-left">
            {error}
          </div>
        ) : null}

        {/* Middle: Login Form */}
        <form className="space-y-5" onSubmit={handleSubmit} noValidate>
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
            placeholder="SC-104829375"
            autoComplete="off"
            value={form.meterId}
            onChange={updateField("meterId")}
          />

          <FormField
            label="Password"
            type={form.showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter password"
            autoComplete="current-password"
            value={form.password}
            onChange={updateField("password")}
          />

          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="inline-flex items-center gap-2 text-[var(--text-secondary)] cursor-pointer font-medium">
              <input
                type="checkbox"
                checked={form.showPassword}
                onChange={updateField("showPassword")}
                className="h-4 w-4 rounded border-[var(--surface-border-strong)] bg-[var(--surface-soft)] text-[var(--accent-primary)] focus:ring-0 cursor-pointer"
              />
              <span>Show password</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-[var(--accent-primary)] hover:opacity-90 active:scale-[0.98] py-2.5 text-xs font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60 shadow shadow-[var(--accent-primary)]/10"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-[var(--text-secondary)]">
          New connection?{" "}
          <button 
            type="button" 
            onClick={onSwitchToRegister} 
            className="font-semibold text-[var(--accent-primary)] hover:opacity-80 transition"
          >
            Create Account
          </button>
        </p>

      </div>
    </AuthShell>
  );
}
