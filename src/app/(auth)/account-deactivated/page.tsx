"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  UserX,
  LogOut,
  ShieldAlert,
  HelpCircle,
  Mail,
  ShieldX,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AccountDeactivatedPage() {
  const [loggingOut, setLoggingOut] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground relative overflow-hidden">
      {/* Ambient Crimson Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-destructive/10 rounded-full blur-[110px] pointer-events-none" />

      <div style={{ maxWidth: "460px", width: "100%" }} className="flex flex-col items-center mx-auto relative z-10">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/15 border border-destructive/30 text-destructive flex items-center justify-center mb-3 shadow-sm">
            <UserX className="h-8 w-8" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">WACRM</h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-destructive/15 border border-destructive/30 text-destructive">
              Access Restricted
            </span>
          </div>

          <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
            Your organization account access has been suspended by the platform administrator.
          </p>
        </div>

        {/* Warning Card */}
        <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl space-y-5">
          <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 space-y-2.5 text-xs">
            <div className="flex items-center gap-2 text-destructive font-semibold">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>Workspace Suspended</span>
            </div>
            <p className="text-muted-foreground leading-relaxed text-xs">
              All inbound messaging, broadcast queues, automations, and CRM member access for this organization have been paused per administrative policy.
            </p>
          </div>

          {/* Help box */}
          <div className="p-4 rounded-xl bg-muted/60 border border-border space-y-2 text-xs">
            <div className="flex items-center gap-2 text-foreground font-semibold">
              <HelpCircle className="h-4 w-4 text-primary shrink-0" />
              <span>How to request reactivation?</span>
            </div>
            <p className="text-muted-foreground text-[11px] leading-relaxed">
              If you believe this suspension is in error or your subscription requires updating, please contact your workspace administrator or reach out to support.
            </p>
            <div className="pt-1 flex items-center gap-2 text-[11px] text-primary font-mono">
              <Mail className="h-3.5 w-3.5" />
              <span>support@crm.local</span>
            </div>
          </div>

          {/* Sign Out Button */}
          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleSignOut}
              disabled={loggingOut}
              className="w-full h-11 border-border hover:bg-muted text-muted-foreground hover:text-foreground text-xs rounded-xl gap-2 transition-all cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              Sign Out to Switch Account
            </Button>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldX className="h-4 w-4 text-destructive" />
          <span>Tenant Enforced Security Policy</span>
        </div>
      </div>
    </div>
  );
}
