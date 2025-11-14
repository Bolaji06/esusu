import { PrismaClient } from "@/app/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Create system settings if not exists
  const settings = await prisma.systemSettings.findFirst();

  if (!settings) {
    await prisma.systemSettings.create({
      data: {
        pack20kMonthly: 20000,
        pack20kPayout: 200000,
        pack20kFine: 2000,
        pack50kMonthly: 50000,
        pack50kPayout: 500000,
        pack50kFine: 2500,
        pack100kMonthly: 100000,
        pack100kPayout: 1000000,
        pack100kFine: 5000,
        optOutPenaltyPercent: 10,
      },
    });
    console.log("✅ Created system settings");
  }

  // Create a contribution cycle
  const cycle = await prisma.contributionCycle.create({
    data: {
      name: "January 2025 Cycle",
      startDate: new Date("2025-01-01"),
      endDate: new Date("2025-12-31"),
      registrationDeadline: new Date("2025-12-20"), // Future date
      numberPickingStartDate: new Date("2024-12-15"),
      status: "ACTIVE",
      paymentDeadlineDay: 29,
      totalSlots: 20,
    },
  });

  console.log("✅ Created contribution cycle:", cycle.name);
  console.log("📅 Registration deadline:", cycle.registrationDeadline);
  console.log("🎯 Total slots:", cycle.totalSlots);
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
