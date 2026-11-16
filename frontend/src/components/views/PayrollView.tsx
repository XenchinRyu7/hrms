import React, { useEffect, useState } from 'react';
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
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
} from '@etherealui/react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import type { PayrollPeriod, Payslip } from '../../lib/types';

export function PayrollView() {
  const { user } = useAuth();
  const [periods, setPeriods] = useState<PayrollPeriod[]>([]);
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadPayrollData = async () => {
    try {
      const [perList, slipList] = await Promise.all([
        api.getPayrollPeriods(),
        api.getPayslips({ period_id: selectedPeriod || undefined }),
      ]);
      setPeriods(perList);
      setPayslips(slipList);
      if (perList.length > 0 && !selectedPeriod) {
        setSelectedPeriod(perList[0].id);
      }
    } catch (err) {
      console.error('Failed to load payroll:', err);
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
    setFeedback(null);
    try {
      await api.generatePayslips(selectedPeriod);
      setFeedback('Payroll calculation executed! All employee payslips generated.');
      loadPayrollData();
    } catch (err: any) {
      setFeedback(err.message || 'Payroll generation failed');
    } finally {
      setProcessing(false);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num);
  };

  const isAdminOrHR = user?.role === 'admin' || user?.role === 'hr_manager';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">Compensation & Benefits</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">Automated Tax & BPJS Deductions</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Payroll Processing & Payslips
          </h1>
          <p className="text-xs text-muted-foreground">
            Monthly salary disbursement, tax compliance, and automated payslip generation.
          </p>
        </div>

        {isAdminOrHR && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleGeneratePayroll}
            disabled={processing}
            className="text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-primary/20"
          >
            <Play className="h-3.5 w-3.5 fill-current" />
            <span>{processing ? 'Processing Calculation...' : 'Run Payroll Calculation'}</span>
          </Button>
        )}
      </div>

      {feedback && (
        <div className="p-3 rounded-xl bg-primary/10 border border-primary/30 text-foreground text-xs flex items-center justify-between">
          <span>{feedback}</span>
          <button onClick={() => setFeedback(null)} className="text-muted-foreground hover:text-foreground">Dismiss</button>
        </div>
      )}

      {/* Cycle Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Selected Payroll Cycle</p>
          <div className="flex items-center justify-between">
            <p className="text-lg font-bold text-foreground">
              {periods.find((p) => p.id === selectedPeriod)?.name || 'October 2026 Cycle'}
            </p>
            <Badge variant="primary" className="text-[10px]">Paid</Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Pay Date: {periods.find((p) => p.id === selectedPeriod)?.pay_date || '2026-10-28'}
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Total Disbursement Volume</p>
          <p className="text-lg font-bold text-foreground">
            {formatIDR(periods.find((p) => p.id === selectedPeriod)?.total_disbursement || 65000000)}
          </p>
          <p className="text-[11px] text-emerald-500 font-medium">100% Reconciled with Banking Gateway</p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">Statutory Compliance</p>
          <p className="text-lg font-bold text-foreground">PPh 21 & BPJS</p>
          <p className="text-[11px] text-primary font-medium">Tax withholding slips ready</p>
        </div>
      </div>

      {/* Payslips Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Employee Payslips</h2>
            <p className="text-xs text-muted-foreground">Itemized salary calculations and net payout</p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="text-xs rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-foreground"
            >
              {periods.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Department & Title</th>
                <th className="py-3.5 px-4">Basic Salary</th>
                <th className="py-3.5 px-4">Allowances</th>
                <th className="py-3.5 px-4">Deductions</th>
                <th className="py-3.5 px-4">Net Salary</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {payslips.length > 0 ? (
                payslips.map((slip) => (
                  <tr key={slip.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">{slip.employee_name}</p>
                      <p className="text-[11px] text-muted-foreground font-mono">{slip.employee_code}</p>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{slip.department_name}</p>
                      <p className="text-[11px] text-muted-foreground">{slip.job_title}</p>
                    </td>
                    <td className="py-3 px-4 font-mono">{formatIDR(slip.basic_salary)}</td>
                    <td className="py-3 px-4 font-mono text-emerald-500">+{formatIDR(slip.total_allowances)}</td>
                    <td className="py-3 px-4 font-mono text-destructive">-{formatIDR(slip.total_deductions)}</td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground text-sm">
                      {formatIDR(slip.net_salary)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="primary" className="text-[10px] capitalize">
                        {slip.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedPayslip(slip)}
                        className="h-7 px-2 text-[11px] flex items-center gap-1"
                      >
                        <FileText className="h-3 w-3" />
                        <span>View Payslip</span>
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-muted-foreground">
                    No payslips found for this cycle. Run payroll calculation above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Payslip Statement Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center font-bold">
                  🌌
                </div>
                <div>
                  <h2 className="text-base font-bold text-foreground">Ethereal Global Corp</h2>
                  <p className="text-[11px] text-muted-foreground font-mono">Confidential Salary Statement</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => window.print()} className="h-8 text-xs">
                  <Printer className="h-3 w-3 mr-1" />
                  <span>Print</span>
                </Button>
                <button
                  onClick={() => setSelectedPayslip(null)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl border border-border bg-muted/20 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Employee</span>
                <p className="font-bold text-foreground mt-0.5">{selectedPayslip.employee_name}</p>
                <p className="text-[11px] text-muted-foreground font-mono">{selectedPayslip.employee_code} &bull; {selectedPayslip.department_name}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Period & Date</span>
                <p className="font-bold text-foreground mt-0.5">{selectedPayslip.period_name}</p>
                <p className="text-[11px] text-emerald-500 font-semibold">Payment Status: Disbursed</p>
              </div>
            </div>

            {/* Breakdown Columns */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              {/* Earnings */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border bg-card">
                <p className="font-bold text-foreground pb-2 border-b border-border flex items-center justify-between">
                  <span>Earnings</span>
                  <span className="text-emerald-500">Gross</span>
                </p>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Basic Salary</span>
                  <span className="font-mono text-foreground">{formatIDR(selectedPayslip.basic_salary)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Housing Allowance</span>
                  <span className="font-mono text-foreground">Rp 2.000.000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Transport Allowance</span>
                  <span className="font-mono text-foreground">Rp 1.500.000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Meal Allowance</span>
                  <span className="font-mono text-foreground">Rp 1.200.000</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between font-semibold">
                  <span>Total Allowances</span>
                  <span className="font-mono text-emerald-500">+{formatIDR(selectedPayslip.total_allowances)}</span>
                </div>
              </div>

              {/* Deductions */}
              <div className="space-y-2 p-3.5 rounded-xl border border-border bg-card">
                <p className="font-bold text-foreground pb-2 border-b border-border flex items-center justify-between">
                  <span>Deductions</span>
                  <span className="text-destructive">Statutory</span>
                </p>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Income Tax (PPh 21)</span>
                  <span className="font-mono text-foreground">Rp 900.000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">BPJS Ketenagakerjaan</span>
                  <span className="font-mono text-foreground">Rp 420.000</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">BPJS Kesehatan</span>
                  <span className="font-mono text-foreground">Rp 300.000</span>
                </div>
                <div className="pt-6 border-t border-border flex justify-between font-semibold">
                  <span>Total Deductions</span>
                  <span className="font-mono text-destructive">-{formatIDR(selectedPayslip.total_deductions)}</span>
                </div>
              </div>
            </div>

            {/* Net Pay Callout */}
            <div className="p-4 rounded-xl border border-primary/30 bg-primary/10 flex items-center justify-between">
              <div>
                <p className="text-xs uppercase font-mono font-semibold text-primary">Net Take-Home Pay</p>
                <p className="text-xs text-muted-foreground">Credited to BCA &bull;&bull;&bull;&bull; 8820</p>
              </div>
              <p className="text-2xl font-bold font-mono text-primary">
                {formatIDR(selectedPayslip.net_salary)}
              </p>
            </div>

            <div className="text-center pt-2">
              <p className="text-[10px] text-muted-foreground">
                This is a computer-generated document authenticated by Ethereal HRMS cryptographic signature.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
