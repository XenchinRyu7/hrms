import React, { useEffect, useState } from 'react';
import {
  Users,
  Clock,
  CalendarCheck,
  CheckCircle,
  AlertCircle,
  FileText,
  DollarSign,
  TrendingUp,
  MapPin,
  Sparkles,
  ArrowUpRight,
  ShieldAlert,
} from 'lucide-react';
import {
  MultiMetricGrid,
  AreaStatisticChart,
  DonutStatisticChart,
  Button,
  Badge,
  Skeleton,
} from '@etherealui/react';
import { useAuth } from '../../lib/auth-context';
import { api } from '../../lib/api';
import type { DashboardTelemetry, Attendance } from '../../lib/types';

export function DashboardView() {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState<DashboardTelemetry | null>(null);
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [clockLocation, setClockLocation] = useState<'office' | 'remote' | 'field'>('office');
  const [msg, setMsg] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [tData, attData] = await Promise.all([
        api.getDashboardTelemetry(),
        api.getTodayAttendance().catch(() => null),
      ]);
      setTelemetry(tData);
      setTodayAttendance(attData);
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleClockIn = async () => {
    setClockActionLoading(true);
    setMsg(null);
    try {
      const updated = await api.clockIn(clockLocation, 'Clock in from executive console');
      setTodayAttendance(updated);
      setMsg('Clock-in recorded successfully!');
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Clock-in failed');
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockActionLoading(true);
    setMsg(null);
    try {
      const updated = await api.clockOut();
      setTodayAttendance(updated);
      setMsg('Clock-out recorded successfully! Total hours updated.');
      fetchData();
    } catch (err: any) {
      setMsg(err.message || 'Clock-out failed');
    } finally {
      setClockActionLoading(false);
    }
  };

  const chartData = [
    { label: 'Mon', value: 4, secondary: 1 },
    { label: 'Tue', value: 5, secondary: 0 },
    { label: 'Wed', value: 4, secondary: 1 },
    { label: 'Thu', value: 5, secondary: 0 },
    { label: 'Fri', value: telemetry?.active_today || 4, secondary: 0 },
    { label: 'Sat', value: 1, secondary: 0 },
    { label: 'Sun', value: 0, secondary: 0 },
  ];

  const donutSegments = (telemetry?.department_stats || [
    { department: 'Engineering', count: 2, percentage: 40 },
    { department: 'Human Resources', count: 1, percentage: 20 },
    { department: 'Product & Design', count: 1, percentage: 20 },
    { department: 'Executive', count: 1, percentage: 20 },
  ]).map((d, i) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ec4899'];
    const dotClasses = ['bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];
    return {
      label: d.department,
      value: d.count,
      color: colors[i % colors.length],
      dotClass: dotClasses[i % dotClasses.length],
    };
  });

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">Enterprise Telemetry</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">Go 1.25 API Connected</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-card-foreground">
            Welcome back, {user?.full_name || 'Administrator'}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time workforce intelligence, payroll disbursement status, and enterprise attendance feed.
          </p>
        </div>

        {/* Live Attendance Pill / Terminal */}
        <div className="rounded-xl border border-border bg-muted/40 p-3 flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-[11px] text-muted-foreground font-medium">Daily Attendance Status</p>
            <p className="text-xs font-semibold text-foreground flex items-center justify-end gap-1.5 mt-0.5">
              {todayAttendance?.clock_in ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <span>Clocked In ({todayAttendance.status === 'on_time' ? 'On Time' : 'Late'})</span>
                </>
              ) : (
                <>
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  <span>Not Clocked In Yet</span>
                </>
              )}
            </p>
          </div>

          <div>
            {!todayAttendance?.clock_in ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleClockIn}
                disabled={clockActionLoading}
                className="text-xs"
              >
                {clockActionLoading ? 'Recording...' : 'Quick Clock In'}
              </Button>
            ) : !todayAttendance.clock_out ? (
              <Button
                size="sm"
                variant="outline"
                onClick={handleClockOut}
                disabled={clockActionLoading}
                className="text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
              >
                {clockActionLoading ? 'Recording...' : 'Clock Out'}
              </Button>
            ) : (
              <Badge variant="outline" className="text-xs py-1.5 px-3">
                Completed ({todayAttendance.total_hours} hrs)
              </Badge>
            )}
          </div>
        </div>
      </div>

      {msg && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-foreground text-xs flex items-center justify-between">
          <span>{msg}</span>
          <button onClick={() => setMsg(null)} className="text-muted-foreground hover:text-foreground text-xs">Dismiss</button>
        </div>
      )}

      {/* 4-KPI Metric Grid using Ethereal UI's MultiMetricGrid */}
      <MultiMetricGrid
        metrics={[
          {
            title: 'Active Employees',
            value: `${telemetry?.total_employees || 5} Total`,
            change: '+14% YoY',
            trend: 'up',
            subtitle: `${telemetry?.active_today || 4} present on site / remote today`,
            sparkline: [3, 4, 4, 5, 5],
            accent: 'blue',
          },
          {
            title: 'Attendance Compliance',
            value: `${telemetry?.attendance_rate || 94.5}%`,
            change: '+3.2% vs last cycle',
            trend: 'up',
            subtitle: 'Average punctuality rate across depts',
            sparkline: [88, 90, 92, 94, 95],
            accent: 'emerald',
          },
          {
            title: 'Pending Approvals',
            value: `${telemetry?.pending_approvals || 2} Pending`,
            change: 'Action Required',
            trend: 'neutral',
            subtitle: 'Leaves, expense reimbursements',
            sparkline: [1, 2, 2, 3, 2],
            accent: 'amber',
          },
          {
            title: 'Monthly Payroll Run',
            value: 'Rp 148.500.000',
            change: '100% Disbursed',
            trend: 'up',
            subtitle: 'October 2026 cycle fully cleared',
            sparkline: [130, 135, 142, 148],
            accent: 'indigo',
          },
        ]}
      />

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Area Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4">
            <div>
              <h3 className="text-base font-bold text-card-foreground">Workforce Presence Telemetry</h3>
              <p className="text-xs text-muted-foreground">
                Weekly attendance distribution (Present vs Absent/Off)
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono">
              7-Day Window
            </Badge>
          </div>

          <AreaStatisticChart
            data={chartData}
            title="Workforce Presence Telemetry"
            subtitle="Real-time employee clock-in throughput"
            value={`${telemetry?.active_today || 4} Present`}
            change="+4.8% Active"
          />
        </div>

        {/* Headcount by Department Donut Chart */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col justify-between">
          <div className="pb-4">
            <h3 className="text-base font-bold text-card-foreground">Headcount by Dept</h3>
            <p className="text-xs text-muted-foreground">
              Organizational allocation and distribution
            </p>
          </div>

          <DonutStatisticChart
            title="Department Allocation"
            segments={donutSegments}
          />

          <div className="pt-4 border-t border-border space-y-2">
            {telemetry?.department_stats?.map((dept, i) => (
              <div key={dept.department} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{dept.department}</span>
                <span className="font-semibold text-foreground">{dept.count} seats ({dept.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Grid: Quick Actions & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Launchpad */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-bold text-card-foreground">Enterprise Launchpad</h3>
            <p className="text-xs text-muted-foreground">High-frequency HR operations</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="/employees"
              className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition text-left block"
            >
              <Users className="h-4 w-4 text-primary mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Directory</p>
              <p className="text-[11px] text-muted-foreground">Manage 5 members</p>
            </a>

            <a
              href="/attendance"
              className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition text-left block"
            >
              <Clock className="h-4 w-4 text-emerald-500 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Attendance</p>
              <p className="text-[11px] text-muted-foreground">View timesheets</p>
            </a>

            <a
              href="/leave"
              className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition text-left block"
            >
              <CalendarCheck className="h-4 w-4 text-amber-500 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Time-Off</p>
              <p className="text-[11px] text-muted-foreground">1 pending request</p>
            </a>

            <a
              href="/payroll"
              className="p-3 rounded-xl border border-border bg-muted/30 hover:bg-muted transition text-left block"
            >
              <DollarSign className="h-4 w-4 text-indigo-500 mb-1.5" />
              <p className="text-xs font-semibold text-foreground">Payroll</p>
              <p className="text-[11px] text-muted-foreground">Generate cycle</p>
            </a>
          </div>

          <div className="rounded-xl border border-border bg-primary/5 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <div className="text-xs">
                <span className="font-semibold text-foreground">Ethereal OKLCH Engine</span>
                <p className="text-[11px] text-muted-foreground">WCAG 2.1 AA Contrast Enforced</p>
              </div>
            </div>
            <Badge variant="primary" className="text-[10px]">Active</Badge>
          </div>
        </div>

        {/* Real-Time Audit Log Feed */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-card-foreground">Audit Log Stream</h3>
              <p className="text-xs text-muted-foreground">Secured activity journal and system telemetry</p>
            </div>
            <a href="/audit" className="text-xs font-medium text-primary hover:underline flex items-center gap-1">
              <span>View All</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
          </div>

          <div className="space-y-2.5">
            {telemetry?.recent_audit_logs && telemetry.recent_audit_logs.length > 0 ? (
              telemetry.recent_audit_logs.slice(0, 4).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-border bg-muted/20 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="h-2 w-2 rounded-full bg-primary"></span>
                    <div>
                      <span className="font-semibold text-foreground">{log.action}</span>
                      <p className="text-[11px] text-muted-foreground">
                        Actor: {log.user_name || 'System Admin'} &bull; Target: {log.entity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{log.ip_address || '127.0.0.1'}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No recent audit events recorded.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
