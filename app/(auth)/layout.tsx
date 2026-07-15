import { AuthLocaleProvider, AuthLocaleShell } from "@/components/auth/auth-locale-provider";

export default function AuthGroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthLocaleProvider>
      <AuthLocaleShell>{children}</AuthLocaleShell>
    </AuthLocaleProvider>
  );
}
