
"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Calendar, AlertCircle, CheckCircle, Users, ArrowRight } from "lucide-react";
import NumberCard from "../NumberCard";
import { pickNumber, checkUserParticipation } from "@/src/actions/numberPicks";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Props {
  userId: string;
  cycleData: {
    id: string;
    name: string;
    totalSlots: number;
    status: string;
    canPickNumbers: boolean;
    numberPickingStartDate?: Date | null;
  };
  userPick: {
    number: number;
    payoutDate?: Date;
  } | null;
  takenNumbers: number[];
}

export default function PickNumberView({
  userId,
  cycleData,
  userPick,
  takenNumbers,
}: Props) {
  const router = useRouter();
  const [revealed, setRevealed] = useState<number[]>(userPick ? [userPick.number] : []);
  const [selected, setSelected] = useState<number | null>(userPick?.number || null);
  const [isPicking, setIsPicking] = useState(false);
  const [hasParticipation, setHasParticipation] = useState(false);
  const [isCheckingParticipation, setIsCheckingParticipation] = useState(true);

  const [numbers] = useState(() =>
    Array.from({ length: cycleData.totalSlots }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    )
  );

  useEffect(() => {
    async function checkParticipation() {
      const hasJoined = await checkUserParticipation(userId);
      setHasParticipation(hasJoined);
      setIsCheckingParticipation(false);
    }
    checkParticipation();
  }, [userId]);

  const handleSelect = async (num: number) => {
    if (selected || isPicking) return;

    setIsPicking(true);

    const result = await pickNumber(userId, num);

    if (result.success) {
      setSelected(num);
      setRevealed((prev) => [...prev, num]);
      toast.success(`You picked number ${num}! 🎉`, {
        description: "Your payout has been scheduled.",
      });
      router.refresh();
    } else {
      toast.error(result.error || "Failed to pick number");
      if (result.pickedNumber) {
        setSelected(result.pickedNumber);
        setRevealed([result.pickedNumber]);
      }
    }

    setIsPicking(false);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  // Loading state
  if (isCheckingParticipation) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-center py-20">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  // Not registered for cycle
  if (hasParticipation) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl p-8 border border-orange-200 text-center"
        >
          <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Join a Cycle First
          </h2>
          <p className="text-gray-600 mb-6">
            You need to register for an active contribution cycle before you can pick a number.
          </p>
          <Link
            href="/dashboard/join-cycle"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Join a Cycle
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  // No active cycle
  if (!cycleData.id) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-2xl p-12 text-center"
        >
          <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No Active Cycle
          </h2>
          <p className="text-gray-600">
            There are no active cycles at the moment. Check back soon!
          </p>
        </motion.div>
      </div>
    );
  }

  // Number picking hasn't started
  if (!cycleData.canPickNumbers) {
    return (
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-200 text-center"
        >
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Number Picking Not Started
          </h2>
          <p className="text-gray-600 mb-4">
            Number picking for <strong>{cycleData.name}</strong> will start on:
          </p>
          {cycleData.numberPickingStartDate && (
            <p className="text-2xl font-bold text-indigo-600">
              {formatDate(cycleData.numberPickingStartDate)}
            </p>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
          Pick Your Number
        </h1>
        <p className="text-gray-600">
          Choose your payout position in <strong>{cycleData.name}</strong>
        </p>
      </motion.div>

      {/* Success Message */}
      {selected && userPick && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6 shadow-lg"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-green-800 mb-2">
                Number Picked Successfully! 🎉
              </h3>
              <div className="flex items-center gap-6 flex-wrap">
                <div>
                  <p className="text-sm text-green-700 mb-1">Your Number</p>
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md">
                      <span className="text-2xl font-black text-white">
                        {selected}
                      </span>
                    </div>
                  </div>
                </div>
                {userPick.payoutDate && (
                  <div>
                    <p className="text-sm text-green-700 mb-1">Payout Date</p>
                    <p className="font-bold text-green-800">
                      {formatDate(userPick.payoutDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4">
            <Calendar className="w-6 h-6 text-indigo-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Total Numbers</p>
          <p className="text-3xl font-bold text-gray-800">{cycleData.totalSlots}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Already Picked</p>
          <p className="text-3xl font-bold text-gray-800">{takenNumbers.length}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100"
        >
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
            <Users className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-sm text-gray-600 mb-1">Available</p>
          <p className="text-3xl font-bold text-gray-800">
            {cycleData.totalSlots - takenNumbers.length}
          </p>
        </motion.div>
      </div>

      {/* Important Info */}
      {!selected && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-indigo-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-indigo-900 mb-2">Important Information</h3>
              <ul className="space-y-2 text-sm text-indigo-800">
                <li>• Your picked number determines when you receive your payout</li>
                <li>• Number 1 = First month payout, Number 10 = Tenth month payout</li>
                <li>• Once picked, numbers cannot be changed</li>
                <li>• You can only pick one number per cycle</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}

      {/* Number Grid */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100">
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-4 sm:gap-5 md:gap-6 justify-items-center">
          {numbers.map((num, index) => (
            <motion.div
              key={num}
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                duration: 0.4,
                delay: index * 0.03,
                ease: "easeOut",
              }}
            >
              <NumberCard
                number={num}
                isRevealed={revealed.includes(num)}
                isDisabled={
                  (selected !== null && selected !== num) ||
                  takenNumbers.includes(num) ||
                  isPicking
                }
                isTaken={takenNumbers.includes(num) && !revealed.includes(num)}
                onSelect={() => handleSelect(num)}
              />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Loading Overlay */}
      {isPicking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            className="bg-white rounded-2xl p-8 shadow-2xl"
            animate={{
              scale: [1, 1.05, 1],
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-700 font-medium">Saving your pick...</p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}