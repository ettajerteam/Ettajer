"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  ArrowLeft,
  Camera,
  ChevronRight,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { AccountProfile } from "@/lib/account-profile";
import { getMerchantPlanInfo } from "@/lib/merchant-plan";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

type ProfilePageClientProps = {
  initialProfile: AccountProfile;
};

const FIELD =
  "h-10 rounded-lg border-black/[0.08] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

/** Fixed locale — avoids SSR/client hydration mismatches. */
function formatProfileDate(iso: string | null, style: "full" | "month" = "full") {
  if (!iso) return null;
  try {
    if (style === "month") {
      return new Intl.DateTimeFormat("en-US", {
        month: "long",
        year: "numeric",
        timeZone: "UTC",
      }).format(new Date(iso));
    }
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

function initials(name: string | null, email: string) {
  const source = (name?.trim() || email.split("@")[0] || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function passwordScore(password: string) {
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (score <= 1) return { score: 1, label: "Weak", color: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "bg-amber-500" };
  if (score === 3) return { score: 3, label: "Good", color: "bg-blue-500" };
  return { score: 4, label: "Strong", color: "bg-emerald-500" };
}

export function ProfilePageClient({ initialProfile }: ProfilePageClientProps) {
  const { update: updateSession } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState(initialProfile);
  const [marketingEmails, setMarketingEmails] = useState(
    initialProfile.marketingEmails,
  );
  const [prefSaving, setPrefSaving] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState(initialProfile.name ?? "");
  const [editSaving, setEditSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const plan = useMemo(
    () =>
      getMerchantPlanInfo({
        founderNumber: profile.founderNumber,
        plan: profile.plan,
      }),
    [profile.founderNumber, profile.plan],
  );

  const displayName =
    profile.name?.trim() || profile.email.split("@")[0] || "Your profile";
  const memberSince = formatProfileDate(profile.createdAt);
  const memberSinceMonth = formatProfileDate(profile.createdAt, "month");
  const lastLogin = formatProfileDate(profile.lastLoginAt);
  const strength = newPassword.length > 0 ? passwordScore(newPassword) : null;

  const openEdit = () => {
    setEditName(profile.name ?? "");
    setEditOpen(true);
  };

  const uploadFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Photo must be under 5 MB");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/account/profile/avatar", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Upload failed");
      setProfile(data.profile);
      await updateSession();
      toast.success("Photo updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = async () => {
    setUploading(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not remove photo");
      setProfile(data.profile);
      await updateSession();
      toast.success("Photo removed");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove photo",
      );
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    if (!editName.trim()) {
      toast.error("Name is required");
      return;
    }
    setEditSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName.trim(),
          marketingEmails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Save failed");
      setProfile(data.profile);
      setMarketingEmails(data.profile.marketingEmails);
      await updateSession();
      setEditOpen(false);
      toast.success("Profile saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setEditSaving(false);
    }
  };

  const savePreference = async (next: boolean) => {
    const prev = marketingEmails;
    setMarketingEmails(next);
    setPrefSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: profile.name?.trim() || displayName,
          marketingEmails: next,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not update preference");
      setProfile(data.profile);
      setMarketingEmails(data.profile.marketingEmails);
    } catch (error) {
      setMarketingEmails(prev);
      toast.error(
        error instanceof Error ? error.message : "Could not update preference",
      );
    } finally {
      setPrefSaving(false);
    }
  };

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
  };

  const savePassword = async () => {
    if (profile.hasPassword && !currentPassword.trim()) {
      toast.error("Enter your current password");
      return;
    }
    if (!newPassword.trim()) {
      toast.error("Enter a new password");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }
    setPasswordSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not update password");
      setProfile(data.profile);
      resetPasswordForm();
      setPasswordOpen(false);
      toast.success(
        profile.hasPassword ? "Password updated" : "Password set successfully",
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update password",
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-[720px]">
      {/* Top bar */}
      <div className="mb-10 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-neutral-500 transition hover:bg-black/[0.04] hover:text-neutral-900 dark:hover:bg-white/[0.06] dark:hover:text-white"
          aria-label="Back to dashboard"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} />
        </Link>
        <h1 className="text-[15px] font-medium tracking-[-0.01em] text-neutral-900 dark:text-white">
          Profile
        </h1>
      </div>

      {/* Hero */}
      <header className="flex flex-col items-center text-center">
        <div className="relative">
          <div className="relative h-24 w-24 overflow-hidden rounded-full bg-[#F2F2F7] dark:bg-white/[0.08] sm:h-28 sm:w-28">
            {profile.image ? (
              <Image
                src={profile.image}
                alt={displayName}
                fill
                className="object-cover"
                sizes="112px"
                unoptimized
                priority
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-[28px] font-medium tracking-tight text-neutral-400 dark:text-neutral-500">
                {initials(profile.name, profile.email)}
              </span>
            )}
          </div>
        </div>

        <h2 className="mt-5 text-[22px] font-semibold tracking-[-0.03em] text-neutral-900 dark:text-white sm:text-[26px]">
          {displayName}
        </h2>
        <p className="mt-1 text-[13px] text-neutral-500 dark:text-neutral-400">
          {profile.email}
        </p>
        {memberSinceMonth ? (
          <p className="mt-1.5 text-[12px] text-neutral-400">
            Member since {memberSinceMonth}
          </p>
        ) : null}

        <Button
          type="button"
          onClick={openEdit}
          className={cn(
            dashboardPrimaryBtn,
            "mt-5 h-9 rounded-full px-5 text-[13px] font-medium",
          )}
        >
          Edit profile
        </Button>
      </header>

      {/* Sections */}
      <div className="mt-12 space-y-0">
        <Section title="About">
          <InfoRow label="Full name" value={displayName} />
          <InfoRow label="Email" value={profile.email} />
        </Section>

        <Section title="Account">
          <InfoRow
            label="Plan"
            value={
              <span className="inline-flex items-center gap-2">
                <span className="rounded-md bg-black/[0.04] px-1.5 py-0.5 text-[11px] font-medium text-neutral-700 dark:bg-white/10 dark:text-neutral-200">
                  {plan.label}
                </span>
                {plan.needsUpgrade ? (
                  <Link
                    href={plan.href}
                    className="text-[12px] font-medium text-[#007AFF] hover:underline"
                  >
                    Upgrade plan
                  </Link>
                ) : (
                  <Link
                    href={plan.href}
                    className="text-[12px] font-medium text-neutral-400 hover:text-[#007AFF]"
                  >
                    View
                  </Link>
                )}
              </span>
            }
          />
          {memberSince ? (
            <InfoRow label="Member since" value={memberSince} />
          ) : null}
          {lastLogin ? (
            <InfoRow label="Last sign-in" value={lastLogin} />
          ) : null}
        </Section>

        <Section title="Security">
          <InfoRow
            label="Password"
            value={
              <span className="inline-flex items-center gap-3">
                <span className="text-[13px] text-neutral-900 dark:text-white">
                  {profile.hasPassword ? "Enabled" : "Not set"}
                </span>
                <button
                  type="button"
                  className="text-[12px] font-medium text-[#007AFF] hover:underline"
                  onClick={() => {
                    resetPasswordForm();
                    setPasswordOpen(true);
                  }}
                >
                  {profile.hasPassword ? "Change password" : "Set password"}
                </button>
              </span>
            }
          />
        </Section>

        <Section title="Preferences">
          <div className="flex items-start justify-between gap-4 py-3.5">
            <div className="min-w-0 pr-4">
              <p className="text-[13px] text-neutral-900 dark:text-white">
                Product updates
              </p>
              <p className="mt-0.5 text-[12px] leading-snug text-neutral-400">
                Occasional emails about new Ettajer features and merchant tips.
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              disabled={prefSaving}
              onCheckedChange={(v) => void savePreference(v)}
              className="mt-0.5 shrink-0"
            />
          </div>
        </Section>

        <Section title="Need help?">
          <HelpRow href="/help" label="Help Center" />
          <HelpRow href="/help/category/getting-started" label="Tutorials & guides" />
        </Section>
      </div>

      {/* Edit profile dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-[400px] gap-0 overflow-hidden rounded-2xl border-black/[0.08] p-0 shadow-xl dark:border-white/10">
          <DialogHeader className="space-y-1 border-b border-black/[0.05] px-5 pb-3.5 pt-5 pr-12 text-left dark:border-white/10">
            <DialogTitle className="text-[17px] font-semibold tracking-[-0.02em]">
              Edit profile
            </DialogTitle>
            <DialogDescription className="text-[12px] text-neutral-500">
              Update your name and photo.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-5 py-5">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="relative h-20 w-20 overflow-hidden rounded-full bg-[#F2F2F7] dark:bg-white/[0.08]">
                  {profile.image ? (
                    <Image
                      src={profile.image}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-[22px] font-medium text-neutral-400">
                      {initials(editName, profile.email)}
                    </span>
                  )}
                  {uploading ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      <Loader2 className="h-4 w-4 animate-spin text-white" />
                    </div>
                  ) : null}
                </div>
                <button
                  type="button"
                  disabled={uploading || editSaving}
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-900 text-white shadow-sm dark:bg-white dark:text-neutral-900"
                  aria-label="Change photo"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) void uploadFile(file);
                    e.target.value = "";
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={uploading || editSaving}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center gap-1 text-[12px] font-medium text-[#007AFF] hover:underline"
                >
                  <ImagePlus className="h-3 w-3" />
                  {profile.image ? "Change photo" : "Upload photo"}
                </button>
                {profile.image ? (
                  <button
                    type="button"
                    disabled={uploading || editSaving}
                    onClick={() => void removePhoto()}
                    className="inline-flex items-center gap-1 text-[12px] font-medium text-red-600 hover:underline"
                  >
                    <Trash2 className="h-3 w-3" />
                    Remove
                  </button>
                ) : null}
              </div>
            </div>

            <div>
              <label
                htmlFor="edit-profile-name"
                className="mb-1.5 block text-[12px] font-medium text-neutral-500"
              >
                Full name
              </label>
              <Input
                id="edit-profile-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className={FIELD}
                disabled={editSaving}
                autoComplete="name"
                autoFocus
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
                Email
              </label>
              <Input
                value={profile.email}
                readOnly
                className={cn(FIELD, "bg-neutral-50 text-neutral-500 dark:bg-white/[0.04]")}
              />
              <p className="mt-1.5 text-[11px] text-neutral-400">
                Contact support to change your sign-in email.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-row justify-end gap-2 border-t border-black/[0.05] bg-[#FAFAFA] px-5 py-3 sm:space-x-0 dark:border-white/10 dark:bg-white/[0.03]">
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-lg text-[13px]"
              disabled={editSaving}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={cn(dashboardPrimaryBtn, "h-9 rounded-lg px-4")}
              disabled={editSaving}
              onClick={() => void saveProfile()}
            >
              {editSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password dialog */}
      <Dialog
        open={passwordOpen}
        onOpenChange={(open) => {
          setPasswordOpen(open);
          if (!open) resetPasswordForm();
        }}
      >
        <DialogContent className="max-w-[400px] gap-0 overflow-hidden rounded-2xl border-black/[0.08] p-0 shadow-xl dark:border-white/10">
          <DialogHeader className="space-y-1 border-b border-black/[0.05] px-5 pb-3.5 pt-5 pr-12 text-left dark:border-white/10">
            <DialogTitle className="text-[17px] font-semibold tracking-[-0.02em]">
              {profile.hasPassword ? "Change password" : "Set password"}
            </DialogTitle>
            <DialogDescription className="text-[12px] text-neutral-500">
              {profile.hasPassword
                ? "Enter your current password, then choose a new one."
                : "Create a password for email sign-in."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 px-5 py-5">
            {profile.hasPassword ? (
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
                  Current password
                </label>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={cn(FIELD, "pr-10")}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                    onClick={() => setShowCurrent((v) => !v)}
                  >
                    {showCurrent ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            ) : null}
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
                New password
              </label>
              <div className="relative">
                <Input
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(FIELD, "pr-10")}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400"
                  onClick={() => setShowNew((v) => !v)}
                >
                  {showNew ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {strength ? (
                <div className="mt-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={cn(
                          "h-1 flex-1 rounded-full",
                          i <= strength.score
                            ? strength.color
                            : "bg-black/[0.06] dark:bg-white/10",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-1 text-[11px] text-neutral-400">
                    {strength.label}
                  </p>
                </div>
              ) : null}
            </div>
            <div>
              <label className="mb-1.5 block text-[12px] font-medium text-neutral-500">
                Confirm password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={FIELD}
                autoComplete="new-password"
              />
            </div>
            <p className="text-[11px] text-neutral-400">
              Forgot it?{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-[#007AFF] hover:underline"
              >
                Reset by email
              </Link>
            </p>
          </div>

          <DialogFooter className="flex-row justify-end gap-2 border-t border-black/[0.05] bg-[#FAFAFA] px-5 py-3 sm:space-x-0 dark:border-white/10 dark:bg-white/[0.03]">
            <Button
              type="button"
              variant="ghost"
              className="h-9 rounded-lg text-[13px]"
              disabled={passwordSaving}
              onClick={() => setPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className={cn(dashboardPrimaryBtn, "h-9 rounded-lg px-4")}
              disabled={passwordSaving}
              onClick={() => void savePassword()}
            >
              {passwordSaving ? "Saving…" : "Update password"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-black/[0.06] py-6 dark:border-white/10">
      <h3 className="mb-1 text-[13px] font-semibold tracking-[-0.01em] text-neutral-900 dark:text-white">
        {title}
      </h3>
      <div className="divide-y divide-black/[0.04] dark:divide-white/[0.06]">
        {children}
      </div>
    </section>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-6 py-3">
      <p className="shrink-0 text-[13px] text-neutral-500">{label}</p>
      <div className="min-w-0 text-right text-[13px] text-neutral-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}

function HelpRow({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 py-3 text-[13px] text-neutral-900 transition hover:text-[#007AFF] dark:text-white"
    >
      <span>{label}</span>
      <ChevronRight className="h-4 w-4 shrink-0 text-neutral-300" />
    </Link>
  );
}
