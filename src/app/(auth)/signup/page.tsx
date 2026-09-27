"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Label } from "@/components/ui/label";
import {
  MessageSquare,
  UsersRound,
  CheckCircle,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupPageInner />
    </Suspense>
  );
}

function SignupPageInner() {
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get("invite");
  const t = useTranslations("SignupPage");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsMismatch"));
      return;
    }

    if (password.length < 6) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    const emailRedirectTo = inviteToken
      ? `${window.location.origin}/join/${encodeURIComponent(inviteToken)}`
      : undefined;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        ...(emailRedirectTo ? { emailRedirectTo } : {}),
      },
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
      <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground">
        <div style={{ maxWidth: "440px", width: "100%" }} className="w-full bg-card text-card-foreground border border-border rounded-2xl p-8 shadow-xl text-center">
          <div className="mb-4 mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20 text-primary">
            <CheckCircle className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            {t("checkEmailTitle")}
          </h2>
          <p className="text-sm text-muted-foreground mt-2">
            {t.rich("checkEmailDesc", {
              email,
              strong: (chunks) => (
                <span className="font-semibold text-foreground">{chunks}</span>
              ),
            })}
          </p>

          <div className="mt-6 p-4 rounded-xl bg-muted/60 border border-border text-xs text-muted-foreground text-center">
            Please verify your email address to complete registration. Once verified, your account will be activated by the administrator.
          </div>

          <div className="mt-6">
            <Link
              href={
                inviteToken
                  ? `/login?invite=${encodeURIComponent(inviteToken)}`
                  : "/login"
              }
            >
              <button
                type="button"
                className="w-full h-11 border border-border bg-muted hover:bg-muted/80 text-foreground font-semibold text-sm rounded-xl transition-colors cursor-pointer"
              >
                {t("backToSignIn")}
              </button>
            </Link>
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
            {inviteToken ? (
              <UsersRound className="h-6 w-6 text-primary" />
            ) : (
              <MessageSquare className="h-6 w-6 text-primary" />
            )}
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-foreground">WACRM</h1>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/15 border border-primary/30 text-primary">
              WhatsApp CRM
            </span>
          </div>

          <p className="text-xs text-muted-foreground">
            {inviteToken ? t("titleJoin") : t("title")}
          </p>
        </div>

        {/* Signup Card */}
        <div className="w-full bg-card text-card-foreground border border-border/80 rounded-2xl p-6 sm:p-7 shadow-lg">
          <div className="mb-5">
            <h2 className="text-base font-bold tracking-tight text-foreground">
              Create Your Company Account
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Start with an isolated workspace and team management
            </p>
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-destructive/40 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2.5">
              <span className="font-bold">Error:</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs font-semibold text-foreground">
                {t("fullNameLabel")}
              </Label>
              <div className="relative flex items-center">
                <User
                  style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
                  className="h-4 w-4 text-muted-foreground pointer-events-none"
                />
                <input
                  id="fullName"
                  type="text"
                  placeholder={t("fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{ height: "44px", paddingLeft: "2.6rem", paddingRight: "1rem" }}
                  className="w-full bg-background border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                />
              </div>
            </div>

            {/* Email */}
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

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs font-semibold text-foreground">
                {t("passwordLabel")}
              </Label>
              <div className="relative flex items-center">
                <Lock
                  style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
                  className="h-4 w-4 text-muted-foreground pointer-events-none"
                />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("passwordPlaceholder")}
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

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs font-semibold text-foreground">
                {t("confirmPasswordLabel")}
              </Label>
              <div className="relative flex items-center">
                <Lock
                  style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)" }}
                  className="h-4 w-4 text-muted-foreground pointer-events-none"
                />
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder={t("confirmPasswordPlaceholder")}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{ height: "44px", paddingLeft: "2.6rem", paddingRight: "2.75rem" }}
                  className="w-full bg-background border border-input rounded-xl text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all shadow-2xs"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)" }}
                  className="text-muted-foreground hover:text-foreground p-1 transition-colors cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Create Account Button */}
            <button
              type="submit"
              disabled={loading}
              style={{ height: "44px" }}
              className="w-full mt-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-xl shadow-sm flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t("creating")}</span>
                </>
              ) : (
                <>
                  <span>{t("submit")}</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Sign In Link */}
          <div className="mt-6 pt-5 border-t border-border text-center">
            <p className="text-xs text-muted-foreground">
              {t("haveAccount")}{" "}
              <Link
                href={
                  inviteToken
                    ? `/login?invite=${encodeURIComponent(inviteToken)}`
                    : "/login"
                }
                className="font-bold text-primary hover:underline"
              >
                {t("signIn")}
              </Link>
            </p>
          </div>
        </div>

        {/* Bottom Trust Badge */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>Multi-Tenant Architecture & Official WhatsApp Cloud API</span>
        </div>
      </div>
    </div>
  );
}
