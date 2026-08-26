"use client";

import type { SaraBriefing } from "@/lib/intelligence/types";
import type { SaraExperienceViewModel } from "@/lib/intelligence/presentation/experience-model";
import { IntelligenceRoom } from "@/components/admin/dr-sara/intelligence-room";

export function DrSaraPage({
  briefing,
  experience,
}: {
  briefing: SaraBriefing;
  experience: SaraExperienceViewModel;
}) {
  return <IntelligenceRoom vm={experience} briefing={briefing} />;
}
