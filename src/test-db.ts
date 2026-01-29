import { prisma } from "./lib/prisma";

async function main() {
  try {
    console.log("Attempting to connect to database...");
    const userCount = await prisma.user.count();
    console.log(`Connection successful! User count: ${userCount}`);

    // Test a simple query to ensure everything is working
    const firstUser = await prisma.user.findFirst({
      select: { id: true, fullName: true, phone: true },
    });
    console.log("Sample user from DB:", firstUser);
  } catch (error) {
    console.error("Connection failed:", error);
  } finally {
    // Note: $extends clients might not need manual disconnect in short scripts but it's good practice
    // However, some versions of extension-accelerate might have different disconnect behavior
    // We'll try to disconnect to clean up
    try {
      await (prisma as any).$disconnect();
    } catch (e) {
      // Ignore if disconnect fails or isn't available on the extended client
    }
  }
}

main();
