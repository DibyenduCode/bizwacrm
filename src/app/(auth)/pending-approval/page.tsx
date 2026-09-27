"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Clock,
  RefreshCw,
  LogOut,
  CheckCircle2,
  Lock,
  Building2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function PendingApprovalPage() {
  const [checking, setChecking] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState<string | null>(null);
  const supabase = createClient();

  // Load user profile details on mount
  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? null);
        const { data: profile } = await supabase
          .from("profiles")
          .select("accounts(name)")
          .eq("user_id", user.id)
          .single();
        if (profile?.accounts && !Array.isArray(profile.accounts)) {
          setCompanyName((profile.accounts as { name: string }).name);
        }
      }
    });
  }, [supabase]);

  // Periodic automatic status poll every 20 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("status, is_super_admin")
        .eq("user_id", user.id)
        .single();

      if (profile?.is_super_admin) {
        window.location.href = "/admin";
      } else if (profile?.status === "active") {
        toast.success("Account Approved! Redirecting to your CRM dashboard...");
        window.location.href = "/dashboard";
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [supabase]);

  const handleCheckStatus = async () => {
    setChecking(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("status, is_super_admin")
      .eq("user_id", user.id)
      .single();

    if (profile?.is_super_admin) {
      window.location.href = "/admin";
      return;
    }

    if (profile?.status === "active") {
      toast.success("Account Approved! Redirecting to your CRM dashboard...");
      window.location.href = "/dashboard";
      return;
    }

    toast.info("Account is still under administrator review. Please check back shortly.");
    setTimeout(() => {
      setChecking(false);
    }, 600);
  };

  const handleSignOut = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground relative overflow-hidden">
      {/* Ambient Amber Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[620px] h-[350px] bg-amber-500/10 rounded-full blur-[110px] pointer-events-none" />

      <div style={{ maxWidth: "480px", width: "100%" }} className="flex flex-col items-center mx-auto relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-500 shadow-sm mb-3 relative">
            <Clock className="h-8 w-8 text-amber-500" />
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500" />
            </span>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">WACRM</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Review Pending
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Your workspace has been created and is awaiting administrator authorization.
          </p>
        </div>

        {/* Status Card */}
        <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-6">
          {/* Organization Pill if available */}
          {(userEmail || companyName) && (
            <div className="p-3 rounded-xl bg-muted/60 border border-border flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-muted-foreground truncate">
                <Building2 className="h-4 w-4 shrink-0 text-primary" />
                <span className="font-semibold text-foreground truncate">
                  {companyName || "Organization Workspace"}
                </span>
              </div>
              {userEmail && (
                <span className="font-mono text-[11px] text-muted-foreground truncate max-w-[170px]">
                  {userEmail}
                </span>
              )}
            </div>
          )}

          {/* Progress Timeline */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Verification Steps
              </span>
              <span className="flex items-center gap-1.5 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                Step 2 of 3
              </span>
            </div>

            <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-3.5">
              {/* Step 1: Complete */}
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Workspace Created</p>
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">Done</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Credentials & company tenant initialized
                  </p>
                </div>
              </div>

              {/* Step 2: In Review */}
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <Clock className="h-3.5 w-3.5 animate-spin" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-amber-600 dark:text-amber-400">Super Admin Review</p>
                    <span className="text-[10px] px-1.5 py-0.2 bg-amber-500/20 rounded text-amber-600 dark:text-amber-400 font-semibold font-mono">
                      In Review
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Tenant security verification by platform administrator
                  </p>
                </div>
              </div>

              {/* Step 3: Locked */}
              <div className="flex items-start gap-3 opacity-60">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground border border-border flex items-center justify-center text-xs shrink-0 mt-0.5">
                  <Lock className="h-3 w-3" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-muted-foreground">CRM Dashboard Access</p>
                    <span className="text-[10px] text-muted-foreground font-mono">Pending</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Full WhatsApp API, shared inbox & contact management
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2.5 pt-1">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
              <span>{checking ? "Checking Approval Status..." : "Check Status & Enter CRM"}</span>
            </button>

            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full h-10 border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs rounded-xl gap-2 cursor-pointer transition-all"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </Button>
          </div>

          {/* Auto-check Notice */}
          <div className="text-center">
            <p className="text-[11px] text-muted-foreground">
              ⚡ This page automatically polls status every 20 seconds. You will be redirected immediately once approved.
            </p>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Tenant Data Isolation & Administrator Protection</span>
        </div>
      </div>
    </div>
  );
}
