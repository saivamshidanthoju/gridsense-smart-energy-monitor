import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AboutPage from "./pages/AboutPage";
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BillingPage from "./pages/BillingPage";
import Dashboard from "./pages/Dashboard";
import DeviceStatusPage from "./pages/DeviceStatusPage";
import Graphs from "./pages/Graphs";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PaymentsPage from "./pages/PaymentsPage";
import Predictions from "./pages/Predictions";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import { ThemeProvider } from "./context/ThemeContext";
import { useTheme } from "./hooks/useTheme";
import {
  clearStoredSession,
  fetchDashboardBundle,
  getCurrentUser,
  loadStoredSession,
  saveStoredSession,
} from "./services/api";

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "graphs", label: "Graphs" },
  { id: "predictions", label: "Predictions" },
  { id: "billing", label: "Billing" },
  { id: "payments", label: "Payments" },
  { id: "alerts", label: "Alerts" },
  { id: "devices", label: "Device Profile" },
  { id: "settings", label: "Settings" },
];

const PRIVATE_ROUTES = new Set([...NAV_ITEMS.map((item) => item.id), "analytics"]);
const PUBLIC_ROUTES = new Set(["home", "about", "login", "signup"]);

const INITIAL_DASHBOARD_STATE = {
  latestReading: null,
  history: [],
  bill: null,
  alerts: [],
  meter: null,
  dailyUsage: [],
  billingForecast: [],
  source: "mock",
  connectionLabel: "Waiting for data",
  lastUpdated: null,
  error: "",
  loading: true,
};

function getRouteFromPathname(pathname) {
  const normalizedPath = pathname.replace(/^\/+|\/+$/g, "");

  if (!normalizedPath) {
    return "home";
  }

  if (normalizedPath === "register") {
    return "signup";
  }

  if (normalizedPath === "device-status") {
    return "devices";
  }

  return normalizedPath;
}

function getPathForRoute(route) {
  if (route === "home") {
    return "/";
  }

  if (route === "signup") {
    return "/signup";
  }

  return `/${route}`;
}

function isPrivateRoute(route) {
  return PRIVATE_ROUTES.has(route);
}

function getMeterStatus(meter, latestReading, connectionLabel) {
  if (connectionLabel === "Device Offline" || connectionLabel === "Meter Offline") {
    return "offline";
  }

  if (meter?.status) {
    return meter.status;
  }

  return latestReading ? "online" : "pending";
}

function AppContent() {
  useTheme();
  const [session, setSession] = useState(() => loadStoredSession());
  const [route, setRoute] = useState(() => getRouteFromPathname(window.location.pathname));
  const [dashboardState, setDashboardState] = useState(INITIAL_DASHBOARD_STATE);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    function handlePopState() {
      setRoute(getRouteFromPathname(window.location.pathname));
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function syncProfile() {
      if (!session?.token || !session?.user) {
        return;
      }

      try {
        const profile = await getCurrentUser(session.token, session.user);

        if (!ignore && profile?.user) {
          const nextSession = {
            ...session,
            user: profile.user,
            authSource: profile.source === "database" ? "database" : session.authSource,
            authLabel: profile.source === "database" ? "Signed in" : session.authLabel,
          };

          setSession(nextSession);
          saveStoredSession(nextSession);
        }
      } catch (error) {
        if (!ignore && error.status === 401) {
          clearStoredSession();
          setSession(null);
        }
      }
    }

    syncProfile();

    return () => {
      ignore = true;
    };
  }, [session?.token]);

  useEffect(() => {
    let ignore = false;

    async function refreshDashboard() {
      if (!session?.token || !session?.user?.meterId) {
        return;
      }

      setDashboardState((current) => ({
        ...current,
        loading: !current.latestReading,
        error: "",
      }));

      try {
        const bundle = await fetchDashboardBundle({
          token: session.token,
          meterId: session.user.meterId,
        });

        if (!ignore) {
          setDashboardState({
            ...bundle,
            error: "",
            loading: false,
          });
        }
      } catch (error) {
        if (!ignore) {
          if (error.status === 401) {
            clearStoredSession();
            setSession(null);
            return;
          }

          setDashboardState((current) => ({
            ...current,
            loading: false,
            error: error.message || "Unable to load meter data.",
          }));
        }
      }
    }

    refreshDashboard();
    const intervalId = setInterval(refreshDashboard, 3000);

    return () => {
      ignore = true;
      clearInterval(intervalId);
    };
  }, [session?.token, session?.user?.meterId]);

  function commitRoute(nextRoute, replace = false) {
    const nextPath = getPathForRoute(nextRoute);

    setRoute(nextRoute);

    if (window.location.pathname !== nextPath) {
      window.history[replace ? "replaceState" : "pushState"]({}, "", nextPath);
    }
  }

  function navigateToPublic(page, replace = false) {
    const nextRoute = PUBLIC_ROUTES.has(page) ? page : "home";
    setSidebarOpen(false);
    commitRoute(nextRoute, replace);
  }

  function navigateToPage(page, replace = false) {
    const nextRoute = isPrivateRoute(page) ? page : "dashboard";
    setSidebarOpen(false);
    commitRoute(nextRoute, replace);
  }

  function handleAuthenticated(nextSession) {
    saveStoredSession(nextSession);
    setDashboardState(INITIAL_DASHBOARD_STATE);
    setSession(nextSession);
    navigateToPage("dashboard", true);
  }

  function handleLogout() {
    clearStoredSession();
    setSession(null);
    setDashboardState(INITIAL_DASHBOARD_STATE);
    navigateToPublic("login", true);
  }

  function toggleSidebarCollapsed() {
    setSidebarOpen(false);
    setSidebarCollapsed((current) => !current);
  }

  if (!session?.user) {
    if (route === "about") {
      return <AboutPage onNavigate={navigateToPublic} />;
    }

    if (route === "login" || isPrivateRoute(route)) {
      return (
        <LoginPage
          onAuthenticated={handleAuthenticated}
          onNavigate={navigateToPublic}
          onSwitchToRegister={() => navigateToPublic("signup")}
        />
      );
    }

    if (route === "signup") {
      return (
        <RegisterPage
          onAuthenticated={handleAuthenticated}
          onNavigate={navigateToPublic}
          onSwitchToLogin={() => navigateToPublic("login")}
        />
      );
    }

    return <HomePage onNavigate={navigateToPublic} />;
  }

  if (route === "home") {
    return (
      <HomePage
        isAuthenticated
        onDashboard={() => navigateToPage("dashboard")}
        onNavigate={navigateToPublic}
      />
    );
  }

  if (route === "about") {
    return (
      <AboutPage
        isAuthenticated
        onDashboard={() => navigateToPage("dashboard")}
        onNavigate={navigateToPublic}
      />
    );
  }

  const activePage = isPrivateRoute(route) ? route : "dashboard";
  const meterStatus = getMeterStatus(
    dashboardState.meter,
    dashboardState.latestReading,
    dashboardState.connectionLabel,
  );
  const sharedPageProps = {
    user: session.user,
    token: session.token,
    latestReading: dashboardState.latestReading,
    history: dashboardState.history,
    bill: dashboardState.bill,
    alerts: dashboardState.alerts,
    meter: dashboardState.meter,
    meterStatus,
    dailyUsage: dashboardState.dailyUsage,
    billingForecast: dashboardState.billingForecast,
    connectionLabel: dashboardState.connectionLabel,
    lastUpdated: dashboardState.lastUpdated,
    authLabel: session.authLabel,
    source: dashboardState.source,
    onNavigate: navigateToPage,
  };

  const pageContent = {
    dashboard: <Dashboard {...sharedPageProps} />,
    graphs: <Graphs {...sharedPageProps} />,
    predictions: <Predictions {...sharedPageProps} />,
    analytics: <AnalyticsPage {...sharedPageProps} />,
    billing: <BillingPage {...sharedPageProps} />,
    payments: <PaymentsPage {...sharedPageProps} />,
    alerts: <AlertsPage {...sharedPageProps} />,
    devices: <DeviceStatusPage {...sharedPageProps} />,
    settings: <SettingsPage {...sharedPageProps} />,
  };

  return (
    <div className="min-h-screen">
      {sidebarOpen ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="mx-auto max-w-[1840px] p-2">
        <div className="shell-frame flex h-[calc(100vh-1rem)] w-full overflow-hidden">
          <Sidebar
            user={session.user}
            navItems={NAV_ITEMS}
            activePage={activePage}
            onNavigate={(page) => navigateToPage(page)}
            onLogout={handleLogout}
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={toggleSidebarCollapsed}
          />

          <div className="relative flex min-w-0 flex-1 flex-col bg-[var(--surface-soft)]">
            <Navbar
              user={session.user}
              onMenuClick={() => setSidebarOpen(true)}
              onNavigatePublic={navigateToPublic}
              onNavigatePrivate={navigateToPage}
            />

            <main className="flex-1 overflow-y-auto overflow-x-hidden px-3 pb-3 pt-3 lg:px-5 lg:pb-5 lg:pt-4">
              <div className="mx-auto max-w-[1580px]">
                {dashboardState.error ? (
                  <div className="surface-panel mb-5 fade-rise p-4 text-sm text-rose-200">
                    <div className="rounded-[10px] border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-rose-200">
                      {dashboardState.error}
                    </div>
                  </div>
                ) : null}

                {dashboardState.loading && !dashboardState.latestReading ? (
                  <div className="surface-panel fade-rise p-8 text-sm text-tonal">
                    Loading your meter data...
                  </div>
                ) : (
                  <div className="fade-rise">{pageContent[activePage] || pageContent.dashboard}</div>
                )}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
