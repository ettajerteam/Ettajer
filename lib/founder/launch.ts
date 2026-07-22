import {
  getLaunchTargetDate,
  isPlatformLaunched,
  getMsUntilLaunch,
} from "@/lib/founder/waiting-intelligence";

export {
  getLaunchTargetDate,
  isPlatformLaunched,
  getMsUntilLaunch,
};

/** Default: July 23, 2026 00:00 Morocco (UTC+1). Override with ETTAJER_LAUNCH_TARGET. */
export const PLATFORM_LAUNCH_LABEL = "July 23, 2026";
