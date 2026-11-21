use crate::id::gen_id;
use crate::models::*;
use crate::store::Store;
use async_trait::async_trait;
use chrono::Utc;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct MemoryStore {
    inner: Arc<RwLock<MemoryData>>,
}

struct MemoryData {
    departments: HashMap<String, Department>,
    job_titles: HashMap<String, JobTitle>,
    employees: HashMap<String, Employee>,
    attendance: HashMap<String, Attendance>, // key: employee_id:YYYY-MM-DD
    leave_types: HashMap<String, LeaveType>,
    leave_balances: HashMap<String, LeaveBalance>, // key: emp_id:type_id:year
    leave_requests: HashMap<String, LeaveRequest>,
    salary_structures: HashMap<String, SalaryStructure>,
    payroll_periods: HashMap<String, PayrollPeriod>,
    payslips: HashMap<String, Payslip>,
    jobs: HashMap<String, JobPosting>,
    applicants: HashMap<String, Applicant>,
    cycles: HashMap<String, PerformanceCycle>,
    goals: HashMap<String, PerformanceGoal>,
    expenses: HashMap<String, Expense>,
    audit_logs: Vec<AuditLog>,
}

impl MemoryStore {
    pub fn new() -> Self {
        let mut data = MemoryData {
            departments: HashMap::new(),
            job_titles: HashMap::new(),
            employees: HashMap::new(),
            attendance: HashMap::new(),
            leave_types: HashMap::new(),
            leave_balances: HashMap::new(),
            leave_requests: HashMap::new(),
            salary_structures: HashMap::new(),
            payroll_periods: HashMap::new(),
            payslips: HashMap::new(),
            jobs: HashMap::new(),
            applicants: HashMap::new(),
            cycles: HashMap::new(),
            goals: HashMap::new(),
            expenses: HashMap::new(),
            audit_logs: Vec::new(),
        };

        data.seed();

        MemoryStore {
            inner: Arc::new(RwLock::new(data)),
        }
    }
}

impl MemoryData {
    fn seed(&mut self) {
        let now = Utc::now();
        let pass_hash = bcrypt::hash("password123", 4).unwrap_or_else(|_| "hash".to_string());

        // 1. Departments
        let dept_exec = Department {
            id: "dept_exec".to_string(),
            name: "Executive Management".to_string(),
            code: "EXEC".to_string(),
            description: Some("C-Suite & Operations".to_string()),
            manager_id: None,
            manager_name: Some("Alex Thorne".to_string()),
            employee_count: 1,
            created_at: now,
        };
        let dept_hr = Department {
            id: "dept_hr".to_string(),
            name: "Human Resources".to_string(),
            code: "HR".to_string(),
            description: Some("People & Talent".to_string()),
            manager_id: None,
            manager_name: Some("Elena Rostova".to_string()),
            employee_count: 1,
            created_at: now,
        };
        let dept_eng = Department {
            id: "dept_eng".to_string(),
            name: "Software Engineering".to_string(),
            code: "ENG".to_string(),
            description: Some("Core Product & Infra".to_string()),
            manager_id: None,
            manager_name: Some("Marcus Vance".to_string()),
            employee_count: 3,
            created_at: now,
        };

        self.departments.insert(dept_exec.id.clone(), dept_exec);
        self.departments.insert(dept_hr.id.clone(), dept_hr);
        self.departments.insert(dept_eng.id.clone(), dept_eng);

        // 2. Job Titles
        let job_admin = JobTitle {
            id: "job_exec".to_string(),
            title: "Chief Executive Officer".to_string(),
            code: "CEO".to_string(),
            department_id: Some("dept_exec".to_string()),
            level: "executive".to_string(),
            min_salary: 50000000.0,
            max_salary: 100000000.0,
            created_at: now,
        };
        let job_hrdir = JobTitle {
            id: "job_hrdir".to_string(),
            title: "HR Director".to_string(),
            code: "HR-DIR".to_string(),
            department_id: Some("dept_hr".to_string()),
            level: "lead".to_string(),
            min_salary: 20000000.0,
            max_salary: 35000000.0,
            created_at: now,
        };
        let job_lead = JobTitle {
            id: "job_lead".to_string(),
            title: "Tech Lead".to_string(),
            code: "TECH-LEAD".to_string(),
            department_id: Some("dept_eng".to_string()),
            level: "lead".to_string(),
            min_salary: 22000000.0,
            max_salary: 38000000.0,
            created_at: now,
        };
        let job_eng = JobTitle {
            id: "job_eng".to_string(),
            title: "Senior Fullstack Engineer".to_string(),
            code: "SR-ENG".to_string(),
            department_id: Some("dept_eng".to_string()),
            level: "senior".to_string(),
            min_salary: 15000000.0,
            max_salary: 25000000.0,
            created_at: now,
        };

        self.job_titles.insert(job_admin.id.clone(), job_admin);
        self.job_titles.insert(job_hrdir.id.clone(), job_hrdir);
        self.job_titles.insert(job_lead.id.clone(), job_lead);
        self.job_titles.insert(job_eng.id.clone(), job_eng);

        // 3. Employees
        let emps = vec![
            Employee {
                id: "emp_admin".to_string(),
                employee_code: "EMP-001".to_string(),
                email: "admin@ethereal.hr".to_string(),
                password_hash: pass_hash.clone(),
                full_name: "Alex Thorne".to_string(),
                role: ROLE_ADMIN.to_string(),
                department_id: Some("dept_exec".to_string()),
                department_name: Some("Executive Management".to_string()),
                job_title_id: Some("job_exec".to_string()),
                job_title: Some("Chief Executive Officer".to_string()),
                manager_id: None,
                phone: Some("+62 811-0001-001".to_string()),
                address: Some("Jakarta Selatan".to_string()),
                hire_date: "2023-01-15".to_string(),
                status: "active".to_string(),
                avatar_url: None,
                created_at: now,
                updated_at: now,
            },
            Employee {
                id: "emp_hr".to_string(),
                employee_code: "EMP-002".to_string(),
                email: "hr@ethereal.hr".to_string(),
                password_hash: pass_hash.clone(),
                full_name: "Elena Rostova".to_string(),
                role: ROLE_HR_MANAGER.to_string(),
                department_id: Some("dept_hr".to_string()),
                department_name: Some("Human Resources".to_string()),
                job_title_id: Some("job_hrdir".to_string()),
                job_title: Some("HR Director".to_string()),
                manager_id: Some("emp_admin".to_string()),
                phone: Some("+62 811-0002-002".to_string()),
                address: Some("Jakarta Pusat".to_string()),
                hire_date: "2023-03-01".to_string(),
                status: "active".to_string(),
                avatar_url: None,
                created_at: now,
                updated_at: now,
            },
            Employee {
                id: "emp_lead".to_string(),
                employee_code: "EMP-003".to_string(),
                email: "devlead@ethereal.hr".to_string(),
                password_hash: pass_hash.clone(),
                full_name: "Marcus Vance".to_string(),
                role: ROLE_MANAGER.to_string(),
                department_id: Some("dept_eng".to_string()),
                department_name: Some("Software Engineering".to_string()),
                job_title_id: Some("job_lead".to_string()),
                job_title: Some("Tech Lead".to_string()),
                manager_id: Some("emp_admin".to_string()),
                phone: Some("+62 811-0003-003".to_string()),
                address: Some("Bandung".to_string()),
                hire_date: "2023-06-15".to_string(),
                status: "active".to_string(),
                avatar_url: None,
                created_at: now,
                updated_at: now,
            },
            Employee {
                id: "emp_sarah".to_string(),
                employee_code: "EMP-004".to_string(),
                email: "employee@ethereal.hr".to_string(),
                password_hash: pass_hash.clone(),
                full_name: "Sarah Jenkins".to_string(),
                role: ROLE_EMPLOYEE.to_string(),
                department_id: Some("dept_eng".to_string()),
                department_name: Some("Software Engineering".to_string()),
                job_title_id: Some("job_eng".to_string()),
                job_title: Some("Senior Fullstack Engineer".to_string()),
                manager_id: Some("emp_lead".to_string()),
                phone: Some("+62 811-0004-004".to_string()),
                address: Some("Tangerang".to_string()),
                hire_date: "2024-01-10".to_string(),
                status: "active".to_string(),
                avatar_url: None,
                created_at: now,
                updated_at: now,
            },
            Employee {
                id: "emp_saeful".to_string(),
                employee_code: "EMP-005".to_string(),
                email: "saeful@ethereal.hr".to_string(),
                password_hash: pass_hash.clone(),
                full_name: "Saeful Rohman".to_string(),
                role: ROLE_MANAGER.to_string(),
                department_id: Some("dept_eng".to_string()),
                department_name: Some("Software Engineering".to_string()),
                job_title_id: Some("job_lead".to_string()),
                job_title: Some("VP of Engineering".to_string()),
                manager_id: Some("emp_admin".to_string()),
                phone: Some("+62 811-0005-005".to_string()),
                address: Some("Bandung".to_string()),
                hire_date: "2023-02-01".to_string(),
                status: "active".to_string(),
                avatar_url: None,
                created_at: now,
                updated_at: now,
            },
        ];

        for emp in emps {
            self.salary_structures.insert(
                emp.id.clone(),
                SalaryStructure {
                    id: format!("sal_{}", emp.id),
                    employee_id: emp.id.clone(),
                    basic_salary: match emp.role.as_str() {
                        "admin" => 35000000.0,
                        "hr_manager" => 25000000.0,
                        "manager" => 24000000.0,
                        _ => 15000000.0,
                    },
                    housing_allowance: 0.0,
                    transport_allowance: 0.0,
                    meal_allowance: 0.0,
                    tax_rate: 5.0,
                    insurance_rate: 4.0,
                    bank_name: Some("BCA".to_string()),
                    bank_account_number: Some("8829012391".to_string()),
                    bank_account_holder: Some(emp.full_name.clone()),
                    effective_date: "2026-01-01".to_string(),
                    created_at: now,
                },
            );
            self.employees.insert(emp.id.clone(), emp);
        }

        // 4. Leave Types & Balances
        let lt_annual = LeaveType {
            id: "lt_annual".to_string(),
            name: "Cuti Tahunan (Annual Leave)".to_string(),
            code: "ANNUAL".to_string(),
            max_days_per_year: 12,
            requires_attachment: false,
            is_paid: true,
            created_at: now,
        };
        let lt_sick = LeaveType {
            id: "lt_sick".to_string(),
            name: "Cuti Sakit (Sick Leave)".to_string(),
            code: "SICK".to_string(),
            max_days_per_year: 14,
            requires_attachment: true,
            is_paid: true,
            created_at: now,
        };
        self.leave_types.insert(lt_annual.id.clone(), lt_annual);
        self.leave_types.insert(lt_sick.id.clone(), lt_sick);

        // Balances for all employees
        for emp_id in self.employees.keys() {
            let bal_key = format!("{}:lt_annual:2026", emp_id);
            self.leave_balances.insert(
                bal_key,
                LeaveBalance {
                    id: format!("bal_{}", emp_id),
                    employee_id: emp_id.clone(),
                    leave_type_id: "lt_annual".to_string(),
                    leave_type_name: Some("Cuti Tahunan".to_string()),
                    year: 2026,
                    total_days: 12,
                    used_days: 2,
                    pending_days: 0,
                    remaining_days: 10,
                    created_at: now,
                },
            );
        }

        // 5. Payroll Periods
        let period_nov = PayrollPeriod {
            id: "per_2026_11".to_string(),
            name: "November 2026 Payroll".to_string(),
            start_date: "2026-11-01".to_string(),
            end_date: "2026-11-30".to_string(),
            pay_date: "2026-11-28".to_string(),
            status: "draft".to_string(),
            total_disbursement: 0.0,
            processed_by: None,
            processed_at: None,
            created_at: now,
        };
        self.payroll_periods
            .insert(period_nov.id.clone(), period_nov);

        // 6. Recruitment Jobs
        let job1 = JobPosting {
            id: "job_fe_dev".to_string(),
            title: "Senior Rust / Frontend Engineer".to_string(),
            department_id: Some("dept_eng".to_string()),
            department_name: Some("Software Engineering".to_string()),
            location: "Jakarta (Hybrid)".to_string(),
            employment_type: "Full-Time".to_string(),
            experience_level: "Senior".to_string(),
            salary_range: "Rp 18.000.000 - Rp 28.000.000".to_string(),
            description: "Memimpin pengembangan arsitektur performa tinggi".to_string(),
            requirements: "Rust, Astro, React, Tailwind CSS".to_string(),
            status: "published".to_string(),
            applicants_count: 2,
            created_at: now,
        };
        self.jobs.insert(job1.id.clone(), job1);

        // 7. Seed sample expenses
        let exp1 = Expense {
            id: "exp_101".to_string(),
            employee_id: "emp_sarah".to_string(),
            employee_name: Some("Sarah Jenkins".to_string()),
            title: "AWS Cloud Certification Exam".to_string(),
            category: "Training".to_string(),
            amount: 2500000.0,
            expense_date: "2026-11-15".to_string(),
            description: Some("Reimbursement biaya sertifikasi AWS Solution Architect".to_string()),
            receipt_url: None,
            status: "pending".to_string(),
            approver_id: None,
            approver_name: None,
            approved_at: None,
            rejection_reason: None,
            created_at: now,
        };
        self.expenses.insert(exp1.id.clone(), exp1);
    }
}

#[async_trait]
impl Store for MemoryStore {
    // -------------------------------------------------------------
    // Auth & Employees
    // -------------------------------------------------------------
    async fn get_employee_by_email(&self, email: &str) -> Option<Employee> {
        let guard = self.inner.read().await;
        guard
            .employees
            .values()
            .find(|e| e.email.eq_ignore_ascii_case(email))
            .cloned()
    }

    async fn get_employee_by_id(&self, id: &str) -> Option<Employee> {
        let guard = self.inner.read().await;
        guard.employees.get(id).cloned()
    }

    async fn list_employees(
        &self,
        role: Option<&str>,
        department_id: Option<&str>,
        search: Option<&str>,
    ) -> Vec<Employee> {
        let guard = self.inner.read().await;
        guard
            .employees
            .values()
            .filter(|e| {
                if let Some(r) = role {
                    if !r.is_empty() && e.role != r {
                        return false;
                    }
                }
                if let Some(dept) = department_id {
                    if !dept.is_empty() && e.department_id.as_deref() != Some(dept) {
                        return false;
                    }
                }
                if let Some(q) = search {
                    if !q.is_empty() {
                        let q_lower = q.to_lowercase();
                        let match_name = e.full_name.to_lowercase().contains(&q_lower);
                        let match_email = e.email.to_lowercase().contains(&q_lower);
                        let match_code = e.employee_code.to_lowercase().contains(&q_lower);
                        if !match_name && !match_email && !match_code {
                            return false;
                        }
                    }
                }
                true
            })
            .cloned()
            .collect()
    }

    async fn create_employee(&self, mut emp: Employee) -> Result<Employee, String> {
        let mut guard = self.inner.write().await;
        if emp.id.is_empty() {
            emp.id = gen_id("emp");
        }
        if emp.employee_code.is_empty() {
            emp.employee_code = format!("EMP-{:03}", guard.employees.len() + 1);
        }
        if let Some(dept_id) = &emp.department_id {
            if let Some(dept) = guard.departments.get(dept_id) {
                emp.department_name = Some(dept.name.clone());
            }
        }
        if let Some(job_id) = &emp.job_title_id {
            if let Some(job) = guard.job_titles.get(job_id) {
                emp.job_title = Some(job.title.clone());
            }
        }
        guard.employees.insert(emp.id.clone(), emp.clone());
        Ok(emp)
    }

    async fn update_employee(&self, id: &str, mut emp: Employee) -> Result<Employee, String> {
        let mut guard = self.inner.write().await;
        let dept_name = emp
            .department_id
            .as_ref()
            .and_then(|did| guard.departments.get(did).map(|d| d.name.clone()));
        let job_title = emp
            .job_title_id
            .as_ref()
            .and_then(|jid| guard.job_titles.get(jid).map(|j| j.title.clone()));

        if let Some(existing) = guard.employees.get_mut(id) {
            existing.full_name = emp.full_name.clone();
            existing.role = emp.role.clone();
            existing.phone = emp.phone.clone();
            existing.address = emp.address.clone();
            existing.department_id = emp.department_id.clone();
            if let Some(dname) = dept_name {
                existing.department_name = Some(dname.clone());
                emp.department_name = Some(dname);
            }
            existing.job_title_id = emp.job_title_id.clone();
            if let Some(jtitle) = job_title {
                existing.job_title = Some(jtitle.clone());
                emp.job_title = Some(jtitle);
            }
            existing.updated_at = Utc::now();
            emp.updated_at = existing.updated_at;
            Ok(emp)
        } else {
            Err("Employee not found".to_string())
        }
    }

    async fn delete_employee(&self, id: &str) -> Result<(), String> {
        let mut guard = self.inner.write().await;
        if guard.employees.remove(id).is_some() {
            Ok(())
        } else {
            Err("Employee not found".to_string())
        }
    }

    // -------------------------------------------------------------
    // Departments & Job Titles
    // -------------------------------------------------------------
    async fn list_departments(&self) -> Vec<Department> {
        let guard = self.inner.read().await;
        guard.departments.values().cloned().collect()
    }

    async fn list_job_titles(&self) -> Vec<JobTitle> {
        let guard = self.inner.read().await;
        guard.job_titles.values().cloned().collect()
    }

    // -------------------------------------------------------------
    // Attendance (Flexible hours, 8h target + 1h break + 50k OT)
    // -------------------------------------------------------------
    async fn get_today_attendance(&self, employee_id: &str) -> Option<Attendance> {
        let today = Utc::now().format("%Y-%m-%d").to_string();
        let key = format!("{}:{}", employee_id, today);
        let guard = self.inner.read().await;
        guard.attendance.get(&key).cloned()
    }

    async fn clock_in(
        &self,
        employee_id: &str,
        location: Option<&str>,
        notes: Option<&str>,
        ip: Option<&str>,
    ) -> Result<Attendance, String> {
        let mut guard = self.inner.write().await;
        let now = Utc::now();
        let today = now.format("%Y-%m-%d").to_string();
        let key = format!("{}:{}", employee_id, today);

        if let Some(existing) = guard.attendance.get(&key) {
            if existing.clock_in.is_some() {
                return Err("Already clocked in today".to_string());
            }
        }

        let emp_name = guard
            .employees
            .get(employee_id)
            .map(|e| e.full_name.clone());

        let att = Attendance {
            id: gen_id("att"),
            employee_id: employee_id.to_string(),
            employee_name: emp_name,
            date: today,
            clock_in: Some(now),
            clock_out: None,
            total_hours: 0.0,
            break_hours: 0.0,
            work_hours: 0.0,
            overtime_hours: 0.0,
            overtime_pay: 0.0,
            status: "present".to_string(),
            work_location: location.unwrap_or("office").to_string(),
            ip_address: ip.map(|s| s.to_string()),
            notes: notes.map(|s| s.to_string()),
            created_at: now,
            updated_at: now,
        };

        guard.attendance.insert(key, att.clone());
        Ok(att)
    }

    async fn clock_out(&self, employee_id: &str) -> Result<Attendance, String> {
        let mut guard = self.inner.write().await;
        let now = Utc::now();
        let today = now.format("%Y-%m-%d").to_string();
        let key = format!("{}:{}", employee_id, today);

        let mut att = match guard.attendance.get(&key) {
            Some(a) if a.clock_in.is_some() => a.clone(),
            _ => return Err("Cannot clock out without clocking in first".to_string()),
        };

        att.clock_out = Some(now);
        let clock_in = att.clock_in.unwrap();
        let duration = now.signed_duration_since(clock_in);
        let total_hrs = (duration.num_minutes() as f64) / 60.0;
        att.total_hours = (total_hrs * 100.0).round() / 100.0;

        // Break policy: 1h automatic break if shift >= 1h
        let break_hrs = if att.total_hours >= 1.0 { 1.0 } else { 0.0 };
        att.break_hours = break_hrs;

        let effective = (att.total_hours - break_hrs).max(0.0);
        att.work_hours = (effective * 100.0).round() / 100.0;

        // Overtime policy: work beyond 8 hours is paid at Rp 50.000 / hour
        if att.work_hours > 8.0 {
            let ot = ((att.work_hours - 8.0) * 100.0).round() / 100.0;
            att.overtime_hours = ot;
            att.overtime_pay = ot * 50000.0;
            att.status = "overtime".to_string();
        } else if att.work_hours >= 8.0 {
            att.overtime_hours = 0.0;
            att.overtime_pay = 0.0;
            att.status = "completed".to_string();
        } else {
            att.overtime_hours = 0.0;
            att.overtime_pay = 0.0;
            att.status = "under_hours".to_string();
        }

        att.updated_at = now;
        guard.attendance.insert(key, att.clone());
        Ok(att)
    }

    async fn list_attendance(
        &self,
        employee_id: Option<&str>,
        start_date: Option<&str>,
        end_date: Option<&str>,
    ) -> Vec<Attendance> {
        let guard = self.inner.read().await;
        let mut list: Vec<Attendance> = guard
            .attendance
            .values()
            .filter(|a| {
                if let Some(emp) = employee_id {
                    if !emp.is_empty() && a.employee_id != emp {
                        return false;
                    }
                }
                if let Some(s) = start_date {
                    if !s.is_empty() && a.date.as_str() < s {
                        return false;
                    }
                }
                if let Some(e) = end_date {
                    if !e.is_empty() && a.date.as_str() > e {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        list.sort_by(|a, b| b.date.cmp(&a.date));
        list
    }

    // -------------------------------------------------------------
    // Leave & Time-Off
    // -------------------------------------------------------------
    async fn list_leave_types(&self) -> Vec<LeaveType> {
        let guard = self.inner.read().await;
        guard.leave_types.values().cloned().collect()
    }

    async fn get_leave_balances(&self, employee_id: &str, year: i32) -> Vec<LeaveBalance> {
        let guard = self.inner.read().await;
        guard
            .leave_balances
            .values()
            .filter(|b| b.employee_id == employee_id && b.year == year)
            .cloned()
            .collect()
    }

    async fn list_leave_requests(
        &self,
        employee_id: Option<&str>,
        status: Option<&str>,
    ) -> Vec<LeaveRequest> {
        let guard = self.inner.read().await;
        let mut list: Vec<LeaveRequest> = guard
            .leave_requests
            .values()
            .filter(|r| {
                if let Some(emp) = employee_id {
                    if !emp.is_empty() && r.employee_id != emp {
                        return false;
                    }
                }
                if let Some(st) = status {
                    if !st.is_empty() && r.status != st {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        list.sort_by_key(|a| std::cmp::Reverse(a.created_at));
        list
    }

    async fn get_leave_request_by_id(&self, id: &str) -> Option<LeaveRequest> {
        let guard = self.inner.read().await;
        guard.leave_requests.get(id).cloned()
    }

    async fn create_leave_request(&self, mut req: LeaveRequest) -> Result<LeaveRequest, String> {
        let mut guard = self.inner.write().await;
        if req.id.is_empty() {
            req.id = gen_id("leave");
        }
        if let Some(emp) = guard.employees.get(&req.employee_id) {
            req.employee_name = Some(emp.full_name.clone());
            req.department_name = emp.department_name.clone();
        }
        if let Some(lt) = guard.leave_types.get(&req.leave_type_id) {
            req.leave_type_name = Some(lt.name.clone());
        }
        req.status = "pending".to_string();
        req.created_at = Utc::now();
        guard.leave_requests.insert(req.id.clone(), req.clone());
        Ok(req)
    }

    async fn update_leave_request_status(
        &self,
        id: &str,
        status: &str,
        approver_id: &str,
        reason: Option<&str>,
    ) -> Result<LeaveRequest, String> {
        let mut guard = self.inner.write().await;
        let mut req = match guard.leave_requests.get(id) {
            Some(r) => r.clone(),
            None => return Err("Leave request not found".to_string()),
        };

        // Separation of Duties: Submitter cannot approve their own leave
        if req.employee_id == approver_id {
            return Err(
                "Separation of Duties violation: Submitter cannot approve their own leave request."
                    .to_string(),
            );
        }

        let now = Utc::now();
        req.status = status.to_string();
        req.approver_id = Some(approver_id.to_string());
        req.approved_at = Some(now);
        req.rejection_reason = reason.map(|s| s.to_string());
        if let Some(approver) = guard.employees.get(approver_id) {
            req.approver_name = Some(approver.full_name.clone());
        }

        // Deduct from balance if approved
        if status == "approved" {
            let bal_key = format!("{}:{}:2026", req.employee_id, req.leave_type_id);
            if let Some(bal) = guard.leave_balances.get_mut(&bal_key) {
                bal.used_days += req.total_days;
                bal.remaining_days = (bal.total_days - bal.used_days).max(0);
            }
        }

        guard.leave_requests.insert(id.to_string(), req.clone());
        Ok(req)
    }

    // -------------------------------------------------------------
    // Payroll (Direct basic salary input + OT + Reimbursements)
    // -------------------------------------------------------------
    async fn list_payroll_periods(&self) -> Vec<PayrollPeriod> {
        let guard = self.inner.read().await;
        let mut list: Vec<PayrollPeriod> = guard.payroll_periods.values().cloned().collect();
        list.sort_by(|a, b| b.start_date.cmp(&a.start_date));
        list
    }

    async fn create_payroll_period(
        &self,
        mut period: PayrollPeriod,
    ) -> Result<PayrollPeriod, String> {
        let mut guard = self.inner.write().await;
        if period.id.is_empty() {
            period.id = gen_id("per");
        }
        period.created_at = Utc::now();
        guard
            .payroll_periods
            .insert(period.id.clone(), period.clone());
        Ok(period)
    }

    async fn list_payslips(
        &self,
        period_id: Option<&str>,
        employee_id: Option<&str>,
    ) -> Vec<Payslip> {
        let guard = self.inner.read().await;
        guard
            .payslips
            .values()
            .filter(|p| {
                if let Some(per) = period_id {
                    if !per.is_empty() && p.period_id != per {
                        return false;
                    }
                }
                if let Some(emp) = employee_id {
                    if !emp.is_empty() && p.employee_id != emp {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect()
    }

    async fn generate_payslips_for_period(
        &self,
        period_id: &str,
        processed_by: &str,
    ) -> Result<(), String> {
        let mut guard = self.inner.write().await;
        let period_name = match guard.payroll_periods.get(period_id) {
            Some(p) => p.name.clone(),
            None => return Err("Payroll period not found".to_string()),
        };

        let mut total_disbursement = 0.0;
        let employees_list: Vec<Employee> = guard.employees.values().cloned().collect();

        for emp in employees_list {
            let basic_sal = guard
                .salary_structures
                .get(&emp.id)
                .map(|s| s.basic_salary)
                .unwrap_or(15000000.0);

            // Accumulate overtime pay from attendance
            let mut ot_hours = 0.0;
            let mut ot_pay = 0.0;
            for att in guard.attendance.values() {
                if att.employee_id == emp.id {
                    ot_hours += att.overtime_hours;
                    ot_pay += att.overtime_pay;
                }
            }

            // Accumulate approved reimbursements
            let mut reimb_amount = 0.0;
            for exp in guard.expenses.values() {
                if exp.employee_id == emp.id
                    && (exp.status == "approved" || exp.status == "reimbursed")
                {
                    reimb_amount += exp.amount;
                }
            }

            let tot_allowances = ot_pay + reimb_amount;
            let tax = basic_sal * 0.05;
            let insurance = basic_sal * 0.04;
            let tot_deductions = tax + insurance;
            let net = (basic_sal + tot_allowances) - tot_deductions;
            total_disbursement += net;

            let breakdown = serde_json::json!({
                "allowances": {
                    "overtime_pay": ot_pay,
                    "reimbursements": reimb_amount,
                },
                "deductions": {
                    "tax": tax,
                    "insurance": insurance,
                },
                "overtime_hours": ot_hours,
            });

            let ps = Payslip {
                id: gen_id("slip"),
                period_id: period_id.to_string(),
                period_name: Some(period_name.clone()),
                employee_id: emp.id.clone(),
                employee_code: emp.employee_code.clone(),
                employee_name: emp.full_name.clone(),
                department_name: emp.department_name.unwrap_or_else(|| "General".to_string()),
                job_title: emp.job_title.unwrap_or_else(|| "Staff".to_string()),
                basic_salary: basic_sal,
                total_allowances: tot_allowances,
                total_deductions: tot_deductions,
                net_salary: net,
                breakdown,
                status: "issued".to_string(),
                created_at: Utc::now(),
            };

            guard.payslips.insert(ps.id.clone(), ps);
        }

        if let Some(period) = guard.payroll_periods.get_mut(period_id) {
            period.status = "processing".to_string();
            period.total_disbursement = total_disbursement;
            period.processed_by = Some(processed_by.to_string());
            period.processed_at = Some(Utc::now());
        }

        Ok(())
    }

    async fn get_salary_structure(&self, employee_id: &str) -> Option<SalaryStructure> {
        let guard = self.inner.read().await;
        guard.salary_structures.get(employee_id).cloned()
    }

    async fn save_salary_structure(
        &self,
        mut st: SalaryStructure,
    ) -> Result<SalaryStructure, String> {
        let mut guard = self.inner.write().await;
        if st.id.is_empty() {
            st.id = gen_id("sal");
        }
        st.created_at = Utc::now();
        guard
            .salary_structures
            .insert(st.employee_id.clone(), st.clone());
        Ok(st)
    }

    // -------------------------------------------------------------
    // Expenses (Reimbursement - Approval exclusive to HR, No Self-Approval)
    // -------------------------------------------------------------
    async fn list_expenses(&self, employee_id: Option<&str>, status: Option<&str>) -> Vec<Expense> {
        let guard = self.inner.read().await;
        let mut list: Vec<Expense> = guard
            .expenses
            .values()
            .filter(|e| {
                if let Some(emp) = employee_id {
                    if !emp.is_empty() && e.employee_id != emp {
                        return false;
                    }
                }
                if let Some(st) = status {
                    if !st.is_empty() && e.status != st {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect();

        list.sort_by_key(|a| std::cmp::Reverse(a.created_at));
        list
    }

    async fn get_expense_by_id(&self, id: &str) -> Option<Expense> {
        let guard = self.inner.read().await;
        guard.expenses.get(id).cloned()
    }

    async fn create_expense(&self, mut exp: Expense) -> Result<Expense, String> {
        let mut guard = self.inner.write().await;
        if exp.id.is_empty() {
            exp.id = gen_id("exp");
        }
        if let Some(emp) = guard.employees.get(&exp.employee_id) {
            exp.employee_name = Some(emp.full_name.clone());
        }
        exp.status = "pending".to_string();
        exp.created_at = Utc::now();
        guard.expenses.insert(exp.id.clone(), exp.clone());
        Ok(exp)
    }

    async fn update_expense_status(
        &self,
        id: &str,
        status: &str,
        approver_id: &str,
        reason: Option<&str>,
    ) -> Result<Expense, String> {
        let mut guard = self.inner.write().await;
        let mut exp = match guard.expenses.get(id) {
            Some(e) => e.clone(),
            None => return Err("Expense claim not found".to_string()),
        };

        // Separation of Duties: Submitter cannot approve their own expense
        if exp.employee_id == approver_id {
            return Err("Separation of Duties (SoD) violation: Anda tidak dapat menyetujui klaim expense yang diajukan sendiri.".to_string());
        }

        let now = Utc::now();
        exp.status = status.to_string();
        exp.approver_id = Some(approver_id.to_string());
        exp.approved_at = Some(now);
        exp.rejection_reason = reason.map(|s| s.to_string());
        if let Some(approver) = guard.employees.get(approver_id) {
            exp.approver_name = Some(approver.full_name.clone());
        }

        guard.expenses.insert(id.to_string(), exp.clone());
        Ok(exp)
    }

    // -------------------------------------------------------------
    // Recruitment
    // -------------------------------------------------------------
    async fn list_jobs(&self) -> Vec<JobPosting> {
        let guard = self.inner.read().await;
        guard.jobs.values().cloned().collect()
    }

    async fn create_job(&self, mut job: JobPosting) -> Result<JobPosting, String> {
        let mut guard = self.inner.write().await;
        if job.id.is_empty() {
            job.id = gen_id("job");
        }
        job.created_at = Utc::now();
        guard.jobs.insert(job.id.clone(), job.clone());
        Ok(job)
    }

    async fn list_applicants(&self, job_id: Option<&str>, stage: Option<&str>) -> Vec<Applicant> {
        let guard = self.inner.read().await;
        guard
            .applicants
            .values()
            .filter(|a| {
                if let Some(jid) = job_id {
                    if !jid.is_empty() && a.job_posting_id != jid {
                        return false;
                    }
                }
                if let Some(st) = stage {
                    if !st.is_empty() && a.stage != st {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect()
    }

    async fn create_applicant(&self, mut app: Applicant) -> Result<Applicant, String> {
        let mut guard = self.inner.write().await;
        if app.id.is_empty() {
            app.id = gen_id("app");
        }
        app.created_at = Utc::now();
        guard.applicants.insert(app.id.clone(), app.clone());
        Ok(app)
    }

    async fn update_applicant_stage(&self, id: &str, stage: &str) -> Result<Applicant, String> {
        let mut guard = self.inner.write().await;
        if let Some(app) = guard.applicants.get_mut(id) {
            app.stage = stage.to_string();
            Ok(app.clone())
        } else {
            Err("Applicant not found".to_string())
        }
    }

    // -------------------------------------------------------------
    // Performance
    // -------------------------------------------------------------
    async fn list_cycles(&self) -> Vec<PerformanceCycle> {
        let guard = self.inner.read().await;
        guard.cycles.values().cloned().collect()
    }

    async fn list_goals(
        &self,
        employee_id: Option<&str>,
        cycle_id: Option<&str>,
    ) -> Vec<PerformanceGoal> {
        let guard = self.inner.read().await;
        guard
            .goals
            .values()
            .filter(|g| {
                if let Some(emp) = employee_id {
                    if !emp.is_empty() && g.employee_id != emp {
                        return false;
                    }
                }
                if let Some(cyc) = cycle_id {
                    if !cyc.is_empty() && g.cycle_id != cyc {
                        return false;
                    }
                }
                true
            })
            .cloned()
            .collect()
    }

    async fn create_goal(&self, mut goal: PerformanceGoal) -> Result<PerformanceGoal, String> {
        let mut guard = self.inner.write().await;
        if goal.id.is_empty() {
            goal.id = gen_id("goal");
        }
        let now = Utc::now();
        goal.created_at = now;
        goal.updated_at = now;
        guard.goals.insert(goal.id.clone(), goal.clone());
        Ok(goal)
    }

    async fn update_goal(
        &self,
        id: &str,
        mut goal: PerformanceGoal,
    ) -> Result<PerformanceGoal, String> {
        let mut guard = self.inner.write().await;
        if let Some(existing) = guard.goals.get_mut(id) {
            existing.title = goal.title.clone();
            existing.description = goal.description.clone();
            existing.category = goal.category.clone();
            existing.weight = goal.weight;
            existing.target_value = goal.target_value;
            existing.current_value = goal.current_value;
            existing.status = goal.status.clone();
            existing.updated_at = Utc::now();
            goal.updated_at = existing.updated_at;
            Ok(goal)
        } else {
            Err("Goal not found".to_string())
        }
    }

    // -------------------------------------------------------------
    // Audit Logs
    // -------------------------------------------------------------
    async fn log_action(&self, mut log: AuditLog) {
        let mut guard = self.inner.write().await;
        if log.id.is_empty() {
            log.id = gen_id("aud");
        }
        guard.audit_logs.insert(0, log);
    }

    async fn list_audit_logs(&self, limit: usize) -> Vec<AuditLog> {
        let guard = self.inner.read().await;
        guard.audit_logs.iter().take(limit).cloned().collect()
    }

    // -------------------------------------------------------------
    // Dashboard Telemetry
    // -------------------------------------------------------------
    async fn get_dashboard_telemetry(&self) -> DashboardTelemetry {
        let guard = self.inner.read().await;
        let today = Utc::now().format("%Y-%m-%d").to_string();

        let active_today = guard
            .attendance
            .values()
            .filter(|a| a.date == today && a.clock_in.is_some())
            .count() as i32;
        let on_leave_today = guard
            .leave_requests
            .values()
            .filter(|l| l.status == "approved" && l.start_date <= today && l.end_date >= today)
            .count() as i32;
        let pending_leaves = guard
            .leave_requests
            .values()
            .filter(|l| l.status == "pending")
            .count() as i32;
        let pending_expenses = guard
            .expenses
            .values()
            .filter(|e| e.status == "pending")
            .count() as i32;
        let open_jobs = guard
            .jobs
            .values()
            .filter(|j| j.status == "published")
            .count() as i32;
        let active_applicants = guard.applicants.len() as i32;

        DashboardTelemetry {
            total_employees: guard.employees.len() as i32,
            active_today,
            on_leave_today,
            pending_leave_requests: pending_leaves,
            pending_expenses,
            monthly_payroll_total: 120000000.0,
            attendance_rate: 98.4,
            open_jobs,
            active_applicants,
        }
    }
}
