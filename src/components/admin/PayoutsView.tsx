/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  TrendingUp,
  Filter,
} from "lucide-react";
import PayoutCard from "./PayoutCard";

interface Payout {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  cycleName: string;
  contributionMode: string;
  amount: number;
  scheduledMonth: number;
  scheduledDate: Date;
  paidAt: Date | null;
  status: string;
  transferReference: string | null;
  processedBy: string | null;
  notes: string | null;
  bankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
}

interface Stats {
  total: number;
  pending: number;
  completed: number;
  overdue: number;
  pendingAmount: number;
  completedAmount: number;
}

interface UpcomingPayout {
  id: string;
  userName: string;
  cycleName: string;
  amount: number;
  scheduledDate: Date;
  scheduledMonth: number;
}

interface Props {
  payouts: Payout[];
  stats: Stats;
  upcoming: UpcomingPayout[];
  adminId: string;
}

export default function PayoutsView({
  payouts,
  stats,
  upcoming,
  adminId,
}: Props) {
  const [filter, setFilter] = useState<
    "all" | "pending" | "completed" | "overdue"
  >("pending");
  const [selectedPayouts, setSelectedPayouts] = useState<string[]>([]);
  const [searchPayout, setSearchPayout] = useState("");

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

  const filteredPayouts = payouts.filter((payout) => {
    if (filter === "all") return true;
    if (filter === "pending") return payout.status === "PENDING";
    if (filter === "completed") return payout.status === "PAID";
    if (filter === "overdue")
      return payout.status === "PENDING" && new Date() > payout.scheduledDate;
    return true;
  });

  const toggleSelection = (payoutId: string) => {
    setSelectedPayouts((prev) =>
      prev.includes(payoutId)
        ? prev.filter((id) => id !== payoutId)
        : [...prev, payoutId]
    );
  };

  const selectAll = () => {
    const pendingIds = filteredPayouts
      .filter((p) => p.status === "PENDING")
      .map((p) => p.id);
    setSelectedPayouts(pendingIds);
  };

  const clearSelection = () => {
    setSelectedPayouts([]);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Payout Management
        </h1>
        <p className="text-gray-600">Process and track member payouts</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending Payouts</p>
          <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
          <p className="text-sm text-gray-600 mt-2">
            {formatCurrency(stats.pendingAmount)}
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
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
          <p className="text-sm text-gray-600 mt-2">
            {formatCurrency(stats.completedAmount)}
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
          <p className="text-3xl font-bold text-gray-800">{stats.overdue}</p>
          <p className="text-xs text-red-600 mt-2">
            Requires immediate attention
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
          <p className="text-sm text-gray-600 mt-2">All time</p>
        </motion.div>
      </div>

      {/* Upcoming Payouts */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6"
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Upcoming Payouts (Next 30 Days)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcoming.map((payout) => (
              <div
                key={payout.id}
                className="bg-white rounded-xl p-4 border border-blue-200"
              >
                <p className="font-semibold text-gray-800">{payout.userName}</p>
                <p className="text-sm text-gray-600">{payout.cycleName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-lg font-bold text-gray-800">
                    {formatCurrency(payout.amount)}
                  </span>
                  <span className="text-xs text-gray-600">
                    {formatDate(payout.scheduledDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="flex flex-wrap items-center gap-4"
      >
        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-2">
          {[
            { value: "pending", label: "Pending", count: stats.pending },
            { value: "overdue", label: "Overdue", count: stats.overdue },
            { value: "completed", label: "Completed", count: stats.completed },
            { value: "all", label: "All", count: stats.total },
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
        </div>

        {filter === "completed" && (
          <div>
            <input
              type="text"
              value={""}
              onChange={(e) => e.target.value}
              placeholder="e.g., TXN-2024-001234"
              className="w-full pl-11 pr-4 text-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
            />
          </div>
        )}

        {selectedPayouts.length > 0 && filter === "pending" && (
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-sm text-gray-600">
              {selectedPayouts.length} selected
            </span>
            <button
              onClick={clearSelection}
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800 font-medium"
            >
              Clear
            </button>
            <button
              onClick={selectAll}
              className="px-3 py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Select All
            </button>
          </div>
        )}
      </motion.div>

      {/* Payouts List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="space-y-4"
      >
        {filteredPayouts.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <DollarSign className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No payouts found for this filter</p>
          </div>
        ) : (
          filteredPayouts.map((payout, index) => (
            <motion.div
              key={payout.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
            >
              <PayoutCard
                payout={payout}
                adminId={adminId}
                isSelected={selectedPayouts.includes(payout.id)}
                onToggleSelection={toggleSelection}
              />
            </motion.div>
          ))
        )}
      </motion.div>
    </div>
  );
}
