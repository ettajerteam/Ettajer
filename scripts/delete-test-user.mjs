import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const email = "salahaddinefarhi@gmail.com";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, founderNumber: true },
  });

  if (!user) {
    console.log("User not found:", email);
    return;
  }

  await prisma.verificationToken.deleteMany({
    where: {
      OR: [
        { identifier: { contains: email } },
        { identifier: `account-activation:${email}` },
        { identifier: `activation-resend:${email}` },
        { identifier: `password-reset:${email}` },
      ],
    },
  });

  await prisma.user.delete({ where: { email } });

  console.log("Deleted user:", {
    email: user.email,
    name: user.name ?? "",
    founderNumber: user.founderNumber,
  });
}

main()
  .catch((error) => {
    console.error("Delete failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
