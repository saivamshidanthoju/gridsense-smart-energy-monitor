import PublicShell from "../components/PublicShell";

export default function ContactPage({ isAuthenticated = false, onDashboard, onNavigate }) {
  return (
    <PublicShell activePage="contact" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      
      {/* HEADER SECTION */}
      <section className="mx-auto max-w-[800px] px-6 pt-16 pb-12 text-center scroll-reveal reveal-fade-up">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--surface-soft)] px-3 py-1 rounded-full border border-[var(--surface-border-strong)]">
          Support Center
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl leading-tight mt-4">
          Get in Touch
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-4 leading-relaxed max-w-2xl mx-auto saas-body-copy">
          Have questions about meter node deployment, billing slabs, or cloud telemetry integration? Contact us directly.
        </p>
      </section>

      {/* CONTACT INFO DETAILS */}
      <section className="py-16 bg-[var(--bg-deep)] border-t border-[var(--surface-border)]">
        <div className="mx-auto max-w-[900px] px-6">
          <div className="grid gap-8 md:grid-cols-3 text-left">
            {/* Phone */}
            <div className="bg-[var(--surface-solid)] border border-[var(--surface-border)] rounded-xl p-6 space-y-4 hover-lift">
              <span className="text-2xl">📞</span>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">Phone Support</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Immediate telephone diagnostics.</p>
              </div>
              <a href="tel:+918374170152" className="text-sm font-bold text-[var(--accent-primary)] hover:underline block pt-2">
                +91 8374170152
              </a>
            </div>

            {/* Email */}
            <div className="bg-[var(--surface-solid)] border border-[var(--surface-border)] rounded-xl p-6 space-y-4 hover-lift">
              <span className="text-2xl">✉️</span>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">Email Support</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Typical response within 24 hours.</p>
              </div>
              <a href="mailto:saivamshidanthoju@gmail.com" className="text-sm font-bold text-[var(--accent-primary)] hover:underline block pt-2">
                saivamshidanthoju@gmail.com
              </a>
            </div>

            {/* Location */}
            <div className="bg-[var(--surface-solid)] border border-[var(--surface-border)] rounded-xl p-6 space-y-4 hover-lift">
              <span className="text-2xl">📍</span>
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[var(--text-primary)]">Branch Office</h4>
                <p className="text-xs text-[var(--text-secondary)] mt-1">Local developer hub location.</p>
              </div>
              <span className="text-sm font-bold text-[var(--text-primary)] block pt-2">
                Hyderabad, India
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* QUICK INQUIRY FORM */}
      <section className="py-16 border-t border-[var(--surface-border)]">
        <div className="mx-auto max-w-[560px] px-6 text-center">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] mb-4">Send a Message</h2>
          <p className="text-xs text-[var(--text-secondary)] mb-8">
            Alternatively, drop us a line below and our core infrastructure team will get back to you.
          </p>
          <form className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Your Name</label>
              <input type="text" placeholder="John Doe" className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-solid)] px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Email Address</label>
              <input type="email" placeholder="john@example.com" className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-solid)] px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[var(--text-secondary)] uppercase mb-1">Message</label>
              <textarea rows="4" placeholder="Describe your meter deployment queries..." className="w-full rounded-lg border border-[var(--surface-border)] bg-[var(--surface-solid)] px-4 py-2.5 text-xs text-[var(--text-primary)] focus:outline-none focus:border-[var(--accent-primary)] transition"></textarea>
            </div>
            <button type="submit" onClick={(e) => e.preventDefault()} className="primary-button w-full py-3 text-xs font-bold text-center">
              Send Message
            </button>
          </form>
        </div>
      </section>

    </PublicShell>
  );
}
