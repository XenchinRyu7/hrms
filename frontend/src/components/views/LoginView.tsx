import React, { useState } from 'react';
import { Sparkles, ArrowRight, Lock, Mail, CheckCircle2 } from 'lucide-react';
import { Button, Input, Badge } from '@etherealui/react';
import { AuthProvider, useAuth, DEMO_ACCOUNTS } from '../../lib/auth-context';
import { ThemeProvider } from '../../lib/theme-context';

export function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@ethereal.hr');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const selectPersona = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-primary text-primary-foreground font-bold text-2xl shadow-lg shadow-primary/30 mx-auto">
            🌌
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Ethereal HRMS
          </h1>
          <p className="text-xs text-muted-foreground">
            Enterprise People & Talent Telemetry Console
          </p>
        </div>

        {/* Demo Persona Quick-Click */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-card-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Select Enterprise Persona:</span>
            </span>
            <Badge variant="outline" className="text-[10px]">Demo Mode</Badge>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((acc) => (
              <button
                key={acc.role}
                type="button"
                onClick={() => selectPersona(acc)}
                className={`p-2 rounded-xl text-left border transition text-xs cursor-pointer ${
                  email === acc.email
                    ? 'border-primary bg-primary/10 text-primary-foreground font-semibold shadow-xs'
                    : 'border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground text-[11px] truncate">{acc.name.split(' (')[0]}</span>
                  {email === acc.email && <CheckCircle2 className="h-3 w-3 text-primary shrink-0" />}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-mono mt-0.5">{acc.role.replace('_', ' ')}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form Card */}
        <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>Work Email</span>
              </label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@ethereal.hr"
                className="w-full text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1.5">
                  <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>Password</span>
                </label>
                <span className="text-[11px] text-muted-foreground">Default: password123</span>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full text-xs"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="w-full text-xs py-2.5 font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/20"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to HRMS Console</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </form>
        </div>

        <p className="text-center text-[11px] text-muted-foreground">
          Protected by Go 1.25 JWT & Supabase Enterprise Encryption &bull; Ethereal UI v0.0.7
        </p>
      </div>
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
