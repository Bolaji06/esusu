"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Calendar,
  Upload,
  Eye,
  X,
} from "lucide-react";
import { markPaymentAsPaid } from "@/src/actions/payments";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import UploadProofModal from "./UploadProofModal";

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
  payment: Payment;
  userId: string;
  monthlyAmount: number;
  fineAmount: number;
}

export default function PaymentCard({
  payment,
  userId,
  monthlyAmount,
  fineAmount,
}: Props) {
  const [showProofModal, setShowProofModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleMarkAsPaid = async () => {
    setIsProcessing(true);
    const result = await markPaymentAsPaid(payment.id, userId);

    if (result.success) {
      toast.success(result.message || "Payment marked as paid!");
      router.refresh();
    } else {
      toast.error(result.error || "Failed to mark payment as paid");
    }
    setIsProcessing(false);
  };

  const isOverdue = payment.status === "PENDING" && new Date() > payment.dueDate;
  const isPaid = payment.status === "PAID";

  const statusConfig = {
    paid: { bg: "bg-green-100", text: "text-green-700", icon: CheckCircle, iconColor: "text-green-600" },
    overdue: { bg: "bg-red-100", text: "text-red-700", icon: AlertCircle, iconColor: "text-red-600" },
    pending: { bg: "bg-yellow-100", text: "text-yellow-700", icon: Clock, iconColor: "text-yellow-600" },
  };

  const status = isPaid ? "paid" : isOverdue ? "overdue" : "pending";
  const config = statusConfig[status];
  const totalAmount = payment.amount + (isOverdue ? fineAmount : 0);

  return (
    <>
      {/* Payment Card */}
      <div
        className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${
          isPaid ? "border-green-200" : isOverdue ? "border-red-200" : "border-yellow-200"
        }`}
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          {/* Left Section */}
          <div className="flex items-start gap-4 flex-1">
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg}`}
            >
              <config.icon className={`w-7 h-7 ${config.iconColor}`} />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-xl font-bold text-gray-800">
                  Month {payment.monthNumber}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text}`}
                >
                  {isPaid ? "Paid" : isOverdue ? "Overdue" : "Pending"}
                </span>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    Due: <strong>{formatDate(payment.dueDate)}</strong>
                  </span>
                </div>

                {isPaid && payment.paidAt && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    <span>Paid on: {formatDate(payment.paidAt)}</span>
                  </div>
                )}

                {isOverdue && (
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="font-semibold">
                      Overdue! Fine: {formatCurrency(fineAmount)}
                    </span>
                  </div>
                )}

                {payment.verifiedBy && payment.verifiedAt && (
                  <div className="text-green-600 text-xs">
                    Verified by admin on {formatDate(payment.verifiedAt)}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Amount</p>
            <p className="text-2xl font-bold text-gray-800">
              {formatCurrency(isPaid ? (payment.paidAmount || payment.amount) : totalAmount)}
            </p>

            {payment.hasFine && (
              <p className="text-xs text-red-600 mt-1">
                (includes {formatCurrency(payment.fineAmount)} fine)
              </p>
            )}

            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {/* Not paid, no proof */}
              {!isPaid && !payment.proofOfPayment && (
                <>
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={isProcessing}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-70 text-sm"
                    aria-label="Mark payment as paid"
                  >
                    {isProcessing ? "Processing..." : "Mark as Paid"}
                  </button>

                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="w-full px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Proof
                  </button>
                </>
              )}

              {/* Not paid, but proof uploaded */}
              {!isPaid && payment.proofOfPayment && (
                <div className="space-y-2">
                  <div className="px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-xs font-semibold text-center">
                    Proof uploaded - Pending verification
                  </div>
                  <button
                    onClick={() => setShowProofModal(true)}
                    className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Proof
                  </button>
                </div>
              )}

              {/* Paid and has proof */}
              {isPaid && payment.proofOfPayment && (
                <button
                  onClick={() => setShowProofModal(true)}
                  className="w-full px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg font-semibold hover:bg-indigo-100 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Proof
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {payment.notes && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Note:</strong> {payment.notes}
            </p>
          </div>
        )}
      </div>

      {/* Upload Proof Modal */}
      <UploadProofModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        paymentId={payment.id}
        monthNumber={payment.monthNumber}
      />

      {/* Proof Viewer Modal */}
      <AnimatePresence>
        {showProofModal && payment.proofOfPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowProofModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  Payment Proof - Month {payment.monthNumber}
                </h3>
                <button
                  onClick={() => setShowProofModal(false)}
                  className="w-8 h-8 text-black rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                {payment.proofOfPayment.endsWith(".pdf") ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                      <span className="text-red-600 font-bold text-xl">PDF</span>
                    </div>
                    <p className="text-gray-600 mb-4">PDF Document</p>
                    <a
                      href={payment.proofOfPayment}
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
                    alt={`Payment proof for month ${payment.monthNumber}`}
                    className="w-full h-auto rounded-lg shadow-sm"
                    loading="lazy"
                  />
                )}
              </div>

              {payment.verifiedBy && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    This payment has been verified by admin
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}