"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { AuthFlowSteps, SignupPasswordRequirements } from "@/components/auth/auth-flow";
import { GoogleAuthButton } from "@/components/auth/google-auth-button";
import { useAuthLocale, AuthArrowForward } from "@/components/auth/auth-locale-provider";
import { setOAuthSignupCookies } from "@/lib/auth/oauth-signup";
import { getFounderOnboardingFlow } from "@/lib/auth/auth-i18n";
import { useAuthProviders } from "@/lib/auth/use-auth-providers";
import {
  isSignupPasswordValid,
  isValidSignupEmail,
} from "@/lib/validations/signup";
import { cn } from "@/lib/utils";

const SIGNUP_PASSWORD_KEY = "ettajer_signup_password";
const EASE = [0.22, 1, 0.36, 1] as const;

const cardShell =
  "relative overflow-hidden rounded-[1.25rem] border border-white/80 bg-white/75 shadow-[0_0_0_1px_rgba(0,0,0,0.03),0_2px_4px_rgba(0,0,0,0.02),0_12px_40px_-8px_rgba(0,0,0,0.08)] backdrop-blur-xl backdrop-saturate-150";

const fieldClassName =
  "h-11 rounded-xl border-neutral-200/80 bg-white/80 text-[15px] shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)] transition-all duration-200 placeholder:text-neutral-400 hover:border-neutral-300 hover:bg-white focus-visible:border-blue-500/70 focus-visible:bg-white focus-visible:shadow-[0_0_0_3px_rgba(59,130,246,0.1)] focus-visible:ring-0";

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="text-[13px] font-medium tracking-[-0.01em] text-neutral-700">
      {children}
    </label>
  );
}

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
          "pointer-events-none absolute start-3.5 top-1/2 h-[17px] w-[17px] -translate-y-1/2 transition-colors duration-200",
          error ? "text-red-400" : "text-neutral-400 group-focus-within/field:text-blue-500",
        )}
        strokeWidth={1.75}
      />
      <Input
        id={id}
        className={cn(
          fieldClassName,
          "ps-10 pe-10",
          error && "border-red-300/80 focus-visible:border-red-400 focus-visible:shadow-[0_0_0_3px_rgba(239,68,68,0.12)]",
          inputClassName,
          className,
        )}
        {...props}
      />
      {rightSlot ? <div className="absolute end-2 top-1/2 -translate-y-1/2">{rightSlot}</div> : null}
    </div>
  );
}

function ConsentCheckbox({
  id,
  checked,
  onChange,
  disabled,
  children,
}: {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-xl border border-neutral-200/80 bg-white/60 px-3.5 py-3 transition-colors hover:bg-white/90",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
        className="mt-0.5 h-4 w-4 shrink-0 rounded border-neutral-300 text-neutral-900 focus:ring-blue-500/30"
      />
      <span className="text-[13px] leading-relaxed text-neutral-600">{children}</span>
    </label>
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
  const onboardingFlow = getFounderOnboardingFlow(authCopy);
  const liveProviders = useAuthProviders({ google: providers.google });

  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
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
      setError(
        "All 100 founder spots have been claimed. Join the waitlist soon.",
      );
    }
  }, [searchParams]);

  const showGoogle = liveProviders.google;

  const emailFormatError =
    emailTouched && email.trim().length > 0 && !isValidSignupEmail(email)
      ? err.invalidEmail
      : null;

  const passwordsMatch =
    confirmPassword.length > 0 && password.length > 0 && password === confirmPassword;
  const passwordsMismatch =
    confirmPassword.length > 0 && password.length > 0 && password !== confirmPassword;

  const handleGoogleSignUp = async () => {
    if (!showGoogle) {
      setError(err.googleNotConfigured);
      return;
    }
    if (!acceptTerms) {
      setError(err.acceptTerms);
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
    if (!acceptTerms) {
      setError(err.acceptTerms);
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
        if (res.status === 403) {
          setErrorCode("founder_full");
        }
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
      <div className={cn(cardShell, "p-8 text-center sm:p-10")}>
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent"
          aria-hidden
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.45, ease: EASE }}
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-600 ring-1 ring-emerald-100/80"
        >
          <CheckCircle2 className="h-6 w-6" strokeWidth={1.5} />
        </motion.div>
        <h1 className="text-xl font-semibold tracking-[-0.03em] text-neutral-900">
          {s.accountCreated}
        </h1>
        <p className="mx-auto mt-3 max-w-[300px] text-[13px] leading-relaxed text-neutral-500">
          {s.codeSentPrefix}{" "}
          <span className="font-medium text-neutral-800">{successEmail}</span>
        </p>
        <div className="mt-6 flex items-center justify-center gap-2 text-[12px] text-neutral-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {s.redirecting}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AuthFlowSteps
        steps={onboardingFlow}
        current="account"
        ariaLabel={s.flowAria}
        className="mb-6"
      />

      <div className={cardShell}>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" aria-hidden />
        <div className="relative border-b border-neutral-100/80 px-7 pb-6 pt-8 text-center sm:px-9 sm:pt-9">
          <h1 className="text-[1.7rem] font-semibold leading-tight tracking-[-0.035em] text-neutral-900">
            {s.title}
          </h1>
          <p className="mx-auto mt-2 max-w-[320px] text-[13px] leading-relaxed text-neutral-500">
            {s.subtitle}
          </p>
        </div>

        <div className="relative px-7 py-7 sm:px-9 sm:py-8">
          {error ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-5 overflow-hidden"
              role="alert"
            >
              <div className="flex gap-2.5 rounded-xl border border-red-200/70 bg-red-50/90 px-3.5 py-3 text-start text-[13px] text-red-800">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                <div>
                  <p>{error}</p>
                  {errorCode === "founder_full" ? (
                    <Link
                      href="/contact"
                      className="mt-2 inline-block font-semibold text-red-900 underline-offset-2 hover:underline"
                    >
                      {s.waitlist}
                    </Link>
                  ) : null}
                </div>
              </div>
            </motion.div>
          ) : null}

          <div className="space-y-4">
            <div className="space-y-3">
              <ConsentCheckbox
                id="acceptTermsGoogle"
                checked={acceptTerms}
                onChange={setAcceptTerms}
                disabled={loading || googleLoading}
              >
                {s.termsPrefix}{" "}
                <Link href="/terms" className="font-semibold text-neutral-900 underline-offset-2 hover:underline">
                  {s.terms}
                </Link>{" "}
                {s.and}{" "}
                <Link href="/privacy" className="font-semibold text-neutral-900 underline-offset-2 hover:underline">
                  {s.privacy}
                </Link>
                <span className="text-red-600"> *</span>
              </ConsentCheckbox>

              <ConsentCheckbox
                id="marketingEmailsGoogle"
                checked={marketingEmails}
                onChange={setMarketingEmails}
                disabled={loading || googleLoading}
              >
                {s.marketing}
              </ConsentCheckbox>
            </div>

            {showGoogle ? (
              <div className="space-y-2">
                <GoogleAuthButton
                  label={s.continueGoogle}
                  loadingLabel={s.connectingGoogle}
                  loading={googleLoading}
                  disabled={!acceptTerms || loading}
                  onClick={() => void handleGoogleSignUp()}
                />
                <p className="text-center text-[12px] text-neutral-400">
                  {acceptTerms
                    ? s.googleHint
                    : err.acceptTerms}
                </p>
              </div>
            ) : null}

            {showGoogle ? (
              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent to-neutral-200/90" />
                <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-neutral-400">
                  {s.orEmail}
                </span>
                <div className="h-px flex-1 bg-gradient-to-l from-transparent to-neutral-200/90" />
              </div>
            ) : null}
          </div>

          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
            onSubmit={handleSubmit}
            className="mt-4 space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <FieldLabel htmlFor="firstName">{s.firstName}</FieldLabel>
                <IconField
                  id="firstName"
                  icon={User}
                  type="text"
                  placeholder={s.firstNamePlaceholder}
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  autoComplete="given-name"
                  autoFocus
                  disabled={loading}
                />
              </div>
              <div className="space-y-1.5">
                <FieldLabel htmlFor="surname">{s.surname}</FieldLabel>
                <Input
                  id="surname"
                  type="text"
                  placeholder={s.surnamePlaceholder}
                  value={surname}
                  onChange={(e) => setSurname(e.target.value)}
                  required
                  autoComplete="family-name"
                  disabled={loading}
                  className={fieldClassName}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="email">{s.email}</FieldLabel>
              <IconField
                id="email"
                icon={Mail}
                type="email"
                inputMode="email"
                autoCapitalize="none"
                spellCheck={false}
                placeholder={s.emailPlaceholder}
                value={email}
                onChange={(e) => setEmail(e.target.value.trim().toLowerCase())}
                onBlur={() => setEmailTouched(true)}
                required
                autoComplete="email"
                disabled={loading}
                error={!!emailFormatError}
                aria-invalid={!!emailFormatError}
                aria-describedby={emailFormatError ? "email-format-error" : undefined}
              />
              {emailFormatError ? (
                <p id="email-format-error" className="text-[12px] text-red-600" role="alert">
                  {emailFormatError}
                </p>
              ) : (
                <p className="text-[12px] text-neutral-400">{s.emailHint}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="password">{s.password}</FieldLabel>
              <IconField
                id="password"
                icon={Lock}
                type={showPassword ? "text" : "password"}
                placeholder={s.passwordPlaceholder}
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
                    className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    aria-label={showPassword ? authCopy.login.hidePassword : authCopy.login.showPassword}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              {password.length > 0 ? <SignupPasswordRequirements password={password} copy={s} /> : null}
            </div>

            <div className="space-y-1.5">
              <FieldLabel htmlFor="confirmPassword">{s.confirmPassword}</FieldLabel>
              <IconField
                id="confirmPassword"
                icon={Lock}
                type={showConfirmPassword ? "text" : "password"}
                placeholder={s.confirmPlaceholder}
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
                    className="rounded-lg p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-600"
                    aria-label={
                      showConfirmPassword ? authCopy.login.hidePassword : authCopy.login.showPassword
                    }
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                }
              />
              {passwordsMatch ? (
                <p className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {s.passwordsMatch}
                </p>
              ) : passwordsMismatch ? (
                <p className="text-[12px] text-red-600" role="alert">
                  {s.passwordsMismatch}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={loading || googleLoading || !acceptTerms}
              className="group relative mt-1 flex h-11 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-neutral-900 text-sm font-medium text-white shadow-[0_1px_2px_rgba(0,0,0,0.1),0_4px_14px_rgba(0,0,0,0.08)] transition-all duration-200 hover:bg-neutral-800 active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {s.creatingAccount}
                </>
              ) : (
                <>
                  {s.createAccount}
                  <AuthArrowForward className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </>
              )}
            </button>
          </motion.form>

          <p className="mt-5 text-center text-[12px] leading-relaxed text-neutral-400">
            {s.noCard}
            <br />
            {s.nextStep}
          </p>
        </div>
      </div>

      <p className="mt-7 text-center text-[13px] text-neutral-500">
        {s.switchText}{" "}
        <Link href="/login" className="font-semibold text-neutral-900 underline-offset-3 hover:underline">
          {s.switchLink}
        </Link>
      </p>
    </div>
  );
}
