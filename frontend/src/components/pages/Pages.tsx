import React from 'react';
import { AppContainer } from '../layout/AppContainer';
import { DashboardView } from '../views/DashboardView';
import { EmployeesView } from '../views/EmployeesView';
import { AttendanceView } from '../views/AttendanceView';
import { LeaveView } from '../views/LeaveView';
import { PayrollView } from '../views/PayrollView';
import { RecruitmentView } from '../views/RecruitmentView';
import { PerformanceView } from '../views/PerformanceView';
import { ExpensesView } from '../views/ExpensesView';
import { AuditView } from '../views/AuditView';
import { SettingsView } from '../views/SettingsView';

export function DashboardPage() {
  return (
    <AppContainer activePath="/">
      <DashboardView />
    </AppContainer>
  );
}

export function EmployeesPage() {
  return (
    <AppContainer activePath="/employees">
      <EmployeesView />
    </AppContainer>
  );
}

export function AttendancePage() {
  return (
    <AppContainer activePath="/attendance">
      <AttendanceView />
    </AppContainer>
  );
}

export function LeavePage() {
  return (
    <AppContainer activePath="/leave">
      <LeaveView />
    </AppContainer>
  );
}

export function PayrollPage() {
  return (
    <AppContainer activePath="/payroll">
      <PayrollView />
    </AppContainer>
  );
}

export function RecruitmentPage() {
  return (
    <AppContainer activePath="/recruitment">
      <RecruitmentView />
    </AppContainer>
  );
}

export function PerformancePage() {
  return (
    <AppContainer activePath="/performance">
      <PerformanceView />
    </AppContainer>
  );
}

export function ExpensesPage() {
  return (
    <AppContainer activePath="/expenses">
      <ExpensesView />
    </AppContainer>
  );
}

export function AuditPage() {
  return (
    <AppContainer activePath="/audit">
      <AuditView />
    </AppContainer>
  );
}

export function SettingsPage() {
  return (
    <AppContainer activePath="/settings">
      <SettingsView />
    </AppContainer>
  );
}
