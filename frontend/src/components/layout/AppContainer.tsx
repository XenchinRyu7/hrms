import React from "react";
import { ThemeProvider } from "../../lib/theme-context";
import { AuthProvider, useAuth } from "../../lib/auth-context";
import { NavProvider, useNav } from "../../lib/nav-context";
import { NotificationProvider } from "../../lib/notification-context";
import { HRMSAppShell } from "./HRMSAppShell";
import { DashboardView } from "../views/DashboardView";
import { EmployeesView } from "../views/EmployeesView";
import { AttendanceView } from "../views/AttendanceView";
import { LeaveView } from "../views/LeaveView";
import { PayrollView } from "../views/PayrollView";
import { RecruitmentView } from "../views/RecruitmentView";
import { PerformanceView } from "../views/PerformanceView";
import { ExpensesView } from "../views/ExpensesView";
import { AuditView } from "../views/AuditView";
import { SettingsView } from "../views/SettingsView";
import { ProfileView } from "../views/ProfileView";
import { LoginView } from "../views/LoginView";

interface AppContainerProps {
  initialPath?: string;
  currentPath?: string;
  children?: React.ReactNode;
}

function DynamicView({
  fallbackChildren,
}: {
  fallbackChildren?: React.ReactNode;
}) {
  const { currentPath } = useNav();
  const normalized = currentPath.replace(/\/+$/, "") || "/";

  switch (normalized) {
    case "/":
      return <DashboardView />;
    case "/employees":
      return <EmployeesView />;
    case "/attendance":
      return <AttendanceView />;
    case "/leave":
      return <LeaveView />;
    case "/payroll":
      return <PayrollView />;
    case "/recruitment":
      return <RecruitmentView />;
    case "/performance":
      return <PerformanceView />;
    case "/expenses":
      return <ExpensesView />;
    case "/audit":
      return <AuditView />;
    case "/settings":
      return <SettingsView />;
    case "/profile":
      return <ProfileView />;
    default:
      return fallbackChildren ? <>{fallbackChildren}</> : <DashboardView />;
  }
}

function AuthContentGuard({
  initialPath,
  currentPath,
  children,
}: {
  initialPath: string;
  currentPath?: string;
  children?: React.ReactNode;
}) {
  const { user, token, isLoading } = useAuth();

  // 1. Loading state while checking token/me
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 space-y-3">
        <div className="h-12 w-12 rounded-xl bg-primary text-primary-foreground font-bold flex items-center justify-center text-sm tracking-wider shadow-sm animate-pulse">
          EH
        </div>
        <p className="text-xs text-muted-foreground font-medium">
          Memeriksa sesi EHMRS...
        </p>
      </div>
    );
  }

  // 2. Unauthenticated state: display clean, professional login view
  if (!token || !user) {
    return <LoginView />;
  }

  // 3. Authenticated: render full HRMS application shell
  return (
    <HRMSAppShell activePath={initialPath} currentPath={currentPath}>
      <DynamicView fallbackChildren={children} />
    </HRMSAppShell>
  );
}

export function AppContainer({
  initialPath = "/",
  currentPath,
  children,
}: AppContainerProps) {
  const effectiveCurrent = currentPath || initialPath;
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavProvider initialPath={initialPath} currentPath={effectiveCurrent}>
          <NotificationProvider>
            <AuthContentGuard
              initialPath={initialPath}
              currentPath={effectiveCurrent}
            >
              {children}
            </AuthContentGuard>
          </NotificationProvider>
        </NavProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
