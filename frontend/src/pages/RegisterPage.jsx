import { useState } from "react";
import AuthShell from "../components/AuthShell";
import { useTheme } from "../hooks/useTheme";
import { registerUser as apiRegisterUser } from "../services/authApi";

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
      setError("Please complete every field before creating your account.");
      return;
    }

    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 8) {
      setError("Passwords must be at least 8 characters long.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and confirmation do not match.");
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
      setError(submissionError.message || "Unable to create your account right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell activePage="signup" onNavigate={onNavigate}>
      <div>
        <h1 className="text-2xl font-semibold text-[var(--text-primary)]">Create Your Account</h1>
        <p className="mt-1.5 text-xs text-tonal">
          Register with your Service Connection / Meter Number to start tracking your energy footprint.
        </p>

        {error ? (
          <div className={`mt-4 rounded-[10px] border px-4 py-3 text-sm ${isDark ? "border-rose-500/20 bg-rose-500/10 text-rose-100" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
            {error}
          </div>
        ) : null}

        <form className="mt-5 space-y-4" onSubmit={handleSubmit} noValidate>
          <FormField
            label="Full Name"
            type="text"
            name="name"
            placeholder="Enter your name"
            autoComplete="name"
            isDark={isDark}
            value={form.name}
            onChange={updateField("name")}
          />

          <FormField
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            autoComplete="email"
            isDark={isDark}
            value={form.email}
            onChange={updateField("email")}
          />

          <FormField
            label="Service Connection / Meter Number"
            type="text"
            name="meterId"
            placeholder="SC-104829375"
            autoComplete="off"
            isDark={isDark}
            value={form.meterId}
            onChange={updateField("meterId")}
          />

          <FormField
            label="Password"
            type={form.showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a password (min 8 chars)"
            autoComplete="new-password"
            isDark={isDark}
            value={form.password}
            onChange={updateField("password")}
          />

          <FormField
            label="Confirm password"
            type={form.showPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            autoComplete="new-password"
            isDark={isDark}
            value={form.confirmPassword}
            onChange={updateField("confirmPassword")}
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
            {loading ? "Creating account..." : "Register & Connect"}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-tonal">
          Already registered?{" "}
          <button type="button" onClick={onSwitchToLogin} className="font-semibold text-[var(--accent-secondary)]">
            Log in here
          </button>
        </p>
      </div>
    </AuthShell>
  );
}
