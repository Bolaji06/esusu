
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
  DollarSign,
  Loader2,
} from "lucide-react";
import { cancelOptOutRequest } from "@/src/actions/optOut";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface OptOutRequest {
  id: string;
  cycleName: string;
  reason: string;
  status: string;
  totalPaid: number;
  penaltyAmount: number;
  refundAmount: number;
  requestedAt: Date;
  reviewedAt: Date | null;
  reviewNotes: string | null;
}

interface Props {
  request: OptOutRequest;
  userId: string;
  showCancelButton?: boolean;
}

export default function OptOutRequestCard({
  request,
  userId,
  showCancelButton = false,
}: Props) {
  const router = useRouter();
  const [isCancelling, setIsCancelling] = useState(false);

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
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this opt-out request?")) {
      return;
    }

    setIsCancelling(true);
    const result = await cancelOptOutRequest(request.id, userId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsCancelling(false);
  };

  const getStatusConfig = () => {
    switch (request.status) {
      case "PENDING_APPROVAL":
        return {
          icon: Clock,
          color: "yellow",
          label: "Pending Approval",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        };
      case "APPROVED":
        return {
          icon: CheckCircle,
          color: "green",
          label: "Approved",
          bgColor: "bg-green-100",
          textColor: "text-green-700",
          borderColor: "border-green-200",
        };
      case "REJECTED":
        return {
          icon: XCircle,
          color: "red",
          label: "Rejected",
          bgColor: "bg-red-100",
          textColor: "text-red-700",
          borderColor: "border-red-200",
        };
      default:
        return {
          icon: Clock,
          color: "gray",
          label: request.status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-2xl shadow-lg border-2 ${statusConfig.borderColor} overflow-hidden`}
    >
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          {/* Left Section */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bgColor}`}
            >
              <StatusIcon className={`w-6 h-6 ${statusConfig.textColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-bold text-gray-800">
                  {request.cycleName}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.textColor}`}
                >
                  {statusConfig.label}
                </span>
              </div>

              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Requested: {formatDateTime(request.requestedAt)}</span>
                </div>
                {request.reviewedAt && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    <span>Reviewed: {formatDateTime(request.reviewedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Refund Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {formatCurrency(request.refundAmount)}
            </p>
            <p className="text-xs text-gray-500">
              Penalty: {formatCurrency(request.penaltyAmount)}
            </p>
          </div>
        </div>

        {/* Reason */}
        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 font-semibold mb-1">
            Reason for opt-out:
          </p>
          <p className="text-sm text-gray-800">{request.reason}</p>
        </div>

        {/* Review Notes */}
        {request.reviewNotes && (
          <div
            className={`mt-4 p-4 rounded-xl ${
              request.status === "APPROVED"
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <p
              className={`text-sm font-semibold mb-1 ${
                request.status === "APPROVED"
                  ? "text-green-800"
                  : "text-red-800"
              }`}
            >
              Admin Response:
            </p>
            <p
              className={`text-sm ${
                request.status === "APPROVED"
                  ? "text-green-700"
                  : "text-red-700"
              }`}
            >
              {request.reviewNotes}
            </p>
          </div>
        )}

        {/* Cancel Button */}
        {showCancelButton && request.status === "PENDING_APPROVAL" && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={handleCancel}
              disabled={isCancelling}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              {isCancelling ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Cancelling...
                </span>
              ) : (
                "Cancel Request"
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}