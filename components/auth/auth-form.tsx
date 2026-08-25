"use client";

import { useState, useEffect } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  AlertCircle,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAuthLocale, AuthArrowForward } from "@/components/auth/auth-locale-provider";
import {
  getAuthErrorMap,
  parseAuthLoginError,
} from "@/lib/auth/auth-i18n";
import { useAuthProviders } from "@/lib/auth/use-auth-providers";

const BRAND_ICON = "/brand/App-Logo.png";

const EASE = [0.22, 1, 0.36, 1] as const;

interface AuthProviders {
  google: boolean;
  email: boolean;
  credentials?: boolean;
}

interface AuthFormProps {
  mode: "login" | "signup";
  providers: AuthProviders;
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px]" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const PENDING_WELCOME_KEY = "ettajer_pending_welcome";

const REMEMBER_ME_KEY = "ettajer_remember_me";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label
      htmlFor={htmlFor}
      className="text-[13px] font-semibold tracking-[-0.01em] text-neutral-800"
    >
      {children}
    </label>
  );
}

function IconField({
  id,
  icon: Icon,
  rightSlot,
  className,
  compact,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: typeof Mail;
  rightSlot?: React.ReactNode;
  compact?: boolean;
}) {
  return (
    <div className="group/field relative">
      <Icon
        className={cn(
          "pointer-events-none absolute start-3.5 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors duration-200 group-focus-within/field:text-[#007AFF]",
          compact ? "h-3.5 w-3.5" : "h-[17px] w-[17px]",
        )}
        strokeWidth={1.75}
      />
      <Input
        id={id}
        className={cn(
          "rounded-2xl border-neutral-200/90 bg-white ps-10 pe-10 shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:border-[#007AFF]/70 focus-visible:bg-white focus-visible:shadow-[0_0_0_4px_rgba(0,122,255,0.12)] focus-visible:ring-0",
          compact ? "h-11 text-[15px] rounded-xl sm:h-9 sm:text-[13.5px] sm:rounded-lg" : "h-12 text-[15px]",
          className,
        )}
        {...props}
      />
      {rightSlot ? (
        <div className="absolute end-2 top-1/2 -translate-y-1/2">{rightSlot}</div>
      ) : null}
    </div>
  );
}

const cardShell =
  "relative overflow-hidden rounded-2xl border border-white/90 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.12)] sm:rounded-xl sm:bg-white/90 sm:shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_16px_-4px_rgba(15,23,42,0.06),0_24px_48px_-12px_rgba(15,23,42,0.1)] sm:backdrop-blur-xl sm:backdrop-saturate-150";

export function AuthForm({ mode, providers }: AuthFormProps) {
  const { copy: authCopy } = useAuthLocale();
  const liveProviders = useAuthProviders(providers);
  const c = mode === "login"
    ? {
        title: authCopy.login.title,
        subtitle: authCopy.login.subtitle,
        emailCta: authCopy.login.signIn,
        switch: {
          text: authCopy.login.switchText,
          link: authCopy.login.switchLink,
          href: "/signup",
        },
      }
    : {
        title: authCopy.signup.title,
        subtitle: authCopy.signup.subtitle,
        emailCta: authCopy.signup.createAccount,
        switch: {
          text: authCopy.signup.switchText,
          link: authCopy.signup.switchLink,
          href: "/login",
        },
      };
  const err = authCopy.errors;
  const authErrors = getAuthErrorMap(authCopy);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [needsActivation, setNeedsActivation] = useState(false);
  const searchParams = useSearchParams();
  const isVerify = searchParams.get("verify") === "true";
  const authError = searchParams.get("error");
  const passwordResetSuccess = searchParams.get("reset") === "success";
  const activatedSuccess = searchParams.get("activated") === "true";
  const queryEmail = searchParams.get("email") ?? "";
  const callbackUrl = searchParams.get("callbackUrl") ?? "/dashboard";
  const isLogin = mode === "login";

  const postAuthUrl = mode === "signup" ? "/onboarding" : callbackUrl;
  const errorMessage = authError
    ? (authErrors[authError] ?? err.default)
    : null;

  useEffect(() => {
    try {
      const stored = localStorage.getItem(REMEMBER_ME_KEY);
      if (stored === "false") setRememberMe(false);
      if (stored === "true") setRememberMe(true);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? "true" : "false");
    } catch {
      /* ignore */
    }
  }, [rememberMe]);

  useEffect(() => {
    if (passwordResetSuccess && queryEmail && mode === "login" && !email) {
      setEmail(queryEmail);
      toast.success(err.passwordUpdatedToast);
    }
  }, [passwordResetSuccess, queryEmail, mode, email, err.passwordUpdatedToast]);

  useEffect(() => {
    if (activatedSuccess && mode === "login" && queryEmail && !email) {
      setEmail(queryEmail);
    }
  }, [activatedSuccess, queryEmail, mode, email]);

  const sendMagicLink = async () => {
    if (!liveProviders.email) {
      toast.error(err.emailNotConfigured);
      return false;
    }
    if (!email.trim()) {
      toast.error(err.enterEmail);
      return false;
    }

    setLoading(true);
    try {
      const result = await signIn("email", {
        email: email.trim(),
        redirect: false,
        callbackUrl: postAuthUrl,
      });

      if (result?.error) {
        toast.error(
          authErrors[result.error] ?? err.unableSendLink,
        );
        return false;
      }
      if (result?.ok) {
        setEmailSent(true);
        return true;
      }
    } catch {
      toast.error(err.somethingWrong);
    } finally {
      setLoading(false);
    }
    return false;
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    await sendMagicLink();
  };

  const handleGoogleSignIn = async () => {
    if (!liveProviders.google) {
      toast.error(err.googleNotConfigured);
      return;
    }
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: postAuthUrl });
    } catch {
      toast.error(err.unableGoogle);
      setGoogleLoading(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    // Password managers need type=password at submit time to offer saving.
    flushSync(() => setShowPassword(false));
    setLoginError(null);
    setNeedsActivation(false);
    if (!email.trim()) {
      setLoginError(err.enterEmail);
      return;
    }
    if (!password) {
      setLoginError(err.enterPassword);
      return;
    }

    setLoading(true);
    try {
      const lockCheck = await fetch("/api/auth/check-lock", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (lockCheck.ok) {
        const lockData = (await lockCheck.json()) as {
          locked?: boolean;
          minutesRemaining?: number;
        };

        if (lockData.locked) {
          const msg = err.accountLockedMinutes(String(lockData.minutesRemaining ?? 15));
          setLoginError(msg);
          toast.error(msg);
          return;
        }
      }

      const result = await signIn("credentials", {
        redirect: false,
        email: email.trim().toLowerCase(),
        password,
        remember: rememberMe ? "true" : "false",
        callbackUrl: postAuthUrl,
      });

      if (result?.error) {
        if (result.error === "EMAIL_NOT_VERIFIED") {
          setNeedsActivation(true);
        } else {
          const message = parseAuthLoginError(result.error, authCopy);
          setLoginError(message);
          if (!message.includes(err.noAccountFoundPhrase)) {
            toast.error(message);
          }
        }
      } else if (result?.ok) {
        // Full navigation helps Chrome/Google Password Manager detect a successful login.
        sessionStorage.removeItem(PENDING_WELCOME_KEY);
        try {
          const targetRes = await fetch("/api/auth/redirect-target");
          const targetData = (await targetRes.json()) as { redirect?: string };
          window.location.assign(targetData.redirect ?? "/dashboard");
        } catch {
          window.location.assign("/dashboard");
        }
        return;
      }
    } catch {
      toast.error(err.unableSignIn);
    } finally {
      setLoading(false);
    }
  };

  if (isVerify || emailSent) {
    const l = authCopy.login;
    return (
      <div className={cn(cardShell, "p-7 text-center sm:p-9")}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 to-transparent"
          aria-hidden
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 ring-1 ring-blue-100/80"
        >
          <Mail className="h-6 w-6" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-2xl font-semibold tracking-[-0.03em] text-neutral-900">
          {l.checkInbox}
        </h1>
        <p className="mx-auto mt-3 max-w-[280px] text-[13px] leading-relaxed text-neutral-500">
          {email ? (
            <>
              {l.sentLinkPrefix}{" "}
              <span className="font-medium text-neutral-800">{email}</span>
            </>
          ) : (
            l.openEmailLink
          )}
        </p>
        <div className="mt-8 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={() => void sendMagicLink()}
            disabled={loading || !email.trim()}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-medium text-white transition-all duration-200 hover:bg-neutral-800 active:scale-[0.98] disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {loading ? l.sending : l.resendLink}
          </button>
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="h-11 rounded-xl border border-neutral-200/80 bg-white/60 text-sm font-medium text-neutral-600 transition-all duration-200 hover:border-neutral-300 hover:bg-white active:scale-[0.98]"
          >
            {l.useDifferentEmail}
          </button>
        </div>
      </div>
    );
  }

  const l = isLogin ? authCopy.login : null;

  const showGoogle = liveProviders.google;
  const showEmailLink = liveProviders.email;
  // Password credentials are always registered in lib/auth.ts. Do not treat
  // "no Google / no magic-link email" as zero providers — that false alarm
  // showed "No sign-in providers configured" on local/dev without OAuth env.
  const noProviders =
    !liveProviders.google && !liveProviders.email && !liveProviders.credentials;

  return (
    <div>
      <div className={cardShell}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#007AFF]/55 to-transparent"
          aria-hidden
        />
        {isLogin ? (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE }}
            className="relative flex flex-col items-center px-4 pb-1 pt-5 text-center sm:pt-4"
          >
            <Image
              src={BRAND_ICON}
              alt="Ettajer"
              width={40}
              height={40}
              className="mb-2.5 h-11 w-11 object-contain sm:mb-2 sm:h-10 sm:w-10"
              priority
            />
            <h1 className="text-[1.45rem] font-bold leading-none tracking-[-0.03em] text-neutral-950 sm:text-[1.35rem]">
              {c.title}
            </h1>
          </motion.div>
        ) : (
          <div className="relative border-b border-neutral-100/80 px-7 pb-6 pt-8 text-center sm:px-9 sm:pt-9">
            <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.035em] text-neutral-900">
              {c.title}
            </h1>
            <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">
              {c.subtitle}
            </p>
          </div>
        )}

        <div className={cn("relative", isLogin ? "px-4 pb-4 pt-3 sm:pb-3.5 sm:pt-2.5" : "px-7 py-7 sm:px-9 sm:py-8")}>
          <AnimatePresence>
            {activatedSuccess && isLogin ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
                role="status"
              >
                <div className="flex gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/90 px-3.5 py-3 text-start text-[13px] text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p>{authCopy.login.accountActivated}</p>
                </div>
              </motion.div>
            ) : null}
            {passwordResetSuccess && isLogin ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
                role="status"
              >
                <div className="flex gap-2.5 rounded-xl border border-emerald-200/70 bg-emerald-50/90 px-3.5 py-3 text-start text-[13px] text-emerald-900">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <p>
                    {authCopy.login.passwordUpdated}
                    {queryEmail ? authCopy.login.passwordUpdatedFor(queryEmail) : "."}
                  </p>
                </div>
              </motion.div>
            ) : null}
            {needsActivation && isLogin ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
                role="status"
              >
                <div className="flex gap-2.5 rounded-xl border border-blue-200/70 bg-blue-50/90 px-3.5 py-3 text-start text-[13px] text-blue-900">
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                  <div>
                    <p>{authCopy.login.needsActivation}</p>
                    <Link
                      href={`/activate?email=${encodeURIComponent(email.trim())}`}
                      className="mt-2 inline-flex items-center gap-1 font-semibold text-blue-800 underline-offset-2 hover:underline"
                    >
                      {authCopy.login.goToActivation}
                      <AuthArrowForward className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ) : null}
            {(errorMessage || loginError) && !needsActivation ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-5 overflow-hidden"
                role="alert"
              >
                <div className="flex gap-2.5 rounded-xl border border-red-200/70 bg-red-50/90 px-3.5 py-3 text-start text-[13px] text-red-800">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <div>
                    <p>{loginError ?? errorMessage}</p>
                    {loginError?.includes(err.noAccountFoundPhrase) ? (
                      <Link
                        href="/signup"
                        className="mt-2 inline-block font-semibold text-red-900 underline-offset-2 hover:underline"
                      >
                        {authCopy.login.createAccountLink}
                      </Link>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {noProviders ? (
            <div
              className="mb-5 rounded-xl border border-amber-200/70 bg-amber-50/90 px-3.5 py-3 text-center text-[13px] text-amber-800"
              role="alert"
            >
              {authCopy.login.noProviders}
            </div>
          ) : null}

          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
            method="post"
            action="/login"
            autoComplete="on"
            onSubmit={isLogin ? handlePasswordSignIn : handleEmailSignIn}
            className={cn(isLogin ? "space-y-2" : "space-y-4")}
          >
            <div className={cn(!isLogin && "space-y-1.5")}>
              {!isLogin ? (
                <FieldLabel htmlFor="email">{authCopy.signup.email}</FieldLabel>
              ) : null}
              <IconField
                id="email"
                name="email"
                icon={Mail}
                compact={isLogin}
                type="email"
                inputMode="email"
                placeholder={isLogin && l ? l.emailPlaceholder : authCopy.signup.emailPlaceholder}
                aria-label={isLogin && l ? l.email : authCopy.signup.email}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (isLogin) {
                    setLoginError(null);
                    setNeedsActivation(false);
                  }
                }}
                required
                autoComplete={isLogin ? "username" : "email"}
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                autoFocus
              />
            </div>

            {isLogin && l ? (
              <div className="space-y-1.5">
                <IconField
                  id="password"
                  name="password"
                  icon={Lock}
                  compact
                  type={showPassword ? "text" : "password"}
                  placeholder={l.passwordPlaceholder}
                  aria-label={l.password}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setLoginError(null);
                  }}
                  required
                  autoComplete="current-password"
                  rightSlot={
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowPassword((v) => !v)}
                      className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]/30"
                      aria-label={showPassword ? l.hidePassword : l.showPassword}
                    >
                      {showPassword ? (
                        <EyeOff className="h-3.5 w-3.5" />
                      ) : (
                        <Eye className="h-3.5 w-3.5" />
                      )}
                    </button>
                  }
                />
                <div className="flex items-center justify-between gap-2 pt-0.5">
                  <label className="group inline-flex cursor-pointer items-center gap-2">
                    <span className="relative flex h-4 w-4 items-center justify-center">
                      <input
                        type="checkbox"
                        name="remember"
                        value="true"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="peer sr-only"
                      />
                      <span className="h-4 w-4 rounded-[4px] border border-neutral-300/90 bg-white transition-all duration-200 peer-checked:border-[#007AFF] peer-checked:bg-[#007AFF] peer-focus-visible:ring-2 peer-focus-visible:ring-[#007AFF]/30" />
                      <svg
                        className="pointer-events-none absolute h-2.5 w-2.5 text-white opacity-0 transition-opacity peer-checked:opacity-100"
                        viewBox="0 0 12 12"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M2.5 6L5 8.5L9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.75"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="text-[12px] font-medium text-neutral-600">
                      {l.staySignedIn}
                    </span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-[12px] font-medium text-[#007AFF] hover:underline"
                  >
                    {l.forgotPassword}
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-[12px] leading-relaxed text-neutral-400">
                {authCopy.login.emailLinkHint}
              </p>
            )}

            <button
              type="submit"
              disabled={loading || (!isLogin && !showEmailLink)}
              className={cn(
                "group relative flex w-full items-center justify-center gap-2 overflow-hidden bg-[#007AFF] text-sm font-semibold text-white shadow-none transition-all duration-200 hover:bg-[#0066d6] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60",
                isLogin ? "mt-1.5 h-11 rounded-xl text-[15px] sm:mt-1 sm:h-9 sm:rounded-lg sm:text-sm" : "mt-2 h-12 rounded-2xl bg-neutral-950 hover:bg-neutral-800",
              )}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isLogin && l ? l.signingIn : authCopy.login.sending}
                </>
              ) : (
                <>
                  {isLogin && l ? l.signIn : c.emailCta}
                  {!isLogin ? (
                    <AuthArrowForward className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                  ) : null}
                </>
              )}
            </button>
          </motion.form>

          {isLogin && showGoogle ? (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.08, ease: EASE }}
              className="mt-3"
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <div className="h-px flex-1 bg-neutral-200/90" />
                <span className="text-[11px] font-medium text-neutral-400">
                  {authCopy.login.or}
                </span>
                <div className="h-px flex-1 bg-neutral-200/90" />
              </div>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading || loading}
                className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-[14px] font-semibold text-neutral-800 transition-all hover:bg-neutral-50 active:scale-[0.985] disabled:opacity-60 sm:h-9 sm:rounded-lg sm:text-[13px]"
              >
                {googleLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-neutral-500" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? authCopy.login.connectingGoogle : authCopy.login.continueGoogle}
              </button>
            </motion.div>
          ) : null}

          {!isLogin && showGoogle ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.16, ease: EASE }}
            >
              <div className="my-5 flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-neutral-200/90" />
                <span className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-400">
                  {authCopy.login.or}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-neutral-200/90" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={googleLoading}
                className="group flex h-12 w-full items-center justify-center gap-2.5 rounded-2xl border border-neutral-200/90 bg-white text-sm font-medium text-neutral-800 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-all duration-200 hover:border-neutral-300 hover:bg-[#fafbfc] hover:shadow-[0_4px_12px_rgba(15,23,42,0.06)] active:scale-[0.985] disabled:opacity-60"
              >
                {googleLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-neutral-500" />
                ) : (
                  <GoogleIcon />
                )}
                {googleLoading ? authCopy.login.connectingGoogle : authCopy.login.continueGoogle}
              </button>
            </motion.div>
          ) : null}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.15 }}
        className={cn(
          "text-center text-[12.5px] text-neutral-500",
          isLogin ? "mt-3.5 sm:mt-3" : "mt-7 space-y-1.5 text-[13px]",
        )}
      >
        {isLogin ? (
          <Link
            href={c.switch.href}
            className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-neutral-200 bg-white text-[14px] font-semibold text-[#007AFF] transition-colors hover:bg-neutral-50 sm:h-9 sm:rounded-lg sm:text-[13px]"
          >
            {c.switch.link}
          </Link>
        ) : (
          <p>
            {c.switch.text}{" "}
            <Link
              href={c.switch.href}
              className="font-semibold text-neutral-900 underline-offset-3 transition-colors hover:underline"
            >
              {c.switch.link}
            </Link>
          </p>
        )}
      </motion.div>
    </div>
  );
}
