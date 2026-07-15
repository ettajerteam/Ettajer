import { spawnSync } from "node:child_process";

function run(command, args, env = process.env) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: true,
    env,
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const prismaGenerateEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL?.trim() ||
    "postgresql://build:build@localhost:5432/build?schema=public",
};

console.log("Generating Prisma client...");
run("npx", ["prisma", "generate"], prismaGenerateEnv);

console.log("Building Next.js app...");
run("npx", ["next", "build"], process.env);
