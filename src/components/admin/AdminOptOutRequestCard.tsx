"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  CheckCircle,
  XCircle,
  Loader2,
  X,
} from "lucide-react";
import { reviewOptOutRequest } from "@/src/actions/optOut";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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

interface Props {
  request: OptOutRequest;
  adminId: string;
  index: number;
}

export default function AdminOptOutRequestCard({
  request,
  adminId,
  index,
}: Props) {
  const router = useRouter();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
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

  const handleApprove = async () => {
    if (
      !confirm(
        `Are you sure you want to approve this opt-out request? The user will be removed from the cycle and a refund of ${formatCurrency(
          request.refundAmount
        )} will need to be processed.`
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const result = await reviewOptOutRequest(request.id, adminId, true);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    const result = await reviewOptOutRequest(
      request.id,
      adminId,
      false,
      rejectNotes
    );

    if (result.success) {
      toast.success(result.message);
      setShowRejectModal(false);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="bg-white rounded-2xl shadow-lg border-2 border-yellow-200 p-6"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* User Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  {request.userName}
                </h3>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  {request.userPhone}
                </div>
                {request.userEmail && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {request.userEmail}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Cycle</p>
                <p className="font-semibold text-gray-800">
                  {request.cycleName}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Requested</p>
                <p className="font-semibold text-gray-800">
                  {formatDateTime(request.requestedAt)}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-600 font-semibold mb-1">
                Reason:
              </p>
              <p className="text-sm text-gray-800">{request.reason}</p>
            </div>
          </div>

          {/* Financial & Actions */}
          <div className="lg:border-l lg:border-gray-200 lg:pl-6 space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Paid</span>
                <span className="font-semibold text-gray-800">
                  {formatCurrency(request.totalPaid)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-red-600">
                <span>Penalty</span>
                <span className="font-semibold">
                  -{formatCurrency(request.penaltyAmount)}
                </span>
              </div>
              <div className="flex justify-between text-lg border-t pt-2">
                <span className="font-semibold text-gray-800">Refund</span>
                <span className="font-bold text-green-600">
                  {formatCurrency(request.refundAmount)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Approve Request
              </button>

              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Reject Request
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Reject Modal */}
      <AnimatePresence>
        {showRejectModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isProcessing && setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Reject Opt-Out Request
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={isProcessing}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-800">
                  Rejecting this request will notify{" "}
                  <strong>{request.userName}</strong> that they cannot opt out
                  at this time.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="Explain why this request is being rejected..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectNotes.trim()}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Rejecting...
                    </span>
                  ) : (
                    "Confirm Rejection"
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
