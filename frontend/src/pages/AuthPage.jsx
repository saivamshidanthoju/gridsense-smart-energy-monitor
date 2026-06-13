import { useState } from "react";
import { loginUser, registerUser } from "../services/api";

const INITIAL_FORM = {
  name: "",
  email: "",
  password: "",
  meterId: "",
};

export default function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(field) {
    return (event) => {
      setForm((current) => ({
        ...current,
        [field]: event.target.value,
      }));
    };
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const session =
        mode === "register"
          ? await registerUser(form)
          : await loginUser({
              email: form.email,
              password: form.password,
              meterId: form.meterId,
            });

      onAuthenticated(session);
    } catch (submissionError) {
      setError(submissionError.message || "Unable to authenticate.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,var(--bg-deep)_0%,var(--bg-base)_100%)] px-4 py-8">
      <section className="surface-panel mx-auto max-w-[27rem] px-5 py-6 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="section-kicker">Account</p>
            <h1 className="mt-2 text-2xl font-semibold text-[var(--text-primary)]">
              {mode === "login" ? "Login" : "Sign Up"}
            </h1>
          </div>
          <button
            type="button"
            onClick={() => setMode(mode === "login" ? "register" : "login")}
            className="secondary-button px-3 py-2 text-sm"
          >
            {mode === "login" ? "Sign Up" : "Login"}
          </button>
        </div>

          {error ? (
            <div className="mt-4 rounded-[10px] border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-400/18 dark:bg-rose-500/10 dark:text-rose-100">
              {error}
            </div>
          ) : null}

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {mode === "register" ? (
              <label className="block">
                <span className="mb-2 block text-[11px] font-semibold uppercase text-faint">Name</span>
                <input
                  type="text"
                  value={form.name}
                  onChange={updateField("name")}
                  required
                  className="surface-card-muted focus-ring w-full px-4 py-3 text-sm outline-none"
                />
              </label>
            ) : null}

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase text-faint">Email</span>
              <input
                type="email"
                value={form.email}
                onChange={updateField("email")}
                required
                className="surface-card-muted focus-ring w-full px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase text-faint">Password</span>
              <input
                type="password"
                value={form.password}
                onChange={updateField("password")}
                required
                minLength={8}
                className="surface-card-muted focus-ring w-full px-4 py-3 text-sm outline-none"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-[11px] font-semibold uppercase text-faint">Meter ID</span>
              <input
                type="text"
                value={form.meterId}
                onChange={updateField("meterId")}
                required
                placeholder="ESP32-A4F2"
                className="surface-card-muted focus-ring w-full px-4 py-3 text-sm outline-none"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="primary-button w-full px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Please wait..." : mode === "login" ? "Login" : "Sign Up"}
            </button>
          </form>
      </section>
    </div>
  );
}
