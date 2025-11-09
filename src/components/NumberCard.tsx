"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { useState } from "react";
import { Lock, Sparkles } from "lucide-react";

interface Props {
  number: number;
  isRevealed: boolean;
  isDisabled: boolean;
  isTaken?: boolean;
  onSelect: () => void;
}

const randomOffset = () => {
  const offset = (Math.random() - 0.5) * 100;
  return { x: offset, y: (Math.random() - 0.5) * 100 };
};

export default function NumberCard({
  number,
  isRevealed,
  isDisabled,
  isTaken,
  onSelect,
}: Props) {
  const [flipped, setFlipped] = useState(isRevealed);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (isDisabled || flipped) return;
    setFlipped(true);

    // reveal number after animation
    setTimeout(() => {
      onSelect();
    }, 200);
  };

  return (
    <motion.div
      className="relative perspective-1000"
      onClick={handleClick}
      onHoverStart={() => !isDisabled && !flipped && setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={!isDisabled && !flipped ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {/* Glow effect on hover */}
      {isHovered && !isDisabled && !flipped && (
        <motion.div
          className="absolute inset-0 rounded-3xl blur-xl opacity-60 -z-10"
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1.1 }}
          exit={{ opacity: 0 }}
        />
      )}

      <motion.div
        className={clsx(
          "relative w-24 h-32 sm:w-28 sm:h-36 md:w-32 md:h-40 rounded-3xl shadow-2xl transition-all duration-500",
          !isDisabled && !flipped && "cursor-pointer"
        )}
        animate={{
          rotateY: flipped ? 180 : 0,
        }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front side (hidden/mystery) */}
        <div
          className={clsx(
            "absolute inset-0 flex flex-col items-center justify-center rounded-3xl backface-hidden border-2 overflow-hidden",
            isDisabled || isTaken
              ? "bg-gradient-to-br from-gray-300 to-gray-400 border-gray-400 cursor-not-allowed"
              : "bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 border-purple-400"
          )}
        >
          {/* Animated background pattern */}
          {!isDisabled && !isTaken && (
            <>
              <motion.div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.8) 0%, transparent 50%),
                                   radial-gradient(circle at 80% 80%, rgba(255,255,255,0.6) 0%, transparent 50%)`,
                }}
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.2, 0.3, 0.2],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Sparkle effect */}
              <motion.div
                className="absolute top-4 right-4"
                animate={{
                  scale: [1, 1.2, 1],
                  rotate: [0, 180, 360],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "linear",
                }}
              >
                <Sparkles className="w-5 h-5 text-white/80" />
              </motion.div>
            </>
          )}

          {isTaken ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <Lock className="w-8 h-8 text-gray-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Taken
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <motion.div
                className="text-6xl sm:text-7xl font-bold text-white/30 select-none"
                animate={{
                  scale: isHovered ? [1, 1.1, 1] : 1,
                }}
                transition={{
                  duration: 0.5,
                  repeat: isHovered ? Infinity : 0,
                }}
              >
                ?
              </motion.div>
              {!isDisabled && (
                <motion.p
                  className="text-xs sm:text-sm px-2 font-medium text-white/90 mt-2 uppercase tracking-wider"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  Tap to reveal
                </motion.p>
              )}
            </div>
          )}

          {/* Shine effect on hover */}
          {isHovered && !isDisabled && !isTaken && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
          )}
        </div>

        {/* Back side (revealed number) */}
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white to-gray-50 rounded-3xl border-2 border-green-400 backface-hidden rotate-y-180 shadow-inner overflow-hidden">
          {/* Decorative corner elements */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-transparent rounded-br-full" />
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-green-400/20 to-transparent rounded-tl-full" />

          {isRevealed ? (
            <motion.div
              className="relative flex flex-col items-center justify-center"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
            >
              {/* Number with gradient */}
              <motion.div
                className="relative"
                animate={{
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <span
                  className="text-6xl sm:text-7xl md:text-8xl font-black bg-gradient-to-br from-green-500 via-emerald-600 to-teal-600 bg-clip-text text-transparent"
                  style={{
                    textShadow: "0 4px 20px rgba(34, 197, 94, 0.3)",
                  }}
                >
                  {number}
                </span>
              </motion.div>

              {/* Success indicator */}
              <motion.div
                className="mt-2 flex items-center gap-1 bg-green-100 px-3 py-1 rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 }}
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-semibold text-green-700 uppercase tracking-wider">
                  Picked
                </span>
              </motion.div>

              {/* Confetti particles */}
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: ["#10b981", "#059669", "#34d399", "#6ee7b7"][
                      i % 4
                    ],
                    top: "50%",
                    left: "50%",
                  }}
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: [0, randomOffset().x],
                    y: [0, randomOffset().y],
                    opacity: [1, 1, 0],
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.3 + i * 0.1,
                    ease: "easeOut",
                  }}
                />
              ))}
            </motion.div>
          ) : (
            <span className="text-transparent select-none">?</span>
          )}
        </div>
      </motion.div>

      {/* Card shadow enhancement */}
      {!isDisabled && !flipped && (
        <motion.div
          className="absolute inset-0 rounded-3xl -z-20"
          style={{
            background:
              "linear-gradient(135deg, rgba(102, 126, 234, 0.4), rgba(118, 75, 162, 0.4))",
            filter: "blur(20px)",
          }}
          animate={{
            opacity: isHovered ? 0.8 : 0.4,
          }}
        />
      )}
    </motion.div>
  );
}
