"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  TrendingUp,
  Settings,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  Play,
  StopCircle,
} from "lucide-react";
import Link from "next/link";
import {
  generateCyclePayments,
  closeCycle,
  deleteCycle,
} from "@/src/actions/cycles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Cycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  status: string;
  totalSlots: number;
  totalParticipants: number;
  activeParticipants: number;
  pickedNumbers: number;
  availableSlots: number;
  totalPayments: number;
  paidPayments: number;
  pendingPayments: number;
  totalPayouts: number;
  completedPayouts: number;
}

interface Props {
  cycle: Cycle;
  adminId: string;
}

export default function CycleCard({ cycle, adminId }: Props) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      ACTIVE: {
        bg: "bg-green-100",
        text: "text-green-700",
        icon: CheckCircle,
        iconColor: "text-green-600",
        border: "border-green-200",
      },
      UPCOMING: {
        bg: "bg-blue-100",
        text: "text-blue-700",
        icon: Clock,
        iconColor: "text-blue-600",
        border: "border-blue-200",
      },
      COMPLETED: {
        bg: "bg-gray-100",
        text: "text-gray-700",
        icon: StopCircle,
        iconColor: "text-gray-600",
        border: "border-gray-200",
      },
      CANCELLED: {
        bg: "bg-red-100",
        text: "text-red-700",
        icon: AlertCircle,
        iconColor: "text-red-600",
        border: "border-red-200",
      },
    };

    return configs[status as keyof typeof configs] || configs.ACTIVE;
  };

  const statusConfig = getStatusConfig(cycle.status);

  const handleGeneratePayments = async () => {
    if (
      !confirm("Generate monthly payments for all participants in this cycle?")
    ) {
      return;
    }

    setIsProcessing(true);
    const result = await generateCyclePayments(cycle.id, adminId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleCloseCycle = async () => {
    if (
      !confirm(
        "Close this cycle? This action can only be done when all payments and payouts are completed."
      )
    ) {
      return;
    }

    setIsProcessing(true);
    const result = await closeCycle(cycle.id, adminId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (cycle.totalParticipants > 0) {
      toast.error("Cycle can only be deleted if there are no participants");
      return;
    }

    setIsProcessing(true);
    const result = await deleteCycle(cycle.id, adminId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const completionPercentage =
    cycle.totalPayments > 0
      ? Math.round((cycle.paidPayments / cycle.totalPayments) * 100)
      : 0;

  return (
    <div
      className={`bg-white rounded-2xl p-6 shadow-lg border-2 transition-all hover:shadow-xl ${statusConfig.border}`}
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Section - Main Info */}
        <div className="flex-1 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${statusConfig.bg}`}
                >
                  <statusConfig.icon
                    className={`w-6 h-6 ${statusConfig.iconColor}`}
                  />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    {cycle.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bg} ${statusConfig.text}`}
                  >
                    {cycle.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600 mb-1">Start Date</p>
              <p className="font-semibold text-gray-800">
                {formatDate(cycle.startDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">End Date</p>
              <p className="font-semibold text-gray-800">
                {formatDate(cycle.endDate)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Registration Deadline</p>
              <p className="font-semibold text-gray-800">
                {formatDate(cycle.registrationDeadline)}
              </p>
            </div>
            <div>
              <p className="text-gray-600 mb-1">Total Slots</p>
              <p className="font-semibold text-gray-800">{cycle.totalSlots}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {cycle.totalPayments > 0 && (
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Payment Progress</span>
                <span className="font-semibold text-gray-800">
                  {completionPercentage}%
                </span>
              </div>
              <div className="w-full h-3bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${completionPercentage}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600"
                />
              </div>
            </div>
          )}
        </div>
        {/* Middle Section - Stats */}
        <div className="lg:border-l lg:border-gray-200 lg:pl-6 space-y-4">
          <h4 className="font-semibold text-gray-800 flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-600" />
            Participants
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-blue-50 rounded-lg p-3">
              <p className="text-blue-600 text-xs mb-1">Total</p>
              <p className="text-2xl font-bold text-blue-700">
                {cycle.totalParticipants}
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-3">
              <p className="text-green-600 text-xs mb-1">Active</p>
              <p className="text-2xl font-bold text-green-700">
                {cycle.activeParticipants}
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-3">
              <p className="text-purple-600 text-xs mb-1">Picked Numbers</p>
              <p className="text-2xl font-bold text-purple-700">
                {cycle.pickedNumbers}
              </p>
            </div>
            <div className="bg-orange-50 rounded-lg p-3">
              <p className="text-orange-600 text-xs mb-1">Available</p>
              <p className="text-2xl font-bold text-orange-700">
                {cycle.availableSlots}
              </p>
            </div>
          </div>

          {/* Payment Stats */}
          {cycle.totalPayments > 0 && (
            <div className="pt-4 border-t border-gray-200">
              <h4 className="font-semibold text-gray-800 text-sm mb-3">
                Payment Status
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Paid:</span>
                  <span className="font-semibold text-green-600">
                    {cycle.paidPayments}/{cycle.totalPayments}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pending:</span>
                  <span className="font-semibold text-yellow-600">
                    {cycle.pendingPayments}
                  </span>
                </div>
                {cycle.totalPayouts > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Payouts:</span>
                    <span className="font-semibold text-indigo-600">
                      {cycle.completedPayouts}/{cycle.totalPayouts}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Section - Actions */}
        <div className="lg:border-l lg:border-gray-200 lg:pl-6 space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm mb-3">Actions</h4>

          <Link
            href={`/dashboard/admin/cycles/${cycle.id}`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors text-sm"
          >
            <Eye className="w-4 h-4" />
            View Details
          </Link>

          {cycle.status !== "COMPLETED" && (
            <Link
              href={`/dashboard/admin/cycles/${cycle.id}/edit`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors text-sm"
            >
              <Edit className="w-4 h-4" />
              Edit Cycle
            </Link>
          )}

          {cycle.status === "ACTIVE" && cycle.totalPayments === 0 && (
            <button
              onClick={handleGeneratePayments}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Play className="w-4 h-4" />
              {isProcessing ? "Generating..." : "Generate Payments"}
            </button>
          )}

          {cycle.status === "ACTIVE" &&
            cycle.pendingPayments === 0 &&
            cycle.totalPayouts === cycle.completedPayouts && (
              <button
                onClick={handleCloseCycle}
                disabled={isProcessing}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
              >
                <StopCircle className="w-4 h-4" />
                {isProcessing ? "Closing..." : "Close Cycle"}
              </button>
            )}

          {cycle.totalParticipants === 0 && (
            <button
              onClick={handleDelete}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 text-sm"
            >
              <Trash2 className="w-4 h-4" />
              {isProcessing ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
