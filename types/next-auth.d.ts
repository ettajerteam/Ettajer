import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      status?: string;
      founderNumber?: number | null;
      plan?: string | null;
      role?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    status?: string;
    founderNumber?: number | null;
    plan?: string | null;
    role?: string;
    remember?: boolean;
    /** Absolute unix expiry; extended on each JWT refresh while signed in. */
    sessionEndsAt?: number;
    name?: string | null;
  }
}