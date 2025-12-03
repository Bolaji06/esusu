"use client";

import { motion } from "framer-motion";
import {
  Users,
  Calendar,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  Activity,
  Outdent,
} from "lucide-react";
import Link from "next/link";
import PaymentVerificationCard from "./PaymentVerificationCard";

interface Props {
  stats: {
    users: {
      total: number;
      active: number;
      suspended: number;
    };
    cycles: {
      total: number;
      active: number;
      upcoming: number;
    };
    participations: {
      total: number;
      active: number;
    };
    payments: {
      pending: number;
      overdue: number;
      unverified: number;
    };
    payouts: {
      pending: number;
    };
    financial: {
      totalCollected: number;
      finesCollected: number;
      pendingPayouts: number;
    };
  };
  activities: {
    recentPayments: Array<{
      id: string;
      userName: string;
      amount: number;
      monthNumber: number;
      paidAt: Date | null;
    }>;
    recentRegistrations: Array<{
      id: string;
      userName: string;
      cycleName: string;
      contributionMode: string;
      registeredAt: Date;
    }>;
  };
  paymentsToVerify: Array<{
    id: string;
    userId: string;
    userName: string;
    userPhone: string;
    cycleName: string;
    contributionMode: string;
    monthNumber: number;
    amount: number;
    dueDate: Date;
    proofOfPayment: string | null;
    hasFine: boolean;
    fineAmount: number;
    uploadedAt: Date;
  }>;
  adminId: string;
}

export default function AdminDashboardView({
  stats,
  activities,
  paymentsToVerify,
  adminId,
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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getContributionModeLabel = (mode: string) => {
    switch (mode) {
      case "PACK_20K":
        return "₦20k";
      case "PACK_50K":
        return "₦50k";
      case "PACK_100K":
        return "₦100k";
      default:
        return mode;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-600">Manage your contribution system</p>
      </motion.div>

      {/* Alert for unverified payments */}
      {paymentsToVerify.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-6"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-orange-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-800">
                {paymentsToVerify.length} Payment
                {paymentsToVerify.length !== 1 ? "s" : ""} Awaiting Verification
              </h3>
              <p className="text-sm text-gray-600">
                Review and verify payment proofs submitted by users
              </p>
            </div>

            <a
              href="#verification"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Review Now
            </a>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.users.total}
          </p>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-green-600">{stats.users.active} active</span>
            {stats.users.suspended > 0 && (
              <span className="text-red-600">
                {stats.users.suspended} suspended
              </span>
            )}
          </div>
        </motion.div>

        {/* Cycles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Contribution Cycles</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.cycles.total}
          </p>
          <div className="mt-3 flex gap-3 text-xs">
            <span className="text-green-600">{stats.cycles.active} active</span>
            <span className="text-blue-600">
              {stats.cycles.upcoming} upcoming
            </span>
          </div>
        </motion.div>

        {/* Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Payments</p>
          <p className="text-3xl font-bold text-gray-800">
            {stats.payments.pending}
          </p>
          <div className="mt-3 flex gap-3 text-xs">
            {stats.payments.overdue > 0 && (
              <span className="text-red-600">
                {stats.payments.overdue} overdue
              </span>
            )}
            {stats.payments.unverified > 0 && (
              <span className="text-orange-600">
                {stats.payments.unverified} to verify
              </span>
            )}
          </div>
        </motion.div>

        {/* Financial */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Collected</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(stats.financial.totalCollected)}
          </p>
          <div className="mt-3 text-xs text-gray-600">
            Fines: {formatCurrency(stats.financial.finesCollected)}
          </div>
        </motion.div>
      </div>

      {/* Payment Verification Section */}
      {paymentsToVerify.length > 0 && (
        <motion.div
          id="verification"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-indigo-600" />
              Payment Verification Queue
            </h2>
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-semibold">
              {paymentsToVerify.length} pending
            </span>
          </div>

          <div className="space-y-4">
            {paymentsToVerify.map((payment) => (
              <PaymentVerificationCard
                key={payment.id}
                payment={payment}
                adminId={adminId}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-600" />
            Recent Payments
          </h3>

          {activities.recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No recent payments</p>
          ) : (
            <div className="space-y-3">
              {activities.recentPayments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {payment.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      Month {payment.monthNumber}
                      {payment.paidAt && ` • ${formatDateTime(payment.paidAt)}`}
                    </p>
                  </div>
                  <p className="font-bold text-green-600">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Recent Registrations */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Recent Registrations
          </h3>

          {activities.recentRegistrations.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              No recent registrations
            </p>
          ) : (
            <div className="space-y-3">
              {activities.recentRegistrations.map((reg) => (
                <div
                  key={reg.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {reg.userName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {reg.cycleName} • {formatDateTime(reg.registeredAt)}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-semibold">
                    {getContributionModeLabel(reg.contributionMode)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <Link
          href="/dashboard/admin/users"
          className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 hover:shadow-lg transition-all group"
        >
          <Users className="w-8 h-8 text-blue-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-gray-800">Manage Users</p>
        </Link>

        <Link
          href="/dashboard/admin/cycles"
          className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200 hover:shadow-lg transition-all group"
        >
          <Calendar className="w-8 h-8 text-purple-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-gray-800">Manage Cycles</p>
        </Link>

        <Link
          href="/dashboard/admin/payouts"
          className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 hover:shadow-lg transition-all group"
        >
          <TrendingUp className="w-8 h-8 text-green-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-gray-800">Process Payouts</p>
        </Link>

        <Link
          href="/dashboard/admin/reports"
          className="p-6 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border border-orange-200 hover:shadow-lg transition-all group"
        >
          <Activity className="w-8 h-8 text-orange-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-gray-800">View Reports</p>
        </Link>

        <Link
          href="/dashboard/admin/opts-out"
          className="p-6 bg-gradient-to-br from-red-50 to-red-50 red-2xl border border-red-200 hover:shadow-lg transition-all group"
        >
          <Outdent className="w-8 h-8 text-red-600 mb-3 group-hover:scale-110 transition-transform" />
          <p className="font-semibold text-gray-800">Opt-Out Request</p>
        </Link>
      </motion.div>
    </div>
  );
}
