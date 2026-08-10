import { DeveloperConsoleShell } from "@/components/developer/developer-console-shell";
import { DeveloperBrandLoader } from "@/components/developer/developer-brand-loader";

export default function DeveloperActivityLoading() {
  return (
    <DeveloperConsoleShell>
      <DeveloperBrandLoader fullPage />
    </DeveloperConsoleShell>
  );
}
