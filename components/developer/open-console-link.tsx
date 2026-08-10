"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export const DEVELOPER_CONSOLE_PATH = "/dashboard/developer";

export function developerConsoleSignInHref(
  returnTo: string = DEVELOPER_CONSOLE_PATH,
) {
  return `/login?callbackUrl=${encodeURIComponent(returnTo)}`;
}

type OpenConsoleLinkProps = {
  className?: string;
  children: React.ReactNode;
};

/** Links to the developer console, or to sign-in with return URL when logged out. */
export function OpenConsoleLink({ className, children }: OpenConsoleLinkProps) {
  const { status } = useSession();
  const href =
    status === "authenticated"
      ? DEVELOPER_CONSOLE_PATH
      : developerConsoleSignInHref();

  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  );
}
