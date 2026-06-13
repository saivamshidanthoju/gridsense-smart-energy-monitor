import PublicShell from "./PublicShell";

export default function AuthShell({ activePage, children, onNavigate }) {
  return (
    <PublicShell activePage={activePage} onNavigate={onNavigate}>
      <section className="flex min-h-[calc(100vh-4.5rem)] items-start justify-center px-4 py-8 lg:px-6">
        <div className="w-full max-w-[27rem]">{children}</div>
      </section>
    </PublicShell>
  );
}
