"use client";

import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  ArrowLeft,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  X,
  Building,
} from "lucide-react";
import Link from "next/link";

interface Participant {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  contributionMode: string;
  pickedNumber: number | null;
  hasOptedOut: boolean;
  registeredAt: Date;
  hasBankDetails: boolean;
}

interface Cycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  numberPickingStartDate: Date | null;
  status: string;
  totalSlots: number;
  paymentDeadlineDay: number;
  createdAt: Date;
  participants: Participant[];
}

interface Props {
  cycle: Cycle;
  adminId: string;
}

export default function CycleDetailsView({ cycle, adminId }: Props) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "UPCOMING":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const activeParticipants = cycle.participants.filter((p) => !p.hasOptedOut);
  const pickedNumbers = cycle.participants.filter((p) => p.pickedNumber !== null);

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href="/dashboard/admin/cycles"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cycles
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{cycle.name}</h1>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                cycle.status
              )}`}
            >
              {cycle.status}
            </span>
          </div>
          <Link
            href={`/dashboard/admin/cycles/${cycle.id}/edit`}
            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
          >
            Edit Cycle
          </Link>
        </div>
      </motion.div>

      {/* Cycle Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">Cycle Information</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <p className="text-sm text-gray-600 mb-1">Start Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(cycle.startDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">End Date</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(cycle.endDate)}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Registration Deadline</p>
            <p className="text-lg font-semibold text-gray-800">
              {formatDate(cycle.registrationDeadline)}
            </p>
          </div>

          {cycle.numberPickingStartDate && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Number Picking Starts</p>
              <p className="text-lg font-semibold text-gray-800">
                {formatDate(cycle.numberPickingStartDate)}
              </p>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600 mb-1">Total Slots</p>
            <p className="text-lg font-semibold text-gray-800">{cycle.totalSlots}</p>
          </div>

          <div>
            <p className="text-sm text-gray-600 mb-1">Payment Deadline Day</p>
            <p className="text-lg font-semibold text-gray-800">
              Day {cycle.paymentDeadlineDay} of each month
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Participants</p>
          <p className="text-3xl font-bold text-gray-800">
            {cycle.participants.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Active Participants</p>
          <p className="text-3xl font-bold text-gray-800">
            {activeParticipants.length}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <CreditCard className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Numbers Picked</p>
          <p className="text-3xl font-bold text-gray-800">{pickedNumbers.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Available Slots</p>
          <p className="text-3xl font-bold text-gray-800">
            {cycle.totalSlots - cycle.participants.length}
          </p>
        </motion.div>
      </div>

      {/* Participants List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Participants ({cycle.participants.length})
        </h2>

        {cycle.participants.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No participants yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Name
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Contact
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                    Package
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Number
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Bank Details
                  </th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {cycle.participants.map((participant) => (
                  <tr
                    key={participant.id}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-800">
                        {participant.userName}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <div className="space-y-1 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          {participant.userPhone}
                        </div>
                        {participant.userEmail && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            {participant.userEmail}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-xs font-semibold">
                        {getContributionModeLabel(participant.contributionMode)}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      {participant.pickedNumber ? (
                        <div className="inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                          <span className="text-white font-bold">
                            {participant.pickedNumber}
                          </span>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">Not picked</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {participant.hasBankDetails ? (
                        <CheckCircle className="w-5 h-5 text-green-600 mx-auto" />
                      ) : (
                        <X className="w-5 h-5 text-red-600 mx-auto" />
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {participant.hasOptedOut ? (
                        <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">
                          Opted Out
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}