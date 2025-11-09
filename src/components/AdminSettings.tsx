
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Save, RefreshCw, AlertTriangle, Plus, Minus } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { resetGame, updateTotalNumbers } from "../actions/settings";

interface Props {
  currentTotal: number;
  pickedCount: number;
}

export default function AdminSettings({ currentTotal, pickedCount }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [totalNumbers, setTotalNumbers] = useState(currentTotal);
  const [isLoading, setIsLoading] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const router = useRouter();

  const handleUpdateTotal = async () => {
    if (totalNumbers === currentTotal) {
      toast.info("No changes to save");
      return;
    }

    setIsLoading(true);
    const result = await updateTotalNumbers(totalNumbers, true);
    setIsLoading(false);

    if (result.success) {
      toast.success(`Total numbers updated to ${totalNumbers}!`);
      router.refresh();
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to update");
      setTotalNumbers(currentTotal); // Reset on error
    }
  };

  const handleResetGame = async () => {
    setIsLoading(true);
    const result = await resetGame(true);
    setIsLoading(false);

    if (result.success) {
      toast.success("Game reset successfully!");
      router.refresh();
      setShowResetConfirm(false);
      setIsOpen(false);
    } else {
      toast.error(result.error || "Failed to reset game");
    }
  };

  const increment = () => {
    if (totalNumbers < 100) setTotalNumbers(totalNumbers + 5);
  };

  const decrement = () => {
    if (totalNumbers > 10) setTotalNumbers(totalNumbers - 5);
  };

  return (
    <>
      {/* Settings Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span className="font-medium">Card Settings</span>
      </motion.button>

      {/* Settings Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !isLoading && setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              {/* Modal */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-6"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-indigo-600" />
                    Card Settings
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    disabled={isLoading}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {!showResetConfirm ? (
                  <>
                    {/* Total Numbers Control */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Total Number of Cards
                      </label>
                      
                      <div className="flex items-center gap-4">
                        <button
                          onClick={decrement}
                          disabled={totalNumbers <= 10 || isLoading}
                          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Minus className="w-5 h-5 text-gray-700" />
                        </button>

                        <div className="flex-1 text-center">
                          <div className="text-5xl font-bold text-indigo-600">
                            {totalNumbers}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">cards</p>
                        </div>

                        <button
                          onClick={increment}
                          disabled={totalNumbers >= 100 || isLoading}
                          className="p-3 rounded-xl bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Plus className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      <input
                        type="range"
                        min="2"
                        max="100"
                        step="1"
                        value={totalNumbers}
                        onChange={(e) => setTotalNumbers(Number(e.target.value))}
                        disabled={isLoading}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />

                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Min: 2</span>
                        <span>Max: 100</span>
                      </div>
                    </div>

                    {/* Current Stats */}
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Current Total:</span>
                        <span className="font-semibold text-gray-800">{currentTotal} cards</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Numbers Picked:</span>
                        <span className="font-semibold text-gray-800">{pickedCount} cards</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Available:</span>
                        <span className="font-semibold text-green-600">{currentTotal - pickedCount} cards</span>
                      </div>
                    </div>

                    {/* Warning if reducing below picked numbers */}
                    {totalNumbers < currentTotal && pickedCount > totalNumbers && (
                      <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-orange-800">
                          <p className="font-semibold">Cannot reduce to {totalNumbers}</p>
                          <p className="mt-1">Some numbers above this limit have already been picked.</p>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="space-y-3 pt-2">
                      <button
                        onClick={handleUpdateTotal}
                        disabled={isLoading || totalNumbers === currentTotal}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {isLoading ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Updating...</span>
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => setShowResetConfirm(true)}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors border border-red-200"
                      >
                        <RefreshCw className="w-5 h-5" />
                        <span>Reset All Picks</span>
                      </button>
                    </div>
                  </>
                ) : (
                  /* Reset Confirmation */
                  <div className="space-y-4">
                    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex gap-3">
                      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-bold text-red-800 text-lg">Confirm Reset</h3>
                        <p className="text-sm text-red-700 mt-2">
                          This will delete all {pickedCount} number picks. Users will be able to pick again.
                        </p>
                        <p className="text-sm text-red-700 mt-2 font-semibold">
                          This action cannot be undone!
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleResetGame}
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isLoading ? "Resetting..." : "Yes, Reset"}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}