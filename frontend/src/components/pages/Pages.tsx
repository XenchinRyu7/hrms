import React from "react";
import { AppContainer } from "../layout/AppContainer";
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

interface PageProps {
  currentPath?: string;
}

export function DashboardPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/" currentPath={currentPath}>
      <DashboardView />
    </AppContainer>
  );
}

export function EmployeesPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/employees" currentPath={currentPath}>
      <EmployeesView />
    </AppContainer>
  );
}

export function AttendancePage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/attendance" currentPath={currentPath}>
      <AttendanceView />
    </AppContainer>
  );
}

export function LeavePage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/leave" currentPath={currentPath}>
      <LeaveView />
    </AppContainer>
  );
}

export function PayrollPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/payroll" currentPath={currentPath}>
      <PayrollView />
    </AppContainer>
  );
}

export function RecruitmentPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/recruitment" currentPath={currentPath}>
      <RecruitmentView />
    </AppContainer>
  );
}

export function PerformancePage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/performance" currentPath={currentPath}>
      <PerformanceView />
    </AppContainer>
  );
}

export function ExpensesPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/expenses" currentPath={currentPath}>
      <ExpensesView />
    </AppContainer>
  );
}

export function AuditPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/audit" currentPath={currentPath}>
      <AuditView />
    </AppContainer>
  );
}

export function SettingsPage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/settings" currentPath={currentPath}>
      <SettingsView />
    </AppContainer>
  );
}

export function ProfilePage({ currentPath }: PageProps = {}) {
  return (
    <AppContainer initialPath="/profile" currentPath={currentPath}>
      <ProfileView />
    </AppContainer>
  );
}
