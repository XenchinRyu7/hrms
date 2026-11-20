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

export function DashboardPage() {
  return (
    <AppContainer initialPath="/">
      <DashboardView />
    </AppContainer>
  );
}

export function EmployeesPage() {
  return (
    <AppContainer initialPath="/employees">
      <EmployeesView />
    </AppContainer>
  );
}

export function AttendancePage() {
  return (
    <AppContainer initialPath="/attendance">
      <AttendanceView />
    </AppContainer>
  );
}

export function LeavePage() {
  return (
    <AppContainer initialPath="/leave">
      <LeaveView />
    </AppContainer>
  );
}

export function PayrollPage() {
  return (
    <AppContainer initialPath="/payroll">
      <PayrollView />
    </AppContainer>
  );
}

export function RecruitmentPage() {
  return (
    <AppContainer initialPath="/recruitment">
      <RecruitmentView />
    </AppContainer>
  );
}

export function PerformancePage() {
  return (
    <AppContainer initialPath="/performance">
      <PerformanceView />
    </AppContainer>
  );
}

export function ExpensesPage() {
  return (
    <AppContainer initialPath="/expenses">
      <ExpensesView />
    </AppContainer>
  );
}

export function AuditPage() {
  return (
    <AppContainer initialPath="/audit">
      <AuditView />
    </AppContainer>
  );
}

export function SettingsPage() {
  return (
    <AppContainer initialPath="/settings">
      <SettingsView />
    </AppContainer>
  );
}

export function ProfilePage() {
  return (
    <AppContainer initialPath="/profile">
      <ProfileView />
    </AppContainer>
  );
}
