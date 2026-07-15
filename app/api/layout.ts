/** Keep all API route handlers dynamic — avoids build-time DB/auth prerender failures on Vercel. */
export const dynamic = "force-dynamic";
export const revalidate = 0;
