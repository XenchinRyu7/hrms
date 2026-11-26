import React, { useState } from "react";
import {
  Lock,
  Mail,
  ArrowRight,
  Palette,
  Sun,
  Moon,
  ChevronDown,
} from "lucide-react";
import {
  Button,
  Input,
  Badge,
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@etherealui/react";
import { AuthProvider, useAuth } from "../../lib/auth-context";
import {
  ThemeProvider,
  useTheme,
  THEME_OPTIONS,
} from "../../lib/theme-context";

interface LoginViewProps {
  onSuccess?: () => void;
}

export function LoginView({ onSuccess }: LoginViewProps) {
  const { login } = useAuth();
  const { mode, colorTheme, toggleMode, setColorTheme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      if (onSuccess) {
        onSuccess();
      } else if (typeof window !== "undefined") {
        if (window.location.pathname === "/login") {
          window.location.href = "/";
        }
      }
    } catch (err: any) {
      setError(
        err.message || "Login gagal. Silakan periksa email dan password Anda.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 sm:p-6 transition-colors duration-150">
      {/* Top Header Bar with Theme Switcher */}
      <div className="flex items-center justify-between w-full max-w-4xl mx-auto py-2">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground font-bold flex items-center justify-center text-xs tracking-wider shadow-sm">
            EH
          </div>
          <span className="font-bold text-sm tracking-tight text-foreground">
            EHMRS
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-border bg-card hover:bg-muted text-xs cursor-pointer text-foreground transition shadow-sm"
                title="Ganti Tema Ethereal OKLCH"
              >
                <Palette className="h-3.5 w-3.5 text-primary" />
                <span className="hidden md:inline capitalize font-medium text-[11px]">
                  {THEME_OPTIONS.find((t) => t.id === colorTheme)?.name ||
                    "Theme"}
                </span>
                <ChevronDown className="h-3 w-3 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Ethereal OKLCH Themes</DropdownMenuLabel>
              {THEME_OPTIONS.map((t) => (
                <DropdownMenuItem
                  key={t.id}
                  onClick={() => setColorTheme(t.id)}
                  className="flex items-center justify-between text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${t.previewClass}`}
                    />
                    <span>{t.name}</span>
                  </div>
                  {colorTheme === t.id && (
                    <Badge variant="primary" className="text-[9px]">
                      Active
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mode Dark/Light Toggle */}
          <button
            type="button"
            onClick={toggleMode}
            title={mode === "dark" ? "Mode Terang" : "Mode Gelap"}
            className="p-2 rounded-xl border border-border bg-card hover:bg-muted text-foreground transition cursor-pointer shadow-sm flex items-center justify-center"
          >
            {mode === "dark" ? (
              <Sun className="h-3.5 w-3.5 text-amber-400" />
            ) : (
              <Moon className="h-3.5 w-3.5 text-primary" />
            )}
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-sm mx-auto my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-primary text-primary-foreground font-bold text-lg shadow-sm mx-auto tracking-wider">
            EH
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Sign In to EHMRS
          </h1>
          <p className="text-xs text-muted-foreground">
            Human Resource Management System
          </p>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card text-card-foreground p-6 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Email</span>
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@ethereal.hr"
                className="w-full text-xs"
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Password</span>
              </label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full text-xs py-2.5 font-semibold flex items-center justify-center gap-2 cursor-pointer mt-2 shadow-sm"
            >
              {loading ? (
                <span>Memproses...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>

          {/* Preset Demo Accounts */}
          <div className="pt-2 border-t border-border">
            <p className="text-[11px] font-semibold text-muted-foreground mb-2 text-center">
              Quick Login Demo Accounts:
            </p>
            <div className="grid grid-cols-2 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => {
                  setEmail("admin@ethereal.hr");
                  setPassword("password123");
                }}
                className="p-1.5 text-left rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
              >
                <div className="font-semibold text-primary">Super Admin</div>
                <div className="text-muted-foreground truncate">
                  admin@ethereal.hr
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("hr@ethereal.hr");
                  setPassword("password123");
                }}
                className="p-1.5 text-left rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
              >
                <div className="font-semibold text-primary">HR Director</div>
                <div className="text-muted-foreground truncate">
                  hr@ethereal.hr
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("saeful@ethereal.hr");
                  setPassword("password123");
                }}
                className="p-1.5 text-left rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
              >
                <div className="font-semibold text-primary">Saeful (Lead)</div>
                <div className="text-muted-foreground truncate">
                  saeful@ethereal.hr
                </div>
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmail("employee@ethereal.hr");
                  setPassword("password123");
                }}
                className="p-1.5 text-left rounded-lg border border-border bg-muted/40 hover:bg-muted text-foreground transition cursor-pointer"
              >
                <div className="font-semibold text-primary">Staff Employee</div>
                <div className="text-muted-foreground truncate">
                  employee@ethereal.hr
                </div>
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} EHMRS. All rights reserved.
        </p>
      </div>

      <div />
    </div>
  );
}

export function LoginPage() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LoginView />
      </AuthProvider>
    </ThemeProvider>
  );
}
