"use client";

import { motion } from "framer-motion";
import {
  Wallet,
  TrendingUp,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  DollarSign,
  Users,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface DashboardData {
  user: {
    fullName: string;
    phone: string;
    email?: string | null;
    occupation?: string | null;
    address?: string | null;
    status: string;
  };
  activeParticipation: {
    id: string;
    cycleName: string;
    contributionMode: string;
    pickedNumber: number | null;
    monthlyAmount: number;
    totalPayout: number;
    registeredAt: Date;
    payoutScheduled?: Date;
    payoutStatus?: string;
  } | null;
  stats: {
    totalContributed: number;
    pendingPayments: number;
    overduePayments: number;
    totalFines: number;
    expectedPayout: number;
  };
  recentPayments: Array<{
    id: string;
    monthNumber: number;
    amount: number;
    dueDate: Date;
    paidAt?: Date | null;
    status: string;
    hasFine: boolean;
    fineAmount: number;
  }>;
  allParticipations: Array<{
    id: string;
    cycleName: string;
    status: string;
    contributionMode: string;
    hasOptedOut: boolean;
  }>;
}

interface Props {
  data: DashboardData;
  activeCycles: Array<{
    id: string;
    name: string;
    startDate: Date;
    endDate: Date;
    registrationDeadline: Date;
    totalSlots: number;
    status: string;
  }>;
  isAdmin: boolean;
}

export default function DashboardOverview({
  data,
  activeCycles,
  isAdmin,
}: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getContributionModeLabel = (mode: string) => {
    switch (mode) {
      case "PACK_20K":
        return "₦20k Pack";
      case "PACK_50K":
        return "₦50k Pack";
      case "PACK_100K":
        return "₦100k Pack";
      default:
        return mode;
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      PENDING: "bg-yellow-100 text-yellow-700",
      PAID: "bg-green-100 text-green-700",
      OVERDUE: "bg-red-100 text-red-700",
      WAIVED: "bg-gray-100 text-gray-700",
    };

    return (
      <span
        className={`px-2 py-1 rounded-full text-xs font-semibold ${
          styles[status as keyof typeof styles] || styles.PENDING
        }`}
      >
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col md:flex-row justify-between  md:items-center"
        >
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {data.user.fullName.split(" ")[0]}! 👋
            </h1>
            <p className="text-indigo-100">
              {data.activeParticipation
                ? `You're currently participating in ${data.activeParticipation.cycleName}`
                : "Ready to join a contribution cycle?"}
            </p>
          </div>

          <div className="py-4 md:py-0">
            <p>
              Account Number:{" "}
              <span className="font-semibold tracking-wider">177379076</span>
            </p>
            <p>
              Account Name: <span>M&Z General Business</span>
            </p>
            <p>
              Bank Name: <span>Access Bank</span>
            </p>
          </div>
        </motion.div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Wallet className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Contributed</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data.stats.totalContributed)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Expected Payout</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data.stats.expectedPayout)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.stats.pendingPayments}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Overdue Payments</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.stats.overduePayments}
          </p>
        </motion.div>
      </div>

      {/* Active Participation Card */}
      {data.activeParticipation ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Active Contribution
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Cycle</p>
              <p className="text-lg font-semibold text-gray-800">
                {data.activeParticipation.cycleName}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Package</p>
              <p className="text-lg font-semibold text-gray-800">
                {getContributionModeLabel(
                  data.activeParticipation.contributionMode
                )}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Your Number</p>
              {data.activeParticipation.pickedNumber ? (
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <span className="text-white font-bold">
                      {data.activeParticipation.pickedNumber}
                    </span>
                  </div>
                </div>
              ) : (
                <Link
                  href="/dashboard/pick-number"
                  className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Pick a number
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-1">Monthly Amount</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatCurrency(data.activeParticipation.monthlyAmount)}
              </p>
            </div>
          </div>

          {data.activeParticipation.payoutScheduled && (
            <div className="mt-6 p-4 bg-indigo-50 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-indigo-600" />
                <div>
                  <p className="text-sm text-gray-600">Payout Scheduled</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(data.activeParticipation.payoutScheduled)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-indigo-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Join a Contribution Cycle
            </h3>
            <p className="text-gray-600 mb-6">
              Start your savings journey by joining an active cycle
            </p>

            {activeCycles.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  {activeCycles.length}{" "}
                  {activeCycles.length === 1 ? "cycle" : "cycles"} available
                </p>
                <Link
                  href="/dashboard/join-cycle"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Browse Available Cycles
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            ) : (
              <p className="text-gray-500 text-sm">
                No cycles are currently accepting registrations. Check back
                soon!
              </p>
            )}
          </div>
        </motion.div>
      )}

      {/* Recent Payments */}
      {data.recentPayments.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Recent Payments</h2>
            <Link
              href="/dashboard/contributions"
              className="text-indigo-600 hover:text-indigo-700 font-semibold text-sm flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {data.recentPayments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                      payment.status === "PAID"
                        ? "bg-green-100"
                        : payment.status === "OVERDUE"
                        ? "bg-red-100"
                        : "bg-yellow-100"
                    }`}
                  >
                    {payment.status === "PAID" ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <Clock className="w-6 h-6 text-yellow-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">
                      Month {payment.monthNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Due: {formatDate(payment.dueDate)}
                    </p>
                    {payment.hasFine && (
                      <p className="text-xs text-red-600">
                        Fine: {formatCurrency(payment.fineAmount)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-800">
                    {formatCurrency(payment.amount)}
                  </p>
                  {getStatusBadge(payment.status)}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Available Cycles */}
      {activeCycles.length > 0 && !data.activeParticipation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Available Cycles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeCycles.map((cycle) => (
              <div
                key={cycle.id}
                className="p-4 border border-gray-200 rounded-xl hover:border-indigo-300 transition-colors"
              >
                <h3 className="font-semibold text-gray-800 mb-2">
                  {cycle.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>Starts: {formatDate(cycle.startDate)}</p>
                  <p>
                    Registration deadline:{" "}
                    {formatDate(cycle.registrationDeadline)}
                  </p>
                  <p>Total slots: {cycle.totalSlots}</p>
                </div>
                <Link
                  href={`/dashboard/join-cycle?id=${cycle.id}`}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Join Cycle
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
