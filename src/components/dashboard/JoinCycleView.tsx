
"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Users,
  DollarSign,
  Clock,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  CreditCard,
  Building,
} from "lucide-react";
import JoinCycleForm from "./JoinCycleForm";
import Link from "next/link";

interface Cycle {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  registrationDeadline: Date;
  numberPickingStartDate: Date | null;
  status: string;
  totalSlots: number;
  availableSlots: number;
  participantCount: number;
}

interface CycleDetails extends Cycle {
  paymentDeadlineDay: number;
}

interface Settings {
  pack20k: { monthly: number; payout: number; fine: number };
  pack50k: { monthly: number; payout: number; fine: number };
  pack100k: { monthly: number; payout: number; fine: number };
}

interface Props {
  cycles: Cycle[];
  selectedCycle: CycleDetails | null;
  alreadyJoined: boolean;
  userId: string;
  settings: Settings;
}

export default function JoinCycleView({
  cycles,
  selectedCycle,
  alreadyJoined,
  userId,
  settings,
}: Props) {
  const [showForm, setShowForm] = useState(!!selectedCycle);
  const [activeCycle, setActiveCycle] = useState<CycleDetails | null>(
    selectedCycle
  );

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "UPCOMING":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleSelectCycle = (cycle: Cycle) => {
    setActiveCycle(cycle as CycleDetails);
    setShowForm(true);
  };

  if (showForm && activeCycle) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Back Button */}
          <button
            onClick={() => setShowForm(false)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
            <span>Back to cycles</span>
          </button>

          {/* Cycle Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                  {activeCycle.name}
                </h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    activeCycle.status
                  )}`}
                >
                  {activeCycle.status}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-5 h-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Date</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(activeCycle.startDate)}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p className="font-semibold text-gray-800">
                    {activeCycle.availableSlots} of {activeCycle.totalSlots}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Registration Deadline</p>
                  <p className="font-semibold text-gray-800">
                    {formatDate(activeCycle.registrationDeadline)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Already Joined Message */}
          {alreadyJoined ? (
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h3 className="font-bold text-green-800 text-lg">
                    Already Registered
                  </h3>
                  <p className="text-green-700">
                    You are already participating in this cycle.
                  </p>
                </div>
              </div>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <JoinCycleForm
              cycleId={activeCycle.id}
              userId={userId}
              settings={settings}
            />
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Join a Contribution Cycle
        </h1>
        <p className="text-gray-600">
          Choose a cycle that fits your savings goals and start contributing
        </p>
      </motion.div>

      {/* Package Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-8"
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          Available Packages
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 20K Package */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-indigo-300 transition-colors">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ₦20k Package
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Monthly: {formatCurrency(settings.pack20k.monthly)}
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Payout: {formatCurrency(settings.pack20k.payout)}
              </p>
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Late Fee: {formatCurrency(settings.pack20k.fine)}
              </p>
            </div>
          </div>

          {/* 50K Package */}
          <div className="border-2 border-indigo-600 rounded-xl p-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full">
              Popular
            </div>
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ₦50k Package
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Monthly: {formatCurrency(settings.pack50k.monthly)}
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Payout: {formatCurrency(settings.pack50k.payout)}
              </p>
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Late Fee: {formatCurrency(settings.pack50k.fine)}
              </p>
            </div>
          </div>

          {/* 100K Package */}
          <div className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 transition-colors">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              ₦100k Package
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Monthly: {formatCurrency(settings.pack100k.monthly)}
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Payout: {formatCurrency(settings.pack100k.payout)}
              </p>
              <p className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600" />
                Late Fee: {formatCurrency(settings.pack100k.fine)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Available Cycles */}
      {cycles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-50 rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            No Cycles Available
          </h3>
          <p className="text-gray-600">
            There are no open cycles at the moment. Check back soon!
          </p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {cycles.map((cycle, index) => (
            <motion.div
              key={cycle.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {cycle.name}
                </h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                    cycle.status
                  )}`}
                >
                  {cycle.status}
                </span>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Starts: {formatDate(cycle.startDate)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Clock className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    Registration deadline: {formatDate(cycle.registrationDeadline)}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Users className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">
                    {cycle.availableSlots} of {cycle.totalSlots} slots available
                  </span>
                </div>
              </div>

              {cycle.availableSlots > 0 ? (
                <button
                  onClick={() => handleSelectCycle(cycle)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Join This Cycle
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  disabled
                  className="w-full px-4 py-3 bg-gray-100 text-gray-400 rounded-xl font-semibold cursor-not-allowed"
                >
                  Fully Booked
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}