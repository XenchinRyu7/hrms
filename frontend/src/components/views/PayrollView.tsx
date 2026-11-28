import React, { useEffect, useState } from "react";
import {
  Wallet,
  Play,
  FileText,
  Printer,
  Download,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Building,
  CreditCard,
  X,
  Coins,
  Receipt,
  Clock,
  UserCheck,
  HandCoins,
  Plus,
  Check,
} from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  ConfirmationDialog,
} from "@etherealui/react";
import { api } from "../../lib/api";
import { useAuth } from "../../lib/auth-context";
import { useNotification } from "../../lib/notification-context";
import { exportToCSV, printPayslip } from "../../lib/export";
import type { PayrollPeriod, Payslip, User } from "../../lib/types";

export interface SalaryAdvanceItem {
  id: string;
  employee_id: string;
  employee_name: string;
  amount: number;
  request_date: string;
  reason: string;
  installments: number;
  status: "pending" | "approved" | "disbursed" | "repaid";
  monthly_deduction: number;
}

const INITIAL_SALARY_ADVANCES: SalaryAdvanceItem[] = [
  {
    id: "adv-1",
    employee_id: "emp-01",
    employee_name: "Alex Thorne",
    amount: 3000000,
    request_date: "20 Nov 2026",
    reason: "Biaya perbaikan kendaraan operasional",
    installments: 3,
    status: "approved",
    monthly_deduction: 1000000,
  },
  {
    id: "adv-2",
    employee_id: "emp-02",
    employee_name: "Sarah Jenkins",
    amount: 1500000,
    request_date: "25 Nov 2026",
    reason: "Kebutuhan medis keluarga mendesak",
    installments: 1,
    status: "pending",
    monthly_deduction: 1500000,
  },
];

export function PayrollView() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [isConfirmRunOpen, setIsConfirmRunOpen] = useState(false);

  // Tab State
  const [payrollTab, setPayrollTab] = useState<"slips" | "advances">("slips");

  // Salary Advance State
  const [advances, setAdvances] = useState<SalaryAdvanceItem[]>(
    INITIAL_SALARY_ADVANCES,
  );
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [advanceForm, setAdvanceForm] = useState({
    employee_id: "",
    amount: 2000000,
    installments: 1,
    reason: "",
  });

  const handleApproveAdvance = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) =>
        a.id === id ? { ...a, status: "approved" as const } : a,
      ),
    );
    toast.success(
      "Kasbon Disetujui",
      "Pengajuan kasbon disetujui dan akan dipotong otomatis pada payroll berjalan.",
    );
  };

  const handleRejectAdvance = (id: string) => {
    setAdvances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: "repaid" as const } : a)),
    );
    toast.info(
      "Kasbon Ditolak",
      "Pengajuan pinjaman karyawan telah dibatalkan.",
    );
  };

  const handleCreateAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find((x) => x.id === advanceForm.employee_id);
    const added: SalaryAdvanceItem = {
      id: `adv-${Date.now()}`,
      employee_id: advanceForm.employee_id || user?.id || "emp-01",
      employee_name: emp?.full_name || user?.full_name || "Karyawan",
      amount: advanceForm.amount,
      request_date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      reason: advanceForm.reason || "Kebutuhan pribadi darurat",
      installments: advanceForm.installments,
      status: "pending",
      monthly_deduction: Math.round(
        advanceForm.amount / (advanceForm.installments || 1),
      ),
    };
    setAdvances((prev) => [added, ...prev]);
    setIsAdvanceModalOpen(false);
    setAdvanceForm({
      employee_id: "",
      amount: 2000000,
      installments: 1,
      reason: "",
    });
    toast.success(
      "Kasbon Berhasil Diajukan",
      `Pengajuan kasbon sebesar ${formatIDR(added.amount)} sedang menunggu approval finance.`,
    );
  };

  // Manual Salary Setting Modal State
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  const [targetEmpId, setTargetEmpId] = useState("");
  const [manualSalaryInput, setManualSalaryInput] = useState<number>(10000000);
  const [savingSalary, setSavingSalary] = useState(false);

  const isAdminOrHR = user?.role === "admin" || user?.role === "hr_manager";
  const isHRManager = user?.role === "hr_manager";

  const loadPayrollData = async () => {
    try {
      const [perList, slipList, empList] = await Promise.all([
        isAdminOrHR ? api.getPayrollPeriods() : Promise.resolve([]),
        api.getPayslips({
          period_id: selectedPeriod || undefined,
          employee_id: !isAdminOrHR ? user?.id : undefined,
        }),
        isAdminOrHR ? api.getEmployees() : Promise.resolve([]),
      ]);
      const validPeriods = Array.isArray(perList) ? perList : [];
      const validSlips = Array.isArray(slipList) ? slipList : [];
      const validEmps = Array.isArray(empList) ? empList : [];
      setPeriods(validPeriods);
      setPayslips(validSlips);
      setEmployees(validEmps);

      if (validPeriods.length > 0 && !selectedPeriod) {
        setSelectedPeriod(validPeriods[0].id);
      }
      if (empList && empList.length > 0 && !targetEmpId) {
        setTargetEmpId(empList[0].id);
      }
    } catch (err) {
      console.error("Failed to load payroll:", err);
      setPeriods([]);
      setPayslips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayrollData();
  }, [selectedPeriod]);

  const handleGeneratePayroll = async () => {
    if (!selectedPeriod) return;
    setProcessing(true);
    try {
      await api.generatePayslips(selectedPeriod);
      toast.success(
        "Kalkulasi Payroll Selesai",
        "Gaji pokok, akumulasi lembur (@Rp 50rb/jam), dan reimbursement disetujui telah digenerate.",
      );
      loadPayrollData();
      setIsConfirmRunOpen(false);
    } catch (err: any) {
      toast.error(
        "Gagal Menghitung Payroll",
        err.message || "Payroll generation failed",
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleSaveManualSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmpId) return;
    setSavingSalary(true);
    try {
      await api.saveSalaryStructure({
        employee_id: targetEmpId,
        basic_salary: Number(manualSalaryInput),
        housing_allowance: 0,
        transport_allowance: 0,
        meal_allowance: 0,
        tax_rate: 5,
        insurance_rate: 4,
        bank_name: "BCA",
        bank_account_number: "8829012391",
        bank_account_holder:
          employees.find((e) => e.id === targetEmpId)?.full_name || "Employee",
        effective_date: new Date().toISOString().split("T")[0],
      });
      toast.success(
        "Gaji Pokok Disimpan",
        `Gaji pokok ${formatIDR(manualSalaryInput)} berhasil disimpan untuk karyawan terpilih.`,
      );
      setIsSalaryModalOpen(false);
      loadPayrollData();
    } catch (err: any) {
      toast.error(
        "Gagal Menyimpan Gaji",
        err.message || "Failed to save salary",
      );
    } finally {
      setSavingSalary(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const handleExportCSV = () => {
    if (payslips.length === 0) {
      toast.warning(
        "Tidak Ada Data",
        "Belum ada data slip gaji untuk diekspor.",
      );
      return;
    }

    const headers = [
      "Nama Karyawan",
      "Kode Karyawan",
      "Departemen",
      "Jabatan",
      "Periode",
      "Gaji Pokok (IDR)",
      "Uang Lembur (IDR)",
      "Reimbursement (IDR)",
      "Total Tunjangan (IDR)",
      "Potongan Pajak PPh21 (IDR)",
      "Potongan BPJS (IDR)",
      "Total Potongan (IDR)",
      "Gaji Bersih / THP (IDR)",
      "Status",
    ];

    const rows = payslips.map((slip) => [
      slip.employee_name || "Karyawan",
      slip.employee_code || "-",
      slip.department_name || "-",
      slip.job_title || "-",
      slip.period_name || currentPeriodObj?.name || "-",
      slip.basic_salary,
      Number(slip.breakdown?.allowances?.overtime_pay || 0),
      Number(slip.breakdown?.allowances?.reimbursements || 0),
      slip.total_allowances,
      Number(slip.breakdown?.deductions?.tax || 0),
      Number(slip.breakdown?.deductions?.insurance || 0),
      slip.total_deductions,
      slip.net_salary,
      slip.status,
    ]);

    const periodNameSlug = (currentPeriodObj?.name || "payroll")
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-");
    exportToCSV(`rekap-payroll-${periodNameSlug}`, headers, rows);
    toast.success(
      "Export Berhasil",
      "File rekap CSV payroll berhasil diunduh.",
    );
  };

  const handlePrintPayslip = (slip: Payslip) => {
    printPayslip({
      companyName: "Ethereal Global Corporation",
      companyAddress:
        "Sudirman Central Business District (SCBD), Jakarta 12190",
      employeeName: slip.employee_name || "Karyawan",
      employeeCode: slip.employee_code || "EMP-001",
      jobTitle: slip.job_title || "Staff",
      department: slip.department_name || "Divisi Operasional",
      periodName:
        slip.period_name || currentPeriodObj?.name || "Periode Berjalan",
      basicSalary: Number(slip.basic_salary || 0),
      overtimePay: Number(slip.breakdown?.allowances?.overtime_pay || 0),
      reimbursements: Number(slip.breakdown?.allowances?.reimbursements || 0),
      totalAllowances: Number(slip.total_allowances || 0),
      taxDeduction: Number(slip.breakdown?.deductions?.tax || 0),
      insuranceDeduction: Number(slip.breakdown?.deductions?.insurance || 0),
      totalDeductions: Number(slip.total_deductions || 0),
      netSalary: Number(slip.net_salary || 0),
    });
  };

  const currentPeriodObj = periods.find((p) => p.id === selectedPeriod);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
              Compensation & Benefits
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">
              Salary, Overtime & Reimbursements
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isAdminOrHR
              ? "Payroll Processing & Compensation"
              : "My Payslips & Compensation"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {isAdminOrHR
              ? "Operasional penggajian oleh HR: input gaji pokok, kalkulasi lembur (Rp 50rb/jam), dan reimbursement."
              : "Rincian slip gaji resmi, akumulasi uang lembur, dan pembayaran reimbursement Anda."}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Tombol Export Rekap CSV */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs flex items-center gap-1.5 shadow-xs cursor-pointer"
            title="Download rekap payroll dalam format CSV"
          >
            <Download className="h-3.5 w-3.5 text-primary" />
            <span>Export Rekap CSV</span>
          </Button>

          {isAdminOrHR && (
            <>
              {/* Input Gaji Pokok Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSalaryModalOpen(true)}
                className="text-xs flex items-center gap-1.5 shadow-xs"
              >
                <Coins className="h-3.5 w-3.5 text-amber-500" />
                <span>Input / Atur Gaji Karyawan</span>
              </Button>

              {/* Run Payroll (Only HR Manager or Admin) */}
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsConfirmRunOpen(true)}
                disabled={processing || !selectedPeriod}
                className="text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>
                  {processing ? "Memproses..." : "Hitung & Generate Payroll"}
                </span>
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Cycle Overview Cards (HR / Admin View) */}
      {isAdminOrHR && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Periode Payroll Aktif
            </p>
            <div className="flex items-center justify-between">
              <p className="text-lg font-bold text-foreground">
                {currentPeriodObj?.name || "Periode Berjalan"}
              </p>
              <Badge variant="primary" className="text-[10px]">
                {currentPeriodObj?.status || "Draft"}
              </Badge>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Tanggal Pembayaran: {currentPeriodObj?.pay_date || "Akhir Bulan"}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Total Pengeluaran Gaji
            </p>
            <p className="text-lg font-bold text-foreground">
              {formatIDR(currentPeriodObj?.total_disbursement || 0)}
            </p>
            <p className="text-[11px] text-emerald-500 font-medium">
              Termasuk lembur Rp 50rb/jam & reimbursement disetujui
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
            <p className="text-xs text-muted-foreground font-medium">
              Diproses Oleh
            </p>
            <p className="text-lg font-bold text-foreground">
              HR Operations Department
            </p>
            <p className="text-[11px] text-muted-foreground">
              Admin bertindak sebagai pemantau & governance
            </p>
          </div>
        </div>
      )}

      {/* Switcher Tab: Slip Gaji vs Kasbon Karyawan */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setPayrollTab("slips")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              payrollTab === "slips"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Daftar Slip Gaji (Payroll)</span>
          </button>

          <button
            type="button"
            onClick={() => setPayrollTab("advances")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 ${
              payrollTab === "advances"
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            <HandCoins className="h-3.5 w-3.5" />
            <span>Kasbon &amp; Pinjaman Karyawan</span>
            {advances.filter((a) => a.status === "pending").length > 0 && (
              <Badge
                variant="secondary"
                className="text-[9px] px-1.5 py-0 bg-amber-500/20 text-amber-600"
              >
                {advances.filter((a) => a.status === "pending").length}
              </Badge>
            )}
          </button>
        </div>

        {payrollTab === "advances" && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAdvanceModalOpen(true)}
            className="text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Ajukan Kasbon Darurat</span>
          </Button>
        )}
      </div>

      {/* Tab: Payslips Table */}
      {payrollTab === "slips" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-card-foreground">
                {isAdminOrHR ? "Daftar Slip Gaji Karyawan" : "Slip Gaji Saya"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Rincian gaji pokok, uang lembur, reimbursement, dan take home
                pay
              </p>
            </div>

            {isAdminOrHR && periods.length > 0 && (
              <div className="flex items-center gap-2">
                <select
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="text-xs rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  {periods.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Departemen &amp; Jabatan</th>
                  <th className="py-3.5 px-4">Gaji Pokok</th>
                  <th className="py-3.5 px-4">Lembur &amp; Tunjangan</th>
                  <th className="py-3.5 px-4">Potongan</th>
                  <th className="py-3.5 px-4">Gaji Bersih</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Rincian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {(payslips || []).length > 0 ? (
                  (payslips || []).map((slip) => (
                    <tr key={slip.id} className="hover:bg-muted/30 transition">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">
                          {slip.employee_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground font-mono">
                          {slip.employee_code}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium text-foreground">
                          {slip.department_name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {slip.job_title}
                        </p>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium">
                        {formatIDR(slip.basic_salary)}
                      </td>
                      <td className="py-3 px-4 font-mono text-emerald-500">
                        +{formatIDR(slip.total_allowances)}
                      </td>
                      <td className="py-3 px-4 font-mono text-destructive">
                        -{formatIDR(slip.total_deductions)}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-foreground text-sm">
                        {formatIDR(slip.net_salary)}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="primary"
                          className="text-[10px] capitalize"
                        >
                          {slip.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayslip(slip)}
                          className="h-7 px-2.5 text-xs text-foreground cursor-pointer"
                        >
                          <FileText className="h-3 w-3 mr-1 text-primary" />
                          <span>Lihat Slip</span>
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      className="py-8 text-center text-xs text-muted-foreground"
                    >
                      Belum ada data slip gaji untuk periode ini. Tekan
                      &quot;Hitung &amp; Generate Payroll&quot; untuk memproses.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Salary Advances Table */}
      {payrollTab === "advances" && (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-card-foreground">
                Buku Pengajuan Kasbon &amp; Pinjaman Karyawan
              </h2>
              <p className="text-xs text-muted-foreground">
                Otorisasi pinjaman darurat dan skema pemotongan otomatis per
                siklus gaji
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Karyawan</th>
                  <th className="py-3.5 px-4">Tanggal Pengajuan</th>
                  <th className="py-3.5 px-4">Total Pinjaman</th>
                  <th className="py-3.5 px-4">Skema Tenor</th>
                  <th className="py-3.5 px-4">Potongan per Bulan</th>
                  <th className="py-3.5 px-4">Alasan Darurat</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {advances.map((adv) => (
                  <tr key={adv.id} className="hover:bg-muted/20 transition">
                    <td className="py-3.5 px-4 font-semibold text-foreground">
                      {adv.employee_name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-muted-foreground">
                      {adv.request_date}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-foreground">
                      {formatIDR(adv.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {adv.installments}x Pemotongan Gaji
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-rose-500">
                      -{formatIDR(adv.monthly_deduction)} / bln
                    </td>
                    <td className="py-3.5 px-4 text-muted-foreground max-w-xs truncate">
                      {adv.reason}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge
                        variant={
                          adv.status === "approved"
                            ? "primary"
                            : adv.status === "repaid"
                              ? "outline"
                              : "secondary"
                        }
                        className="text-[10px]"
                      >
                        {adv.status === "approved"
                          ? "Disetujui"
                          : adv.status === "repaid"
                            ? "Lunas / Selesai"
                            : "Menunggu Approval"}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {adv.status === "pending" && isAdminOrHR ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleApproveAdvance(adv.id)}
                            className="h-7 px-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                          >
                            <Check className="h-3 w-3 mr-1" />
                            <span>Setujui</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRejectAdvance(adv.id)}
                            className="h-7 px-2 text-xs cursor-pointer text-destructive border-destructive/30 hover:bg-destructive/10"
                          >
                            <X className="h-3 w-3 mr-1" />
                            <span>Tolak</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          -
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual Salary Input Modal */}
      <Modal open={isSalaryModalOpen} onOpenChange={setIsSalaryModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Input / Atur Gaji Karyawan</ModalTitle>
            <ModalDescription>
              Masukkan langsung nominal gaji pokok karyawan tanpa rumus rumit.
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleSaveManualSalary} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Pilih Karyawan *
              </label>
              <select
                required
                value={targetEmpId}
                onChange={(e) => setTargetEmpId(e.target.value)}
                className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name} ({emp.employee_code || "EMP"}) &bull;{" "}
                    {emp.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground">
                Nominal Gaji Pokok (IDR) *
              </label>
              <Input
                type="number"
                required
                min={1000000}
                step={100000}
                value={manualSalaryInput}
                onChange={(e) => setManualSalaryInput(Number(e.target.value))}
                placeholder="Contoh: 12000000"
                className="w-full text-xs"
              />
              <p className="text-[11px] text-muted-foreground font-mono">
                Format: {formatIDR(manualSalaryInput)}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/20 text-[11px] text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">
                Keterangan Kompensasi Tambahan:
              </p>
              <p>
                &bull; Uang lembur dihitung otomatis dari log kehadiran:{" "}
                <strong>Rp 50.000 / jam lembur</strong>.
              </p>
              <p>
                &bull; Klaim reimbursement yang di-approve HR otomatis
                dibayarkan di slip gaji.
              </p>
            </div>

            <ModalFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsSalaryModalOpen(false)}
                className="text-xs"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                disabled={savingSalary}
                className="text-xs font-semibold cursor-pointer"
              >
                {savingSalary ? "Menyimpan..." : "Simpan Gaji Pokok"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Payslip Details Modal */}
      <Modal
        open={!!selectedPayslip}
        onOpenChange={(open) => !open && setSelectedPayslip(null)}
      >
        <ModalContent className="max-w-2xl">
          <ModalHeader>
            <div className="flex items-center justify-between w-full pr-6">
              <div>
                <ModalTitle>Slip Gaji Elektronik Resmi</ModalTitle>
                <ModalDescription>
                  EHMRS Payroll Statement &bull; PT Ethereal Human Resource
                </ModalDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.print()}
                className="text-xs cursor-pointer"
              >
                <Printer className="h-3 w-3 mr-1" />
                <span>Cetak</span>
              </Button>
            </div>
          </ModalHeader>

          {selectedPayslip && (
            <div className="space-y-4 pt-2">
              <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-muted/20 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">
                    Nama Karyawan
                  </span>
                  <p className="font-bold text-foreground mt-0.5">
                    {selectedPayslip.employee_name}
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono">
                    {selectedPayslip.employee_code} &bull;{" "}
                    {selectedPayslip.department_name}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] uppercase font-mono text-muted-foreground">
                    Periode Payroll
                  </span>
                  <p className="font-bold text-foreground mt-0.5">
                    {selectedPayslip.period_name}
                  </p>
                  <p className="text-[11px] text-emerald-500 font-semibold">
                    Status: Dibayarkan
                  </p>
                </div>
              </div>

              {/* Earnings & Deductions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Earnings */}
                <div className="space-y-2 p-3.5 rounded-xl border border-border bg-card">
                  <p className="font-bold text-foreground pb-2 border-b border-border flex items-center justify-between">
                    <span>Penerimaan (Earnings)</span>
                    <span className="text-emerald-500">Kotor</span>
                  </p>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">Gaji Pokok</span>
                    <span className="font-mono text-foreground font-semibold">
                      {formatIDR(selectedPayslip.basic_salary)}
                    </span>
                  </div>
                  {/* Overtime Pay */}
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">
                      Uang Lembur (@Rp 50rb/jam)
                    </span>
                    <span className="font-mono text-emerald-500 font-semibold">
                      +
                      {formatIDR(
                        Number(
                          selectedPayslip.breakdown?.allowances?.overtime_pay ||
                            0,
                        ),
                      )}
                    </span>
                  </div>
                  {/* Reimbursements */}
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">
                      Pencairan Reimbursement (HR Approved)
                    </span>
                    <span className="font-mono text-emerald-500 font-semibold">
                      +
                      {formatIDR(
                        Number(
                          selectedPayslip.breakdown?.allowances
                            ?.reimbursements || 0,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Total Tunjangan &amp; Tambahan</span>
                    <span className="font-mono text-emerald-500">
                      +{formatIDR(selectedPayslip.total_allowances)}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2 p-3.5 rounded-xl border border-border bg-card">
                  <p className="font-bold text-foreground pb-2 border-b border-border flex items-center justify-between">
                    <span>Potongan Statutori (PPh 21 & BPJS)</span>
                    <span className="text-destructive">Karyawan</span>
                  </p>
                  <div className="flex justify-between py-1">
                    <div>
                      <span className="text-muted-foreground block">
                        PPh 21 (TER 2024)
                      </span>
                      <span className="text-[10px] text-muted-foreground/75">
                        Kategori TER Efektif Bulanan
                      </span>
                    </div>
                    <span className="font-mono text-destructive">
                      -
                      {formatIDR(
                        Number(selectedPayslip.breakdown?.deductions?.tax || 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border/50">
                    <div>
                      <span className="text-muted-foreground block">
                        BPJS Ketenagakerjaan
                      </span>
                      <span className="text-[10px] text-muted-foreground/75">
                        JHT 2% + JP 1%
                      </span>
                    </div>
                    <span className="font-mono text-destructive">
                      -
                      {formatIDR(
                        Math.round(
                          Number(
                            selectedPayslip.breakdown?.deductions?.insurance ||
                              0,
                          ) * 0.75,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-t border-border/50">
                    <div>
                      <span className="text-muted-foreground block">
                        BPJS Kesehatan
                      </span>
                      <span className="text-[10px] text-muted-foreground/75">
                        1% Potongan Karyawan
                      </span>
                    </div>
                    <span className="font-mono text-destructive">
                      -
                      {formatIDR(
                        Math.round(
                          Number(
                            selectedPayslip.breakdown?.deductions?.insurance ||
                              0,
                          ) * 0.25,
                        ),
                      )}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-border flex justify-between font-semibold">
                    <span>Total Potongan</span>
                    <span className="font-mono text-destructive">
                      -{formatIDR(selectedPayslip.total_deductions)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Take-Home Pay Banner */}
              <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                    Take-Home Pay (Gaji Bersih Diterima)
                  </span>
                  <p className="text-xs text-muted-foreground">
                    Telah ditransfer ke rekening bank terdaftar
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black font-mono text-primary">
                    {formatIDR(selectedPayslip.net_salary)}
                  </span>
                </div>
              </div>

              {/* Company Benefit & Contributions */}
              <div className="p-3 rounded-xl border border-border bg-muted/20 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="font-semibold text-foreground">
                    Iuran Ditanggung Perusahaan (BPJS TK 6,24% &amp; Kesehatan
                    4%)
                  </span>
                  <p className="text-[11px] text-muted-foreground">
                    Iuran jaminan sosial yang dibayarkan penuh oleh perusahaan
                    di luar pemotongan gaji pokok
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className="text-emerald-500 border-emerald-500/30 text-[10px] shrink-0 font-mono"
                >
                  +
                  {formatIDR(Math.round(selectedPayslip.basic_salary * 0.1024))}{" "}
                  / bln
                </Badge>
              </div>
            </div>
          )}

          <ModalFooter className="flex items-center justify-between w-full">
            <Button
              variant="primary"
              size="sm"
              onClick={() =>
                selectedPayslip && handlePrintPayslip(selectedPayslip)
              }
              className="text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Cetak / Unduh PDF Slip Gaji</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedPayslip(null)}
              className="text-xs cursor-pointer"
            >
              Tutup
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Confirmation Dialog Run Payroll */}
      <ConfirmationDialog
        open={isConfirmRunOpen}
        onOpenChange={setIsConfirmRunOpen}
        title="Konfirmasi Hitung Payroll"
        description="Aksi ini akan menghitung gaji pokok, akumulasi jam lembur (@Rp 50.000/jam), dan reimbursement disetujui untuk seluruh karyawan."
        confirmText="Hitung Sekarang"
        cancelText="Batal"
        variant="primary"
        onConfirm={handleGeneratePayroll}
      />

      {/* Modal Ajukan Kasbon / Pinjaman Karyawan */}
      <Modal open={isAdvanceModalOpen} onOpenChange={setIsAdvanceModalOpen}>
        <ModalContent className="max-w-md p-6">
          <ModalHeader>
            <ModalTitle>Pengajuan Kasbon Darurat</ModalTitle>
            <ModalDescription>
              Fasilitas pinjaman uang muka gaji karyawan dengan skema pemotongan
              otomatis.
            </ModalDescription>
          </ModalHeader>

          <form
            onSubmit={handleCreateAdvance}
            className="space-y-4 pt-2 text-xs"
          >
            {isAdminOrHR && (
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">
                  Pilih Karyawan *
                </label>
                <select
                  required
                  value={advanceForm.employee_id}
                  onChange={(e) =>
                    setAdvanceForm({
                      ...advanceForm,
                      employee_id: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Pilih Anggota Tim --</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.full_name} ({emp.employee_code || "EMP"}) &bull;{" "}
                      {emp.department_name || "General"}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="font-medium text-foreground">
                  Nominal Pinjaman (IDR) *
                </label>
                <Input
                  type="number"
                  required
                  min={500000}
                  max={10000000}
                  step={500000}
                  value={advanceForm.amount}
                  onChange={(e) =>
                    setAdvanceForm({
                      ...advanceForm,
                      amount: Number(e.target.value),
                    })
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-medium text-foreground">
                  Tenor Pemotongan
                </label>
                <select
                  value={advanceForm.installments}
                  onChange={(e) =>
                    setAdvanceForm({
                      ...advanceForm,
                      installments: Number(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border border-border bg-muted/40 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value={1}>1x Pelunasan (Gaji Bulan Ini)</option>
                  <option value={2}>2x Cicilan Bulanan</option>
                  <option value={3}>3x Cicilan Bulanan</option>
                </select>
              </div>
            </div>

            <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-1 text-[11px]">
              <span className="text-muted-foreground block">
                Estimasi cicilan per bulan:
              </span>
              <p className="font-bold text-rose-500 font-mono text-sm">
                -
                {formatIDR(
                  Math.round(
                    advanceForm.amount / (advanceForm.installments || 1),
                  ),
                )}{" "}
                / bulan
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="font-medium text-foreground">
                Alasan Kebutuhan Darurat *
              </label>
              <Input
                required
                value={advanceForm.reason}
                onChange={(e) =>
                  setAdvanceForm({
                    ...advanceForm,
                    reason: e.target.value,
                  })
                }
                placeholder="Contoh: Kebutuhan medis mendesak keluarga"
                className="text-xs"
              />
            </div>

            <ModalFooter className="p-0 pt-4 border-t border-border flex flex-row gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAdvanceModalOpen(false)}
                className="text-xs cursor-pointer"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs cursor-pointer"
              >
                Kirim Pengajuan Kasbon
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </div>
  );
}
