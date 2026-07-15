import { HelpLocaleRoot } from "@/components/help/help-locale-provider";

export default function HelpLayout({ children }: { children: React.ReactNode }) {
  return <HelpLocaleRoot>{children}</HelpLocaleRoot>;
}
