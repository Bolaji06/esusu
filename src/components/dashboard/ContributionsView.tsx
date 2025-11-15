
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  AlertCircle,
  CheckCircle,
  Clock,
  Calendar,
  DollarSign,
  Upload,
  Eye,
  TrendingUp,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import PaymentCard from "./PaymentCard";

interface Payment {
  id: string;
  monthNumber: number;
  amount: number;
  dueDate: Date;
  paidAt?: Date | null;
  paidAmount?: number | null;
  status: string;
  hasFine: boolean;
  fineAmount: number;
  finePaid: boolean;
  proofOfPayment?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: Date | null;
  notes?: string | null;
}

interface Props {
  userId: string;
  data: {
    participation: {
      id: string;
      cycleName: string;
      contributionMode: string;
      monthlyAmount: number;
      fineAmount: number;
    } | null;
    payments: Payment[];
    stats: {
      totalPaid: number;
      totalFines: number;
      pendingCount: number;
      overdueCount: number;
    };
  };
}

export default function ContributionsView({ userId, data }: Props) {
  const [filter, setFilter] = useState<"all" | "pending" | "paid" | "overdue">("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const filteredPayments = data.payments.filter((payment) => {
    if (filter === "all") return true;
    if (filter === "paid") return payment.status === "PAID";
    if (filter === "pending") return payment.status === "PENDING" && new Date() <= payment.dueDate;
    if (filter === "overdue") return payment.status === "PENDING" && new Date() > payment.dueDate;
    return true;
  });

  // No participation
  if (!data.participation) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200 text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Active Contribution
          </h2>
          <p className="text-gray-600 mb-6">
            Join a contribution cycle to start making payments and track your contributions.
          </p>
          <Link
            href="/dashboard/join-cycle"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Join a Cycle
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          My Contributions
        </h1>
        <p className="text-gray-600">
          Track your payments for <strong>{data.participation.cycleName}</strong>
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Paid</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data.stats.totalPaid)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.stats.pendingCount}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-gray-800">
            {data.stats.overdueCount}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Fines</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(data.stats.totalFines)}
          </p>
        </motion.div>
      </div>

      {/* Contribution Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-indigo-100 text-sm mb-1">Package</p>
            <p className="text-xl font-bold">
              {getContributionModeLabel(data.participation.contributionMode)}
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Monthly Amount</p>
            <p className="text-xl font-bold">
              {formatCurrency(data.participation.monthlyAmount)}
            </p>
          </div>
          <div>
            <p className="text-indigo-100 text-sm mb-1">Late Payment Fine</p>
            <p className="text-xl font-bold">
              {formatCurrency(data.participation.fineAmount)}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-2"
      >
        {[
          { value: "all", label: "All", count: data.payments.length },
          { value: "pending", label: "Pending", count: data.stats.pendingCount - data.stats.overdueCount },
          { value: "paid", label: "Paid", count: data.payments.filter(p => p.status === "PAID").length },
          { value: "overdue", label: "Overdue", count: data.stats.overdueCount },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.value
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </motion.div>

      {/* Payments List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="space-y-4"
      >
        {filteredPayments.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payments found for this filter</p>
          </div>
        ) : (
          filteredPayments.map((payment, index) => (
            <motion.div
              key={payment.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.05 }}
            >
              <PaymentCard
                payment={payment}
                userId={userId}
                monthlyAmount={data?.participation?.monthlyAmount as number}
                fineAmount={data?.participation?.fineAmount as number}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}