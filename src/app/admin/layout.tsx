"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ShieldCheck, LogOut, RefreshCw, Database, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const supabase = createClient();
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setAdminEmail(user.email ?? "admin");
      }
    });
  }, [supabase]);

  const handleSignOut = async () => {
    setLoggingOut(true);
    await supabase.auth.signOut();
    window.location.href = "/admin/login";
  };

  // If on login page, don't show the authenticated header and footer
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased relative">
      {/* Super Admin Top Header */}
      <header className="border-b border-border/80 bg-card/85 backdrop-blur-xl sticky top-0 z-50 px-5 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-foreground text-base">
                WACRM
              </span>
              <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase bg-primary/15 text-primary border border-primary/30 rounded-md flex items-center gap-1">
                <Sparkles className="h-2.5 w-2.5" />
                Super Admin
              </span>
            </div>
            <p className="text-xs text-muted-foreground font-medium hidden sm:block">
              Multi-Company User Access & Tenant Controller
            </p>
          </div>
        </div>

        {/* Right Status & Admin Controls */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-full bg-muted/60 border border-border text-xs text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-medium text-foreground">Postgres DB Live</span>
          </div>

          {adminEmail && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted border border-border text-xs text-foreground">
              <div className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold text-[10px] flex items-center justify-center">
                {adminEmail[0].toUpperCase()}
              </div>
              <span className="font-mono text-xs max-w-[140px] truncate sm:max-w-none">{adminEmail}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            disabled={loggingOut}
            className="border-border hover:bg-muted text-foreground text-xs h-9 px-3 rounded-xl gap-1.5 transition-all cursor-pointer"
          >
            {loggingOut ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <LogOut className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>

      <footer className="border-t border-border/80 bg-card/60 backdrop-blur-xs py-4 px-6 sm:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground gap-2">
        <div className="flex items-center gap-2">
          <Database className="h-3.5 w-3.5 text-primary" />
          <span>Multi-Tenant Architecture • Row-Level Security Enforced</span>
        </div>
        <span>WACRM Dedicated Administration System</span>
      </footer>
    </div>
  );
}
