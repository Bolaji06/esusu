/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { getUserDetails } from "@/src/actions/userManagement";

interface Props {
  userId: string;
  onClose: () => void;
}

export default function UserDetailsModal({ userId, onClose }: Props) {
  const [loading, setLoading] = useState(true);
  const [userDetails, setUserDetails] = useState<any>(null);

  useEffect(() => {
    async function fetchDetails() {
      const details = await getUserDetails(userId);
      setUserDetails(details);
      setLoading(false);
    }
    fetchDetails();
  }, [userId]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      case "OPTED_OUT":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-auto"
        >
          {loading ? (
            <div className="p-12 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : !userDetails ? (
            <div className="p-12 text-center">
              <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-gray-600">Failed to load user details</p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    User Details
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">
                    Complete user information and activity
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="w-10 h-10 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Info */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Full Name</p>
                        <p className="font-semibold text-gray-800">
                          {userDetails.user.fullName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-semibold text-gray-800">
                          {userDetails.user.phone}
                        </p>
                      </div>
                    </div>
                    {userDetails.user.email && (
                      <div className="flex items-start gap-3">
                        <Mail className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-800">
                            {userDetails.user.email}
                          </p>
                        </div>
                      </div>
                    )}
                    {userDetails.user.occupation && (
                      <div className="flex items-start gap-3">
                        <Briefcase className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Occupation</p>
                          <p className="font-semibold text-gray-800">
                            {userDetails.user.occupation}
                          </p>
                        </div>
                      </div>
                    )}
                    {userDetails.user.address && (
                      <div className="flex items-start gap-3 md:col-span-2">
                        <MapPin className="w-5 h-5 text-gray-600 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Address</p>
                          <p className="font-semibold text-gray-800">
                            {userDetails.user.address}
                          </p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-3">
                      <Calendar className="w-5 h-5 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Member Since</p>
                        <p className="font-semibold text-gray-800">
                          {formatDate(userDetails.user.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mt-1 ${getStatusColor(
                            userDetails.user.status
                          )}`}
                        >
                          {userDetails.user.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h3 className="text-lg font-bold text-gray-800 mb-4">
                    Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                      <p className="text-sm text-green-700 mb-1">
                        Total Contributed
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(
                          userDetails.statistics.totalContributed
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                      <p className="text-sm text-blue-700 mb-1">
                        Payouts Received
                      </p>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          userDetails.statistics.totalPayoutsReceived
                        )}
                      </p>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                      <p className="text-sm text-orange-700 mb-1">Total Fines</p>
                      <p className="text-2xl font-bold text-orange-600">
                        {formatCurrency(userDetails.statistics.totalFines)}
                      </p>
                    </div>
                    <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                      <p className="text-sm text-purple-700 mb-1">
                        Participations
                      </p>
                      <p className="text-2xl font-bold text-purple-600">
                        {userDetails.statistics.participationCount}
                      </p>
                    </div>
                    <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <p className="text-sm text-indigo-700 mb-1">
                        Active Cycles
                      </p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {userDetails.statistics.activeParticipations}
                      </p>
                    </div>
                    {userDetails.statistics.overduePayments > 0 && (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                        <p className="text-sm text-red-700 mb-1">Overdue</p>
                        <p className="text-2xl font-bold text-red-600">
                          {userDetails.statistics.overduePayments}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Participations */}
                {userDetails.participations.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Participations
                    </h3>
                    <div className="space-y-4">
                      {userDetails.participations.map((participation: any) => (
                        <div
                          key={participation.id}
                          className="border border-gray-200 rounded-xl p-4"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <h4 className="font-semibold text-gray-800">
                                {participation.cycleName}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {getContributionModeLabel(
                                  participation.contributionMode
                                )}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                participation.cycleStatus === "ACTIVE"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {participation.cycleStatus}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <p className="text-gray-600">Monthly Amount</p>
                              <p className="font-semibold text-gray-800">
                                {formatCurrency(participation.monthlyAmount)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Total Payout</p>
                              <p className="font-semibold text-gray-800">
                                {formatCurrency(participation.totalPayout)}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Picked Number</p>
                              <p className="font-semibold text-gray-800">
                                {participation.pickedNumber || "Not picked"}
                              </p>
                            </div>
                            <div>
                              <p className="text-gray-600">Payment Progress</p>
                              <p className="font-semibold text-gray-800">
                                {participation.paidPayments}/
                                {participation.totalPayments}
                              </p>
                            </div>
                          </div>

                          {participation.bankDetails && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-2">
                                Bank Details
                              </p>
                              <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                  <p className="text-gray-600">Bank</p>
                                  <p className="font-semibold text-gray-800">
                                    {participation.bankDetails.bankName}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Account Number</p>
                                  <p className="font-semibold text-gray-800 font-mono">
                                    {participation.bankDetails.accountNumber}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-600">Account Name</p>
                                  <p className="font-semibold text-gray-800">
                                    {participation.bankDetails.accountName}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Payments */}
                {userDetails.recentPayments.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-gray-800 mb-4">
                      Recent Payments
                    </h3>
                    <div className="space-y-3">
                      {userDetails.recentPayments.map((payment: any) => (
                        <div
                          key={payment.id}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <div>
                              <p className="font-semibold text-gray-800">
                                Month {payment.monthNumber}
                              </p>
                              <p className="text-xs text-gray-600">
                                {payment.paidAt &&
                                  formatDate(payment.paidAt)}
                              </p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-800">
                            {formatCurrency(payment.paidAmount || payment.amount)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}