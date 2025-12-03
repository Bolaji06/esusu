"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  Calendar,
  Building,
  CreditCard,
  User,
  ChevronDown,
  ChevronUp,
  DollarSign,
} from "lucide-react";

interface Payout {
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
}

interface Props {
  payout: Payout;
  index: number;
}

export default function PayoutHistoryCard({ payout, index }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const formatDateTime = (date: Date) => {
    return new Date(date).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

  const isPaid = payout.status === "PAID";
  const isPending = payout.status === "PENDING";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-2xl shadow-lg border-2 overflow-hidden transition-all ${
        isPaid ? "border-green-200" : "border-yellow-200"
      }`}
    >
      {/* Main Content */}
      <div
        className="p-6 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-start gap-4">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
                isPaid ? "bg-green-100" : "bg-yellow-100"
              }`}
            >
              {isPaid ? (
                <CheckCircle className="w-7 h-7 text-green-600" />
              ) : (
                <Clock className="w-7 h-7 text-yellow-600" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-800">
                  {payout.cycleName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isPaid
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {isPaid ? "Paid" : "Pending"}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Month {payout.scheduledMonth} •{" "}
                    {formatDate(payout.scheduledDate)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  <span>{getContributionModeLabel(payout.contributionMode)}</span>
                </div>
                {isPaid && payout.paidAt && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Received on {formatDateTime(payout.paidAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="text-right flex-shrink-0">
            <p className="text-3xl font-bold text-gray-800">
              {formatCurrency(payout.amount)}
            </p>
            <button className="mt-2 text-gray-500 hover:text-gray-700 transition-colors">
              {isExpanded ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-gray-200"
          >
            <div className="p-6 bg-gray-50 space-y-4">
              {/* Bank Details */}
              {payout.bankDetails && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">
                    Bank Account Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Building className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Bank</p>
                        <p className="font-semibold text-gray-800">
                          {payout.bankDetails.bankName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Account Number</p>
                        <p className="font-semibold text-gray-800 font-mono">
                          {payout.bankDetails.accountNumber}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-xs text-gray-500">Account Name</p>
                        <p className="font-semibold text-gray-800">
                          {payout.bankDetails.accountName}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Transfer Reference (for paid payouts) */}
              {isPaid && payout.transferReference && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                  <p className="text-sm text-green-800">
                    <strong>Transfer Reference:</strong> {payout.transferReference}
                  </p>
                </div>
              )}

              {/* Notes */}
              {payout.notes && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-blue-800">
                    <strong>Note:</strong> {payout.notes}
                  </p>
                </div>
              )}

              {/* Status Info for Pending */}
              {isPending && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                  <p className="text-sm text-yellow-800">
                    This payout is scheduled for{" "}
                    <strong>{formatDate(payout.scheduledDate)}</strong>. You will
                    receive the funds after all contributions for this month are
                    collected.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}