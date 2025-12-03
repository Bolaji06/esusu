/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { motion } from "framer-motion";
import { TrendingUp, DollarSign } from "lucide-react";

interface Props {
  trends: any[];
}

export default function PaymentTrendsChart({ trends }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const maxAmount = Math.max(...trends.map((t) => t.amount));
  const totalAmount = trends.reduce((sum, t) => sum + t.amount, 0);
  const totalCount = trends.reduce((sum, t) => sum + t.count, 0);
  const avgMonthly = totalAmount / trends.length;

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-indigo-600" />
          Payment Trends
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Last 12 months payment collection trends
        </p>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-green-700 mb-1">Total Collected</p>
            <p className="text-3xl font-bold text-green-600">
              {formatCurrency(totalAmount)}
            </p>
            <p className="text-xs text-green-600 mt-1">Last 12 months</p>
          </div>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-700 mb-1">Monthly Average</p>
            <p className="text-3xl font-bold text-blue-600">
              {formatCurrency(avgMonthly)}
            </p>
            <p className="text-xs text-blue-600 mt-1">Per month</p>
          </div>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
            <p className="text-sm text-purple-700 mb-1">Total Payments</p>
            <p className="text-3xl font-bold text-purple-600">{totalCount}</p>
            <p className="text-xs text-purple-600 mt-1">Transactions</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="p-6">
        <div className="space-y-4">
          {trends.map((trend, index) => (
            <motion.div
              key={trend.month}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{trend.month}</span>
                <div className="flex items-center gap-4">
                  <span className="text-gray-500">
                    {trend.count} payment{trend.count !== 1 ? "s" : ""}
                  </span>
                  <span className="font-bold text-gray-800">
                    {formatCurrency(trend.amount)}
                  </span>
                </div>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-200 rounded-full h-8 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: `${(trend.amount / maxAmount) * 100}%`,
                    }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-8 rounded-full flex items-center justify-end pr-3"
                  >
                    {trend.amount > 0 && (
                      <span className="text-white text-xs font-semibold">
                        {((trend.amount / maxAmount) * 100).toFixed(0)}%
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600 mb-2">
            <strong>Note:</strong> Chart shows payment amounts relative to the
            highest month ({formatCurrency(maxAmount)})
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded" />
              <span>Payment Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>All amounts in Naira (₦)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}