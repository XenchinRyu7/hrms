import React, { useEffect, useState } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Briefcase,
  Calendar,
  Shield,
  Eye,
  Trash2,
  CheckCircle,
  X,
  Network,
} from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Input,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@etherealui/react';
import { api } from '../../lib/api';
import type { User, Department, JobTitle } from '../../lib/types';
import { useAuth } from '../../lib/auth-context';

export function EmployeesView() {
  const { user: currentUser } = useAuth();
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'org_chart'>('table');

  // Selected for Drawer / Modal
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    full_name: '',
    email: '',
    role: 'employee' as const,
    department_id: '',
    job_title_id: '',
    phone: '',
    address: '',
    hire_date: new Date().toISOString().split('T')[0],
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchEmployees = async () => {
    try {
      const [empList, deptList, jobList] = await Promise.all([
        api.getEmployees({
          role: selectedRole || undefined,
          department_id: selectedDept || undefined,
          search: search || undefined,
        }),
        api.getDepartments(),
        api.getJobTitles(),
      ]);
      setEmployees(empList);
      setDepartments(deptList);
      setJobTitles(jobList);
    } catch (err) {
      console.error('Error fetching employees:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [selectedDept, selectedRole]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchEmployees();
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const deptObj = departments.find((d) => d.id === newEmp.department_id);
      const titleObj = jobTitles.find((j) => j.id === newEmp.job_title_id);

      await api.createEmployee({
        ...newEmp,
        department_name: deptObj?.name,
        job_title: titleObj?.title,
        status: 'active',
        avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150`,
      });
      setIsAddModalOpen(false);
      setNewEmp({
        full_name: '',
        email: '',
        role: 'employee',
        department_id: '',
        job_title_id: '',
        phone: '',
        address: '',
        hire_date: new Date().toISOString().split('T')[0],
      });
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to add employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to remove this employee from directory?')) return;
    try {
      await api.deleteEmployee(id);
      if (selectedEmployee?.id === id) {
        setIsDetailOpen(false);
      }
      fetchEmployees();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  const getRoleVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'primary';
      case 'hr_manager':
        return 'secondary';
      case 'manager':
        return 'outline';
      default:
        return 'muted';
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">People Operations</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">{employees.length} Active Records</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Employee Directory & Organization
          </h1>
          <p className="text-xs text-muted-foreground">
            Enterprise roster management, hierarchical reporting lines, and personnel files.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl border border-border bg-muted/40 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                viewMode === 'table' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode('org_chart')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                viewMode === 'org_chart' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Org Hierarchy
            </button>
          </div>

          {(currentUser?.role === 'admin' || currentUser?.role === 'hr_manager') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs flex items-center gap-1.5"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Employee</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name, email, or employee ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 text-xs w-full"
            />
          </div>
          <Button type="submit" variant="outline" size="sm" className="text-xs">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2.5 w-full md:w-auto">
          {/* Dept Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="text-xs rounded-xl border border-border bg-muted/30 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>

          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="text-xs rounded-xl border border-border bg-muted/30 px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Roles</option>
            <option value="admin">Super Admin</option>
            <option value="hr_manager">HR Director</option>
            <option value="manager">Team Lead</option>
            <option value="employee">Employee</option>
          </select>
        </div>
      </div>

      {/* View Mode: Table or Org Chart */}
      {viewMode === 'table' ? (
        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border uppercase tracking-wider text-[11px] text-muted-foreground font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Employee</th>
                  <th className="py-3.5 px-4">Department & Title</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Joined Date</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {employees.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-muted/30 transition cursor-pointer"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setIsDetailOpen(true);
                    }}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={emp.avatar_url}
                          alt={emp.full_name}
                          className="h-9 w-9 rounded-xl border border-border"
                        />
                        <div>
                          <p className="font-semibold text-foreground">{emp.full_name}</p>
                          <p className="text-[11px] text-muted-foreground font-mono">{emp.employee_code} &bull; {emp.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-foreground">{emp.department_name || 'General'}</p>
                      <p className="text-[11px] text-muted-foreground">{emp.job_title || 'Specialist'}</p>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={getRoleVariant(emp.role)} className="text-[10px] capitalize">
                        {emp.role.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 capitalize">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                        {emp.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground font-mono">
                      {emp.hire_date}
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedEmployee(emp);
                            setIsDetailOpen(true);
                          }}
                          className="h-7 px-2 text-[11px]"
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          <span>View</span>
                        </Button>
                        {currentUser?.role === 'admin' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDelete(emp.id)}
                            className="h-7 px-2 text-[11px] text-destructive hover:bg-destructive/10 border-destructive/30"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Org Hierarchy Tree View */
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-2">
            <Network className="h-4 w-4 text-primary" />
            <h2 className="text-base font-bold text-card-foreground">Corporate Structure & Reporting Lines</h2>
          </div>

          <div className="space-y-6">
            {/* C-Level Node */}
            <div className="p-4 rounded-xl border border-primary/40 bg-primary/5 max-w-md mx-auto text-center space-y-2">
              <Badge variant="primary" className="text-[10px]">C-Suite Executive</Badge>
              <div className="flex items-center justify-center gap-2">
                <Avatar src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" className="h-10 w-10 rounded-xl" />
                <div className="text-left">
                  <p className="font-bold text-foreground text-xs">Alex Thorne</p>
                  <p className="text-[11px] text-muted-foreground">Chief Executive Officer</p>
                </div>
              </div>
            </div>

            {/* Connecting line */}
            <div className="w-0.5 h-6 bg-border mx-auto"></div>

            {/* Department Leads */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">Human Resources</span>
                  <Badge variant="outline" className="text-[10px]">Dept Head</Badge>
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100" className="h-8 w-8 rounded-lg" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Elena Rostova</p>
                    <p className="text-[11px] text-muted-foreground">Head of HR & People Ops</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-border bg-muted/20 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-foreground">Software Engineering</span>
                  <Badge variant="outline" className="text-[10px]">Tech Lead</Badge>
                </div>
                <div className="flex items-center gap-2.5">
                  <Avatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" className="h-8 w-8 rounded-lg" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Marcus Vance</p>
                    <p className="text-[11px] text-muted-foreground">Staff Software Engineer</p>
                  </div>
                </div>

                {/* Subordinate engineers */}
                <div className="pt-2 border-t border-border space-y-2">
                  <p className="text-[10px] uppercase font-mono text-muted-foreground">Direct Reports (2)</p>
                  <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-card border border-border">
                    <span>Sarah Jenkins (Senior Fullstack)</span>
                    <Badge variant="muted" className="text-[9px]">EMP-004</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs p-1.5 rounded-lg bg-card border border-border">
                    <span>Kenji Sato (Lead Designer)</span>
                    <Badge variant="muted" className="text-[9px]">EMP-005</Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Profile Drawer / Modal */}
      {isDetailOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-md bg-card border-l border-border h-full p-6 overflow-y-auto space-y-6 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <h2 className="text-base font-bold text-card-foreground">Employee Record</h2>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center space-y-2">
              <Avatar
                src={selectedEmployee.avatar_url}
                alt={selectedEmployee.full_name}
                className="h-20 w-20 rounded-2xl mx-auto border-2 border-primary/20 shadow-md"
              />
              <h3 className="text-base font-bold text-foreground">{selectedEmployee.full_name}</h3>
              <p className="text-xs text-muted-foreground font-mono">{selectedEmployee.employee_code}</p>
              <Badge variant={getRoleVariant(selectedEmployee.role)} className="text-xs">
                {selectedEmployee.role.replace('_', ' ')}
              </Badge>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Building className="h-3.5 w-3.5 text-primary" />
                    <span>Department</span>
                  </span>
                  <span className="font-semibold text-foreground">{selectedEmployee.department_name || 'General'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Briefcase className="h-3.5 w-3.5 text-primary" />
                    <span>Job Title</span>
                  </span>
                  <span className="font-semibold text-foreground">{selectedEmployee.job_title || 'Member'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Hire Date</span>
                  </span>
                  <span className="font-semibold text-foreground">{selectedEmployee.hire_date}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl border border-border bg-muted/20 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Email</span>
                  </span>
                  <span className="font-mono text-foreground">{selectedEmployee.email}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" />
                    <span>Phone</span>
                  </span>
                  <span className="text-foreground">{selectedEmployee.phone || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-border flex gap-2">
              <Button
                variant="outline"
                className="flex-1 text-xs"
                onClick={() => setIsDetailOpen(false)}
              >
                Close Profile
              </Button>
              {currentUser?.role === 'admin' && (
                <Button
                  variant="outline"
                  className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                  onClick={() => handleDelete(selectedEmployee.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-card-foreground">Add New Enterprise Employee</h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateEmployee} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Full Name *</label>
                  <Input
                    required
                    value={newEmp.full_name}
                    onChange={(e) => setNewEmp({ ...newEmp, full_name: e.target.value })}
                    placeholder="e.g. Maya Indah"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Work Email *</label>
                  <Input
                    type="email"
                    required
                    value={newEmp.email}
                    onChange={(e) => setNewEmp({ ...newEmp, email: e.target.value })}
                    placeholder="maya@ethereal.hr"
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Department *</label>
                  <select
                    required
                    value={newEmp.department_id}
                    onChange={(e) => setNewEmp({ ...newEmp, department_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                  >
                    <option value="">Select Dept</option>
                    {departments.map((d) => (
                      <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Job Title *</label>
                  <select
                    required
                    value={newEmp.job_title_id}
                    onChange={(e) => setNewEmp({ ...newEmp, job_title_id: e.target.value })}
                    className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                  >
                    <option value="">Select Job Title</option>
                    {jobTitles.map((j) => (
                      <option key={j.id} value={j.id}>{j.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Access Role *</label>
                  <select
                    value={newEmp.role}
                    onChange={(e) => setNewEmp({ ...newEmp, role: e.target.value as any })}
                    className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                  >
                    <option value="employee">Employee</option>
                    <option value="manager">Team Lead</option>
                    <option value="hr_manager">HR Director</option>
                    <option value="admin">Super Admin</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Hire Date</label>
                  <Input
                    type="date"
                    value={newEmp.hire_date}
                    onChange={(e) => setNewEmp({ ...newEmp, hire_date: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Phone Number</label>
                <Input
                  value={newEmp.phone}
                  onChange={(e) => setNewEmp({ ...newEmp, phone: e.target.value })}
                  placeholder="+62 811-..."
                  className="text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddModalOpen(false)}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="text-xs"
                >
                  {submitting ? 'Registering...' : 'Save Employee'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
