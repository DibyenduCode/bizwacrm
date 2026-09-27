"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  KeyRound,
  Zap,
} from "lucide-react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setError("Failed to retrieve user session.");
      setLoading(false);
      return;
    }

    // Verify if user is super admin
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_super_admin")
      .eq("user_id", data.user.id)
      .single();

    if (profileError || !profile?.is_super_admin) {
      await supabase.auth.signOut();
      setError("Access Denied: This portal is strictly reserved for Super Administrators.");
      setLoading(false);
      return;
    }

    window.location.href = "/admin";
  };

  const handleQuickFill = () => {
    setEmail("admin@crm.local");
    setPassword("Admin@123456");
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground relative overflow-y-auto">
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-primary/10 rounded-full blur-[90px] pointer-events-none" />

      <div style={{ maxWidth: "420px", width: "100%" }} className="flex flex-col items-center mx-auto relative z-10 py-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs mb-3">
            <ShieldCheck className="h-6 w-6 text-primary" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">Super Admin Console</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/15 border border-primary/30 text-primary">
              Master Access
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            Multi-organization user management and tenant activation
          </p>
        </div>

        {/* Admin Login Card */}
        <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-7 shadow-lg">
          <div className="mb-5">
            <h2 className="text-base font-bold tracking-tight text-foreground flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-primary" />
              Master Credentials
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your platform administrator credentials
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-email" className="text-xs font-semibold text-foreground">
                Administrator Email
              </Label>
              <div className="relative flex items-center">
                <Mail
                  style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
                  className="h-4 w-4 text-muted-foreground pointer-events-none"
                />
                <input
                  id="admin-email"
                  type="email"
                  placeholder="admin@crm.local"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ height: "44px", paddingLeft: "2.6rem", paddingRight: "1rem" }}
                  className="w-full bg-background border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <Label htmlFor="admin-password" className="text-xs font-semibold text-foreground">
                Security Password
              </Label>
              <div className="relative flex items-center">
                <Lock
                  style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
                  className="h-4 w-4 text-muted-foreground pointer-events-none"
                />
                <input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ height: "44px", paddingLeft: "2.6rem", paddingRight: "2.75rem" }}
                  className="w-full bg-background border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ height: "44px" }}
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In as Super Admin</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Actions & Switchers */}
          <div className="mt-5 pt-4 border-t border-border flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={handleQuickFill}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold cursor-pointer transition-colors"
            >
              <Zap className="h-3.5 w-3.5" />
              <span>Fill Default Admin</span>
            </button>

            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              User Login →
            </Link>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Restricted Admin Portal • Session Audit Logged</span>
        </div>
      </div>
    </div>
  );
}
