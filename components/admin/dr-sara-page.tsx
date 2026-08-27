"use client";

import type { SaraBriefing } from "@/lib/intelligence/types";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { IntelligenceRoomV3 } from "@/components/admin/dr-sara/intelligence-room-v3";

export function DrSaraPage({
  briefing,
  experience,
}: {
  briefing: SaraBriefing;
  experience: SaraExperienceViewModel;
}) {
  return <IntelligenceRoomV3 vm={experience} briefing={briefing} />;
}
