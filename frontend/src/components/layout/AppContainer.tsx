import React from "react";
import { ThemeProvider } from "../../lib/theme-context";
import { AuthProvider } from "../../lib/auth-context";
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

interface AppContainerProps {
  initialPath?: string;
  children?: React.ReactNode;
}

function DynamicView({
  fallbackChildren,
}: {
  fallbackChildren?: React.ReactNode;
}) {
  const { currentPath } = useNav();

  switch (currentPath) {
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

export function AppContainer({
  initialPath = "/",
  children,
}: AppContainerProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        <NavProvider initialPath={initialPath}>
          <NotificationProvider>
            <HRMSAppShell activePath={initialPath}>
              <DynamicView fallbackChildren={children} />
            </HRMSAppShell>
          </NotificationProvider>
        </NavProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
