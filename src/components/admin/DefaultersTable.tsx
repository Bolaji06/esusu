/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { motion } from "framer-motion";
import { Download, AlertTriangle, Phone, Mail, Calendar } from "lucide-react";
import { useState } from "react";

interface Props {
  defaulters: any[];
  onExport: () => void;
}

export default function DefaultersTable({ defaulters, onExport }: Props) {
  const [sortBy, setSortBy] = useState<"amount" | "count">("amount");

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

  const sortedDefaulters = [...defaulters].sort((a, b) => {
    if (sortBy === "amount") {
      return b.totalOverdue - a.totalOverdue;
    }
    return b.overduePayments.length - a.overduePayments.length;
  });

  const totalOverdue = defaulters.reduce((sum, d) => sum + d.totalOverdue, 0);
  const totalFines = defaulters.reduce((sum, d) => sum + d.totalFines, 0);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              Defaulters Report
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Members with overdue payments
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

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-700 mb-1">Total Defaulters</p>
            <p className="text-3xl font-bold text-red-600">
              {defaulters.length}
            </p>
          </div>
          <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
            <p className="text-sm text-orange-700 mb-1">Total Overdue</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatCurrency(totalOverdue)}
            </p>
          </div>
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-yellow-700 mb-1">Total Fines</p>
            <p className="text-3xl font-bold text-yellow-600">
              {formatCurrency(totalFines)}
            </p>
          </div>
        </div>

        {/* Sort Options */}
        <div className="mt-4 flex items-center gap-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <button
            onClick={() => setSortBy("amount")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "amount"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Amount
          </button>
          <button
            onClick={() => setSortBy("count")}
            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
              sortBy === "count"
                ? "bg-indigo-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Payment Count
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {sortedDefaulters.length === 0 ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No defaulters found! 🎉</p>
            <p className="text-sm text-gray-500 mt-1">
              All members are up to date with their payments
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Member
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Overdue Payments
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Total Overdue
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Fines
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sortedDefaulters.map((defaulter, index) => (
                <motion.tr
                  key={defaulter.userId}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-semibold text-gray-800">
                        {defaulter.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        ID: {defaulter.userId.slice(0, 8)}...
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="w-3 h-3" />
                        {defaulter.userPhone}
                      </div>
                      {defaulter.userEmail && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-3 h-3" />
                          {defaulter.userEmail}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      {defaulter.overduePayments.length}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-bold text-red-600">
                      {formatCurrency(defaulter.totalOverdue)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <p className="font-semibold text-orange-600">
                      {formatCurrency(defaulter.totalFines)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => {
                        // Show details modal
                        alert(
                          `Overdue payments for ${defaulter.userName}:\n\n${defaulter.overduePayments
                            .map(
                              (p: any) =>
                                `${p.cycleName} - Month ${p.monthNumber}: ${formatCurrency(p.amount)} (${p.daysPastDue} days past due)`
                            )
                            .join("\n")}`
                        );
                      }}
                      className="px-3 py-1 text-sm bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium"
                    >
                      View Details
                    </button>
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