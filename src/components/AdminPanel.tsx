"use client";

import { motion } from "framer-motion";
import { Users, CheckCircle, Clock } from "lucide-react";
import AdminSettings from "./AdminSettings";
import { div } from "framer-motion/client";

interface UserPick {
  id: string;
  number: number;
  userName: string;
  userPhone: string;
  createdAt: Date;
}

interface Props {
  userPicks: UserPick[];
  stats: Stats;
  totalNumbers: number;
}

interface Stats {
  totalUsers: number;
  totalPicks: number;
  availableNumbers: number;
  totalNumbers?: number;
}

export default function AdminPanel({ userPicks, stats, totalNumbers }: Props) {
  // Calculate correct available numbers
  const availableNumbers = totalNumbers - stats.totalPicks;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full lg:w-96 bg-white rounded-2xl shadow-lg p-6 border border-gray-200"
    >
      {/* Header with Settings Button */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            Admin Panel
          </h2>
        </div>
        <AdminSettings
          currentTotal={totalNumbers}
          pickedCount={stats.totalPicks}
        />
        <p className="text-sm text-gray-500 mt-3">
          Overview of all number picks
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bg-indigo-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-indigo-600">
            {stats.totalUsers}
          </p>
          <p className="text-xs text-gray-600 mt-1">Total Users</p>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-green-600">
            {stats.totalPicks}
          </p>
          <p className="text-xs text-gray-600 mt-1">Picked</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-3 text-center">
          <p className="text-2xl font-bold text-orange-600">
            {availableNumbers}
          </p>
          <p className="text-xs text-gray-600 mt-1">Available</p>
        </div>
      </div>

      {/* Total Numbers Display */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
        <p className="text-sm text-gray-600 mb-1">Total Cards</p>
        <p className="text-3xl font-bold text-indigo-600">{totalNumbers}</p>
      </div>

      {/* User Picks List */}
      <div>
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          Recent Picks ({userPicks.length})
        </h3>

        <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {userPicks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No picks yet</p>
              <p className="text-sm mt-1">Waiting for users to pick numbers</p>
            </div>
          ) : (
            userPicks.map((pick) => (
              <motion.div
                key={pick.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors
                "
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">
                      {pick.userName}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {pick.userPhone}
                    </p>
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {formatDate(pick.createdAt)}
                    </div>
                  </div>
                  <div className="flex-shrink-0 ml-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
                      <span className="text-white font-bold text-lg">
                        {pick.number}
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </motion.div>
  );
}
