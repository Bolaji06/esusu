/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Plus,
  Activity,
  Users,
  DollarSign,
  TrendingUp,
  Filter,
} from "lucide-react";
import CycleCard from "./CycleCard";
import CreateCycleModal from "./CreateCycleModal";

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
  cycles: Cycle[];
  adminId: string;
}

export default function CyclesManagementView({ cycles, adminId }: Props) {
  const [filter, setFilter] = useState<
    "all" | "active" | "upcoming" | "completed"
  >("all");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const stats = {
    total: cycles.length,
    active: cycles.filter((c) => c.status === "ACTIVE").length,
    upcoming: cycles.filter((c) => c.status === "UPCOMING").length,
    completed: cycles.filter((c) => c.status === "COMPLETED").length,
  };

  const filteredCycles = cycles.filter((cycle) => {
    if (filter === "all") return true;
    if (filter === "active") return cycle.status === "ACTIVE";
    if (filter === "upcoming") return cycle.status === "UPCOMING";
    if (filter === "completed") return cycle.status === "COMPLETED";
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Cycle Management
          </h1>
          <p className="text-gray-600">Create and manage contribution cycles</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          Create New Cycle
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Cycles</p>
          <p className="text-3xl font-bold text-gray-800">{stats.total}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <Activity className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Active Cycles</p>
          <p className="text-3xl font-bold text-gray-800">{stats.active}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Upcoming</p>
          <p className="text-3xl font-bold text-gray-800">{stats.upcoming}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Completed</p>
          <p className="text-3xl font-bold text-gray-800">{stats.completed}</p>
        </motion.div>
      </div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 inline-flex gap-2"
      >
        {[
          { value: "all", label: "All", count: stats.total },
          { value: "active", label: "Active", count: stats.active },
          { value: "upcoming", label: "Upcoming", count: stats.upcoming },
          { value: "completed", label: "Completed", count: stats.completed },
        ].map((tab) => (
          <button
            key={tab.value}
            onClick={() => setFilter(tab.value as any)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              filter === tab.value
                ? "bg-indigo-600 text-white shadow-md"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </motion.div>

      {/* Cycles List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-4"
      >
        {filteredCycles.length === 0 ? (
          <div className="bg-gray-50 rounded-2xl p-12 text-center">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">
              No cycles found for this filter
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create First Cycle
            </button>
          </div>
        ) : (
          filteredCycles.map((cycle, index) => (
            <motion.div
              key={cycle.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 + index * 0.05 }}
            >
              <CycleCard cycle={cycle} adminId={adminId} />
            </motion.div>
          ))
        )}
      </motion.div>

      {/* Create Cycle Modal */}
      <CreateCycleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        adminId={adminId}
      />
    </div>
  );
}
