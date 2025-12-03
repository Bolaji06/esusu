
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  DollarSign,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  Info,
} from "lucide-react";
import Link from "next/link";
import OptOutRequestForm from "./OptOutRequestForm";
import OptOutRequestCard from "./OptOutrequestCard";

interface OptOutInfo {
  eligible: boolean;
  reason?: string;
  existingRequest?: {
    id: string;
    requestedAt: Date;
    status: string;
  };
  participation: {
    id: string;
    cycleId: string;
    cycleName: string;
    contributionMode: string;
    monthlyAmount: number;
    totalPayout: number;
    pickedNumber: number | null;
    registeredAt: Date;
  } | null;
  calculations?: {
    totalPaid: number;
    penaltyPercent: number;
    penaltyAmount: number;
    refundAmount: number;
    paymentsMade: number;
  };
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
}

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
  userId: string;
  optOutInfo: OptOutInfo;
  requests: OptOutRequest[];
}

export default function OptOutView({ userId, optOutInfo, requests }: Props) {
  const [showForm, setShowForm] = useState(false);

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

  const pendingRequests = requests.filter(
    (r) => r.status === "PENDING_APPROVAL"
  );
  const processedRequests = requests.filter(
    (r) => r.status !== "PENDING_APPROVAL"
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Opt-Out Request</h1>
        <p className="text-gray-600">
          Request to leave an active contribution cycle
        </p>
      </motion.div>

      {/* Warning Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-2xl p-6"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              Important Information
            </h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>
                  Opting out will result in a{" "}
                  <strong>
                    {optOutInfo.calculations?.penaltyPercent || 10}% penalty
                  </strong>{" "}
                  on your total contributions.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>
                  Once approved, you will be removed from the cycle and will not
                  receive any future payouts.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>
                  The refund (minus penalty) will be processed after admin
                  approval.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-600 mt-1">•</span>
                <span>This action cannot be undone once approved.</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>

      {/* Eligibility Check */}
      {!optOutInfo.eligible ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8"
        >
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Info className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Not Eligible for Opt-Out
            </h3>
            <p className="text-gray-600 mb-6">{optOutInfo.reason}</p>

            {optOutInfo.existingRequest && (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl text-left">
                <p className="text-sm text-yellow-800">
                  <strong>Pending Request:</strong> You submitted an opt-out
                  request on{" "}
                  {formatDate(optOutInfo.existingRequest.requestedAt)}. Please
                  wait for admin approval.
                </p>
              </div>
            )}

            <Link
              href="/dashboard"
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              Back to Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      ) : (
        <>
          {/* Current Participation Summary */}
          {optOutInfo.participation && optOutInfo.calculations && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
            >
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-bold text-gray-800">
                  Current Participation
                </h3>
                <p className="text-sm text-gray-600">
                  {optOutInfo.participation.cycleName}
                </p>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Package</p>
                    <p className="font-semibold text-gray-800">
                      {getContributionModeLabel(
                        optOutInfo.participation.contributionMode
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payments Made</p>
                    <p className="font-semibold text-gray-800">
                      {optOutInfo.calculations.paymentsMade} payment(s)
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">
                      Your Payout Number
                    </p>
                    <p className="font-semibold text-gray-800">
                      {optOutInfo.participation.pickedNumber || "Not picked"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Joined On</p>
                    <p className="font-semibold text-gray-800">
                      {formatDate(optOutInfo.participation.registeredAt)}
                    </p>
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="font-bold text-gray-800 mb-4">
                    Opt-Out Calculation
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Contributed</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(optOutInfo.calculations.totalPaid)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-red-600">
                      <span>
                        Penalty ({optOutInfo.calculations.penaltyPercent}%)
                      </span>
                      <span className="font-semibold">
                        -{formatCurrency(optOutInfo.calculations.penaltyAmount)}
                      </span>
                    </div>
                    <div className="border-t border-gray-300 pt-3 flex items-center justify-between">
                      <span className="font-bold text-gray-800">
                        Refund Amount
                      </span>
                      <span className="text-2xl font-bold text-green-600">
                        {formatCurrency(optOutInfo.calculations.refundAmount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Request Form or Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {showForm ? (
              <OptOutRequestForm
                userId={userId}
                cycleId={optOutInfo.participation?.cycleId || ""}
                cycleName={optOutInfo.participation?.cycleName || ""}
                refundAmount={optOutInfo.calculations?.refundAmount || 0}
                penaltyAmount={optOutInfo.calculations?.penaltyAmount || 0}
                onCancel={() => setShowForm(false)}
              />
            ) : (
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
                <button
                  onClick={() => setShowForm(true)}
                  className="px-8 py-4 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                >
                  Request to Opt-Out
                </button>
                <p className="text-sm text-gray-500 mt-4">
                  Click the button above to submit an opt-out request
                </p>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Pending Requests
          </h3>
          <div className="space-y-4">
            {pendingRequests.map((request) => (
              <OptOutRequestCard
                key={request.id}
                request={request}
                userId={userId}
                showCancelButton
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Request History */}
      {processedRequests.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <h3 className="text-lg font-bold text-gray-800 mb-4">
            Request History
          </h3>
          <div className="space-y-4">
            {processedRequests.map((request) => (
              <OptOutRequestCard
                key={request.id}
                request={request}
                userId={userId}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}