import { useEffect } from "react";
import PublicShell from "../components/PublicShell";

const TIMELINE_STEPS = [
  {
    kicker: "01. Obstruction",
    title: "The Problem",
    description: "Electricity is a silent, invisible household utility. For decades, homeowners have had no active diagnostics to track where current is drawn, leading to end-of-month billing stress and unexpected costs.",
  },
  {
    kicker: "02. Obsolete Enclosures",
    title: "Traditional Meter Problems",
    description: "Sealed utility meter enclosures reside outside the residence, physically locking consumers out of their own telemetry data. Homeowners receive billing feedback 30 days too late to address wasteful habits.",
  },
  {
    kicker: "03. Conceptual Blueprint",
    title: "Idea Behind GridSense",
    description: "Our engineering team envisioned extracting raw phase metrics directly from household mains. By reading alternating current and voltage wave shapes, we could calculate active power factor calculations in real-time.",
  },
  {
    kicker: "04. Prototype Testing",
    title: "Hardware Development",
    description: "We integrated analog sensory modules (ACS712 current transducer and ZMPT101B voltage transformer) with an ESP32 microcontroller. The unit processes waves locally using fast ADC calculations.",
  },
  {
    kicker: "05. Stream Security",
    title: "Cloud Integration",
    description: "We established a secure telemetry pipe. Real-time parameters are packaged into structured JSON strings and transmitted securely over TLS-encrypted MQTT client protocol loops to our NoSQL databases.",
  },
  {
    kicker: "06. Active Portal",
    title: "Current Platform",
    description: "Today, GridSense is a production-grade utility tracking client. Homeowners monitor loads down to the second, forecast slab transitions, receive overload warning notifications, and manage utility audits.",
  },
];

export default function AboutPage({ isAuthenticated = false, onDashboard, onNavigate }) {
  // Trigger once scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-active");
            observer.unobserve(entry.target); // Trigger once
          }
        });
      },
      { threshold: 0.05, rootMargin: "0px 0px -40px 0px" }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);



  return (
    <PublicShell activePage="about" isAuthenticated={isAuthenticated} onDashboard={onDashboard} onNavigate={onNavigate}>
      
      {/* HEADER SECTION */}
      <section className="mx-auto max-w-[800px] px-6 pt-16 pb-12 text-center scroll-reveal reveal-fade-up">
        <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-primary)] bg-[var(--surface-soft)] px-3 py-1 rounded-full border border-[var(--surface-border-strong)]">
          Platform Origins
        </span>
        <h1 className="text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl lg:text-5xl leading-tight mt-4">
          The Story Behind GridSense
        </h1>
        <p className="text-base text-[var(--text-secondary)] mt-4 leading-relaxed max-w-2xl mx-auto saas-body-copy">
          From a prototype hardware breadboard to a real-time time-series telemetry client. Follow our journey of giving homeowners control of their utility consumption.
        </p>
      </section>

      {/* STORY TIMELINE SECTION (No Cards) */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-[var(--bg-deep)] border-t border-[var(--surface-border)]">
        <div className="mx-auto max-w-[1280px] px-6">
          <div className="timeline-container">
            {/* Center Timeline Track Line */}
            <div className="timeline-line" />

            {TIMELINE_STEPS.map((step, idx) => {
              const isEven = idx % 2 === 1;
              return (
                <div 
                  key={step.title} 
                  className={`timeline-item grid grid-cols-1 md:grid-cols-12 gap-8 items-start scroll-reveal ${
                    isEven ? "reveal-fade-left" : "reveal-fade-right"
                  }`}
                >
                  
                  {/* LEFT COLUMN */}
                  <div className={`md:col-span-5 text-left md:text-right ${isEven ? "md:invisible" : "relative z-10"}`}>
                    {!isEven && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-mono font-bold text-[var(--accent-primary)] uppercase tracking-widest">{step.kicker}</span>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-wide">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-[var(--text-secondary)] max-w-lg md:ml-auto">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* CENTER COLUMN: Marker */}
                  <div className="hidden md:col-span-2 md:flex justify-center items-start pt-1">
                    <div className="timeline-marker" />
                  </div>

                  {/* RIGHT COLUMN */}
                  <div className={`md:col-span-5 text-left relative z-10 ${!isEven ? "md:invisible" : ""}`}>
                    {isEven && (
                      <div className="space-y-2.5">
                        <span className="text-xs font-mono font-bold text-[var(--accent-primary)] uppercase tracking-widest">{step.kicker}</span>
                        <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-wide">{step.title}</h3>
                        <p className="text-sm leading-relaxed text-[var(--text-secondary)] max-w-lg">
                          {step.description}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Mobile stacked style support */}
                  <div className="md:hidden flex gap-4 items-start pl-8 relative z-10 mt-1">
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-[var(--accent-primary)] uppercase tracking-widest">{step.kicker}</span>
                      <h3 className="text-lg font-bold text-[var(--text-primary)]">{step.title}</h3>
                      <p className="text-xs leading-relaxed text-[var(--text-secondary)]">
                        {step.description}
                      </p>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CALL TO ACTION SECTION */}
      <section className="bg-[var(--surface-soft)] py-16 border-t border-[var(--surface-border)] scroll-reveal reveal-cta">
        <div className="mx-auto max-w-[800px] px-6 text-center space-y-6">
          <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl leading-tight">
            Curious to see GridSense in action?
          </h2>
          <p className="text-sm text-[var(--text-secondary)] max-w-[60ch] mx-auto leading-relaxed">
            Link a simulated service connection to experiment with active power projections and slab estimates.
          </p>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => onNavigate?.("login")}
              className="primary-button px-8 py-3.5 text-xs font-bold"
            >
              Access Telemetry Dashboard
            </button>
          </div>
        </div>
      </section>

    </PublicShell>
  );
}
