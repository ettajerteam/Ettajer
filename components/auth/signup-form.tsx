"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useAuthLocale } from "@/components/auth/auth-locale-provider";
import { setOAuthSignupCookies } from "@/lib/auth/oauth-signup";
import { useAuthProviders } from "@/lib/auth/use-auth-providers";
import {
  isSignupPasswordValid,
  isValidSignupEmail,
} from "@/lib/validations/signup";
import { cn } from "@/lib/utils";

const BRAND_ICON = "/brand/App-Logo.png";
const SIGNUP_PASSWORD_KEY = "ettajer_signup_password";
const EASE = [0.22, 1, 0.36, 1] as const;

const cardShell =
  "relative overflow-hidden rounded-2xl border border-white/90 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_24px_-8px_rgba(15,23,42,0.12)] sm:rounded-xl sm:bg-white/90 sm:shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_8px_16px_-4px_rgba(15,23,42,0.06),0_24px_48px_-12px_rgba(15,23,42,0.1)] sm:backdrop-blur-xl";

const fieldClassName =
  "h-10 rounded-lg border-neutral-200/90 bg-white text-[14px] shadow-[inset_0_1px_2px_rgba(15,23,42,0.03)] transition-all placeholder:text-neutral-400 hover:border-neutral-300 focus-visible:border-[#007AFF]/70 focus-visible:shadow-[0_0_0_3px_rgba(0,122,255,0.12)] focus-visible:ring-0 sm:h-[34px] sm:text-[13px]";

function IconField({
  id,
  icon: Icon,
  rightSlot,
  className,
  inputClassName,
  error,
  ...props
}: React.ComponentProps<typeof Input> & {
  icon: typeof Mail;
  rightSlot?: React.ReactNode;
  inputClassName?: string;
  error?: boolean;
}) {
  return (
    <div className="group/field relative">
      <Icon
        className={cn(
          "pointer-events-none absolute start-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 transition-colors",
          error ? "text-red-400" : "text-neutral-400 group-focus-within/field:text-[#007AFF]",
        )}
        strokeWidth={1.75}
      />
      <Input
        id={id}
        className={cn(
          fieldClassName,
          "ps-9 pe-9",
          error &&
            "border-red-300/80 focus-visible:border-red-400 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
          inputClassName,
          className,
        )}
        {...props}
      />
      {rightSlot ? <div className="absolute end-1.5 top-1/2 -translate-y-1/2">{rightSlot}</div> : null}
    </div>
  );
}

interface SignupFormProps {
  providers: {
    google: boolean;
  };
}

export function SignupForm({ providers }: SignupFormProps) {
  const { copy: authCopy, locale } = useAuthLocale();
  const s = authCopy.signup;
  const err = authCopy.errors;
  const liveProviders = useAuthProviders({ google: providers.google });

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<"founder_full" | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("error") === "founder_full") {
      setErrorCode("founder_full");
      setError("All 100 founder spots have been claimed. Join the waitlist soon.");
    }
  }, [searchParams]);

  const showGoogle = liveProviders.google;

  const emailFormatError =
    emailTouched && email.trim().length > 0 && !isValidSignupEmail(email)
      ? err.invalidEmail
      : null;

  const passwordsMismatch =
    confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;

  const handleGoogleSignUp = async () => {
    if (!showGoogle) {
      setError(err.googleNotConfigured);
      return;
    }

    setError(null);
    setErrorCode(null);
    setGoogleLoading(true);
    try {
      setOAuthSignupCookies(true, marketingEmails);
      await signIn("google", { callbackUrl: "/onboarding" });
    } catch {
      setError(err.unableGoogle);
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setErrorCode(null);
    setEmailTouched(true);

    if (!firstName.trim()) {
      setError(err.enterFirstName);
      return;
    }
    if (!surname.trim()) {
      setError(err.enterSurname);
      return;
    }
    if (!email.trim()) {
      setError(err.enterEmail);
      return;
    }
    if (!isValidSignupEmail(email)) {
      setError(err.invalidEmail);
      return;
    }
    if (!isSignupPasswordValid(password)) {
      setError(err.passwordRequirements);
      return;
    }
    if (password !== confirmPassword) {
      setError(err.passwordsDoNotMatch);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          surname: surname.trim(),
          email: email.trim().toLowerCase(),
          password,
          confirmPassword,
          acceptTerms: true,
          marketingEmails,
          locale,
        }),
      });

      const data = (await res.json()) as {
        error?: string;
        success?: boolean;
        needsActivation?: boolean;
        email?: string;
      };

      if (!res.ok) {
        if (res.status === 403) setErrorCode("founder_full");
        if (res.status === 429) {
          setError(data.error ?? err.tooManySignups);
          return;
        }
        setError(data.error ?? err.unableCreateAccount);
        return;
      }

      if (data.needsActivation && data.email) {
        sessionStorage.setItem(SIGNUP_PASSWORD_KEY, password);
        setSuccessEmail(data.email);
        window.setTimeout(() => {
          window.location.href = `/activate?email=${encodeURIComponent(data.email!)}&sent=1`;
        }, 1600);
        return;
      }
    } catch {
      setError(err.default);
    } finally {
      setLoading(false);
    }
  };

  if (successEmail) {
    return (
      <div className={cn(cardShell, "px-5 py-6 text-center sm:p-7")}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 ring-1 ring-emerald-100"
        >
          <CheckCircle2 className="h-5 w-5" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-[1.2rem] font-bold tracking-[-0.03em] text-neutral-950">
          {s.accountCreated}
        </h1>
        <p className="mx-auto mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-neutral-500">
          {s.codeSentPrefix}{" "}
          <span className="font-medium text-neutral-800">{successEmail}</span>
        </p>
        <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-neutral-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {s.redirecting}
        </div>
      </div>
    );
  }

  const legalLine = (
    <>
      {s.termsPrefix}{" "}
      <Link
        href="/terms"
        className="font-medium text-neutral-600 underline-offset-2 hover:underline"
      >
        {s.terms}
      </Link>{" "}
      {s.and}{" "}
      <Link
        href="/privacy"
        className="font-medium text-neutral-600 underline-offset-2 hover:underline"
      >
        {s.privacy}
      </Link>
    </>
  );

  return (
    <div>
      <div className={cardShell}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#007AFF]/55 to-transparent"
          aria-hidden
        />

        <div className="relative flex flex-col items-center px-3.5 pb-0.5 pt-3 text-center sm:pt-2.5">
          <Image
            src={BRAND_ICON}
            alt="Ettajer"
            width={32}
            height={32}
            className="mb-1.5 h-8 w-8 object-contain sm:h-7 sm:w-7"
            priority
          />
          <h1 className="text-[1.2rem] font-bold leading-none tracking-[-0.03em] text-neutral-950 sm:text-[1.15rem]">
            {s.title}
          </h1>
        </div>

        <div className="relative px-3.5 pb-3 pt-2 sm:pb-2.5 sm:pt-1.5">
          {error ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-1.5 overflow-hidden"
              role="alert"
            >
              <div className="flex gap-1.5 rounded-lg border border-red-200/70 bg-red-50/90 px-2.5 py-1.5 text-start text-[11px] text-red-800">
                <AlertCircle className="mt-0.5 h-3 w-3 shrink-0" />
                <div>
                  <p>{error}</p>
                  {errorCode === "founder_full" ? (
                    <Link
                      href="/contact"
                      className="mt-0.5 inline-block font-semibold text-red-900 underline-offset-2 hover:underline"
                    >
                      {s.waitlist}
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}

          <motion.form
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05, ease: EASE }}
            onSubmit={handleSubmit}
            className="space-y-1.5"
          >
            <div className="grid grid-cols-2 gap-1.5">
              <IconField
                id="firstName"
                icon={User}
                type="text"
                placeholder={s.firstNamePlaceholder}
                aria-label={s.firstName}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                autoComplete="given-name"
                autoFocus
                disabled={loading}
              />
              <Input
                id="surname"
                type="text"
                placeholder={s.surnamePlaceholder}
                aria-label={s.surname}
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                required
                autoComplete="family-name"
                disabled={loading}
                className={fieldClassName}
              />
            </div>

            <div>
              <IconField
                id="email"
                icon={Mail}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={s.emailPlaceholder}
                aria-label={s.email}
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                onBlur={() => setEmailTouched(true)}
                required
                autoComplete="email"
                disabled={loading}
                error={!!emailFormatError}
                aria-invalid={!!emailFormatError}
              />
              {emailFormatError ? (
                <p className="mt-0.5 text-[10px] text-red-600" role="alert">
                  {emailFormatError}
                </p>
              ) : null}
            </div>

            <IconField
              id="password"
              icon={Lock}
              type={showPassword ? "text" : "password"}
              placeholder={s.passwordPlaceholder}
              aria-label={s.password}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              minLength={8}
              disabled={loading}
              rightSlot={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                  aria-label={
                    showPassword ? authCopy.login.hidePassword : authCopy.login.showPassword
                  }
                >
                  {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                </button>
              }
            />

            <div>
              <IconField
                id="confirmPassword"
                icon={Lock}
                type={showConfirmPassword ? "text" : "password"}
                placeholder={s.confirmPlaceholder}
                aria-label={s.confirmPassword}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={8}
                disabled={loading}
                error={passwordsMismatch}
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    className="rounded-md p-1 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    aria-label={
                      showConfirmPassword
                        ? authCopy.login.hidePassword
                        : authCopy.login.showPassword
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                }
              />
              {passwordsMismatch ? (
                <p className="mt-0.5 text-[10px] text-red-600" role="alert">
                  {s.passwordsMismatch}
                </p>
              ) : null}
            </div>

            <label
              htmlFor="marketingEmails"
              className={cn(
                "flex cursor-pointer items-center gap-2 pt-0.5",
                (loading || googleLoading) && "cursor-not-allowed opacity-60",
              )}
            >
              <span className="relative flex h-3.5 w-3.5 shrink-0 items-center justify-center">
                <input
                  id="marketingEmails"
                  type="checkbox"
                  checked={marketingEmails}
                  onChange={(e) => setMarketingEmails(e.target.checked)}
                  disabled={loading || googleLoading}
                  className="peer sr-only"
                />
                <span className="h-3.5 w-3.5 rounded-[3px] border border-neutral-300/90 bg-white transition-all peer-checked:border-[#007AFF] peer-checked:bg-[#007AFF]" />
                <svg
                  className="pointer-events-none absolute h-2 w-2 text-white opacity-0 transition-opacity peer-checked:opacity-100"
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
              <span className="text-[10.5px] leading-snug text-neutral-500">{s.marketing}</span>
            </label>

            <p className="text-[10px] leading-snug text-neutral-400">{legalLine}</p>

            <button
              type="submit"
              disabled={loading || googleLoading}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-[#007AFF] text-[14px] font-semibold text-white transition-all hover:bg-[#0066d6] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60 sm:h-[34px] sm:text-[13px]"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  {s.creatingAccount}
                </>
              ) : (
                s.createAccount
              )}
            </button>
          </motion.form>

          {showGoogle ? (
            <div className="mt-2">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-px flex-1 bg-neutral-200/90" />
                <span className="text-[10px] font-medium text-neutral-400">
                  {authCopy.login.or}
                </span>
                <div className="h-px flex-1 bg-neutral-200/90" />
              </div>
              <GoogleAuthButton
                label={s.continueGoogle}
                loadingLabel={s.connectingGoogle}
                loading={googleLoading}
                disabled={loading}
                onClick={() => void handleGoogleSignUp()}
                className="h-10 rounded-lg text-[13px] sm:h-[34px] sm:text-[12.5px]"
              />
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-2.5 text-center text-[12px] text-neutral-500 sm:mt-2">
        {s.switchText}{" "}
        <Link
          href="/login"
          className="font-semibold text-[#007AFF] underline-offset-2 hover:underline"
        >
          {s.switchLink}
        </Link>
      </p>
    </div>
  );
}
