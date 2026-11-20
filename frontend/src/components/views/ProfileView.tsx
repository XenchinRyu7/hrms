import React, { useState, useEffect } from "react";
import {
  User,
  KeyRound,
  ShieldCheck,
  Mail,
  Building2,
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Lock,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Clock,
  FileText,
} from "lucide-react";
import { Button, Badge, Input } from "@etherealui/react";
import { useAuth } from "../../lib/auth-context";
import { api } from "../../lib/api";
import { useNotification } from "../../lib/notification-context";
import type { User as UserType } from "../../lib/types";

export function ProfileView() {
  const { user: authUser, refreshUser } = useAuth();
  const { toast } = useNotification();
  const [user, setUser] = useState<UserType | null>(authUser);
  const [loading, setLoading] = useState(!authUser);

  // Contact form state
  const [phone, setPhone] = useState(authUser?.phone || "");
  const [address, setAddress] = useState(authUser?.address || "");
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Fetch full employee details directly from /auth/me on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getMe()
      .then((data) => {
        if (!isMounted) return;
        setUser(data);
        setPhone(data.phone || "");
        setAddress(data.address || "");
      })
      .catch((err) => {
        console.error("Failed to load profile:", err);
        if (isMounted && authUser) {
          setUser(authUser);
          setPhone(authUser.phone || "");
          setAddress(authUser.address || "");
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "admin":
        return "Super Admin";
      case "hr_manager":
        return "HR Director";
      case "manager":
        return "Team Lead";
      default:
        return "Employee";
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const updated = await api.updateProfile({ phone, address });
      setUser(updated);
      await refreshUser();
      setProfileSuccess("Informasi kontak berhasil disimpan.");
      toast.success("Profil Diperbarui", "Data kontak Anda telah disimpan.");
      setTimeout(() => setProfileSuccess(null), 4000);
    } catch (err: any) {
      const msg = err.message || "Gagal memperbarui profil.";
      setProfileError(msg);
      toast.error("Gagal", msg);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword.length < 6) {
      setPasswordError("Password baru minimal harus 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError("Konfirmasi password tidak cocok dengan password baru.");
      return;
    }

    setIsUpdatingPassword(true);
    try {
      const res = await api.changePassword({
        current_password: currentPassword || undefined,
        new_password: newPassword,
      });

      setPasswordSuccess(res.message || "Password berhasil diperbarui.");
      toast.success(
        "Password Diperbarui",
        "Gunakan password baru Anda untuk login berikutnya.",
      );
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(null), 4000);
    } catch (err: any) {
      const msg =
        err.message || "Gagal memperbarui password. Periksa password saat ini.";
      setPasswordError(msg);
      toast.error("Gagal", msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading && !user) {
    return (
      <div className="flex items-center justify-center py-20 text-xs text-muted-foreground">
        Memuat informasi profil karyawan...
      </div>
    );
  }

  const currentUser = user || authUser;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-wider font-semibold text-primary">
            Data Karyawan
          </span>
          <span className="text-muted-foreground">&bull;</span>
          <span className="text-xs text-muted-foreground">
            Informasi Pribadi & Keamanan Akun
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Profil Karyawan & Keamanan
        </h1>
        <p className="text-xs text-muted-foreground">
          Lihat detail identitas Anda, perbarui nomor telepon/alamat, dan ganti
          password akun.
        </p>
      </div>

      {/* Main Profile Info Card */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-border">
          <div className="h-20 w-20 rounded-2xl bg-primary/10 border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-2xl shrink-0 overflow-hidden shadow-sm">
            {currentUser?.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.full_name || "Profile"}
                className="h-full w-full object-cover"
              />
            ) : (
              currentUser?.full_name?.substring(0, 2).toUpperCase() || "EH"
            )}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-foreground truncate">
                {currentUser?.full_name || "Nama Karyawan"}
              </h2>
              <Badge variant="primary" className="text-xs">
                {getRoleLabel(currentUser?.role)}
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                {currentUser?.employee_code || "EMP-000"}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-emerald-500 border-emerald-500/30 bg-emerald-500/10"
              >
                {currentUser?.status === "active"
                  ? "Aktif"
                  : currentUser?.status || "Active"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {currentUser?.job_title ? `${currentUser.job_title} ` : ""}
              {currentUser?.department_name
                ? `• Departemen ${currentUser.department_name}`
                : ""}
            </p>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-5 text-xs">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-primary" />
              <span>Email Perusahaan</span>
            </span>
            <p className="font-semibold text-foreground truncate">
              {currentUser?.email || "-"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              <span>Nomor Induk Karyawan (NIK)</span>
            </span>
            <p className="font-semibold text-foreground font-mono">
              {currentUser?.employee_code || "-"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Building2 className="h-3.5 w-3.5 text-primary" />
              <span>Departemen</span>
            </span>
            <p className="font-semibold text-foreground">
              {currentUser?.department_name || "-"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Briefcase className="h-3.5 w-3.5 text-primary" />
              <span>Jabatan / Role</span>
            </span>
            <p className="font-semibold text-foreground">
              {currentUser?.job_title || getRoleLabel(currentUser?.role)}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-primary" />
              <span>No. Telepon</span>
            </span>
            <p className="font-semibold text-foreground">
              {currentUser?.phone || "-"}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-muted/30 border border-border/60 space-y-1">
            <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              <span>Tanggal Masuk</span>
            </span>
            <p className="font-semibold text-foreground">
              {currentUser?.hire_date || "-"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact Info Edit Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <User className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Perbarui Data Kontak
              </h3>
            </div>

            {profileSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{profileSuccess}</span>
              </div>
            )}

            {profileError && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{profileError}</span>
              </div>
            )}

            <form
              id="profile-form"
              onSubmit={handleUpdateProfile}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Work Email (Permanen)</span>
                </label>
                <Input
                  disabled
                  value={currentUser?.email || ""}
                  className="text-xs opacity-70 cursor-not-allowed bg-muted/40"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Nomor Telepon</span>
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+62 812-..."
                  className="text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Alamat Domisili</span>
                </label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Jl. Sudirman No..."
                  className="text-xs"
                />
              </div>
            </form>
          </div>

          <Button
            type="submit"
            form="profile-form"
            variant="outline"
            disabled={isUpdatingProfile}
            className="w-full text-xs py-2 font-medium flex items-center justify-center gap-1.5 cursor-pointer mt-4"
          >
            <Save className="h-3.5 w-3.5" />
            <span>
              {isUpdatingProfile ? "Menyimpan..." : "Simpan Data Kontak"}
            </span>
          </Button>
        </div>

        {/* Change Password Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
              <KeyRound className="h-4 w-4 text-primary" />
              <h3 className="font-semibold text-sm text-foreground">
                Ubah Password Akun
              </h3>
            </div>

            {passwordSuccess && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-500 text-xs flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form
              id="password-form"
              onSubmit={handleUpdatePassword}
              className="space-y-4"
            >
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Password Saat Ini</span>
                </label>
                <div className="relative">
                  <Input
                    type={showCurrentPass ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showCurrentPass ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Password Baru</span>
                </label>
                <div className="relative">
                  <Input
                    type={showNewPass ? "text" : "password"}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="text-xs pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {showNewPass ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Konfirmasi Password Baru</span>
                </label>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi password baru"
                  className="text-xs"
                />
              </div>
            </form>
          </div>

          <Button
            type="submit"
            form="password-form"
            variant="primary"
            disabled={isUpdatingPassword}
            className="w-full text-xs py-2 font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-primary/20 mt-4"
          >
            <KeyRound className="h-3.5 w-3.5" />
            <span>
              {isUpdatingPassword ? "Memproses..." : "Perbarui Password"}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
}
