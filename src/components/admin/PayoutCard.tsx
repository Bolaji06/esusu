"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  User,
  Phone,
  Mail,
  Building,
  CreditCard,
  X,
  Loader2,
} from "lucide-react";
import { processPayout } from "@/src/actions/payout";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface Props {
  payout: Payout;
  adminId: string;
  isSelected: boolean;
  onToggleSelection: (id: string) => void;
}

export default function PayoutCard({
  payout,
  adminId,
  isSelected,
  onToggleSelection,
}: Props) {
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transferReference, setTransferReference] = useState("");
  const [notes, setNotes] = useState("");
  const router = useRouter();

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
        return "₦20k Pack";
      case "PACK_50K":
        return "₦50k Pack";
      case "PACK_100K":
        return "₦100k Pack";
      default:
        return mode;
    }
  };

  const handleProcess = async () => {
    if (!transferReference.trim()) {
      toast.error("Transfer reference is required");
      return;
    }

    setIsProcessing(true);
    const result = await processPayout(
      payout.id,
      adminId,
      transferReference,
      notes
    );

    if (result.success) {
      toast.success("Payout processed successfully!");
      setShowProcessModal(false);
      setTransferReference("");
      setNotes("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to process payout");
    }
    setIsProcessing(false);
  };

  const isPending = payout.status === "PENDING";
  const isCompleted = payout.status === "PAID";
  const isOverdue = isPending && new Date() > payout.scheduledDate;

  const statusConfig = {
    pending: {
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      icon: Clock,
      iconColor: "text-yellow-600",
      border: "border-yellow-200",
    },
    overdue: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: AlertCircle,
      iconColor: "text-red-600",
      border: "border-red-200",
    },
    completed: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: CheckCircle,
      iconColor: "text-green-600",
      border: "border-green-200",
    },
  };

  const status = isCompleted ? "completed" : isOverdue ? "overdue" : "pending";
  const config = statusConfig[status];

  return (
    <>
      {/* Payout Card */}
      <div
        className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
          isSelected ? "border-indigo-400 bg-indigo-50" : config.border
        }`}
      >
        <div className="flex items-start gap-4">
          {/* Selection Checkbox (only for pending) */}
          {isPending && (
            <div className="flex items-center pt-1">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => onToggleSelection(payout.id)}
                className="w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 cursor-pointer"
              />
            </div>
          )}

          {/* Status Icon */}
          <div
            className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
          >
            <config.icon className={`w-7 h-7 ${config.iconColor}`} />
          </div>

          {/* Content */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* User Info */}
            <div className="space-y-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-gray-600" />
                  <h3 className="text-lg font-bold text-gray-800">
                    {payout.userName}
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{payout.userPhone}</span>
                </div>
                {payout.userEmail && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4" />
                    <span>{payout.userEmail}</span>
                  </div>
                )}
              </div>

              <div>
                <p className="text-sm text-gray-600">Cycle</p>
                <p className="font-semibold text-gray-800">
                  {payout.cycleName}
                </p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Package</p>
                <p className="font-semibold text-gray-800">
                  {getContributionModeLabel(payout.contributionMode)}
                </p>
              </div>
            </div>

            {/* Bank Details */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Bank Details
              </h4>

              {payout.bankDetails ? (
                <div className="space-y-2 text-sm">
                  <div>
                    <p className="text-gray-600">Bank</p>
                    <p className="font-semibold text-gray-800">
                      {payout.bankDetails.bankName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Number</p>
                    <p className="font-semibold text-gray-800 font-mono">
                      {payout.bankDetails.accountNumber}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Account Name</p>
                    <p className="font-semibold text-gray-800">
                      {payout.bankDetails.accountName}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-red-600">No bank details provided</p>
              )}
            </div>
            {/* Payout Info & Actions */}
            <div className="space-y-4">
              <div className="text-right lg:text-left">
                <p className="text-sm text-gray-600 mb-1">Payout Amount</p>
                <p className="text-3xl font-bold text-gray-800">
                  {formatCurrency(payout.amount)}
                </p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-600" />
                  <span className="text-gray-600">
                    Month {payout.scheduledMonth} • Due:{" "}
                    {formatDate(payout.scheduledDate)}
                  </span>
                </div>

                <div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                  >
                    {isCompleted
                      ? "Completed"
                      : isOverdue
                      ? "Overdue"
                      : "Pending"}
                  </span>
                </div>

                {isCompleted && payout.paidAt && (
                  <div className="text-green-600">
                    <p className="font-semibold">
                      Paid on: {formatDateTime(payout.paidAt)}
                    </p>
                    {payout.transferReference && (
                      <p className="text-xs mt-1">
                        Ref: {payout.transferReference}
                      </p>
                    )}
                  </div>
                )}

                {isOverdue && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">
                      Requires immediate attention!
                    </span>
                  </div>
                )}
              </div>

              {/* Action Button */}
              {isPending && payout.bankDetails && (
                <button
                  onClick={() => setShowProcessModal(true)}
                  className="w-full px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Process Payout
                </button>
              )}

              {isPending && !payout.bankDetails && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-semibold">
                    Cannot process: Missing bank details
                  </p>
                </div>
              )}

              {payout.notes && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs text-gray-600 font-semibold mb-1">
                    Admin Note:
                  </p>
                  <p className="text-sm text-gray-800">{payout.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Process Payout Modal */}
      <AnimatePresence>
        {showProcessModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isProcessing && setShowProcessModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-800">
                  Process Payout
                </h3>
                <button
                  onClick={() => setShowProcessModal(false)}
                  disabled={isProcessing}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Payout Summary */}
              <div className="mb-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-sm text-gray-600">Paying to</p>
                    <p className="text-lg font-bold text-gray-800">
                      {payout.userName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(payout.amount)}
                    </p>
                  </div>
                </div>

                {payout.bankDetails && (
                  <div className="grid grid-cols-2 gap-4 pt-3 border-t border-green-200 text-sm">
                    <div>
                      <p className="text-gray-600">Bank</p>
                      <p className="font-semibold text-gray-800">
                        {payout.bankDetails.bankName}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Account Number</p>
                      <p className="font-semibold text-gray-800 font-mono">
                        {payout.bankDetails.accountNumber}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-gray-600">Account Name</p>
                      <p className="font-semibold text-gray-800">
                        {payout.bankDetails.accountName}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Transfer Reference */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transfer Reference / Transaction ID{" "}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={transferReference}
                    onChange={(e) => setTransferReference(e.target.value)}
                    placeholder="e.g., TXN-2024-001234"
                    className="w-full pl-11 pr-4 text-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter the bank transfer reference or transaction ID
                </p>
              </div>

              {/* Notes (Optional) */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes{" "}
                  <span className="text-gray-400 text-xs">(Optional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes about this payout..."
                  rows={3}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all resize-none"
                />
              </div>

              {/* Warning */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Important</p>
                    <p>
                      Please ensure the transfer has been completed successfully
                      before marking this payout as processed. This action
                      cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProcessModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProcess}
                  disabled={isProcessing || !transferReference.trim()}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      Confirm & Process
                    </span>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
