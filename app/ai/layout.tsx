import { HelpLocaleRoot } from "@/components/help/help-locale-provider";

export default function AiLayout({ children }: { children: React.ReactNode }) {
  return <HelpLocaleRoot>{children}</HelpLocaleRoot>;
}
