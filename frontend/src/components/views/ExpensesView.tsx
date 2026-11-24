import React, { useEffect, useState } from "react";
import {
  Receipt,
  Plus,
  Check,
  X,
  CreditCard,
  Calendar,
  FileText,
  DollarSign,
  Tag,
  ShieldCheck,
  ShieldAlert,
} from "lucide-react";
import {
  Button,
  Badge,
  Input,
  Textarea,
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
import type { Expense } from "../../lib/types";

export function ExpensesView() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectExpenseId, setRejectExpenseId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [newExpense, setNewExpense] = useState({
    title: "",
    category: "Travel",
    amount: 500000,
    expense_date: new Date().toISOString().split("T")[0],
    description: "",
  });

  const canApproveReimbursement =
    user?.role === "admin" || user?.role === "hr_manager";

  const isManagerOrAdmin =
    user?.role === "admin" ||
    user?.role === "hr_manager" ||
    user?.role === "manager";

  const loadExpenses = async () => {
    try {
      const list = await api.getExpenses({
        status: filterStatus || undefined,
        employee_id: !isManagerOrAdmin ? user?.id : undefined,
      });
      setExpenses(list);
    } catch (err) {
      console.error("Failed to load expenses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExpenses();
  }, [filterStatus]);

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createExpense(newExpense);
      setIsModalOpen(false);
      toast.success(
        "Klaim Diajukan",
        `Klaim sebesar ${formatIDR(newExpense.amount)} berhasil dikirim untuk approval.`,
      );
      setNewExpense({
        title: "",
        category: "Travel",
        amount: 500000,
        expense_date: new Date().toISOString().split("T")[0],
        description: "",
      });
      loadExpenses();
    } catch (err: any) {
      toast.error(
        "Gagal Mengajukan Klaim",
        err.message || "Failed to submit expense claim",
      );
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    setActionLoading(id);
    try {
      await api.updateExpenseStatus(
        id,
        status,
        status === "approved"
          ? "Approved for payroll reimbursement"
          : "Exceeds departmental budget quota",
      );
      toast.success(
        status === "approved" ? "Klaim Disetujui" : "Klaim Ditolak",
        `Status reimbursement telah diperbarui.`,
      );
      loadExpenses();
    } catch (err: any) {
      toast.error(
        "Gagal Memperbarui Status",
        err.message || "Failed to update expense status",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(num);
  };

  const totalSubmitted = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalApproved = expenses
    .filter((e) => e.status === "approved" || e.status === "reimbursed")
    .reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
              Financial Operations
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">
              Reimbursements & Claims
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {!isManagerOrAdmin
              ? "My Reimbursements & Claims"
              : "Expense Approvals & Claims Management"}
          </h1>
          <p className="text-xs text-muted-foreground">
            {!isManagerOrAdmin
              ? "Pengajuan klaim pengeluaran pribadi dan pemantauan status reimbursement."
              : "Corporate expenditures approval queue, separation-of-duties enforcement, and financial audit."}
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Submit New Claim</span>
        </Button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">
            Total Claims Volume
          </p>
          <p className="text-xl font-bold text-foreground">
            {formatIDR(totalSubmitted)}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {expenses.length} claims submitted
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">
            Approved for Reimbursement
          </p>
          <p className="text-xl font-bold text-emerald-500">
            {formatIDR(totalApproved)}
          </p>
          <p className="text-[11px] text-emerald-500/80">
            Disbursed with next monthly payroll cycle
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-1">
          <p className="text-xs text-muted-foreground font-medium">
            Pending Review
          </p>
          <p className="text-xl font-bold text-amber-500">
            {expenses.filter((e) => e.status === "pending").length} Awaiting
          </p>
          <p className="text-[11px] text-muted-foreground">
            Requires manager sign-off
          </p>
        </div>
      </div>

      {/* Separation of Duties (SoD) Policy Alert Banner */}
      <div className="flex items-center gap-3 p-3.5 rounded-2xl border border-border bg-card/60 text-xs shadow-sm">
        <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
        <div className="flex-1">
          <span className="font-semibold text-foreground">
            Separation of Duties (SoD) & Governance:
          </span>{" "}
          <span className="text-muted-foreground">
            Persetujuan reimbursement dan pembayaran klaim adalah wewenang
            eksklusif <strong>HR & Finance</strong>. Team Lead / Manager
            berwenang memantau dan mengajukan klaim, namun tidak dapat melakukan
            approval finansial. Tidak ada self-approval.
          </span>
        </div>
      </div>

      {/* Claims Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              Expenditure Ledger
            </h2>
            <p className="text-xs text-muted-foreground">
              Itemized receipts and approvals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="text-xs rounded-xl border border-border bg-muted/40 px-3 py-1.5 text-foreground"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
              <tr>
                <th className="py-3.5 px-4">Claimant</th>
                <th className="py-3.5 px-4">Expense Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {expenses.length > 0 ? (
                expenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {exp.employee_name || user?.full_name}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{exp.title}</p>
                      <p className="text-[11px] text-muted-foreground truncate max-w-xs">
                        {exp.description || "Corporate expense"}
                      </p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px]">
                        {exp.category}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {exp.expense_date}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      {formatIDR(exp.amount)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          exp.status === "approved"
                            ? "primary"
                            : exp.status === "rejected"
                              ? "outline"
                              : "default"
                        }
                        className={`text-[10px] capitalize ${exp.status === "rejected" ? "text-destructive border-destructive/30" : ""}`}
                      >
                        {exp.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {exp.status === "pending" ? (
                        canApproveReimbursement ? (
                          exp.employee_id === user?.id ? (
                            <span
                              className="inline-flex items-center gap-1 text-[10px] text-amber-500 font-medium px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/20"
                              title="Separation of Duties: Anda adalah pemohon klaim ini sehingga tidak dapat melakukan self-approval."
                            >
                              <ShieldAlert className="h-3 w-3" />
                              <span>Self-Claim (SoD Locked)</span>
                            </span>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                size="sm"
                                variant="primary"
                                disabled={actionLoading === exp.id}
                                onClick={() =>
                                  handleUpdateStatus(exp.id, "approved")
                                }
                                className="h-7 px-2 text-[11px] flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3 w-3" />
                                <span>Approve</span>
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                disabled={actionLoading === exp.id}
                                onClick={() => setRejectExpenseId(exp.id)}
                                className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 border-destructive/30 flex items-center gap-1 cursor-pointer"
                              >
                                <X className="h-3 w-3" />
                                <span>Reject</span>
                              </Button>
                            </div>
                          )
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground font-medium px-2 py-1 rounded-md bg-muted/40 border border-border">
                            <span>Awaiting HR Approval</span>
                          </span>
                        )
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {exp.approved_at
                            ? new Date(exp.approved_at).toLocaleDateString()
                            : "-"}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={7}
                    className="py-8 text-center text-xs text-muted-foreground"
                  >
                    No expense claims recorded.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Submit Claim Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Submit Reimbursement Claim</ModalTitle>
            <ModalDescription>
              Record corporate expense receipt for financial audit and payroll
              reimbursement.
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleCreateExpense} className="space-y-3 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Expense Title *
              </label>
              <Input
                required
                value={newExpense.title}
                onChange={(e) =>
                  setNewExpense({ ...newExpense, title: e.target.value })
                }
                placeholder="e.g. AWS Cloud Certification Exam Voucher"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Category *
                </label>
                <select
                  value={newExpense.category}
                  onChange={(e) =>
                    setNewExpense({ ...newExpense, category: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Training">Training & Certs</option>
                  <option value="Travel">Travel & Lodging</option>
                  <option value="Hardware">Hardware & Equipment</option>
                  <option value="Software">Software & SaaS</option>
                  <option value="Meals">Client Entertainment</option>
                  <option value="Medical">Medical / Wellness</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Amount (IDR) *
                </label>
                <Input
                  type="number"
                  min="10000"
                  required
                  value={newExpense.amount}
                  onChange={(e) =>
                    setNewExpense({
                      ...newExpense,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Date Incurred *
              </label>
              <Input
                type="date"
                required
                value={newExpense.expense_date}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    expense_date: e.target.value,
                  })
                }
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Business Justification
              </label>
              <Textarea
                rows={2}
                value={newExpense.description}
                onChange={(e) =>
                  setNewExpense({
                    ...newExpense,
                    description: e.target.value,
                  })
                }
                placeholder="Explain the work relevance of this expenditure..."
                className="text-xs"
              />
            </div>

            <ModalFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="text-xs shadow-md shadow-primary/20"
              >
                Submit Claim
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Rejection Confirmation Dialog */}
      <ConfirmationDialog
        open={!!rejectExpenseId}
        onOpenChange={(open) => !open && setRejectExpenseId(null)}
        title="Decline Reimbursement Claim"
        description="Are you sure you want to reject this expense reimbursement? The employee will be notified with the decline record."
        confirmText="Reject Claim"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (rejectExpenseId) {
            await handleUpdateStatus(rejectExpenseId, "rejected");
            setRejectExpenseId(null);
          }
        }}
      />
    </div>
  );
}
