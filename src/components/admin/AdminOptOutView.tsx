"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  DollarSign,
  Users,
} from "lucide-react";
import AdminOptOutRequestCard from "./AdminOptOutRequestCard";

interface OptOutRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  cycleId: string;
  cycleName: string;
  reason: string;
  totalPaid: number;
  penaltyAmount: number;
  refundAmount: number;
  requestedAt: Date;
}

interface Stats {
  pending: number;
  approved: number;
  rejected: number;
  totalRefunded: number;
  totalPenalties: number;
}

interface Props {
  pendingRequests: OptOutRequest[];
  stats: Stats;
  adminId: string;
}

export default function AdminOptOutView({
  pendingRequests,
  stats,
  adminId,
}: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Opt-Out Requests
        </h1>
        <p className="text-gray-600">Review and manage user opt-out requests</p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <Clock className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Pending</p>
          <p className="text-3xl font-bold text-gray-800">{stats.pending}</p>
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
          <p className="text-sm text-gray-600 mb-1">Approved</p>
          <p className="text-3xl font-bold text-gray-800">{stats.approved}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Rejected</p>
          <p className="text-3xl font-bold text-gray-800">{stats.rejected}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Refunded</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(stats.totalRefunded)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Penalties</p>
          <p className="text-2xl font-bold text-gray-800">
            {formatCurrency(stats.totalPenalties)}
          </p>
        </motion.div>
      </div>

      {/* Pending Requests */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-yellow-600" />
          Pending Requests ({pendingRequests.length})
        </h2>

        {pendingRequests.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No pending opt-out requests</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((request, index) => (
              <AdminOptOutRequestCard
                key={request.id}
                request={request}
                adminId={adminId}
                index={index}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
