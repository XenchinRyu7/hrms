import type {
  User,
  Department,
  JobTitle,
  Attendance,
  LeaveType,
  LeaveBalance,
  LeaveRequest,
  PayrollPeriod,
  Payslip,
  JobPosting,
  Applicant,
  PerformanceCycle,
  PerformanceGoal,
  Expense,
  AuditLog,
  DashboardTelemetry,
} from "./types";

function getRequestUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;

  // 1. In server runtime / functions, use internal service binding injected by Vercel
  if (typeof process !== "undefined" && process.env?.BACKEND_URL) {
    const backendBase = process.env.BACKEND_URL.replace(/\/$/, "");
    return `${backendBase}/api/v1${cleanEndpoint}`;
  }

  // 2. Client-side browser runtime: use public path prefix routed via Vercel rewrites (/api/v1)
  const publicBase =
    (typeof import.meta !== "undefined" &&
      (import.meta as any).env?.PUBLIC_API_URL) ||
    (typeof window !== "undefined" && window.location?.port === "4321"
      ? "http://localhost:8080/api/v1"
      : "/api/v1");

  return `${publicBase.replace(/\/$/, "")}${cleanEndpoint}`;
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("ethereal_auth_token");
}

export function setAuthSession(token: string, user: User) {
  if (typeof window === "undefined") return;
  localStorage.setItem("ethereal_auth_token", token);
  localStorage.setItem("ethereal_user", JSON.stringify(user));
}

export function clearAuthSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("ethereal_auth_token");
  localStorage.removeItem("ethereal_user");
}

export function getStoredUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("ethereal_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const res = await fetch(getRequestUrl(endpoint), {
    ...options,
    headers,
  });

  if (!res.ok) {
    let errorMsg = `Request failed: ${res.statusText}`;
    try {
      const errJson = await res.json();
      if (errJson.error) errorMsg = errJson.error;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  }

  return res.json();
}

export const api = {
  // Auth
  login: (email: string, password: string) =>
    request<{ token: string; user: User; expires_at: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getMe: () => request<User>("/auth/me"),
  updateProfile: (data: {
    phone?: string;
    address?: string;
    avatar_url?: string;
  }) =>
    request<User>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  changePassword: (data: { current_password?: string; new_password: string }) =>
    request<{ message: string }>("/auth/password", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Dashboard Telemetry
  getDashboardTelemetry: () =>
    request<DashboardTelemetry>("/dashboard/telemetry"),

  // Employees & Depts
  getEmployees: (params?: {
    role?: string;
    department_id?: string;
    search?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.role) q.set("role", params.role);
    if (params?.department_id) q.set("department_id", params.department_id);
    if (params?.search) q.set("search", params.search);
    return request<User[]>(`/employees?${q.toString()}`);
  },
  getEmployee: (id: string) => request<User>(`/employees/${id}`),
  createEmployee: (emp: Partial<User>) =>
    request<User>("/employees", {
      method: "POST",
      body: JSON.stringify(emp),
    }),
  updateEmployee: (id: string, emp: Partial<User>) =>
    request<User>(`/employees/${id}`, {
      method: "PUT",
      body: JSON.stringify(emp),
    }),
  deleteEmployee: (id: string) =>
    request<{ message: string }>(`/employees/${id}`, { method: "DELETE" }),
  getDepartments: () => request<Department[]>("/departments"),
  getJobTitles: () => request<JobTitle[]>("/job-titles"),

  // Attendance
  getTodayAttendance: () => request<Attendance | null>("/attendance/today"),
  clockIn: (work_location: string, notes?: string) =>
    request<Attendance>("/attendance/clock-in", {
      method: "POST",
      body: JSON.stringify({ work_location, notes: notes || "" }),
    }),
  clockOut: () =>
    request<Attendance>("/attendance/clock-out", {
      method: "POST",
    }),
  getAttendanceHistory: (params?: {
    employee_id?: string;
    start_date?: string;
    end_date?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.employee_id) q.set("employee_id", params.employee_id);
    if (params?.start_date) q.set("start_date", params.start_date);
    if (params?.end_date) q.set("end_date", params.end_date);
    return request<Attendance[]>(`/attendance/history?${q.toString()}`);
  },

  // Leave
  getLeaveTypes: () => request<LeaveType[]>("/leave/types"),
  getLeaveBalances: (employee_id?: string) => {
    const q = employee_id ? `?employee_id=${employee_id}` : "";
    return request<LeaveBalance[]>(`/leave/balances${q}`);
  },
  getLeaveRequests: (params?: { employee_id?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.employee_id) q.set("employee_id", params.employee_id);
    if (params?.status) q.set("status", params.status);
    return request<LeaveRequest[]>(`/leave/requests?${q.toString()}`);
  },
  createLeaveRequest: (data: {
    leave_type_id: string;
    start_date: string;
    end_date: string;
    total_days: number;
    reason: string;
  }) =>
    request<LeaveRequest>("/leave/requests", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateLeaveRequestStatus: (id: string, status: string, reason?: string) =>
    request<LeaveRequest>(`/leave/requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason: reason || "" }),
    }),

  // Payroll
  getPayrollPeriods: () => request<PayrollPeriod[]>("/payroll/periods"),
  createPayrollPeriod: (data: Partial<PayrollPeriod>) =>
    request<PayrollPeriod>("/payroll/periods", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getSalaryStructure: (employee_id: string) =>
    request<any>(`/payroll/salary-structure/${employee_id}`),
  saveSalaryStructure: (data: any) =>
    request<any>("/payroll/salary-structure", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getPayslips: (params?: { period_id?: string; employee_id?: string }) => {
    const q = new URLSearchParams();
    if (params?.period_id) q.set("period_id", params.period_id);
    if (params?.employee_id) q.set("employee_id", params.employee_id);
    return request<Payslip[]>(`/payroll/payslips?${q.toString()}`);
  },
  generatePayslips: (period_id: string) =>
    request<{ message: string }>(`/payroll/periods/${period_id}/generate`, {
      method: "POST",
    }),

  // Recruitment
  getJobPostings: () => request<JobPosting[]>("/recruitment/jobs"),
  createJobPosting: (data: Partial<JobPosting>) =>
    request<JobPosting>("/recruitment/jobs", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getApplicants: (params?: { job_id?: string; stage?: string }) => {
    const q = new URLSearchParams();
    if (params?.job_id) q.set("job_id", params.job_id);
    if (params?.stage) q.set("stage", params.stage);
    return request<Applicant[]>(`/recruitment/applicants?${q.toString()}`);
  },
  createApplicant: (data: Partial<Applicant>) =>
    request<Applicant>("/recruitment/applicants", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateApplicantStage: (id: string, stage: string) =>
    request<{ message: string }>(`/recruitment/applicants/${id}/stage`, {
      method: "PATCH",
      body: JSON.stringify({ stage }),
    }),

  // Performance
  getPerformanceCycles: () =>
    request<PerformanceCycle[]>("/performance/cycles"),
  getPerformanceGoals: (params?: {
    employee_id?: string;
    cycle_id?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.employee_id) q.set("employee_id", params.employee_id);
    if (params?.cycle_id) q.set("cycle_id", params.cycle_id);
    return request<PerformanceGoal[]>(`/performance/goals?${q.toString()}`);
  },
  createPerformanceGoal: (goal: Partial<PerformanceGoal>) =>
    request<PerformanceGoal>("/performance/goals", {
      method: "POST",
      body: JSON.stringify(goal),
    }),
  updatePerformanceGoal: (id: string, goal: Partial<PerformanceGoal>) =>
    request<PerformanceGoal>(`/performance/goals/${id}`, {
      method: "PUT",
      body: JSON.stringify(goal),
    }),

  // Expenses
  getExpenses: (params?: { employee_id?: string; status?: string }) => {
    const q = new URLSearchParams();
    if (params?.employee_id) q.set("employee_id", params.employee_id);
    if (params?.status) q.set("status", params.status);
    return request<Expense[]>(`/expenses?${q.toString()}`);
  },
  createExpense: (data: {
    title: string;
    category: string;
    amount: number;
    expense_date: string;
    description?: string;
  }) =>
    request<Expense>("/expenses", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateExpenseStatus: (id: string, status: string, reason?: string) =>
    request<Expense>(`/expenses/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status, reason: reason || "" }),
    }),

  // Audit Logs
  getAuditLogs: (limit?: number) =>
    request<AuditLog[]>(`/audit/logs?limit=${limit || 50}`),
};
