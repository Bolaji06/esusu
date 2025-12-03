
"use client";

import { motion } from "framer-motion";
import { CheckCircle, Clock, User } from "lucide-react";

interface Timeline {
  timeline: Array<{
    month: number;
    userName: string;
    userId: string;
    status: string;
    amount: number;
    scheduledDate: Date;
    isCurrentUser: boolean;
  }>;
  currentMonth: number;
  userPosition: number | null;
  cycleName: string;
  totalSlots: number;
}

interface Props {
  timeline: Timeline;
  userId: string;
}

export default function PayoutTimelineView({ timeline, userId }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatMonth = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">
          Payout Timeline - {timeline.cycleName}
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Track the payout schedule for all participants
        </p>
      </div>

      <div className="p-6">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
            <span>Cycle Progress</span>
            <span>
              Month {timeline.currentMonth} of {timeline.totalSlots}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{
                width: `${(timeline.currentMonth / timeline.totalSlots) * 100}%`,
              }}
              transition={{ duration: 0.5 }}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 h-3 rounded-full"
            />
          </div>
        </div>

        {/* Timeline Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {timeline.timeline.map((item, index) => {
            const isPast = item.month < timeline.currentMonth;
            const isCurrent = item.month === timeline.currentMonth;
            const isUserSlot = item.isCurrentUser;
            const isPaid = item.status === "PAID";

            return (
              <motion.div
                key={item.month}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
                className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                  isUserSlot
                    ? "border-indigo-500 bg-indigo-50"
                    : isPaid
                    ? "border-green-300 bg-green-50"
                    : isPast
                    ? "border-gray-300 bg-gray-50"
                    : isCurrent
                    ? "border-yellow-400 bg-yellow-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {isUserSlot && (
                  <div className="absolute -top-2 -right-2 w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                )}

                <div
                  className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center mb-2 ${
                    isPaid
                      ? "bg-green-500 text-white"
                      : isUserSlot
                      ? "bg-indigo-600 text-white"
                      : isPast
                      ? "bg-gray-400 text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {isPaid ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs font-bold">{item.month}</span>
                  )}
                </div>

                <p
                  className={`text-xs font-medium truncate ${
                    isUserSlot ? "text-indigo-700" : "text-gray-600"
                  }`}
                  title={item.userName}
                >
                  {isUserSlot ? "You" : item.userName.split(" ")[0]}
                </p>

                <p className="text-[10px] text-gray-500 mt-1">
                  {formatMonth(item.scheduledDate)}
                </p>
              </motion.div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-gray-600">
         <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-indigo-600 rounded" />
            <span>Your Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>Paid Out</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 rounded" />
            <span>Current Month</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-400 rounded" />
            <span>Past</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <span>Upcoming</span>
          </div>
        </div>
      </div>
    </div>
  );
}