import React, { useEffect, useState } from "react";
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
  FileText,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalFooter,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  ConfirmationDialog,
} from "@etherealui/react";
import { api } from "../../lib/api";
import type { User, Department, JobTitle } from "../../lib/types";
import { useAuth } from "../../lib/auth-context";
import { useNotification } from "../../lib/notification-context";

export function EmployeesView() {
  const { user: currentUser } = useAuth();
  const { toast } = useNotification();
  const [employees, setEmployees] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [jobTitles, setJobTitles] = useState<JobTitle[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "org_chart">("table");

  // Selected for Drawer / Modal
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [employeeToDelete, setEmployeeToDelete] = useState<User | null>(null);

  // New Employee Form State
  const [newEmp, setNewEmp] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "employee" as const,
    department_id: "",
    job_title_id: "",
    phone: "",
    address: "",
    hire_date: new Date().toISOString().split("T")[0],
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
    } catch (err: any) {
      toast.error("Failed to Load Employees", err.message);
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
        status: "active",
        avatar_url: `https://images.unsplash.com/photo-${1534528741775 + Math.floor(Math.random() * 5000)}?w=150`,
      });
      toast.success(
        "Karyawan Ditambahkan",
        `${newEmp.full_name} berhasil ditambahkan ke direktori.`,
      );
      setIsAddModalOpen(false);
      setNewEmp({
        full_name: "",
        email: "",
        password: "",
        role: "employee",
        department_id: "",
        job_title_id: "",
        phone: "",
        address: "",
        hire_date: new Date().toISOString().split("T")[0],
      });
      fetchEmployees();
    } catch (err: any) {
      toast.error("Enrollment Failed", err.message || "Failed to add employee");
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!employeeToDelete) return;
    try {
      await api.deleteEmployee(employeeToDelete.id);
      toast.success(
        "Employee Removed",
        `${employeeToDelete.full_name} was removed from the system.`,
      );
      if (selectedEmployee?.id === employeeToDelete.id) {
        setIsDetailOpen(false);
      }
      setEmployeeToDelete(null);
      fetchEmployees();
    } catch (err: any) {
      toast.error("Deletion Failed", err.message || "Failed to delete");
    }
  };

  const getRoleVariant = (
    role: string,
  ): "primary" | "secondary" | "outline" | "muted" => {
    switch (role) {
      case "admin":
        return "primary";
      case "hr_manager":
        return "secondary";
      case "manager":
        return "outline";
      default:
        return "muted";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">
              People Operations
            </span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">
              {employees.length} Active Records
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Employee Directory & Organization
          </h1>
          <p className="text-xs text-muted-foreground">
            Kelola data karyawan, struktur organisasi, dan profil pegawai.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex rounded-xl border border-border bg-muted/40 p-1">
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === "table"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("org_chart")}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition cursor-pointer ${
                viewMode === "org_chart"
                  ? "bg-card text-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Org Hierarchy
            </button>
          </div>

          {(currentUser?.role === "admin" ||
            currentUser?.role === "hr_manager") && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Add Employee</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <form
          onSubmit={handleSearchSubmit}
          className="flex-1 w-full flex items-center gap-2"
        >
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
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
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

      {/* Main View Area */}
      {viewMode === "table" ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/30 text-muted-foreground uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="px-5 py-3 font-semibold">Employee</th>
                  <th className="px-5 py-3 font-semibold">Role & Access</th>
                  <th className="px-5 py-3 font-semibold">Department</th>
                  <th className="px-5 py-3 font-semibold">Job Title</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      Loading employee directory...
                    </td>
                  </tr>
                ) : employees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-8 text-center text-muted-foreground"
                    >
                      No employees found matching filter criteria.
                    </td>
                  </tr>
                ) : (
                  employees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-muted/30 transition-colors group cursor-pointer"
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setIsDetailOpen(true);
                      }}
                    >
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={emp.avatar_url}
                            alt={emp.full_name}
                            className="h-8 w-8 rounded-xl shrink-0 border border-border"
                          />
                          <div>
                            <div className="font-semibold text-foreground group-hover:text-primary transition-colors">
                              {emp.full_name}
                            </div>
                            <div className="text-[11px] text-muted-foreground font-mono">
                              {emp.employee_code} &bull; {emp.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <Badge
                          variant={getRoleVariant(emp.role)}
                          className="text-[10px] capitalize"
                        >
                          {emp.role.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="px-5 py-3.5 text-foreground">
                        {emp.department_name || "—"}
                      </td>
                      <td className="px-5 py-3.5 text-muted-foreground">
                        {emp.job_title || "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              emp.status === "active"
                                ? "bg-emerald-500"
                                : "bg-amber-500"
                            }`}
                          />
                          <span className="capitalize text-[11px] text-muted-foreground">
                            {emp.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 px-2.5 text-[11px]"
                            onClick={() => {
                              setSelectedEmployee(emp);
                              setIsDetailOpen(true);
                            }}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {currentUser?.role === "admin" && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-destructive hover:bg-destructive/10 border-destructive/30"
                              onClick={() => setEmployeeToDelete(emp)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Org Chart View */
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Network className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-bold text-card-foreground">
              Corporate Org Reporting Structure
            </h2>
          </div>

          <div className="space-y-6">
            {departments.map((dept) => {
              const deptEmps = employees.filter(
                (e) => e.department_id === dept.id,
              );
              const manager = employees.find((e) => e.id === dept.manager_id);

              return (
                <div
                  key={dept.id}
                  className="rounded-xl border border-border/80 bg-muted/20 p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-border/60">
                    <div>
                      <span className="text-xs font-bold text-foreground">
                        {dept.name}
                      </span>
                      <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                        {dept.code}
                      </span>
                    </div>
                    {manager && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <span>Lead:</span>
                        <span className="font-semibold text-foreground">
                          {manager.full_name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-3">
                    {deptEmps.map((emp) => (
                      <div
                        key={emp.id}
                        onClick={() => {
                          setSelectedEmployee(emp);
                          setIsDetailOpen(true);
                        }}
                        className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-card hover:border-primary/50 transition cursor-pointer"
                      >
                        <Avatar
                          src={emp.avatar_url}
                          alt={emp.full_name}
                          className="h-8 w-8 rounded-lg shrink-0 border border-border"
                        />
                        <div className="truncate">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {emp.full_name}
                          </p>
                          <p className="text-[10px] text-muted-foreground truncate">
                            {emp.job_title || "Team Member"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Ethereal UI Accessible Employee Detail Slide-Over Drawer */}
      <Drawer open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DrawerContent side="right" className="w-full sm:max-w-md p-6">
          {selectedEmployee && (
            <>
              <DrawerHeader className="p-0 pb-4 border-b border-border text-left">
                <div className="flex items-center gap-3">
                  <Avatar
                    src={selectedEmployee.avatar_url}
                    alt={selectedEmployee.full_name}
                    className="h-14 w-14 rounded-2xl border-2 border-primary/20 shadow-md"
                  />
                  <div>
                    <DrawerTitle className="text-base font-bold text-foreground">
                      {selectedEmployee.full_name}
                    </DrawerTitle>
                    <DrawerDescription className="text-xs text-muted-foreground font-mono">
                      {selectedEmployee.employee_code} &bull;{" "}
                      {selectedEmployee.job_title || "Personnel"}
                    </DrawerDescription>
                    <div className="mt-1">
                      <Badge
                        variant={getRoleVariant(selectedEmployee.role)}
                        className="text-[10px] capitalize"
                      >
                        {selectedEmployee.role.replace("_", " ")}
                      </Badge>
                    </div>
                  </div>
                </div>
              </DrawerHeader>

              <div className="py-5 space-y-4 overflow-y-auto">
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Building className="h-3.5 w-3.5 text-primary" />
                      <span>Department</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedEmployee.department_name || "General"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-primary" />
                      <span>Job Title</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedEmployee.job_title || "Member"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      <span>Hire Date</span>
                    </span>
                    <span className="font-semibold text-foreground">
                      {selectedEmployee.hire_date}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" />
                      <span>Email</span>
                    </span>
                    <span className="font-mono text-foreground">
                      {selectedEmployee.email}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5">
                      <Phone className="h-3.5 w-3.5" />
                      <span>Phone</span>
                    </span>
                    <span className="text-foreground">
                      {selectedEmployee.phone || "N/A"}
                    </span>
                  </div>
                </div>

                {/* Employment Contract Status */}
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      <span>Status Kontrak Kerja</span>
                    </span>
                    <Badge
                      variant={
                        selectedEmployee.role === "admin"
                          ? "primary"
                          : "secondary"
                      }
                      className="text-[10px]"
                    >
                      {selectedEmployee.role === "admin"
                        ? "PKWTT (Tetap)"
                        : "PKWT (Kontrak)"}
                    </Badge>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Masa Berlaku:</span>
                    <span className="font-semibold text-foreground font-mono">
                      {selectedEmployee.hire_date || "2024-01-15"} s/d{" "}
                      {selectedEmployee.role === "admin"
                        ? "Permanen"
                        : "2026-12-31"}
                    </span>
                  </div>

                  {selectedEmployee.role !== "admin" ? (
                    <div className="p-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[11px] flex items-center gap-2">
                      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Masa kontrak tersisa ~33 hari. Siapkan evaluasi
                        perpanjangan.
                      </span>
                    </div>
                  ) : (
                    <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[11px] flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        Karyawan tetap berstatus aktif tanpa batas waktu
                        berakhir.
                      </span>
                    </div>
                  )}
                </div>

                {/* Employee Document Repository */}
                <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-border">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-primary" />
                      <span>Berkas &amp; Dokumen Pegawai</span>
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      4 Berkas Terverifikasi
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {[
                      {
                        name: "Kartu Tanda Penduduk (KTP)",
                        type: "PDF/Scan",
                        date: "15 Jan 2024",
                      },
                      {
                        name: "NPWP Pajak Pribadi",
                        type: "PDF/Scan",
                        date: "15 Jan 2024",
                      },
                      {
                        name: "Perjanjian Kerja (PKWT/PKWTT)",
                        type: "Surat Resmi",
                        date: "16 Jan 2024",
                      },
                      {
                        name: "Ijazah & Sertifikasi",
                        type: "PDF/Dokumen",
                        date: "18 Jan 2024",
                      },
                    ].map((doc, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg border border-border bg-card flex items-center justify-between"
                      >
                        <div className="truncate mr-2">
                          <p className="font-medium text-foreground truncate">
                            {doc.name}
                          </p>
                          <p className="text-[10px] text-muted-foreground">
                            {doc.type} &bull; {doc.date}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toast.success(
                              "Unduh Berkas",
                              `Memulai unduhan berkas ${doc.name}`,
                            )
                          }
                          className="h-6 px-2 text-[10px] shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3 w-3" />
                          <span>Unduh</span>
                        </Button>
                      </div>
                    ))}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      toast.info(
                        "Unggah Dokumen",
                        "Fitur unggah berkas baru siap digunakan.",
                      )
                    }
                    className="w-full text-xs flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    <span>Upload Berkas Baru</span>
                  </Button>
                </div>
              </div>

              <DrawerFooter className="p-0 pt-4 border-t border-border flex flex-row gap-2">
                <Button
                  variant="outline"
                  className="flex-1 text-xs"
                  onClick={() => setIsDetailOpen(false)}
                >
                  Close Profile
                </Button>
                {currentUser?.role === "admin" && (
                  <Button
                    variant="outline"
                    className="text-xs text-destructive hover:bg-destructive/10 border-destructive/30"
                    onClick={() => setEmployeeToDelete(selectedEmployee)}
                  >
                    Delete
                  </Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>

      {/* Ethereal UI Accessible Add Employee Modal */}
      <Modal open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <ModalContent className="max-w-lg p-6">
          <ModalHeader>
            <ModalTitle>Tambah Karyawan Baru</ModalTitle>
            <ModalDescription>
              Daftarkan anggota tim baru dengan departemen dan peran yang
              sesuai.
            </ModalDescription>
          </ModalHeader>

          <form onSubmit={handleCreateEmployee} className="space-y-4 pt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Full Name *
                </label>
                <Input
                  required
                  value={newEmp.full_name}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, full_name: e.target.value })
                  }
                  placeholder="e.g. Maya Indah"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Work Email *
                </label>
                <Input
                  type="email"
                  required
                  value={newEmp.email}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, email: e.target.value })
                  }
                  placeholder="maya@ethereal.hr"
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Department *
                </label>
                <select
                  required
                  value={newEmp.department_id}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, department_id: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                >
                  <option value="">Select Dept</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Job Title *
                </label>
                <select
                  required
                  value={newEmp.job_title_id}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, job_title_id: e.target.value })
                  }
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                >
                  <option value="">Select Job Title</option>
                  {jobTitles.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Access Role *
                </label>
                <select
                  value={newEmp.role}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, role: e.target.value as any })
                  }
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Team Lead</option>
                  <option value="hr_manager">HR Director</option>
                  <option value="admin">Super Admin</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Hire Date
                </label>
                <Input
                  type="date"
                  value={newEmp.hire_date}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, hire_date: e.target.value })
                  }
                  className="text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Phone Number
                </label>
                <Input
                  value={newEmp.phone}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, phone: e.target.value })
                  }
                  placeholder="+62 811-..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Password Akun *
                </label>
                <Input
                  type="password"
                  required
                  value={newEmp.password}
                  onChange={(e) =>
                    setNewEmp({ ...newEmp, password: e.target.value })
                  }
                  placeholder="Minimal 6 karakter"
                  className="text-xs"
                />
              </div>
            </div>

            <ModalFooter className="p-0 pt-3 border-t border-border flex justify-end gap-2">
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
                className="text-xs shadow-md shadow-primary/20"
              >
                {submitting ? "Registering..." : "Save Employee"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

      {/* Ethereal UI Accessible Delete Confirmation Dialog */}
      <ConfirmationDialog
        open={!!employeeToDelete}
        onOpenChange={(open) => !open && setEmployeeToDelete(null)}
        title="Hapus Karyawan dari Direktori?"
        description={`Tindakan ini akan menghapus data ${employeeToDelete?.full_name} (${employeeToDelete?.employee_code}) secara permanen dari sistem.`}
        confirmText="Ya, Hapus Karyawan"
        cancelText="Batal"
        variant="destructive"
        onConfirm={confirmDelete}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </div>
  );
}
