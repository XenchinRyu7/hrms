-- ==============================================================================
-- ETHEREAL HRMS - COMPREHENSIVE SEED DATA
-- Default password for all seed accounts: "password123"
-- Bcrypt hash: $2a$10$wN36.4q/24UeI2q6hVvF5e6QkH97p5s9e47G2h56j4K1v0L98m7Ni
-- ==============================================================================

-- 1. DEPARTMENTS
INSERT INTO departments (id, name, code, description) VALUES
('11111111-1111-1111-1111-111111111101', 'Executive Management', 'EXEC', 'C-Suite leadership and corporate strategy'),
('11111111-1111-1111-1111-111111111102', 'Human Resources', 'HR', 'People operations, talent acquisition, culture and compliance'),
('11111111-1111-1111-1111-111111111103', 'Software Engineering', 'ENG', 'Full-stack software engineering, infrastructure and AI systems'),
('11111111-1111-1111-1111-111111111104', 'Product & Design', 'PRD', 'Product management, UI/UX research, and design systems'),
('11111111-1111-1111-1111-111111111105', 'Finance & Operations', 'FIN', 'Accounting, financial planning, payroll, and corporate operations')
ON CONFLICT (name) DO NOTHING;

-- 2. JOB TITLES
INSERT INTO job_titles (id, title, code, department_id, level, min_salary, max_salary) VALUES
('22222222-2222-2222-2222-222222222201', 'Chief Executive Officer', 'EXEC-CEO', '11111111-1111-1111-1111-111111111101', 'executive', 30000000, 60000000),
('22222222-2222-2222-2222-222222222202', 'Head of Human Resources', 'HR-HEAD', '11111111-1111-1111-1111-111111111102', 'lead', 18000000, 32000000),
('22222222-2222-2222-2222-222222222203', 'HR Generalist & Talent Ops', 'HR-GEN', '11111111-1111-1111-1111-111111111102', 'mid', 9000000, 16000000),
('22222222-2222-2222-2222-222222222204', 'VP of Engineering', 'ENG-VP', '11111111-1111-1111-1111-111111111103', 'executive', 28000000, 50000000),
('22222222-2222-2222-2222-222222222205', 'Staff Software Engineer', 'ENG-STAFF', '11111111-1111-1111-1111-111111111103', 'lead', 20000000, 35000000),
('22222222-2222-2222-2222-222222222206', 'Senior Fullstack Engineer', 'ENG-SR-FS', '11111111-1111-1111-1111-111111111103', 'senior', 15000000, 26000000),
('22222222-2222-2222-2222-222222222207', 'Lead Product Designer', 'DES-LEAD', '11111111-1111-1111-1111-111111111104', 'lead', 16000000, 28000000),
('22222222-2222-2222-2222-222222222208', 'Senior Financial Analyst', 'FIN-SR-ANL', '11111111-1111-1111-1111-111111111105', 'senior', 12000000, 22000000)
ON CONFLICT (code) DO NOTHING;

-- 3. EMPLOYEES
-- Password for all is: "password123"
INSERT INTO employees (id, employee_code, email, password_hash, full_name, role, department_id, job_title_id, phone, address, hire_date, status, avatar_url) VALUES
('33333333-3333-3333-3333-333333333301', 'EMP-001', 'admin@ethereal.hr', '$2a$10$0s9hFkE5y5yvA170Yh/0QOn0Z3p/P5tYq/YJ7L4d2pA5/t.Jk4uSm', 'Alex Thorne (Admin)', 'admin', '11111111-1111-1111-1111-111111111101', '22222222-2222-2222-2222-222222222201', '+62 811-2345-6789', 'Sudirman Central Business District, Jakarta', '2023-01-10', 'active', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'),
('33333333-3333-3333-3333-333333333302', 'EMP-002', 'hr@ethereal.hr', '$2a$10$0s9hFkE5y5yvA170Yh/0QOn0Z3p/P5tYq/YJ7L4d2pA5/t.Jk4uSm', 'Elena Rostova (HR Lead)', 'hr_manager', '11111111-1111-1111-1111-111111111102', '22222222-2222-2222-2222-222222222202', '+62 812-3456-7890', 'Kuningan, Jakarta Selatan', '2023-03-15', 'active', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150'),
('33333333-3333-3333-3333-333333333303', 'EMP-003', 'devlead@ethereal.hr', '$2a$10$0s9hFkE5y5yvA170Yh/0QOn0Z3p/P5tYq/YJ7L4d2pA5/t.Jk4uSm', 'Marcus Vance (Tech Lead)', 'manager', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222205', '+62 813-4567-8901', 'BSD City, Tangerang Selatan', '2023-06-01', 'active', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'),
('33333333-3333-3333-3333-333333333304', 'EMP-004', 'employee@ethereal.hr', '$2a$10$0s9hFkE5y5yvA170Yh/0QOn0Z3p/P5tYq/YJ7L4d2pA5/t.Jk4uSm', 'Sarah Jenkins (Fullstack)', 'employee', '11111111-1111-1111-1111-111111111103', '22222222-2222-2222-2222-222222222206', '+62 814-5678-9012', 'Kemang, Jakarta Selatan', '2024-01-15', 'active', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'),
('33333333-3333-3333-3333-333333333305', 'EMP-005', 'designer@ethereal.hr', '$2a$10$0s9hFkE5y5yvA170Yh/0QOn0Z3p/P5tYq/YJ7L4d2pA5/t.Jk4uSm', 'Kenji Sato (Lead Designer)', 'employee', '11111111-1111-1111-1111-111111111104', '22222222-2222-2222-2222-222222222207', '+62 815-6789-0123', 'Menteng, Jakarta Pusat', '2024-02-01', 'active', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150')
ON CONFLICT (email) DO NOTHING;

-- Update manager assignments
UPDATE departments SET manager_id = '33333333-3333-3333-3333-333333333301' WHERE code = 'EXEC';
UPDATE departments SET manager_id = '33333333-3333-3333-3333-333333333302' WHERE code = 'HR';
UPDATE departments SET manager_id = '33333333-3333-3333-3333-333333333303' WHERE code = 'ENG';

UPDATE employees SET manager_id = '33333333-3333-3333-3333-333333333303' WHERE id IN ('33333333-3333-3333-3333-333333333304', '33333333-3333-3333-3333-333333333305');

-- 4. LEAVE TYPES
INSERT INTO leave_types (id, name, code, max_days_per_year, requires_attachment, is_paid) VALUES
('44444444-4444-4444-4444-444444444401', 'Annual Paid Leave', 'ANNUAL', 12, false, true),
('44444444-4444-4444-4444-444444444402', 'Sick Leave', 'SICK', 14, true, true),
('44444444-4444-4444-4444-444444444403', 'Maternity / Paternity Leave', 'PARENTAL', 90, true, true),
('44444444-4444-4444-4444-444444444404', 'Compassionate & Urgent', 'URGENT', 3, false, true),
('44444444-4444-4444-4444-444444444405', 'Unpaid Leave', 'UNPAID', 30, false, false)
ON CONFLICT (code) DO NOTHING;

-- 5. LEAVE BALANCES FOR EMPLOYEES
INSERT INTO leave_balances (employee_id, leave_type_id, year, total_days, used_days, pending_days)
SELECT e.id, lt.id, 2026, lt.max_days_per_year, 
       (CASE WHEN lt.code = 'ANNUAL' THEN 3 ELSE 0 END),
       (CASE WHEN lt.code = 'ANNUAL' THEN 1 ELSE 0 END)
FROM employees e
CROSS JOIN leave_types lt
ON CONFLICT (employee_id, leave_type_id, year) DO NOTHING;

-- 6. LEAVE REQUESTS
INSERT INTO leave_requests (id, employee_id, leave_type_id, start_date, end_date, total_days, reason, status, approver_id, approved_at) VALUES
('55555555-5555-5555-5555-555555555501', '33333333-3333-3333-3333-333333333304', '44444444-4444-4444-4444-444444444401', '2026-11-20', '2026-11-21', 2, 'Attending family wedding out of town', 'pending', '33333333-3333-3333-3333-333333333303', NULL),
('55555555-5555-5555-5555-555555555502', '33333333-3333-3333-3333-333333333305', '44444444-4444-4444-4444-444444444402', '2026-11-05', '2026-11-06', 2, 'Doctor consultation and rest (flu)', 'approved', '33333333-3333-3333-3333-333333333302', '2026-11-04 14:00:00+07')
ON CONFLICT (id) DO NOTHING;

-- 7. ATTENDANCE SEEDS (Recent records)
INSERT INTO attendance (employee_id, date, clock_in, clock_out, total_hours, status, work_location) VALUES
('33333333-3333-3333-3333-333333333301', CURRENT_DATE, CURRENT_DATE + TIME '08:45:00', CURRENT_DATE + TIME '17:30:00', 8.75, 'on_time', 'office'),
('33333333-3333-3333-3333-333333333302', CURRENT_DATE, CURRENT_DATE + TIME '08:55:00', CURRENT_DATE + TIME '17:45:00', 8.83, 'on_time', 'office'),
('33333333-3333-3333-3333-333333333303', CURRENT_DATE, CURRENT_DATE + TIME '09:02:00', NULL, 0, 'on_time', 'remote'),
('33333333-3333-3333-3333-333333333304', CURRENT_DATE, CURRENT_DATE + TIME '09:18:00', NULL, 0, 'late', 'remote'),
('33333333-3333-3333-3333-333333333305', CURRENT_DATE, CURRENT_DATE + TIME '08:50:00', CURRENT_DATE + TIME '17:20:00', 8.50, 'on_time', 'office')
ON CONFLICT (employee_id, date) DO NOTHING;

-- 8. SALARY STRUCTURES
INSERT INTO salary_structures (employee_id, basic_salary, housing_allowance, transport_allowance, meal_allowance, tax_rate, insurance_rate, bank_name, bank_account_number, bank_account_holder) VALUES
('33333333-3333-3333-3333-333333333301', 45000000, 5000000, 3000000, 2000000, 15.0, 4.0, 'Bank Central Asia', '8820192831', 'Alex Thorne'),
('33333333-3333-3333-3333-333333333302', 25000000, 3000000, 2000000, 1500000, 10.0, 4.0, 'Bank Mandiri', '122009847162', 'Elena Rostova'),
('33333333-3333-3333-3333-333333333303', 28000000, 3500000, 2000000, 1500000, 10.0, 4.0, 'Bank Central Asia', '5420918234', 'Marcus Vance'),
('33333333-3333-3333-3333-333333333304', 18000000, 2000000, 1500000, 1200000, 5.0, 4.0, 'Bank BNI', '0928172635', 'Sarah Jenkins'),
('33333333-3333-3333-3333-333333333305', 20000000, 2500000, 1500000, 1200000, 5.0, 4.0, 'Bank Central Asia', '6729102938', 'Kenji Sato')
ON CONFLICT (employee_id) DO NOTHING;

-- 9. PAYROLL PERIOD & PAYSLIPS
INSERT INTO payroll_periods (id, name, start_date, end_date, pay_date, status, total_disbursement, processed_by, processed_at) VALUES
('66666666-6666-6666-6666-666666666601', 'October 2026 Cycle', '2026-10-01', '2026-10-31', '2026-10-28', 'paid', 148500000, '33333333-3333-3333-3333-333333333302', '2026-10-27 16:00:00+07')
ON CONFLICT (id) DO NOTHING;

INSERT INTO payslips (period_id, employee_id, basic_salary, total_allowances, total_deductions, net_salary, breakdown, status, paid_at) VALUES
('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333304', 18000000, 4700000, 1620000, 21080000, '{"allowances": {"housing": 2000000, "transport": 1500000, "meal": 1200000}, "deductions": {"tax": 900000, "bpjs": 720000}}'::jsonb, 'paid', '2026-10-28 10:00:00+07'),
('66666666-6666-6666-6666-666666666601', '33333333-3333-3333-3333-333333333305', 20000000, 5200000, 1800000, 23400000, '{"allowances": {"housing": 2500000, "transport": 1500000, "meal": 1200000}, "deductions": {"tax": 1000000, "bpjs": 800000}}'::jsonb, 'paid', '2026-10-28 10:00:00+07')
ON CONFLICT (period_id, employee_id) DO NOTHING;

-- 10. JOB POSTINGS & APPLICANTS (ATS)
INSERT INTO job_postings (id, title, department_id, location, employment_type, experience_level, salary_range, description, requirements, status) VALUES
('77777777-7777-7777-7777-777777777701', 'Senior AI / ML Platform Engineer', '11111111-1111-1111-1111-111111111103', 'Hybrid (Jakarta)', 'Full-time', 'Senior Level', 'Rp 25.000.000 - Rp 40.000.000', 'Architecting autonomous agent workflows, vector search pipelines, and enterprise telemetry systems.', 'Minimum 5+ years building distributed Go or Python services, LLM integrations, and Kubernetes orchestration.', 'published'),
('77777777-7777-7777-7777-777777777702', 'Design System Architect', '11111111-1111-1111-1111-111111111104', 'Remote', 'Full-time', 'Lead Level', 'Rp 22.000.000 - Rp 35.000.000', 'Lead Ethereal UI evolution, OKLCH color tokenization, and multi-tenant enterprise theming.', 'Deep mastery of Tailwind CSS v4, Radix UI, Figma Code Connect, and modern micro-interactions.', 'published')
ON CONFLICT (id) DO NOTHING;

INSERT INTO applicants (id, job_id, full_name, email, phone, stage, rating, notes) VALUES
('88888888-8888-8888-8888-888888888801', '77777777-7777-7777-7777-777777777701', 'Rian Pratama', 'rian.pratama@example.com', '+62 811-9988-7766', 'interview', 5, 'Exceptional Go backend skills, built custom Raft consensus in prior role.'),
('88888888-8888-8888-8888-888888888802', '77777777-7777-7777-7777-777777777701', 'Amira Zahra', 'amira.zahra@example.com', '+62 812-7766-5544', 'screening', 4, 'Solid machine learning background at top fintech unicorn.'),
('88888888-8888-8888-8888-888888888803', '77777777-7777-7777-7777-777777777702', 'Devi Anggraini', 'devi.a@example.com', '+62 813-1122-3344', 'offer', 5, 'Portfolio exhibits stellar dark-mode telemetry consoles matching Ethereal UI standards.')
ON CONFLICT (id) DO NOTHING;

-- 11. PERFORMANCE REVIEWS & GOALS
INSERT INTO performance_cycles (id, title, quarter, year, start_date, end_date, status) VALUES
('99999999-9999-9999-9999-999999999901', 'Q4 2026 Engineering & Product Cycle', 'Q4', 2026, '2026-10-01', '2026-12-31', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO performance_goals (cycle_id, employee_id, title, description, category, metric_type, target_value, current_value, weight, status, score) VALUES
('99999999-9999-9999-9999-999999999901', '33333333-3333-3333-3333-333333333304', 'Modernize Microservice APIs to Go 1.25', 'Refactor latency-critical endpoints to sub-15ms p99 latency.', 'OKR', 'percentage', 100, 85, 40, 'in_progress', 4.5),
('99999999-9999-9999-9999-999999999901', '33333333-3333-3333-3333-333333333304', 'Zero High-Severity Security CVEs', 'Perform automated Snyk and Dependabot remediation in CI/CD.', 'KPI', 'percentage', 100, 100, 30, 'completed', 5.0),
('99999999-9999-9999-9999-999999999901', '33333333-3333-3333-3333-333333333305', 'Design System WCAG 2.1 AA Compliance', 'Audit 42+ Ethereal UI primitives for strict dark-mode contrast.', 'OKR', 'percentage', 100, 92, 50, 'in_progress', 4.8)
ON CONFLICT DO NOTHING;

-- 12. EXPENSES
INSERT INTO expenses (employee_id, title, category, amount, expense_date, description, status, approver_id) VALUES
('33333333-3333-3333-3333-333333333304', 'Cloud Infrastructure Certification Exam', 'Training', 3500000, '2026-11-10', 'AWS Certified Solutions Architect Professional voucher', 'approved', '33333333-3333-3333-3333-333333333303'),
('33333333-3333-3333-3333-333333333305', 'Ergonomic Vertical Mouse & Mechanical Keypad', 'Hardware', 2150000, '2026-11-14', 'Equipment allowance for WFH workstation ergonomics', 'pending', '33333333-3333-3333-3333-333333333302')
ON CONFLICT DO NOTHING;

-- 13. AUDIT LOGS
INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address) VALUES
('33333333-3333-3333-3333-333333333301', 'UPDATE_PAYROLL_SETTINGS', 'payroll_periods', '66666666-6666-6666-6666-666666666601', '{"notes": "October 2026 cycle approved and processed for disbursement"}'::jsonb, '192.168.1.10'),
('33333333-3333-3333-3333-333333333302', 'APPROVE_LEAVE', 'leave_requests', '55555555-5555-5555-5555-555555555502', '{"days": 2, "type": "SICK"}'::jsonb, '192.168.1.15');
