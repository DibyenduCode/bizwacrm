'use client';

// ============================================================
// /join/[token] — invitation redemption landing page.
// ============================================================

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Loader2,
  MailX,
  ShieldCheck,
  UsersRound,
  Building,
  UserCheck,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { createClient } from '@/lib/supabase/client';

interface PeekOk {
  ok: true;
  account_name: string;
  role: 'admin' | 'agent' | 'viewer';
  expires_at: string;
}
interface PeekFail {
  ok: false;
  reason: 'not_found' | 'used' | 'expired' | 'server_error';
}
type PeekResult = PeekOk | PeekFail;

const FAIL_KEY: Record<PeekFail['reason'], 'notFound' | 'used' | 'expired' | 'serverError'> = {
  not_found: 'notFound',
  used: 'used',
  expired: 'expired',
  server_error: 'serverError',
};

export default function JoinPage() {
  const params = useParams<{ token: string }>();
  const token = params?.token;
  const t = useTranslations('JoinPage');
  const tRoles = useTranslations('Settings.roles');

  const [peek, setPeek] = useState<PeekResult | null>(null);
  const [authedUserId, setAuthedUserId] = useState<string | null | undefined>(
    undefined,
  );
  const [accepting, setAccepting] = useState(false);
  const [conflictMessage, setConflictMessage] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  const loadPeekAndAuth = useCallback(async () => {
    if (!token) return;
    setPeek(null);
    setAuthedUserId(undefined);
    try {
      const [peekRes, authRes] = await Promise.all([
        fetch(`/api/invitations/${encodeURIComponent(token)}/peek`, {
          cache: 'no-store',
        }),
        createClient().auth.getUser(),
      ]);
      const peekBody = (await peekRes.json()) as PeekResult;
      setPeek(peekBody);
      setAuthedUserId(authRes.data.user?.id ?? null);
    } catch (err) {
      console.error('[join] peek error:', err);
      setPeek({ ok: false, reason: 'server_error' });
      setAuthedUserId(null);
    }
  }, [token]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const [peekRes, authRes] = await Promise.all([
          fetch(`/api/invitations/${encodeURIComponent(token)}/peek`, {
            cache: 'no-store',
          }),
          createClient().auth.getUser(),
        ]);
        const peekBody = (await peekRes.json()) as PeekResult;
        if (cancelled) return;
        setPeek(peekBody);
        setAuthedUserId(authRes.data.user?.id ?? null);
      } catch (err) {
        console.error('[join] peek error:', err);
        if (cancelled) return;
        setPeek({ ok: false, reason: 'server_error' });
        setAuthedUserId(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = useCallback(async () => {
    if (!token) return;
    setAccepting(true);
    try {
      const res = await fetch(
        `/api/invitations/${encodeURIComponent(token)}/redeem`,
        { method: 'POST' },
      );
      if (!res.ok) {
        const payload = (await res.json().catch(() => ({}))) as {
          error?: string;
        };
        if (res.status === 409) {
          setConflictMessage(payload.error || t('conflictDefault'));
        } else {
          toast.error(payload.error || t('acceptFailed'));
        }
        setAccepting(false);
        return;
      }
      toast.success(t('welcome'));
      window.location.href = '/dashboard';
    } catch (err) {
      console.error('[join] redeem error:', err);
      toast.error(t('serverUnreachable'));
      setAccepting(false);
    }
  }, [token, t]);

  const handleSignOutAndRetry = useCallback(async () => {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
      window.location.reload();
    } catch (err) {
      console.error('[join] sign-out error:', err);
      toast.error(t('signOutFailed'));
      setSigningOut(false);
    }
  }, [t]);

  // Ambient container wrapper
  const renderContainer = (content: React.ReactNode) => (
    <div className="min-h-screen w-full bg-background flex flex-col items-center justify-center p-4 text-foreground relative overflow-hidden">
      {/* Ambient Top Glow */}
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-primary/10 rounded-full blur-[110px] pointer-events-none" />

      <div style={{ maxWidth: "460px", width: "100%" }} className="flex flex-col items-center mx-auto relative z-10">
        {content}
        {/* Trust badge */}
        <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span>Multi-Tenant Architecture & End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );

  // ----- Loading state -----
  if (peek === null || authedUserId === undefined) {
    return renderContainer(
      <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-8 sm:p-12 shadow-xl flex flex-col items-center gap-4 text-center">
        <div className="h-14 w-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
          <Loader2 className="h-7 w-7 animate-spin text-primary" />
        </div>
        <div>
          <h3 className="text-base font-bold text-foreground">Verifying Invitation</h3>
          <p className="text-xs text-muted-foreground mt-1">{t('verifying')}</p>
        </div>
      </div>
    );
  }

  // ----- Peek failed -----
  if (!peek.ok) {
    const failKey = FAIL_KEY[peek.reason];
    return renderContainer(
      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center mb-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive mb-3 shadow-xs">
            <MailX className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {t(`fail.${failKey}Title`)}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
            {t(`fail.${failKey}Body`)}
          </p>
        </div>

        <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl flex flex-col gap-3">
          {peek.reason === 'server_error' ? (
            <>
              <button
                onClick={loadPeekAndAuth}
                className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {t('tryAgain')}
              </button>
              <Link href="/signup">
                <Button
                  variant="outline"
                  className="w-full h-10 border-border text-muted-foreground hover:bg-muted hover:text-foreground text-xs rounded-xl"
                >
                  {t('createNewAccount')}
                </Button>
              </Link>
            </>
          ) : (
            <>
              <Link href="/signup">
                <button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all">
                  <span>{t('createNewAccount')}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </Link>
              <Link href="/login">
                <Button
                  variant="outline"
                  className="w-full h-10 border-border text-muted-foreground hover:bg-muted hover:text-foreground text-xs rounded-xl"
                >
                  {t('signIn')}
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }

  // ----- Peek OK -----
  const inviteHeaderNode = (
    <div className="flex flex-col items-center mb-6 text-center">
      <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm mb-3">
        <UsersRound className="h-8 w-8 text-primary" />
      </div>

      <div className="flex items-center gap-2 mb-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">WACRM</h1>
        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/15 border border-primary/30 text-primary">
          Workspace Invitation
        </span>
      </div>

      <p className="text-sm text-muted-foreground mt-1">
        You have been invited to collaborate on WhatsApp conversations
      </p>
    </div>
  );

  // Invite Details Card Content
  const inviteCardDetails = (
    <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-3 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground font-bold text-sm">
          <Building className="h-4 w-4 text-primary shrink-0" />
          <span>{peek.account_name}</span>
        </div>
        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold capitalize bg-primary/15 text-primary border border-primary/25">
          {tRoles(peek.role)} Role
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
        <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        <span>
          Valid until{' '}
          <strong className="text-foreground font-mono">
            {new Date(peek.expires_at).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </strong>
        </span>
      </div>
    </div>
  );

  // ----- Authed: show Accept button -----
  if (authedUserId) {
    return renderContainer(
      <div className="w-full flex flex-col items-center">
        {inviteHeaderNode}

        <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
          <div className="mb-4">
            <h2 className="text-lg font-bold tracking-tight text-foreground">
              {t.rich('invitedTo', {
                name: peek.account_name,
                account: (chunks) => <span className="text-primary">{chunks}</span>,
              })}
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              You are signed in and ready to join this company workspace.
            </p>
          </div>

          {inviteCardDetails}

          <div className="flex flex-col gap-3">
            <button
              onClick={handleAccept}
              disabled={accepting}
              className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {accepting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('accepting')}</span>
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  <span>{t('acceptInvitation')}</span>
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              {t('acceptNote', { name: peek.account_name })}
            </p>
          </div>
        </div>

        {/* Conflict modal */}
        <Dialog
          open={conflictMessage !== null}
          onOpenChange={(open) => {
            if (!open) setConflictMessage(null);
          }}
        >
          <DialogContent className="bg-card border-border sm:max-w-md rounded-2xl shadow-xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground text-base">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                {t('conflictTitle', { name: peek.account_name })}
              </DialogTitle>
              <DialogDescription className="text-muted-foreground text-xs mt-1">
                {conflictMessage}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 py-2 text-xs text-muted-foreground">
              <p>
                {t.rich('conflictBody', {
                  name: peek.account_name,
                  account: (chunks) => (
                    <span className="text-foreground font-semibold">{chunks}</span>
                  ),
                })}
              </p>
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConflictMessage(null)}
                className="border-border text-foreground hover:bg-muted rounded-xl"
              >
                {t('staySignedIn')}
              </Button>
              <Button
                size="sm"
                onClick={handleSignOutAndRetry}
                disabled={signingOut}
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl"
              >
                {signingOut ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('signingOut')}</span>
                  </>
                ) : (
                  t('signOutSwitch')
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ----- Not authed: prompt to sign up or sign in -----
  return renderContainer(
    <div className="w-full flex flex-col items-center">
      {inviteHeaderNode}

      <div className="w-full bg-card text-card-foreground border border-border rounded-2xl p-6 sm:p-8 shadow-xl">
        <div className="mb-4">
          <h2 className="text-lg font-bold tracking-tight text-foreground">
            {t.rich('invitedTo', {
              name: peek.account_name,
              account: (chunks) => <span className="text-primary">{chunks}</span>,
            })}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Create an account or sign in with your email to claim your access.
          </p>
        </div>

        {inviteCardDetails}

        <div className="flex flex-col gap-2.5">
          <Link href={`/signup?invite=${encodeURIComponent(token!)}`}>
            <button className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer">
              <UserCheck className="h-4 w-4" />
              <span>{t('createAndJoin')}</span>
            </button>
          </Link>
          <Link href={`/login?invite=${encodeURIComponent(token!)}`}>
            <Button
              variant="outline"
              className="w-full h-10 border-border text-muted-foreground hover:bg-muted hover:text-foreground text-xs rounded-xl"
            >
              {t('haveAccount')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
