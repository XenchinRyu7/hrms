export interface User {
  id: string;
  employee_code: string;
  email: string;
  full_name: string;
  role: 'admin' | 'hr_manager' | 'manager' | 'employee';
  department_id?: string;
  department_name?: string;
  job_title_id?: string;
  job_title?: string;
  manager_id?: string;
  manager_name?: string;
  phone: string;
  address: string;
  hire_date: string;
  status: 'active' | 'probation' | 'on_leave' | 'terminated';
  avatar_url: string;
  created_at: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  manager_id?: string;
  created_at: string;
}

export interface JobTitle {
  id: string;
  title: string;
  code: string;
  department_id: string;
  level: string;
  min_salary: number;
  max_salary: number;
}

export interface Attendance {
  id: string;
  employee_id: string;
  employee_name?: string;
  date: string;
  clock_in?: string;
  clock_out?: string;
  total_hours: number;
  status: 'on_time' | 'late' | 'early_leave' | 'absent';
  work_location: 'office' | 'remote' | 'field';
  ip_address?: string;
  notes?: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  max_days_per_year: number;
  requires_attachment: boolean;
  is_paid: boolean;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  leave_type_id: string;
  leave_type_name: string;
  year: number;
  total_days: number;
  used_days: number;
  pending_days: number;
  remaining_days: number;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee_name: string;
  department_name: string;
  leave_type_id: string;
  leave_type_name: string;
  start_date: string;
  end_date: string;
  total_days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  approver_id?: string;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface PayrollPeriod {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  pay_date: string;
  status: 'draft' | 'processing' | 'approved' | 'paid';
  total_disbursement: number;
  processed_by?: string;
  processed_at?: string;
}

export interface Payslip {
  id: string;
  period_id: string;
  period_name: string;
  employee_id: string;
  employee_code: string;
  employee_name: string;
  department_name: string;
  job_title: string;
  basic_salary: number;
  total_allowances: number;
  total_deductions: number;
  net_salary: number;
  breakdown: {
    allowances?: Record<string, number>;
    deductions?: Record<string, number>;
  };
  status: 'draft' | 'issued' | 'paid';
  paid_at?: string;
  created_at: string;
}

export interface JobPosting {
  id: string;
  title: string;
  department_id: string;
  department_name?: string;
  location: string;
  employment_type: string;
  experience_level: string;
  salary_range: string;
  description: string;
  requirements: string;
  status: 'draft' | 'published' | 'closed';
  applicant_count: number;
  created_at: string;
}

export interface Applicant {
  id: string;
  job_id: string;
  job_title?: string;
  full_name: string;
  email: string;
  phone: string;
  stage: 'applied' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
  rating: number;
  notes: string;
  created_at: string;
}

export interface PerformanceCycle {
  id: string;
  title: string;
  quarter: string;
  year: number;
  start_date: string;
  end_date: string;
  status: string;
}

export interface PerformanceGoal {
  id: string;
  cycle_id: string;
  employee_id: string;
  employee_name: string;
  title: string;
  description: string;
  category: string;
  metric_type: string;
  target_value: number;
  current_value: number;
  weight: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'behind';
  manager_feedback?: string;
  score: number;
}

export interface Expense {
  id: string;
  employee_id: string;
  employee_name: string;
  title: string;
  category: string;
  amount: number;
  expense_date: string;
  description: string;
  receipt_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'reimbursed';
  approver_id?: string;
  approver_name?: string;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity: string;
  entity_id: string;
  details: Record<string, any>;
  ip_address: string;
  created_at: string;
}

export interface DashboardTelemetry {
  total_employees: number;
  active_today: number;
  on_leave_today: number;
  open_jobs: number;
  monthly_payroll: number;
  pending_approvals: number;
  attendance_rate: number;
  turnover_rate: number;
  department_stats: { department: string; count: number; percentage: number }[];
  attendance_trend: { label: string; present: number; late: number; absent: number }[];
  payroll_trend: { month: string; disbursement: number }[];
  recent_audit_logs: AuditLog[];
}
