"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { DashboardHeader } from "@/components/shared/dashboard-header";
import {
  EmailHealthCheckButton,
  EMAIL_SETTINGS_TIPS,
} from "@/components/settings/email-health-popup-button";

function SettingsHeaderInner() {
  const searchParams = useSearchParams();
  const isEmailTab = searchParams.get("tab") === "email";

  return (
    <DashboardHeader
      title="Settings"
      description="Store profile, checkout, shipping, and SEO"
      tips={isEmailTab ? [...EMAIL_SETTINGS_TIPS] : undefined}
      tipsTitle="Email tips"
      tipsDescription="Get sending ready for campaigns and automations."
      besideHelp={isEmailTab ? <EmailHealthCheckButton /> : null}
    />
  );
}

/** Settings page header — tips + health icons next to Help on the Email tab. */
export function SettingsDashboardHeader() {
  return (
    <Suspense
      fallback={
        <DashboardHeader
          title="Settings"
          description="Store profile, checkout, shipping, and SEO"
        />
      }
    >
      <SettingsHeaderInner />
    </Suspense>
  );
}
