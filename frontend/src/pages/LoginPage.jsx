import { useState } from "react";
import AuthShell from "../components/AuthShell";
import { useTheme } from "../hooks/useTheme";
import { loginUser as apiLoginUser } from "../services/authApi";

function FormField({ label, isDark, ...props }) {
  return (
    <label className="block">
      <span className={`mb-2 block text-[11px] font-semibold uppercase ${isDark ? "text-white/68" : "text-slate-700"}`}>
        {label}
      </span>
      <div className="surface-card-muted focus-ring flex items-center gap-3 px-4 py-3">
        <input {...props} className={`w-full bg-transparent text-sm outline-none ${isDark ? "text-white" : "text-slate-900"}`} />
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
      setError("Please enter your email, meter ID, and password.");
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
      <div className="surface-panel px-5 py-6 sm:px-6">
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Login</h1>

        {error ? (
          <div className={`mt-4 rounded-[10px] border px-4 py-3 text-sm ${isDark ? "border-rose-500/20 bg-rose-500/10 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {error}
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Email"
            type="email"
            name="email"
            placeholder="Enter your email"
            autoComplete="email"
            isDark={isDark}
            value={form.email}
            onChange={updateField("email")}
          />

          <FormField
            label="Meter ID"
            type="text"
            name="meterId"
            placeholder="ESP32-A4F2"
            autoComplete="off"
            isDark={isDark}
            value={form.meterId}
            onChange={updateField("meterId")}
          />

          <FormField
            label="Password"
            type={form.showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            autoComplete="current-password"
            isDark={isDark}
            value={form.password}
            onChange={updateField("password")}
          />

          <label className={`inline-flex items-center gap-2 text-sm ${isDark ? "text-white/76" : "text-slate-700"}`}>
            <input
              type="checkbox"
              checked={form.showPassword}
              onChange={updateField("showPassword")}
              className="h-4 w-4 rounded border-slate-300 accent-cyan-600"
            />
            Show password
          </label>

          <button
            type="submit"
            disabled={loading}
            className="primary-button w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-tonal">
          New user?{" "}
          <button type="button" onClick={onSwitchToRegister} className="font-semibold text-[var(--accent-secondary)]">
            Sign up
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
