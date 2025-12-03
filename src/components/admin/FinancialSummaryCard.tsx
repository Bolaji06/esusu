/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { motion } from "framer-motion";
import { Download, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

interface Props {
  data: any;
  onExport: () => void;
}

export default function FinancialSummaryCard({ data, onExport }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const sections = [
    {
      title: "Collections",
      items: [
        {
          label: "Total Collected",
          value: data.collections.total,
          color: "text-green-600",
          icon: TrendingUp,
        },
        {
          label: "Fines Collected",
          value: data.collections.fines,
          color: "text-orange-600",
          icon: DollarSign,
        },
        {
          label: "Pending Collections",
          value: data.collections.pending,
          color: "text-yellow-600",
          icon: TrendingUp,
        },
        {
          label: "Overdue Collections",
          value: data.collections.overdue,
          color: "text-red-600",
          icon: TrendingDown,
        },
      ],
    },
    {
      title: "Payouts",
      items: [
        {
          label: "Completed Payouts",
          value: data.payouts.completed.amount,
          color: "text-blue-600",
          count: data.payouts.completed.count,
        },
        {
          label: "Pending Payouts",
          value: data.payouts.pending.amount,
          color: "text-yellow-600",
          count: data.payouts.pending.count,
        },
      ],
    },
    {
      title: "Summary",
      items: [
        {
          label: "Net Balance",
          value: data.netBalance,
          color:
            data.netBalance >= 0 ? "text-green-600" : "text-red-600",
          highlight: true,
        },
        {
          label: "System Profit",
          value: data.profit,
          color: data.profit >= 0 ? "text-green-600" : "text-red-600",
          highlight: true,
        },
      ],
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">Financial Summary</h2>
        <button
          onClick={onExport}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {sections.map((section, idx) => (
          <motion.div
            key={section.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {section.title}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className={`p-4 rounded-xl border ${
                      item.highlight
                        ? "bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    {Icon && (
                      <div className="mb-2">
                        <Icon className={`w-5 h-5 ${item.color}`} />
                      </div>
                    )}
                    <p className="text-sm text-gray-600 mb-1">{item.label}</p>
                    <p
                      className={`text-2xl font-bold ${item.color}`}
                    >
                      {formatCurrency(item.value)}
                    </p>
                    {item.count !== undefined && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item.count} transaction{item.count !== 1 ? "s" : ""}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        ))}

        {/* Visual Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl text-white"
        >
          <h3 className="text-lg font-bold mb-4">Cash Flow Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-indigo-100 text-sm mb-1">Money In</p>
              <p className="text-3xl font-bold">
                {formatCurrency(data.collections.total)}
              </p>
              <p className="text-indigo-200 text-xs mt-1">
                Collections + Fines
              </p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Money Out</p>
              <p className="text-3xl font-bold">
                {formatCurrency(data.payouts.completed.amount)}
              </p>
              <p className="text-indigo-200 text-xs mt-1">Member Payouts</p>
            </div>
            <div>
              <p className="text-indigo-100 text-sm mb-1">Current Balance</p>
              <p className="text-3xl font-bold">
                {formatCurrency(data.netBalance)}
              </p>
              <p className="text-indigo-200 text-xs mt-1">
                Available for Payouts
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}