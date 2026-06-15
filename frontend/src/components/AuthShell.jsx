import PublicShell from "./PublicShell";

export default function AuthShell({ activePage, children, onNavigate }) {
  return (
    <PublicShell activePage={activePage} onNavigate={onNavigate} hideHeaderFooter={true}>
      <section className="h-screen w-screen flex items-stretch overflow-hidden bg-[var(--bg-base)]">
        <div className="w-full grid lg:grid-cols-12 items-stretch">
          
          {/* Left Column: Dark Gradient Panel with Benefits & Illustrations */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-between p-12 bg-[linear-gradient(135deg,#0f172a_0%,#1e1b4b_50%,#0f172a_100%)] text-white relative overflow-hidden">
            {/* Background decorative elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.2),transparent_70%)] pointer-events-none" />
            <div className="absolute -bottom-48 -left-48 h-96 w-96 rounded-full bg-indigo-500/10 filter blur-3xl pointer-events-none" />

            {/* Top brand header */}
            <div className="relative z-10 flex items-center gap-3">
              <button 
                type="button" 
                onClick={() => onNavigate?.("home")} 
                className="flex items-center gap-2 text-xs text-indigo-300 hover:text-white transition"
              >
                <span>← Back to Home</span>
              </button>
            </div>

            {activePage === "login" ? (
              /* LOGIN LEFT COLUMN */
              <div className="relative z-10 flex flex-col justify-between h-full py-8">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                    GridSense Homeowner Portal
                  </span>
                  <h2 className="text-3xl font-light leading-tight">
                    Monitor your household <br />
                    <span className="font-semibold text-indigo-400">energy draw live.</span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                    Access your personalized dashboard to track consumption, view estimates, and manage billing cycles effortlessly.
                  </p>
                </div>

                {/* Benefits list */}
                <div className="my-8 space-y-4">
                  <div className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 text-xs">✓</span>
                    <span>Track usage updates from your smart meter.</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 text-xs">✓</span>
                    <span>Estimate your monthly charges based on tariff slabs.</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 text-xs">✓</span>
                    <span>Verify line quality, voltage spikes, and active events.</span>
                  </div>
                </div>

                {/* Dashboard Preview Component */}
                <div className="rounded-xl border border-white/10 bg-slate-950/50 p-4.5 shadow-2xl backdrop-blur-md max-w-sm">
                  <div className="flex items-center justify-between border-b border-white/5 pb-2 text-[10px] text-slate-400 font-mono">
                    <span className="flex items-center gap-1.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Meter
                    </span>
                    <span className="text-indigo-400 font-semibold uppercase text-[9px]">SC-104829375</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2">
                      <p className="text-[8px] uppercase tracking-wider text-slate-500 font-medium">Live Power</p>
                      <p className="text-sm font-bold text-white mt-0.5">720 W</p>
                    </div>
                    <div className="rounded-lg bg-white/[0.02] border border-white/5 p-2">
                      <p className="text-[8px] uppercase tracking-wider text-slate-500 font-medium">Est. Bill</p>
                      <p className="text-sm font-bold text-indigo-400 mt-0.5">₹ 622</p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* SIGNUP LEFT COLUMN */
              <div className="relative z-10 flex flex-col justify-between h-full py-8">
                <div className="space-y-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-300 border border-indigo-500/20">
                    Join GridSense Platform
                  </span>
                  <h2 className="text-3xl font-light leading-tight">
                    Start monitoring your <br />
                    <span className="font-semibold text-indigo-400">power bills today.</span>
                  </h2>
                  <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                    Create an account to stop bill surprises, track slab changes, and monitor your domestic load.
                  </p>
                </div>

                {/* Core Benefits */}
                <div className="my-8 space-y-5">
                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 text-sm">✓</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Avoid Slab Surprises</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Know exactly when your monthly consumption crosses into high tariff slabs.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 text-sm">✓</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Understand Home Appliances</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Identify which appliances draw the most active load from the grid.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-3.5 items-start">
                    <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0 text-sm">✓</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">Secure Billing Audit</h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                        Maintain a clean, verified history of all your monthly cycles and receipts.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Minimal Illustration of home power monitoring */}
                <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-3 max-w-sm">
                  <span className="text-2xl">🏡</span>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-white">Smart Home Connected</p>
                    <p className="text-[10px] text-slate-400 truncate mt-0.5">Linked connection: SC-104829375</p>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom brand footer */}
            <div className="relative z-10 text-[10px] text-slate-500 flex justify-between items-center mt-4 border-t border-white/5 pt-4">
              <span>GridSense Utility</span>
              <span>© 2026</span>
            </div>
          </div>

          {/* Right Column: Main Form */}
          <div className="col-span-12 lg:col-span-7 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-[var(--surface-solid)] overflow-y-auto">
            <div className="w-full max-w-[28rem] mx-auto space-y-6">
              {/* Mobile Back Button */}
              <button 
                type="button" 
                onClick={() => onNavigate?.("home")} 
                className="flex items-center gap-1.5 text-xs text-tonal hover:text-[var(--text-primary)] transition lg:hidden mb-4"
              >
                <span>← Back to Home</span>
              </button>
              {children}
            </div>
          </div>
          
        </div>
      </section>
    </PublicShell>
  );
}
