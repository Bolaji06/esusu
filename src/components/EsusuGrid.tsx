"use client";

import { useState } from "react";
import NumberCard from "./NumberCard";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { pickNumber } from "../data";

interface Props {
  userId: string;
  isAdmin: boolean
  userPick: number | null;
  takenNumbers: number[];
  totalNumbers: number;
}

export default function EsusuGrid({ userId, userPick, takenNumbers, totalNumbers, isAdmin }: Props) {
  const [revealed, setRevealed] = useState<number[]>(
    userPick ? [userPick] : []
  );
  const [selected, setSelected] = useState<number | null>(userPick);
  const [isPicking, setIsPicking] = useState(false);
  // Update the numbers state initialization
  const [numbers] = useState(() =>
    Array.from({ length: totalNumbers }, (_, i) => i + 1).sort(
      () => Math.random() - 0.5
    )
  );

  const handleSelect = async (num: number) => {
    if (selected || isPicking) return;

    setIsPicking(true);

    const result = await pickNumber(userId, num);

    if (result.success) {
      setSelected(num);
      setRevealed((prev) => [...prev, num]);
      toast.success(`You picked number ${num}! 🎉`, {
        description: "Your lucky number has been saved.",
      });
    } else {
      toast.error(result.error || "Failed to pick number");
      if (result.pickedNumber) {
        setSelected(result.pickedNumber);
        setRevealed([result.pickedNumber]);
      }
    }

    setIsPicking(false);
  };

  return (
    <div className="w-full max-w-3xl px-4">
      {selected && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl text-center shadow-lg"
        >
          <p className="text-green-700 text-sm font-medium uppercase tracking-wider mb-2">
            Your Lucky Number
          </p>
          <div className="flex items-center justify-center gap-3">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-xl"
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <span className="text-3xl font-black text-white">{selected}</span>
            </motion.div>
            <div className="text-left">
              <p className="text-2xl font-bold text-green-800">{selected}</p>
              <p className="text-sm text-green-600">Saved & Locked</p>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-3 sm:grid-cols-5 gap-4 sm:gap-5 md:gap-6 justify-items-center">
        {numbers.map((num, index) => (
          <motion.div
            key={num}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{
              duration: 0.4,
              delay: index * 0.05,
              ease: "easeOut",
            }}
          >
            <NumberCard
              number={num}
              isRevealed={revealed.includes(num)}
              isDisabled={
                (selected !== null && selected !== num) ||
                takenNumbers.includes(num) ||
                isPicking || isAdmin
              }
              isTaken={takenNumbers.includes(num) && !revealed.includes(num)}
              onSelect={() => handleSelect(num)}
            />
          </motion.div>
        ))}
      </div>

      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-gray-200">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm text-gray-600 font-medium">
              Your selection is permanently saved
            </p>
          </div>
        </motion.div>
      )}

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
