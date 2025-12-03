"use client";

import { useState, useEffect, useRef, useActionState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Users, AlertCircle } from "lucide-react";
import { createCycle } from "@/src/actions/cycles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  adminId: string;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? "Creating Cycle..." : "Create Cycle"}
    </button>
  );
}

export default function CreateCycleModal({ isOpen, onClose, adminId }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(createCycle, null);
  const hasShownToast = useRef(false);

  useEffect(() => {
    if (!state) return;

    // Prevent duplicate toasts
    if (hasShownToast.current) return;

    if (state?.success) {
      hasShownToast.current = true;
      toast.success(state.message);
      router.refresh();
      onClose();
      // Reset after modal closes
      setTimeout(() => {
        hasShownToast.current = false;
      }, 1000);
    } else if (state?.error) {
      hasShownToast.current = true;
      toast.error(state.error);
      setTimeout(() => {
        hasShownToast.current = false;
      }, 1000);
    }
  }, [state, router, onClose]);

  // Reset ref when modal closes
  useEffect(() => {
    if (!isOpen) {
      hasShownToast.current = false;
    }
  }, [isOpen]);

  // Get default dates
  const today = new Date();
  const nextMonth = new Date(today);
  nextMonth.setMonth(today.getMonth() + 1);
  const nextYear = new Date(today);
  nextYear.setFullYear(today.getFullYear() + 1);

  const formatDateInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                Create New Cycle
              </h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg text-black hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form action={formAction} className="space-y-6">
              <input type="hidden" name="adminId" value={adminId} />

              {/* Cycle Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cycle Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g., January 2025 Cycle"
                  className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    required
                    defaultValue={formatDateInput(nextMonth)}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    required
                    defaultValue={formatDateInput(nextYear)}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Deadline{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="registrationDeadline"
                    required
                    defaultValue={formatDateInput(today)}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Number Picking Start Date
                  </label>
                  <input
                    type="date"
                    name="numberPickingStartDate"
                    defaultValue={formatDateInput(nextMonth)}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    required
                    defaultValue="UPCOMING"
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  >
                    <option value="UPCOMING">Upcoming</option>
                    <option value="ACTIVE">Active</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Slots <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="totalSlots"
                    required
                    min="10"
                    max="100"
                    defaultValue="20"
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Deadline (Day){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="paymentDeadlineDay"
                    required
                    min="1"
                    max="31"
                    defaultValue="29"
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800">
                    <p className="font-semibold mb-1">Important</p>
                    <ul className="space-y-1 text-xs">
                      <li>
                        • Registration deadline must be before the start date
                      </li>
                      <li>
                        • Users can only join before the registration deadline
                      </li>
                      <li>
                        • Payment deadline day is the day of each month when
                        payments are due
                      </li>
                      <li>
                        • Generate monthly payments after the cycle becomes
                        active
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <SubmitButton />
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
