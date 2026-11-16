import React, { useEffect, useState } from 'react';
import {
  Clock,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Laptop,
  Building,
  Car,
  Filter,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
} from '@etherealui/react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import type { Attendance, User } from '../../lib/types';

export function AttendanceView() {
  const { user } = useAuth();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(null);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [location, setLocation] = useState<'office' | 'remote' | 'field'>('office');
  const [notes, setNotes] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedback, setFeedback] = useState<string | null>(null);

  // Digital clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const loadAttendance = async () => {
    try {
      const [today, hist] = await Promise.all([
        api.getTodayAttendance().catch(() => null),
        api.getAttendanceHistory(),
      ]);
      setTodayAttendance(today);
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAttendance();
  }, []);

  const handleClockIn = async () => {
    setClockActionLoading(true);
    setFeedback(null);
    try {
      const updated = await api.clockIn(location, notes);
      setTodayAttendance(updated);
      setFeedback('Successfully clocked in! Welcome to work.');
      setNotes('');
      loadAttendance();
    } catch (err: any) {
      setFeedback(err.message || 'Clock-in failed');
    } finally {
      setClockActionLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockActionLoading(true);
    setFeedback(null);
    try {
      const updated = await api.clockOut();
      setTodayAttendance(updated);
      setFeedback('Successfully clocked out! Have a good rest.');
      loadAttendance();
    } catch (err: any) {
      setFeedback(err.message || 'Clock-out failed');
    } finally {
      setClockActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on_time':
        return <Badge variant="primary" className="text-[10px]">On Time</Badge>;
      case 'late':
        return <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Late</Badge>;
      default:
        return <Badge variant="muted" className="text-[10px]">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">Time & Attendance</span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">Automated Geofencing & Work Log</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Attendance Terminal & Timesheets
        </h1>
        <p className="text-xs text-muted-foreground">
          Real-time check-in, remote work logging, and compliance auditing.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-foreground text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      {/* Clock-In Terminal Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-border">
            <span className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" />
              <span>Live Attendance Terminal</span>
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-muted text-muted-foreground">
              UTC+7 (WIB)
            </span>
          </div>

          {/* Digital Clock Display */}
          <div className="text-center py-4 bg-muted/20 rounded-xl border border-border space-y-1">
            <p className="text-3xl font-mono font-bold tracking-tight text-foreground">
              {currentTime.toLocaleTimeString([], { hour12: false })}
            </p>
            <p className="text-xs text-muted-foreground">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          {/* Work Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Work Location</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocation('office')}
                className={`p-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition cursor-pointer ${
                  location === 'office'
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>Office</span>
              </button>
              <button
                type="button"
                onClick={() => setLocation('remote')}
                className={`p-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition cursor-pointer ${
                  location === 'remote'
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Remote</span>
              </button>
              <button
                type="button"
                onClick={() => setLocation('field')}
                className={`p-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition cursor-pointer ${
                  location === 'field'
                    ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'border-border bg-muted/30 text-muted-foreground hover:text-foreground'
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                <span>Client Site</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">Work / Daily Log Note</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sprints planning, backend microservice"
              className="text-xs"
            />
          </div>

          {/* Action Button */}
          {!todayAttendance?.clock_in ? (
            <Button
              variant="primary"
              onClick={handleClockIn}
              disabled={clockActionLoading}
              className="w-full text-xs py-2.5 font-semibold shadow-md shadow-primary/20"
            >
              {clockActionLoading ? 'Recording Clock-In...' : 'Clock In Now'}
            </Button>
          ) : !todayAttendance.clock_out ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs flex items-center justify-between">
                <span>Clocked in at {new Date(todayAttendance.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                <Badge variant="primary" className="text-[10px]">Active Shift</Badge>
              </div>
              <Button
                variant="outline"
                onClick={handleClockOut}
                disabled={clockActionLoading}
                className="w-full text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
              >
                {clockActionLoading ? 'Recording Clock-Out...' : 'Clock Out & Finalize Hours'}
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-border bg-muted/30 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Shift Completed Today</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total recorded: {todayAttendance.total_hours} productive hours
              </p>
            </div>
          )}
        </div>

        {/* Attendance Summary Telemetry */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Shift Performance & Hours Telemetry</h2>
            <p className="text-xs text-muted-foreground">Month-to-date calculation based on standard 8-hour workday</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Standard Hours</p>
              <p className="text-xl font-bold text-foreground">168.0 hrs</p>
              <p className="text-[10px] text-emerald-500 font-semibold">100% Target Met</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Punctuality Score</p>
              <p className="text-xl font-bold text-foreground">98.2%</p>
              <p className="text-[10px] text-primary font-semibold">Top 5% Tier</p>
            </div>
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <p className="text-xs text-muted-foreground font-medium">Overtime Accrued</p>
              <p className="text-xl font-bold text-foreground">12.5 hrs</p>
              <p className="text-[10px] text-indigo-400 font-semibold">Eligible for Payout</p>
            </div>
          </div>

          <div className="p-3 rounded-xl border border-border bg-muted/30 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Company Standard Policy: Core hours 09:00 - 18:00 WIB</span>
            <Badge variant="outline" className="text-[10px]">Strict Grace: 15 mins</Badge>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Attendance Records & Logs</h2>
            <p className="text-xs text-muted-foreground">Daily clock entries and location tags</p>
          </div>
          <Button variant="outline" size="sm" className="text-xs flex items-center gap-1.5">
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Export Timesheet</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Clock In</th>
                <th className="py-3.5 px-4">Clock Out</th>
                <th className="py-3.5 px-4">Total Hours</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.length > 0 ? (
                history.map((att) => (
                  <tr key={att.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-mono font-medium text-foreground">{att.date}</td>
                    <td className="py-3 px-4 font-semibold text-foreground">{att.employee_name || user?.full_name}</td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {att.clock_in ? new Date(att.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {att.clock_out ? new Date(att.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-foreground">
                      {att.total_hours > 0 ? `${att.total_hours} hrs` : '-'}
                    </td>
                    <td className="py-3 px-4 capitalize">
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span>{att.work_location}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {getStatusBadge(att.status)}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground truncate max-w-xs">
                      {att.notes || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
