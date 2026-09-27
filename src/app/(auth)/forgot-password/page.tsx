"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Loader2,
  ShieldAlert,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPasswordPage");
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[580px] h-[320px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />

        <div style={{ maxWidth: "440px", width: "100%" }} className="flex flex-col items-center mx-auto relative z-10">
          {/* Brand Header */}
          <div className="flex flex-col items-center mb-6 text-center">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm mb-3">
              <CheckCircle2 className="h-7 w-7 text-emerald-500" />
            </div>

            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold tracking-tight text-foreground">WACRM</h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400">
                Email Sent
              </span>
            </div>
          </div>

          {/* Success Card */}
          <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl text-center space-y-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-foreground">
                {t("checkEmailTitle")}
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-2 leading-relaxed">
                {t.rich("checkEmailDesc", {
                  email,
                  strong: (chunks) => (
                    <span className="font-semibold text-foreground bg-muted px-1.5 py-0.5 rounded-md border border-border">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground text-left">
              <p className="font-semibold text-foreground mb-1">Next steps:</p>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Check your inbox and spam folder for the reset link</li>
                <li>The security link remains valid for 24 hours</li>
              </ul>
            </div>

            <Link
              href="/login"
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t("backToSignIn")}</span>
            </Link>
          </div>

          {/* Bottom Security Note */}
          <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-4 w-4 text-primary" />
            <span>Secure Password Recovery • Multi-Tenant CRM</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground relative overflow-y-auto">
      {/* Ambient Top Glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[260px] bg-primary/10 rounded-full blur-[90px] pointer-events-none" />

      <div style={{ maxWidth: "420px", width: "100%" }} className="flex flex-col items-center mx-auto relative z-10 py-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs mb-3">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">WACRM</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/15 border border-primary/30 text-primary">
              Account Recovery
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {t("desc")}
          </p>
        </div>

        {/* Reset Request Card */}
        <div className="w-full bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-7 shadow-lg">
          <div className="mb-5">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              {t("title")}
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Enter your work email address to receive reset instructions
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5">
              <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-foreground">
                {t("emailLabel")}
              </Label>
              <div className="relative flex items-center">
                <Mail
                  style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
                  className="h-4 w-4 text-muted-foreground pointer-events-none"
                />
                <input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ height: "44px", paddingLeft: "2.6rem", paddingRight: "1rem" }}
                  className="w-full bg-background border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ height: "44px" }}
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("sending")}</span>
                </>
              ) : (
                <>
                  <span>{t("sendLink")}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Back to Sign In */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>{t("backToSignIn")}</span>
            </Link>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>Encrypted Link Delivery & Single Sign-On Ready</span>
        </div>
      </div>
    </div>
  );
}
