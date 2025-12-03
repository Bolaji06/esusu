/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Users,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  FileText,
  AlertTriangle,
} from "lucide-react";
import FinancialSummaryCard from "./FinancialSummaryCard";
import DefaultersTable from "./DefaultersTable";
import CyclePerformanceTable from "./CyclePerformanceTable";
import PaymentTrendsChart from "./PaymentTrendsChart";

interface Props {
  financialSummary: any;
  defaulters: any[];
  cyclePerformance: any[];
  paymentTrends: any[];
  cycles: any[];
}

export default function ReportsView({
  financialSummary,
  defaulters,
  cyclePerformance,
  paymentTrends,
  cycles,
}: Props) {
  const [activeTab, setActiveTab] = useState<
    "financial" | "defaulters" | "cycles" | "trends"
  >("financial");
  const [selectedCycle, setSelectedCycle] = useState<string>("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleExport = (type: string) => {
    // This will download the report as CSV
    let data: any;
    let filename: string;

    switch (type) {
      case "financial":
        data = financialSummary;
        filename = "financial-summary.csv";
        break;
      case "defaulters":
        data = defaulters;
        filename = "defaulters-report.csv";
        break;
      case "cycles":
        data = cyclePerformance;
        filename = "cycle-performance.csv";
        break;
      default:
        return;
    }

    // Create CSV content
    const csvContent = generateCSV(type, data);
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const generateCSV = (type: string, data: any): string => {
    switch (type) {
      case "financial":
        return `Category,Amount
Total Collections,${data.collections.total}
Fines Collected,${data.collections.fines}
Pending Collections,${data.collections.pending}
Overdue Collections,${data.collections.overdue}
Completed Payouts,${data.payouts.completed.amount}
Pending Payouts,${data.payouts.pending.amount}
Net Balance,${data.netBalance}
Profit,${data.profit}`;

      case "defaulters":
        let csv =
          "Name,Phone,Email,Total Overdue,Total Fines,Overdue Payments\n";
        data.forEach((d: any) => {
          csv += `"${d.userName}","${d.userPhone}","${d.userEmail || "N/A"}",${
            d.totalOverdue
          },${d.totalFines},${d.overduePayments.length}\n`;
        });
        return csv;

      case "cycles":
        let cycleCsv =
          "Cycle,Status,Participants,Occupancy Rate,Total Collected,Collection Rate\n";
        data.forEach((c: any) => {
          cycleCsv += `"${c.name}","${c.status}",${c.participants.total}/${c.participants.capacity},${c.participants.occupancyRate}%,${c.collections.total},${c.collections.collectionRate}%\n`;
        });
        return cycleCsv;

      default:
        return "";
    }
  };

  const tabs = [
    { id: "financial", label: "Financial Summary", icon: DollarSign },
    { id: "defaulters", label: "Defaulters", icon: AlertTriangle },
    { id: "cycles", label: "Cycle Performance", icon: BarChart3 },
    { id: "trends", label: "Payment Trends", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Reports & Analytics
        </h1>
        <p className="text-gray-600">
          Comprehensive financial reports and system analytics
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Collections</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(financialSummary.collections.total)}
          </p>
          <p className="text-xs text-green-600 mt-2">
            +{formatCurrency(financialSummary.collections.fines)} in fines
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Payouts</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(financialSummary.payouts.completed.amount)}
          </p>
          <p className="text-xs text-gray-600 mt-2">
            {financialSummary.payouts.completed.count} members paid
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <PieChart className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Net Balance</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(financialSummary.netBalance)}
          </p>
          <p className="text-xs text-gray-600 mt-2">Collections - Payouts</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Overdue Amount</p>
          <p className="text-3xl font-bold text-gray-800">
            {formatCurrency(financialSummary.collections.overdue)}
          </p>
          <p className="text-xs text-red-600 mt-2">
            {defaulters.length} defaulters
          </p>
        </motion.div>
      </div>

      {/* Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-2"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-3 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <Icon className="w-5 h-5" />
              {tab.label}
            </button>
          );
        })}
      </motion.div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        {activeTab === "financial" && (
          <FinancialSummaryCard
            data={financialSummary}
            onExport={() => handleExport("financial")}
          />
        )}

        {activeTab === "defaulters" && (
          <DefaultersTable
            defaulters={defaulters}
            onExport={() => handleExport("defaulters")}
          />
        )}

        {activeTab === "cycles" && (
          <CyclePerformanceTable
            cycles={cyclePerformance}
            onExport={() => handleExport("cycles")}
          />
        )}

        {activeTab === "trends" && (
          <PaymentTrendsChart trends={paymentTrends} />
        )}
      </motion.div>
    </div>
  );
}
