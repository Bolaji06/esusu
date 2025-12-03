
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import {
  getFinancialSummary,
  getDefaultersReport,
  getCyclePerformance,
  getPaymentTrends,
} from "@/src/actions/report";
import ReportsView from "@/src/components/admin/ReportView";
import { getAllCycles } from "@/src/actions/admin";

export default async function AdminReportsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!user.isAdmin) {
    redirect("/dashboard");
  }

  const [financialSummary, defaulters, cyclePerformance, paymentTrends, cycles] =
    await Promise.all([
      getFinancialSummary(),
      getDefaultersReport(),
      getCyclePerformance(),
      getPaymentTrends(),
      getAllCycles(),
    ]);

  return (
    <ReportsView
      financialSummary={financialSummary}
      defaulters={defaulters}
      cyclePerformance={cyclePerformance}
      paymentTrends={paymentTrends}
      cycles={cycles}
    />
  );
}