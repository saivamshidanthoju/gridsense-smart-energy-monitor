import { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import AboutPage from "./pages/AboutPage";
import AlertsPage from "./pages/AlertsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import BillingPage from "./pages/BillingPage";
import Dashboard from "./pages/Dashboard";
import DeviceStatusPage from "./pages/DeviceStatusPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PaymentsPage from "./pages/PaymentsPage";
import Predictions from "./pages/Predictions";
import RegisterPage from "./pages/RegisterPage";
import SettingsPage from "./pages/SettingsPage";
import ContactPage from "./pages/ContactPage";
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
  { id: "predictions", label: "Predictions" },
  { id: "billing", label: "Billing" },
  { id: "payments", label: "Payments" },
  { id: "alerts", label: "Alerts" },
  { id: "settings", label: "Settings" },
];

const PRIVATE_ROUTES = new Set([...NAV_ITEMS.map((item) => item.id), "analytics", "devices"]);
const PUBLIC_ROUTES = new Set(["home", "about", "login", "signup", "contact"]);

const INITIAL_DASHBOARD_STATE = {
  latestReading: null,
  history: [],
  bill: null,
  alerts: [],
  meter: null,
  dailyUsage: [],
  billingForecast: [],
  source: "database",
  connectionLabel: "Waiting for data",
  lastUpdated: null,
};

function getRouteFromPathname(pathname) {
  const normalizedPath = pathname.replace(/^\//, "");
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
  const { setTheme } = useTheme();
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

  // Reset scroll to top on page navigation
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

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
            error: "Unable to connect to backend",
          }));
        }
      }
    }

    refreshDashboard();
    const intervalId = setInterval(refreshDashboard, 2000);

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
    setTheme("light");
    navigateToPage("dashboard", true);
  }

  function handleLogout() {
    clearStoredSession();
    setSession(null);
    setDashboardState(INITIAL_DASHBOARD_STATE);
    setTheme("light");
    navigateToPublic("login", true);
  }

  function handleUpdateUser(updatedFields) {
    const nextSession = {
      ...session,
      user: {
        ...session.user,
        ...updatedFields,
      },
    };
    setSession(nextSession);
    saveStoredSession(nextSession);
  }

  function toggleSidebarCollapsed() {
    setSidebarCollapsed((current) => !current);
  }

  const meterStatus = getMeterStatus(
    dashboardState.meter,
    dashboardState.latestReading,
    dashboardState.connectionLabel
  );

  const sharedPageProps = {
    user: session?.user,
    token: session?.token,
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
    authLabel: session?.authLabel,
    source: dashboardState.source,
    onNavigate: navigateToPage,
  };

  const pageContent = {
    dashboard: <Dashboard {...sharedPageProps} />,
    predictions: <Predictions {...sharedPageProps} />,
    analytics: <AnalyticsPage {...sharedPageProps} />,
    billing: <BillingPage {...sharedPageProps} />,
    payments: <PaymentsPage {...sharedPageProps} />,
    alerts: <AlertsPage {...sharedPageProps} />,
    devices: <DeviceStatusPage {...sharedPageProps} />,
    settings: <SettingsPage {...sharedPageProps} />,
  };

  if (PUBLIC_ROUTES.has(route)) {
    if (route === "login") {
      return <LoginPage onAuthenticated={handleAuthenticated} onNavigate={navigateToPublic} />;
    }
    if (route === "signup") {
      return <RegisterPage onAuthenticated={handleAuthenticated} onNavigate={navigateToPublic} />;
    }
    if (route === "about") {
      return <AboutPage isAuthenticated={!!session?.token} onNavigate={navigateToPublic} />;
    }
    if (route === "contact") {
      return <ContactPage isAuthenticated={!!session?.token} onNavigate={navigateToPublic} />;
    }
    return (
      <HomePage
        isAuthenticated={!!session?.token}
        onDashboard={() => navigateToPage("dashboard")}
        onNavigate={navigateToPublic}
      />
    );
  }

  if (!session?.token) {
    return <LoginPage onAuthenticated={handleAuthenticated} onNavigate={navigateToPublic} />;
  }

  const activePage = pageContent[route] ? route : "dashboard";

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
            isOpen={sidebarOpen}
            isCollapsed={sidebarCollapsed}
            onClose={() => setSidebarOpen(false)}
            onToggleCollapse={toggleSidebarCollapsed}
          />

          <div className="relative flex min-w-0 flex-1 flex-col bg-[var(--surface-soft)]">
            <Navbar
              user={session.user}
              activePage={activePage}
              alerts={dashboardState.alerts}
              onMenuClick={() => setSidebarOpen(true)}
              onNavigatePublic={navigateToPublic}
              onNavigatePrivate={navigateToPage}
              onLogout={handleLogout}
              onUpdateUser={handleUpdateUser}
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

                {dashboardState.error ? null : !dashboardState.latestReading ? (
                  <div className="surface-panel fade-rise p-8 text-sm text-tonal">
                    Waiting for ESP32 data...
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
