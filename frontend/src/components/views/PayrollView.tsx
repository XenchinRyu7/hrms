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
import type { PayrollPeriod, Payslip, User } from "../../lib/types";

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
      const validPeriods = perList || [];
      const validSlips = slipList || [];
      setPeriods(validPeriods);
      setPayslips(validSlips);
      setEmployees(empList || []);

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

        {isAdminOrHR && (
          <div className="flex items-center gap-2.5">
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
          </div>
        )}
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

      {/* Payslips Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              {isAdminOrHR ? "Daftar Slip Gaji Karyawan" : "Slip Gaji Saya"}
            </h2>
            <p className="text-xs text-muted-foreground">
              Rincian gaji pokok, uang lembur, reimbursement, dan take home pay
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
                <th className="py-3.5 px-4">Departemen & Jabatan</th>
                <th className="py-3.5 px-4">Gaji Pokok</th>
                <th className="py-3.5 px-4">Lembur & Tunjangan</th>
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
                    <span>Potongan (Deductions)</span>
                    <span className="text-destructive">Statutori</span>
                  </p>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">
                      PPh 21 Pajak Penghasilan
                    </span>
                    <span className="font-mono text-destructive">
                      -
                      {formatIDR(
                        Number(selectedPayslip.breakdown?.deductions?.tax || 0),
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground">
                      BPJS Ketenagakerjaan &amp; Kesehatan
                    </span>
                    <span className="font-mono text-destructive">
                      -
                      {formatIDR(
                        Number(
                          selectedPayslip.breakdown?.deductions?.insurance || 0,
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
            </div>
          )}

          <ModalFooter>
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
    </div>
  );
}
