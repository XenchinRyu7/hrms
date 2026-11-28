import React, { useEffect, useState } from "react";
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
  Coins,
  Coffee,
  ShieldCheck,
  Download,
} from "lucide-react";
import { Button, Badge, Input } from "@etherealui/react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useNotification } from "../../lib/notification-context";
import { exportToCSV } from "../../lib/export";
import type { Attendance, User } from "../../lib/types";

export function AttendanceView() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [todayAttendance, setTodayAttendance] = useState<Attendance | null>(
    null,
  );
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [clockActionLoading, setClockActionLoading] = useState(false);
  const [location, setLocation] = useState<"office" | "remote" | "client_site">(
    "office",
  );
  const [notes, setNotes] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());
  const [feedback, setFeedback] = useState<string | null>(null);

  // Digital clock timer
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const isManagerOrAdmin =
    user?.role === "admin" ||
    user?.role === "hr_manager" ||
    user?.role === "manager";

  const loadAttendance = async () => {
    try {
      const [today, hist] = await Promise.all([
        api.getTodayAttendance().catch(() => null),
        api.getAttendanceHistory({
          employee_id: !isManagerOrAdmin ? user?.id : undefined,
        }),
      ]);
      setTodayAttendance(today);
      setHistory(hist || []);
    } catch (err) {
      console.error("Failed to load attendance:", err);
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
      setFeedback("Clock-in berhasil! Jam kerja fleksibel dimulai.");
      toast.success(
        "Clock-In Berhasil",
        `Shift aktif via ${location === "client_site" ? "Client Site" : location}. Target: 8 jam kerja + 1 jam istirahat.`,
      );
      setNotes("");
      loadAttendance();
    } catch (err: any) {
      const msg = err.message || "Clock-in failed";
      setFeedback(msg);
      toast.error("Clock-In Gagal", msg);
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
      const effectiveWork =
        updated.work_hours || Math.max(0, updated.total_hours - 1);
      const otHours =
        updated.overtime_hours || (effectiveWork > 8 ? effectiveWork - 8 : 0);
      const otPay = updated.overtime_pay || otHours * 50000;

      const summaryText =
        otHours > 0
          ? `Total kerja ${effectiveWork.toFixed(1)} jam (Lembur ${otHours.toFixed(1)} jam = +Rp ${otPay.toLocaleString("id-ID")})`
          : `Total kerja ${effectiveWork.toFixed(1)} jam (+1 jam istirahat otomatis)`;

      setFeedback(`Clock-out berhasil! ${summaryText}.`);
      toast.success("Clock-Out Berhasil", summaryText);
      loadAttendance();
    } catch (err: any) {
      const msg = err.message || "Clock-out failed";
      setFeedback(msg);
      toast.error("Clock-Out Gagal", msg);
    } finally {
      setClockActionLoading(false);
    }
  };

  const getStatusBadge = (status: string, overtimeHours: number = 0) => {
    if (overtimeHours > 0 || status === "overtime") {
      return (
        <Badge
          variant="primary"
          className="text-[10px] bg-indigo-600 text-white border-indigo-600"
        >
          Lembur (+Rp 50rb/h)
        </Badge>
      );
    }
    switch (status) {
      case "present":
      case "on_time":
        return (
          <Badge variant="secondary" className="text-[10px]">
            Hadir (Shift Aktif)
          </Badge>
        );
      case "completed":
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-emerald-500 border-emerald-500/30"
          >
            8 Jam Terpenuhi
          </Badge>
        );
      case "under_hours":
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-amber-500 border-amber-500/30"
          >
            &lt; 8 Jam Kerja
          </Badge>
        );
      default:
        return (
          <Badge variant="muted" className="text-[10px]">
            {status}
          </Badge>
        );
    }
  };

  const totalOvertimeMonth = history.reduce(
    (acc, curr) => acc + (curr.overtime_hours || 0),
    0,
  );
  const totalOvertimePayMonth = history.reduce(
    (acc, curr) =>
      acc + (curr.overtime_pay || (curr.overtime_hours || 0) * 50000),
    0,
  );

  const handleExportCSV = () => {
    if (history.length === 0) {
      toast.warning(
        "Tidak Ada Data",
        "Belum ada riwayat kehadiran untuk diekspor.",
      );
      return;
    }

    const headers = [
      "Tanggal",
      "Jam Masuk",
      "Jam Keluar",
      "Total Durasi (Jam)",
      "Jam Kerja Efektif",
      "Jam Lembur",
      "Estimasi Uang Lembur (IDR)",
      "Lokasi",
      "Status",
      "Catatan",
    ];

    const rows = history.map((att) => [
      att.date,
      att.clock_in
        ? new Date(att.clock_in).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      att.clock_out
        ? new Date(att.clock_out).toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "-",
      att.total_hours.toFixed(1),
      (att.work_hours || Math.max(0, att.total_hours - 1)).toFixed(1),
      (att.overtime_hours || 0).toFixed(1),
      att.overtime_pay || (att.overtime_hours || 0) * 50000,
      att.work_location || "Office",
      att.status,
      att.notes || "-",
    ]);

    const dateSlug = new Date().toISOString().slice(0, 7);
    exportToCSV(`rekap-presensi-${dateSlug}`, headers, rows);
    toast.success(
      "Export Berhasil",
      "File rekap CSV presensi berhasil diunduh.",
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">
            Time & Attendance
          </span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">
            Flexible Hours & Overtime Engine
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Attendance Terminal & Work Shifts
        </h1>
        <p className="text-xs text-muted-foreground">
          Jam kerja fleksibel bebas jam masuk. Standar 8 jam kerja + 1 jam
          istirahat otomatis. Lembur dihitung Rp 50.000 / jam.
        </p>
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-foreground text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button
            onClick={() => setFeedback(null)}
            className="text-muted-foreground hover:text-foreground cursor-pointer text-xs"
          >
            Dismiss
          </button>
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
              WIB (UTC+7)
            </span>
          </div>

          {/* Large Live Digital Clock */}
          <div className="text-center py-3 bg-muted/20 rounded-2xl border border-border/50">
            <div className="text-3xl sm:text-4xl font-extrabold tracking-tight font-mono text-foreground">
              {currentTime.toLocaleTimeString([], { hour12: false })}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>

          {/* Work Location Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Lokasi Kerja (Work Location)
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLocation("office")}
                className={`p-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition cursor-pointer ${
                  location === "office"
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Building className="h-3.5 w-3.5" />
                <span>Office</span>
              </button>
              <button
                type="button"
                onClick={() => setLocation("remote")}
                className={`p-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition cursor-pointer ${
                  location === "remote"
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Laptop className="h-3.5 w-3.5" />
                <span>Remote</span>
              </button>
              <button
                type="button"
                onClick={() => setLocation("client_site")}
                className={`p-2 rounded-xl text-xs font-medium border flex flex-col items-center gap-1 transition cursor-pointer ${
                  location === "client_site"
                    ? "border-primary bg-primary text-primary-foreground font-semibold shadow-xs"
                    : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
                }`}
              >
                <Car className="h-3.5 w-3.5" />
                <span>Client Site</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground">
              Catatan Aktivitas / Rencana Kerja
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Sprints backend, client meeting, feature deployment"
              className="text-xs"
            />
          </div>

          {/* Action Button */}
          {!todayAttendance?.clock_in ? (
            <Button
              variant="primary"
              onClick={handleClockIn}
              disabled={clockActionLoading}
              className="w-full text-xs py-2.5 font-semibold shadow-md shadow-primary/20 cursor-pointer"
            >
              {clockActionLoading ? "Merekam Clock-In..." : "Clock In Sekarang"}
            </Button>
          ) : !todayAttendance.clock_out ? (
            <div className="space-y-2">
              <div className="p-2.5 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-500 text-xs flex items-center justify-between">
                <span>
                  Masuk pukul{" "}
                  {new Date(todayAttendance.clock_in).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <Badge variant="primary" className="text-[10px]">
                  Shift Sedang Berjalan
                </Badge>
              </div>
              <Button
                variant="outline"
                onClick={handleClockOut}
                disabled={clockActionLoading}
                className="w-full text-xs text-destructive hover:bg-destructive/10 border-destructive/30 cursor-pointer"
              >
                {clockActionLoading
                  ? "Merekam Clock-Out..."
                  : "Clock Out & Selesaikan Shift"}
              </Button>
            </div>
          ) : (
            <div className="p-3 rounded-xl border border-border bg-muted/30 text-center space-y-1">
              <p className="text-xs font-semibold text-foreground flex items-center justify-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Shift Hari Ini Telah Selesai</span>
              </p>
              <p className="text-[11px] text-muted-foreground">
                Total di tempat: {todayAttendance.total_hours} jam | Efektif:{" "}
                {(
                  todayAttendance.work_hours ||
                  Math.max(0, todayAttendance.total_hours - 1)
                ).toFixed(1)}{" "}
                jam
                {(todayAttendance.overtime_hours || 0) > 0 &&
                  ` (+Lembur ${(todayAttendance.overtime_hours || 0).toFixed(1)} jam)`}
              </p>
            </div>
          )}
        </div>

        {/* Shift Policy & Overtime Telemetry */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <h2 className="text-base font-bold text-card-foreground">
                Kebijakan Jam Fleksibel & Skema Lembur
              </h2>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Karyawan bebas masuk jam berapa saja. Standar kerja 1 shift adalah{" "}
              <strong>8 jam kerja produktif</strong> +{" "}
              <strong>1 jam istirahat otomatis</strong> (total 9 jam). Kerja
              melebihi 8 jam kerja efektif dihitung sebagai lembur resmi.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <span>Target Kerja Harian</span>
              </div>
              <p className="text-xl font-bold text-foreground">8.0 Jam</p>
              <p className="text-[10px] text-muted-foreground">
                +1 Jam Istirahat Otomatis
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Coffee className="h-3.5 w-3.5 text-amber-500" />
                <span>Total Jam Lembur</span>
              </div>
              <p className="text-xl font-bold text-indigo-500">
                {totalOvertimeMonth.toFixed(1)} Jam
              </p>
              <p className="text-[10px] text-muted-foreground">
                Akumulasi bulan ini
              </p>
            </div>

            <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <Coins className="h-3.5 w-3.5 text-emerald-500" />
                <span>Tarif Lembur</span>
              </div>
              <p className="text-xl font-bold text-emerald-500">
                Rp 50.000 / Jam
              </p>
              <p className="text-[10px] text-emerald-600 font-semibold">
                Estimasi: Rp {totalOvertimePayMonth.toLocaleString("id-ID")}
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-muted/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-muted-foreground">
              Mendukung kerja dari <strong>Office</strong>,{" "}
              <strong>Remote (WFH)</strong>, maupun <strong>Client Site</strong>
              .
            </span>
            <Badge
              variant="outline"
              className="text-[10px] text-primary border-primary/30 shrink-0"
            >
              Kompensasi Lembur Terintegrasi Payroll
            </Badge>
          </div>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden space-y-0">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              Riwayat Kehadiran & Catatan Jam Kerja
            </h2>
            <p className="text-xs text-muted-foreground">
              Log waktu clock-in, clock-out, jam istirahat, dan kalkulasi lembur
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
            title="Download riwayat presensi dalam format CSV"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export CSV Presensi</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">Tanggal</th>
                <th className="py-3.5 px-4">Karyawan</th>
                <th className="py-3.5 px-4">Jam Masuk</th>
                <th className="py-3.5 px-4">Jam Pulang</th>
                <th className="py-3.5 px-4">Istirahat</th>
                <th className="py-3.5 px-4">Kerja Efektif</th>
                <th className="py-3.5 px-4">Lembur (@50rb)</th>
                <th className="py-3.5 px-4">Lokasi</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history.length > 0 ? (
                history.map((att) => {
                  const effectiveWork =
                    att.work_hours || Math.max(0, att.total_hours - 1);
                  const otHours =
                    att.overtime_hours ||
                    (effectiveWork > 8 ? effectiveWork - 8 : 0);
                  const otPay = att.overtime_pay || otHours * 50000;
                  return (
                    <tr key={att.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4 font-mono font-medium text-foreground">
                        {att.date}
                      </td>
                      <td className="py-3 px-4 font-semibold text-foreground">
                        {att.employee_name || user?.full_name}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {att.clock_in
                          ? new Date(att.clock_in).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {att.clock_out
                          ? new Date(att.clock_out).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "Sedang Aktif"}
                      </td>
                      <td className="py-3 px-4 font-mono text-muted-foreground">
                        {att.clock_out ? "1.0 jam" : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">
                        {att.clock_out
                          ? `${effectiveWork.toFixed(1)} jam`
                          : "-"}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        {otHours > 0 ? (
                          <span className="text-emerald-500 font-bold">
                            +{otHours.toFixed(1)} jam (Rp{" "}
                            {otPay.toLocaleString("id-ID")})
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="py-3 px-4 capitalize">
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3 text-primary" />
                          <span>
                            {att.work_location === "client_site"
                              ? "Client Site"
                              : att.work_location}
                          </span>
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(att.status, otHours)}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground truncate max-w-xs">
                        {att.notes || "-"}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan={10}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    Belum ada riwayat kehadiran tercatat.
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
