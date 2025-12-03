
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  CreditCard,
  User,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import PayoutTimelineView from "./PayoutTimelineView";
import PayoutHistoryCard from "./PayoutHistoryCard";

interface PayoutInfo {
  payouts: Array<{
    id: string;
    cycleName: string;
    cycleStatus: string;
    contributionMode: string;
    amount: number;
    scheduledMonth: number;
    scheduledDate: Date;
    paidAt: Date | null;
    status: string;
    transferReference: string | null;
    notes: string | null;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    } | null;
  }>;
  activePayout: {
    id: string;
    cycleName: string;
    amount: number;
    scheduledMonth: number;
    scheduledDate: Date;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    } | null;
  } | null;
  statistics: {
    totalExpected: number;
    totalReceived: number;
    totalPending: number;
    completedCount: number;
    pendingCount: number;
  };
}

interface Timeline {
  timeline: Array<{
    month: number;
    userName: string;
    userId: string;
    status: string;
    amount: number;
    scheduledDate: Date;
    isCurrentUser: boolean;
  }>;
  currentMonth: number;
  userPosition: number | null;
  cycleName: string;
  totalSlots: number;
}

interface Props {
  userId: string;
  payoutInfo: PayoutInfo;
  timeline: Timeline;
}

export default function UserPayoutsView({
  userId,
  payoutInfo,
  timeline,
}: Props) {
  const [activeTab, setActiveTab] = useState<"upcoming" | "history">("upcoming");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
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

  const getDaysUntilPayout = (date: Date) => {
    const now = new Date();
    const payoutDate = new Date(date);
    const diffTime = payoutDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const pendingPayouts = payoutInfo.payouts.filter((p) => p.status === "PENDING");
  const completedPayouts = payoutInfo.payouts.filter((p) => p.status === "PAID");

  // No payouts
  if (payoutInfo.payouts.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 border border-indigo-200 text-center"
        >
          <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Payouts Scheduled
          </h2>
          <p className="text-gray-600 mb-6">
            You need to join a contribution cycle and pick your payout number first.
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
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Payouts</h1>
        <p className="text-gray-600">
          Track your payout schedule and history
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
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Expected</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(payoutInfo.statistics.totalExpected)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Received</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(payoutInfo.statistics.totalReceived)}
          </p>
          <p className="text-xs text-green-600 mt-1">
            {payoutInfo.statistics.completedCount} payout(s)
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(payoutInfo.statistics.totalPending)}
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            {payoutInfo.statistics.pendingCount} upcoming
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Your Position</p>
          <p className="text-2xl font-bold text-gray-800">
            {timeline.userPosition ? `Month ${timeline.userPosition}` : "N/A"}
          </p>
        </motion.div>
      </div>

      {/* Active Payout Card */}
      {payoutInfo.activePayout && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
        >
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-indigo-100 text-sm">Next Payout</p>
                  <h3 className="text-lg font-bold">
                    {payoutInfo.activePayout.cycleName}
                  </h3>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-4xl font-bold">
                  {formatCurrency(payoutInfo.activePayout.amount)}
                </p>
                <div className="flex items-center gap-4 text-indigo-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Month {payoutInfo.activePayout.scheduledMonth}
                  </span>
                  <span>
                    {formatDate(payoutInfo.activePayout.scheduledDate)}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              {getDaysUntilPayout(payoutInfo.activePayout.scheduledDate) > 0 ? (
                <div className="bg-white/20 rounded-xl px-6 py-4">
                  <p className="text-indigo-100 text-sm mb-1">Days Until Payout</p>
                  <p className="text-4xl font-bold">
                    {getDaysUntilPayout(payoutInfo.activePayout.scheduledDate)}
                  </p>
                </div>
              ) : (
                <div className="bg-green-400/20 rounded-xl px-6 py-4">
                  <p className="text-green-100 text-sm mb-1">Status</p>
                  <p className="text-xl font-bold">Ready for Payout!</p>
                </div>
              )}
            </div>
          </div>

          {/* Bank Details */}
          {payoutInfo.activePayout.bankDetails ? (
            <div className="mt-6 pt-6 border-t border-white/20">
              <p className="text-indigo-100 text-sm mb-3">Payout will be sent to:</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-200" />
                  <span>{payoutInfo.activePayout.bankDetails.bankName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-200" />
                  <span className="font-mono">
                    {payoutInfo.activePayout.bankDetails.accountNumber}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-200" />
                  <span>{payoutInfo.activePayout.bankDetails.accountName}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-6 pt-6 border-t border-white/20">
              <div className="flex items-center gap-3 p-4 bg-red-400/20 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-200" />
                <div>
                  <p className="font-semibold">Bank Details Missing</p>
                  <p className="text-sm text-red-100">
                    Please update your bank details in your profile to receive this
                    payout.
                  </p>
                </div>
                <Link
                  href="/dashboard/profile"
                  className="ml-auto px-4 py-2 bg-white text-indigo-600 rounded-lg font-semibold hover:bg-indigo-50 transition-colors"
                >
                  Update
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Payout Timeline */}
      {timeline.timeline.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <PayoutTimelineView timeline={timeline} userId={userId} />
        </motion.div>
      )}

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-2"
      >
        <button
          onClick={() => setActiveTab("upcoming")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === "upcoming"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Upcoming ({pendingPayouts.length})
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`px-6 py-3 rounded-xl font-semibold transition-all ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          History ({completedPayouts.length})
        </button>
      </motion.div>

      {/* Payouts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="space-y-4"
      >
        {activeTab === "upcoming" ? (
          pendingPayouts.length === 0 ? (
            <div className="bg-gray-50 rounded-2xl p-12 text-center">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No upcoming payouts</p>
            </div>
          ) : (
            pendingPayouts.map((payout, index) => (
              <PayoutHistoryCard
                key={payout.id}
                payout={payout}
                index={index}
              />
            ))
          )
        ) : completedPayouts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No completed payouts yet</p>
          </div>
        ) : (
          completedPayouts.map((payout, index) => (
            <PayoutHistoryCard key={payout.id} payout={payout} index={index} />
          ))
        )}
      </motion.div>
    </div>
  );
}