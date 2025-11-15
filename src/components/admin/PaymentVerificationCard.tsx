"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  XCircle,
  Eye,
  Calendar,
  User,
  Phone,
  AlertCircle,
  X,
  Loader2,
} from "lucide-react";
import { verifyPayment } from "@/src/actions/admin";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Payment {
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
}

interface Props {
  payment: Payment;
  adminId: string;
}

export default function PaymentVerificationCard({ payment, adminId }: Props) {
  const [showProof, setShowProof] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [rejectNotes, setRejectNotes] = useState("");
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

  const handleApprove = async () => {
    setIsProcessing(true);
    const result = await verifyPayment(payment.id, adminId, true);

    if (result.success) {
      toast.success("Payment approved successfully!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to approve payment");
    }
    setIsProcessing(false);
  };

  const handleReject = async () => {
    if (!rejectNotes.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    setIsProcessing(true);
    const result = await verifyPayment(payment.id, adminId, false, rejectNotes);

    if (result.success) {
      toast.success("Payment rejected");
      setShowRejectModal(false);
      setRejectNotes("");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to reject payment");
    }
    setIsProcessing(false);
  };

  const totalAmount = payment.amount + (payment.hasFine ? payment.fineAmount : 0);

  return (
    <>
      {/* Payment Card */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
      >
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Section - User Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-5 h-5 text-gray-600" />
                <h3 className="text-lg font-bold text-gray-800">
                  {payment.userName}
                </h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="w-4 h-4" />
                <span>{payment.userPhone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Cycle</p>
                <p className="font-semibold text-gray-800">{payment.cycleName}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Package</p>
                <p className="font-semibold text-gray-800">
                  {getContributionModeLabel(payment.contributionMode)}
                </p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Month</p>
                <p className="font-semibold text-gray-800">Month {payment.monthNumber}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Due Date</p>
                <p className="font-semibold text-gray-800">{formatDate(payment.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Uploaded: {formatDateTime(payment.uploadedAt)}</span>
            </div>

            {payment.hasFine && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <div className="text-sm">
                  <p className="font-semibold text-red-800">Payment is overdue</p>
                  <p className="text-red-600">Fine: {formatCurrency(payment.fineAmount)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Right Section - Amount & Actions */}
          <div className="lg:border-l lg:border-gray-300 lg:pl-6 space-y-4">
            <div className="text-center lg:text-right">
              <p className="text-sm text-gray-600 mb-1">Amount to Verify</p>
              <p className="text-3xl font-bold text-gray-800">
                {formatCurrency(totalAmount)}
              </p>
              {payment.hasFine && (
                <p className="text-xs text-red-600 mt-1">
                  (includes {formatCurrency(payment.fineAmount)} fine)
                </p>
              )}
            </div>

            <div className="space-y-3">
              {/* View Proof Button */}
              {payment.proofOfPayment && (
                <button
                  onClick={() => setShowProof(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  <Eye className="w-5 h-5" />
                  View Payment Proof
                </button>
              )}

              {/* Approve Button */}
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <CheckCircle className="w-5 h-5" />
                )}
                Approve Payment
              </button>

              {/* Reject Button */}
              <button
                onClick={() => setShowRejectModal(true)}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle className="w-5 h-5" />
                Reject Payment
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Proof Viewer Modal */}
      <AnimatePresence>
        {showProof && payment.proofOfPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProof(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-xl text-black font-bold text-gray-800">
                    Payment Proof Verification
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {payment.userName} - Month {payment.monthNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowProof(false)}
                  className="w-8 h-8 text-gray-800 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-black" />
                </button>
              </div>

              {/* Payment Details */}
              <div className="mb-4 p-4 bg-gray-50 rounded-xl space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold text-black">{formatCurrency(payment.amount)}</span>
                </div>
                {payment.hasFine && (
                  <div className="flex justify-between text-red-600">
                    <span>Fine:</span>
                    <span className="font-semibold">{formatCurrency(payment.fineAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-800 font-semibold">Total:</span>
                  <span className="font-bold text-lg text-black">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Proof Image/PDF */}
              <div className="bg-gray-50 rounded-xl p-4 mb-4">
                {payment.proofOfPayment.endsWith(".pdf") ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-red-600 font-bold text-xl">PDF</span>
                    </div>
                    <p className="text-gray-600 mb-4">PDF Document</p>
                    
                     <a href={payment.proofOfPayment}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Open PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={payment.proofOfPayment}
                    alt="Payment proof"
                    className="w-full h-auto rounded-lg shadow-sm"
                  />
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowProof(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowProof(false);
                    setShowRejectModal(true);
                  }}
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Approve"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
              className="bg-white rounded-2xl p-6 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Reject Payment Proof
                </h3>
                <button
                  onClick={() => setShowRejectModal(false)}
                  disabled={isProcessing}
                  className="w-8 h-8 rounded-lg text-black hover:bg-gray-100 flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">Warning</p>
                    <p>
                      Rejecting this payment will remove the uploaded proof and notify the user.
                      They will need to upload a new proof.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for Rejection <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectNotes}
                  onChange={(e) => setRejectNotes(e.target.value)}
                  placeholder="e.g., Image is unclear, wrong amount shown, invalid receipt..."
                  rows={4}
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all resize-none"
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
                  className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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