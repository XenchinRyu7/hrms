import React, { useEffect, useState } from "react";
import {
  CalendarOff,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  AlertCircle,
  FileCheck,
  Check,
  X,
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
import type { LeaveType, LeaveBalance, LeaveRequest } from "../../lib/types";

export function LeaveView() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [types, setTypes] = useState<LeaveType[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // New Request Form Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectTargetId, setRejectTargetId] = useState<string | null>(null);
  const [newRequest, setNewRequest] = useState({
    leave_type_id: "",
    start_date: "",
    end_date: "",
    total_days: 1,
    reason: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState("");

  const isManagerOrAdmin =
    user?.role === "admin" ||
    user?.role === "hr_manager" ||
    user?.role === "manager";

  const loadData = async () => {
    try {
      const [balList, typeList, reqList] = await Promise.all([
        api.getLeaveBalances(user?.id),
        api.getLeaveTypes(),
        api.getLeaveRequests({
          status: filterStatus || undefined,
          employee_id: !isManagerOrAdmin ? user?.id : undefined,
        }),
      ]);
      const validBal = Array.isArray(balList) ? balList : [];
      const validType = Array.isArray(typeList) ? typeList : [];
      const validReq = Array.isArray(reqList) ? reqList : [];
      setBalances(validBal);
      setTypes(validType);
      setRequests(validReq);
      if (validType.length > 0 && !newRequest.leave_type_id) {
        setNewRequest((prev) => ({ ...prev, leave_type_id: validType[0].id }));
      }
    } catch (err) {
      console.error("Failed to load leave data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createLeaveRequest(newRequest);
      setIsModalOpen(false);
      toast.success(
        "Pengajuan Cuti Terkirim",
        `${newRequest.total_days} hari diajukan untuk persetujuan.`,
      );
      setNewRequest({
        leave_type_id: types[0]?.id || "",
        start_date: "",
        end_date: "",
        total_days: 1,
        reason: "",
      });
      loadData();
    } catch (err: any) {
      const msg = err.message || "Failed to submit leave request";
      toast.error("Pengajuan Gagal", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateStatus = async (
    id: string,
    status: "approved" | "rejected",
  ) => {
    setActionLoading(id);
    try {
      await api.updateLeaveRequestStatus(
        id,
        status,
        status === "approved"
          ? "Approved by manager"
          : "Declined per operational schedule",
      );
      toast.info(
        status === "approved" ? "Cuti Disetujui" : "Cuti Ditolak",
        `Permohonan cuti telah diperbarui dalam database.`,
      );
      loadData();
    } catch (err: any) {
      toast.error(
        "Gagal Memperbarui Cuti",
        err.message || "Failed to update leave request",
      );
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="primary" className="text-[10px]">
            Approved
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="text-[10px] text-destructive border-destructive/30"
          >
            Rejected
          </Badge>
        );
      default:
        return (
          <Badge variant="default" className="text-[10px]">
            Pending Approval
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
              Time-Off & Leave
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">
              Accrual Year 2026
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Leave & Absence Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Leave balance allocation, vacation scheduling, and manager approval
            flows.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="text-xs flex items-center gap-1.5 self-start sm:self-auto shadow-md shadow-primary/20"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Request Leave</span>
        </Button>
      </div>

      {/* Balance Quota Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {balances.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-card-foreground truncate">
                {b.leave_type_name}
              </span>
              <Badge variant="outline" className="text-[10px] font-mono">
                {b.year}
              </Badge>
            </div>

            <div>
              <p className="text-2xl font-bold tracking-tight text-foreground">
                {b.remaining_days}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  days left
                </span>
              </p>
              <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-primary h-1.5 rounded-full transition-all"
                  style={{
                    width: `${Math.min(100, (b.used_days / (b.total_days || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-1 border-t border-border">
              <span>Used: {b.used_days}d</span>
              <span>Pending: {b.pending_days}d</span>
              <span>Total: {b.total_days}d</span>
            </div>
          </div>
        ))}
      </div>

      {/* Leave Requests Table */}
      <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-card-foreground">
              Leave Requests & Approvals
            </h2>
            <p className="text-xs text-muted-foreground">
              Historical records and pending review requests
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
                <th className="py-3.5 px-4">Employee</th>
                <th className="py-3.5 px-4">Leave Type</th>
                <th className="py-3.5 px-4">Period</th>
                <th className="py-3.5 px-4">Days</th>
                <th className="py-3.5 px-4">Reason</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requests.length > 0 ? (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-muted/30 transition">
                    <td className="py-3 px-4">
                      <p className="font-semibold text-foreground">
                        {req.employee_name || "Staff"}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {req.department_name || "Software Engineering"}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      {req.leave_type_name}
                    </td>
                    <td className="py-3 px-4 font-mono text-muted-foreground">
                      {req.start_date}{" "}
                      <span className="text-muted-foreground/60">&rarr;</span>{" "}
                      {req.end_date}
                    </td>
                    <td className="py-3 px-4 font-semibold text-foreground">
                      {req.total_days} days
                    </td>
                    <td className="py-3 px-4 text-muted-foreground max-w-xs truncate">
                      {req.reason}
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(req.status)}</td>
                    <td className="py-3 px-4 text-right">
                      {req.status === "pending" && isManagerOrAdmin ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="primary"
                            disabled={actionLoading === req.id}
                            onClick={() =>
                              handleUpdateStatus(req.id, "approved")
                            }
                            className="h-7 px-2 text-[11px] flex items-center gap-1"
                          >
                            <Check className="h-3 w-3" />
                            <span>Approve</span>
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={actionLoading === req.id}
                            onClick={() => setRejectTargetId(req.id)}
                            className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 border-destructive/30 flex items-center gap-1"
                          >
                            <X className="h-3 w-3" />
                            <span>Reject</span>
                          </Button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {req.approved_at
                            ? new Date(req.approved_at).toLocaleDateString()
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
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Leave Modal */}
      <Modal open={isModalOpen} onOpenChange={setIsModalOpen}>
        <ModalContent className="max-w-md">
          <ModalHeader>
            <ModalTitle>Submit Leave Request</ModalTitle>
            <ModalDescription>
              Submit quota deduction for manager approval and roster sync.
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleCreateRequest} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Leave Type *
              </label>
              <select
                required
                value={newRequest.leave_type_id}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    leave_type_id: e.target.value,
                  })
                }
                className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} (Max {t.max_days_per_year}d/yr)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Start Date *
                </label>
                <Input
                  type="date"
                  required
                  value={newRequest.start_date}
                  onChange={(e) =>
                    setNewRequest({
                      ...newRequest,
                      start_date: e.target.value,
                    })
                  }
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  End Date *
                </label>
                <Input
                  type="date"
                  required
                  value={newRequest.end_date}
                  onChange={(e) =>
                    setNewRequest({ ...newRequest, end_date: e.target.value })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Total Working Days *
              </label>
              <Input
                type="number"
                min="1"
                max="90"
                required
                value={newRequest.total_days}
                onChange={(e) =>
                  setNewRequest({
                    ...newRequest,
                    total_days: parseInt(e.target.value) || 1,
                  })
                }
                className="text-xs"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground">
                Reason & Coverage Handover *
              </label>
              <Textarea
                required
                rows={3}
                value={newRequest.reason}
                onChange={(e) =>
                  setNewRequest({ ...newRequest, reason: e.target.value })
                }
                placeholder="Provide context, emergency contact, or handover colleague..."
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
                disabled={submitting}
                className="text-xs shadow-md shadow-primary/20"
              >
                {submitting ? "Submitting..." : "Send Request for Approval"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Rejection Confirmation Dialog */}
      <ConfirmationDialog
        open={!!rejectTargetId}
        onOpenChange={(open) => !open && setRejectTargetId(null)}
        title="Reject Leave Request"
        description="Are you sure you want to decline this leave request? The employee's pending balance will be released and notified."
        confirmText="Confirm Rejection"
        cancelText="Cancel"
        variant="destructive"
        onConfirm={async () => {
          if (rejectTargetId) {
            await handleUpdateStatus(rejectTargetId, "rejected");
            setRejectTargetId(null);
          }
        }}
      />
    </div>
  );
}
