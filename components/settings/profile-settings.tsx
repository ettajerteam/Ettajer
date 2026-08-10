"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  CalendarDays,
  Check,
  Clock3,
  Eye,
  EyeOff,
  ImagePlus,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SettingsPanel } from "@/components/settings/settings-panel";
import {
  SettingsField,
  SettingsSection,
} from "@/components/settings/settings-section";
import {
  SettingsRelatedCard,
  SettingsRelatedLink,
} from "@/components/settings/settings-related-link";
import type { AccountProfile } from "@/lib/account-profile";
import { formatFounderNumber } from "@/lib/founder/constants";
import { dashboardPrimaryBtn } from "@/lib/dashboard-ui";
import { cn } from "@/lib/utils";

interface ProfileSettingsProps {
  initialProfile: AccountProfile;
}

const FIELD =
  "h-9 rounded-md border-black/[0.06] bg-white text-[13px] shadow-none focus-visible:ring-[#007AFF]/20 dark:border-white/10 dark:bg-transparent";

function initials(name: string | null, email: string) {
  const source = (name?.trim() || email.split("@")[0] || "?").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
}

function formatDate(iso: string | null) {
  if (!iso) return null;
  try {
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

export function ProfileSettings({ initialProfile }: ProfileSettingsProps) {
  const { update: updateSession } = useSession();
  const fileRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState(initialProfile);
  const [lastSaved, setLastSaved] = useState(initialProfile);
  const [name, setName] = useState(initialProfile.name ?? "");
  const [marketingEmails, setMarketingEmails] = useState(
    initialProfile.marketingEmails
  );
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const [passwordOpen, setPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const dirty = useMemo(() => {
    const nameDirty = name.trim() !== (lastSaved.name ?? "").trim();
    const marketingDirty = marketingEmails !== lastSaved.marketingEmails;
    return nameDirty || marketingDirty;
  }, [name, marketingEmails, lastSaved]);

  const checklist = useMemo(
    () => [
      { id: "name", label: "Name", done: Boolean(name.trim()) },
      { id: "photo", label: "Photo", done: Boolean(profile.image) },
      { id: "password", label: "Password", done: profile.hasPassword },
    ],
    [name, profile.image, profile.hasPassword]
  );
  const doneCount = checklist.filter((item) => item.done).length;

  const strength = newPassword.length > 0 ? passwordScore(newPassword) : null;
  const memberSince = formatDate(profile.createdAt);
  const lastLogin = formatDate(profile.lastLoginAt);
  const displayName = name.trim() || profile.email.split("@")[0] || "Your profile";

  const resetPasswordForm = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrent(false);
    setShowNew(false);
  };

  const openPasswordDialog = () => {
    resetPasswordForm();
    setPasswordOpen(true);
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
      setLastSaved(data.profile);
      await updateSession();
      toast.success("Photo updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
      setDragging(false);
    }
  };

  const removePhoto = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: null }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Could not remove photo");
      setProfile(data.profile);
      setLastSaved(data.profile);
      await updateSession();
      toast.success("Photo removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove photo");
    } finally {
      setSaving(false);
    }
  };

  const onSave = async () => {
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/account/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          marketingEmails,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Save failed");

      setProfile(data.profile);
      setLastSaved(data.profile);
      setName(data.profile.name ?? "");
      setMarketingEmails(data.profile.marketingEmails);
      await updateSession();
      toast.success(data.message ?? "Profile updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const onSavePassword = async () => {
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
      setLastSaved((prev) => ({
        ...prev,
        hasPassword: data.profile.hasPassword,
      }));
      resetPasswordForm();
      setPasswordOpen(false);
      toast.success(
        profile.hasPassword ? "Password updated" : "Password set successfully"
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <>
      <SettingsPanel
        title="Profile"
        description="Your personal Ettajer account — separate from store settings."
        onSave={onSave}
        saving={saving || uploading}
        dirty={dirty}
        saveLabel="Save profile"
      >
        {/* Identity preview */}
        <div className="overflow-hidden rounded-[10px] border border-black/[0.06] bg-[#FAFAFA]/80 dark:border-white/10 dark:bg-white/[0.025]">
          <div className="flex items-center justify-between border-b border-black/[0.05] px-3.5 py-2 dark:border-white/10">
            <p className="text-[11px] font-medium text-neutral-400">
              Account preview
            </p>
            <p className="text-[10px] text-neutral-400">
              {doneCount}/{checklist.length} complete
            </p>
          </div>

          <div className="flex flex-col gap-3 px-3.5 py-3.5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-white ring-1 ring-black/[0.06] dark:bg-[#1C1C1E] dark:ring-white/10">
                {profile.image ? (
                  <Image
                    src={profile.image}
                    alt={displayName}
                    fill
                    className="object-cover"
                    sizes="56px"
                    unoptimized
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-[#007AFF]/10 text-[13px] font-semibold text-[#007AFF]">
                    {initials(name, profile.email)}
                  </span>
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[13px] font-semibold tracking-[-0.02em] text-neutral-900 dark:text-white">
                  {displayName}
                </p>
                <p className="mt-0.5 truncate text-[11px] text-neutral-500">
                  {profile.email}
                </p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.founderNumber != null ? (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#007AFF]/10 px-1.5 py-0.5 text-[10px] font-medium text-[#007AFF]">
                      <Sparkles className="h-2.5 w-2.5" />
                      {formatFounderNumber(profile.founderNumber)}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[10px] text-neutral-500 ring-1 ring-black/[0.05] dark:bg-white/[0.04] dark:ring-white/10">
                      Merchant
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium",
                      profile.hasPassword
                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300"
                    )}
                  >
                    <ShieldCheck className="h-2.5 w-2.5" />
                    {profile.hasPassword ? "Password on" : "Google only"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-1.5 sm:justify-end">
              {checklist.map((item) => (
                <span
                  key={item.id}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px]",
                    item.done
                      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-white text-neutral-400 ring-1 ring-black/[0.05] dark:bg-white/[0.04] dark:ring-white/10"
                  )}
                >
                  {item.done ? <Check className="h-2.5 w-2.5" /> : null}
                  {item.label}
                </span>
              ))}
            </div>
          </div>

          {(memberSince || lastLogin) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-black/[0.05] px-3.5 py-2 text-[10px] text-neutral-400 dark:border-white/10">
              {memberSince ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  Joined {memberSince}
                </span>
              ) : null}
              {lastLogin ? (
                <span className="inline-flex items-center gap-1">
                  <Clock3 className="h-3 w-3" />
                  Last sign-in {lastLogin}
                </span>
              ) : null}
            </div>
          )}
        </div>

        <SettingsSection
          title="Photo"
          description="Shown in the dashboard sidebar and account menus."
        >
          <div
            className={cn(
              "flex flex-col gap-3 rounded-[10px] border border-dashed px-3.5 py-3.5 transition sm:flex-row sm:items-center",
              dragging
                ? "border-[#007AFF]/50 bg-[#007AFF]/5"
                : "border-black/[0.08] bg-white dark:border-white/15 dark:bg-transparent"
            )}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files?.[0];
              if (file) void uploadFile(file);
              else setDragging(false);
            }}
          >
            <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full bg-[#F5F5F7] ring-1 ring-black/[0.06] dark:bg-white/[0.06] dark:ring-white/10">
              {profile.image ? (
                <Image
                  src={profile.image}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="64px"
                  unoptimized
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center text-[13px] font-semibold text-neutral-400">
                  {initials(name, profile.email)}
                </span>
              )}
              {uploading ? (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-black/50">
                  <Loader2 className="h-4 w-4 animate-spin text-[#007AFF]" />
                </div>
              ) : null}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                {dragging ? "Drop to upload" : "Drag a photo here, or browse"}
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Square JPG or PNG works best · max 5 MB
              </p>
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
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-[12px]"
                  disabled={uploading || saving}
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus className="mr-1.5 h-3.5 w-3.5" />
                  {profile.image ? "Change photo" : "Upload photo"}
                </Button>
                {profile.image ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[12px] text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
                    disabled={uploading || saving}
                    onClick={() => void removePhoto()}
                  >
                    <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Identity"
          description="Your name appears on account emails and the dashboard."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SettingsField label="Full name" htmlFor="profile-name">
              <div className="relative">
                <UserRound className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="profile-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={cn(FIELD, "ps-8")}
                  disabled={saving}
                  autoComplete="name"
                />
              </div>
            </SettingsField>

            <SettingsField
              label="Email"
              htmlFor="profile-email"
              hint="Contact support to change your sign-in email."
            >
              <div className="relative">
                <Mail className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                <Input
                  id="profile-email"
                  value={profile.email}
                  readOnly
                  className={cn(
                    FIELD,
                    "ps-8 bg-neutral-50 text-neutral-500 dark:bg-white/[0.03]"
                  )}
                />
              </div>
            </SettingsField>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Security"
          description="Protect your merchant dashboard access."
        >
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
              <div className="flex min-w-0 items-start gap-2.5">
                <span
                  className={cn(
                    "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md",
                    profile.hasPassword
                      ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300"
                      : "bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300"
                  )}
                >
                  <Lock className="h-3.5 w-3.5" />
                </span>
                <div className="min-w-0">
                  <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                    {profile.hasPassword ? "Password enabled" : "No password yet"}
                  </p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-400">
                    {profile.hasPassword
                      ? "You can sign in with email and password."
                      : "You’re using Google. Set a password for email sign-in too."}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 shrink-0 text-[12px]"
                onClick={openPasswordDialog}
              >
                {profile.hasPassword ? "Change password" : "Set password"}
              </Button>
            </div>

            <p className="px-0.5 text-[11px] text-neutral-400">
              Forgot it?{" "}
              <Link
                href="/forgot-password"
                className="font-medium text-[#007AFF] underline-offset-2 hover:underline"
              >
                Reset by email
              </Link>
            </p>
          </div>
        </SettingsSection>

        <SettingsSection
          title="Email preferences"
          description="Optional product news from Ettajer — not your store’s customer emails."
        >
          <label className="flex cursor-pointer items-center justify-between gap-3 rounded-[10px] border border-black/[0.06] bg-white px-3.5 py-3 dark:border-white/10 dark:bg-transparent">
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-neutral-900 dark:text-white">
                Product updates & merchant tips
              </p>
              <p className="mt-0.5 text-[11px] text-neutral-400">
                Occasional emails about new features. You can turn this off anytime.
              </p>
            </div>
            <Switch
              checked={marketingEmails}
              onCheckedChange={setMarketingEmails}
              disabled={saving}
            />
          </label>
        </SettingsSection>

        <SettingsRelatedCard>
          Related:{" "}
          <SettingsRelatedLink tab="general">General</SettingsRelatedLink>
          <span className="mx-1.5 text-neutral-300">·</span>
          <SettingsRelatedLink tab="plan">Plan</SettingsRelatedLink>
          <span className="mx-1.5 text-neutral-300">·</span>
          <Link
            href="/contact"
            className="inline-flex items-center gap-1 font-medium text-[#007AFF] transition hover:text-[#0071EB]"
          >
            Support
          </Link>
        </SettingsRelatedCard>
      </SettingsPanel>

      <Dialog
        open={passwordOpen}
        onOpenChange={(open) => {
          setPasswordOpen(open);
          if (!open) resetPasswordForm();
        }}
      >
        <DialogContent className="max-w-[420px] gap-0 overflow-hidden p-0 sm:rounded-xl">
          <DialogHeader className="space-y-0 border-b border-black/[0.05] px-4 pb-3 pt-4 pr-12 text-left dark:border-white/10">
            <DialogTitle className="text-[15px] font-semibold tracking-[-0.02em]">
              {profile.hasPassword ? "Change password" : "Set password"}
            </DialogTitle>
            <DialogDescription className="mt-1 text-[12px] text-neutral-500">
              {profile.hasPassword
                ? "Enter your current password, then choose a new one."
                : "Create a password so you can also sign in with email."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 px-4 py-4">
            {profile.hasPassword ? (
              <SettingsField label="Current password" htmlFor="popup-current-password">
                <div className="relative">
                  <Lock className="pointer-events-none absolute start-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
                  <Input
                    id="popup-current-password"
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className={cn(FIELD, "ps-8 pe-9")}
                    autoComplete="current-password"
                    disabled={passwordSaving}
                    autoFocus
                  />
                  <button
                    type="button"
                    className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-600"
                    onClick={() => setShowCurrent((v) => !v)}
                    aria-label={showCurrent ? "Hide password" : "Show password"}
                  >
                    {showCurrent ? (
                      <EyeOff className="h-3.5 w-3.5" />
                    ) : (
                      <Eye className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
              </SettingsField>
            ) : null}

            <SettingsField label="New password" htmlFor="popup-new-password">
              <div className="relative">
                <Input
                  id="popup-new-password"
                  type={showNew ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={cn(FIELD, "pe-9")}
                  autoComplete="new-password"
                  disabled={passwordSaving}
                  placeholder="8+ chars, letter & number"
                  autoFocus={!profile.hasPassword}
                />
                <button
                  type="button"
                  className="absolute end-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-neutral-400 hover:text-neutral-600"
                  onClick={() => setShowNew((v) => !v)}
                  aria-label={showNew ? "Hide password" : "Show password"}
                >
                  {showNew ? (
                    <EyeOff className="h-3.5 w-3.5" />
                  ) : (
                    <Eye className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
              {strength ? (
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[10px]">
                    <span className="text-neutral-400">Strength</span>
                    <span className="font-medium text-neutral-600 dark:text-neutral-300">
                      {strength.label}
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= strength.score
                            ? strength.color
                            : "bg-neutral-200 dark:bg-white/10"
                        )}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
            </SettingsField>

            <SettingsField label="Confirm new password" htmlFor="popup-confirm-password">
              <Input
                id="popup-confirm-password"
                type={showNew ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={cn(
                  FIELD,
                  confirmPassword.length > 0 &&
                    newPassword !== confirmPassword &&
                    "border-red-300 focus-visible:ring-red-200"
                )}
                autoComplete="new-password"
                disabled={passwordSaving}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void onSavePassword();
                  }
                }}
              />
              {confirmPassword.length > 0 && newPassword !== confirmPassword ? (
                <p className="mt-1 text-[10px] text-red-600">Passwords do not match</p>
              ) : null}
            </SettingsField>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-black/[0.05] bg-[#FAFAFA]/80 px-4 py-3 dark:border-white/10 dark:bg-white/[0.02]">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 text-[12px]"
              disabled={passwordSaving}
              onClick={() => setPasswordOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              className={cn(dashboardPrimaryBtn, "h-8 text-[12px]")}
              disabled={passwordSaving}
              onClick={() => void onSavePassword()}
            >
              {passwordSaving ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Saving…
                </>
              ) : profile.hasPassword ? (
                "Update password"
              ) : (
                "Set password"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
