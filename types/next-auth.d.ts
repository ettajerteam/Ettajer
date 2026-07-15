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
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    status?: string;
    founderNumber?: number | null;
    remember?: boolean;
    name?: string | null;
  }
}
