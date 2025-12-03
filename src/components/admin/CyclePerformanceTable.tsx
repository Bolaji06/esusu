/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { motion } from "framer-motion";
import { Download, TrendingUp, Users, Calendar } from "lucide-react";

interface Props {
  cycles: any[];
  onExport: () => void;
}

export default function CyclePerformanceTable({ cycles, onExport }: Props) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "UPCOMING":
        return "bg-blue-100 text-blue-700";
      case "COMPLETED":
        return "bg-gray-100 text-gray-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            Cycle Performance
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Detailed analytics for all contribution cycles
          </p>
        </div>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {cycles.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No cycles found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Cycle
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Participants
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Collections
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Collection Rate
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Payments
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {cycles.map((cycle, index) => (
                <motion.tr
                  key={cycle.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {cycle.name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(cycle.startDate)} - {formatDate(cycle.endDate)}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        cycle.status
                      )}`}
                    >
                      {cycle.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Users className="w-4 h-4 text-gray-400" />
                      <span className="font-semibold text-gray-800">
                        {cycle.participants.total}/{cycle.participants.capacity}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-indigo-600 h-2 rounded-full transition-all"
                          style={{
                            width: `${cycle.participants.occupancyRate}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {cycle.participants.occupancyRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-gray-800">
                      {formatCurrency(cycle.collections.total)}
                    </p>
                    <p className="text-xs text-gray-500">
                      of {formatCurrency(cycle.collections.expected)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-16 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            cycle.collections.collectionRate >= 80
                              ? "bg-green-600"
                              : cycle.collections.collectionRate >= 50
                              ? "bg-yellow-600"
                              : "bg-red-600"
                          }`}
                          style={{
                            width: `${cycle.collections.collectionRate}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-gray-800">
                        {cycle.collections.collectionRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="space-y-1">
                      <div className="flex items-center justify-center gap-2 text-sm">
                        <span className="text-yellow-600 font-semibold">
                          {cycle.payments.pending}
                        </span>
                        <span className="text-gray-500">pending</span>
                      </div>
                      {cycle.payments.overdue > 0 && (
                        <div className="flex items-center justify-center gap-2 text-xs">
                          <span className="text-red-600 font-semibold">
                            {cycle.payments.overdue}
                          </span>
                          <span className="text-gray-500">overdue</span>
                        </div>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}