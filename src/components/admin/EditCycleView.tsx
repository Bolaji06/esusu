"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Home,
  Check,
  RotateCcw,
  Sparkles,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { updateCycle } from "@/src/actions/cycles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { CycleStatus } from "@/generated/prisma/enums";

interface Participant {
  id: string;
  userName: string;
  userPhone: string;
  userEmail: string | null;
  contributionMode: string;
  pickedNumber: number | null;
  hasOptedOut: boolean;
  registeredAt: Date;
  hasBankDetails: boolean;
}

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
  hiddenNumbers?: number[];
  participants?: Participant[];
}

interface Props {
  cycle: Cycle;
  adminId: string;
}

export default function EditCycleView({ cycle, adminId }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [totalSlots, setTotalSlots] = useState<number>(cycle.totalSlots || 20);

  // Initial hidden numbers from cycle or default to [1, 2]
  const [hiddenNumbers, setHiddenNumbers] = useState<number[]>(() => {
    if (cycle.hiddenNumbers && Array.isArray(cycle.hiddenNumbers)) {
      return [...cycle.hiddenNumbers].sort((a, b) => a - b);
    }
    return [1, 2];
  });

  // Track manual input text representation
  const [textInput, setTextInput] = useState<string>(() =>
    (cycle.hiddenNumbers && Array.isArray(cycle.hiddenNumbers)
      ? cycle.hiddenNumbers
      : [1, 2]
    ).join(", ")
  );

  // Map of already picked numbers to participant name
  const alreadyPickedMap = new Map<number, string>();
  if (cycle.participants) {
    for (const p of cycle.participants) {
      if (p.pickedNumber !== null && !p.hasOptedOut) {
        alreadyPickedMap.set(p.pickedNumber, p.userName);
      }
    }
  }

  const formatDateInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleToggleNumber = (num: number) => {
    if (alreadyPickedMap.has(num)) {
      toast.error(
        `Number ${num} has already been picked by ${alreadyPickedMap.get(
          num
        )} and cannot be hidden.`
      );
      return;
    }

    setHiddenNumbers((prev) => {
      let updated: number[];
      if (prev.includes(num)) {
        updated = prev.filter((n) => n !== num);
      } else {
        if (prev.length + 1 >= totalSlots) {
          toast.error("At least one slot must remain pickable for users.");
          return prev;
        }
        updated = [...prev, num].sort((a, b) => a - b);
      }
      setTextInput(updated.join(", "));
      return updated;
    });
  };

  const handleApplyPreset = (preset: number[]) => {
    const valid = preset.filter(
      (n) => n >= 1 && n <= totalSlots && !alreadyPickedMap.has(n)
    );
    if (valid.length >= totalSlots && totalSlots > 0) {
      toast.error("At least one slot must remain pickable for users.");
      return;
    }
    setHiddenNumbers(valid);
    setTextInput(valid.join(", "));
  };

  const handleTextInputChange = (val: string) => {
    setTextInput(val);
    const parsed = val
      .split(/[, ]+/)
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n) && n >= 1 && n <= totalSlots);
    const unique = Array.from(new Set(parsed)).sort((a, b) => a - b);

    // Filter out already picked
    const conflicts = unique.filter((n) => alreadyPickedMap.has(n));
    if (conflicts.length > 0) {
      toast.error(
        `Number(s) ${conflicts.join(", ")} already picked by participants and cannot be hidden.`
      );
      return;
    }

    setHiddenNumbers(unique);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const newTotalSlots = parseInt(formData.get("totalSlots") as string, 10);

    // Validate hidden numbers
    const validHiddenNumbers = hiddenNumbers.filter(
      (n) => n >= 1 && n <= newTotalSlots
    );

    // Check conflict with already picked numbers
    const conflicts = validHiddenNumbers.filter((n) =>
      alreadyPickedMap.has(n)
    );
    if (conflicts.length > 0) {
      toast.error(
        `Cannot hide number(s) ${conflicts.join(", ")} as they have already been picked by participants.`
      );
      return;
    }

    if (validHiddenNumbers.length >= newTotalSlots) {
      toast.error("At least one slot must remain pickable for users.");
      return;
    }

    const data = {
      name: formData.get("name") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      registrationDeadline: formData.get("registrationDeadline") as string,
      numberPickingStartDate: formData.get("numberPickingStartDate") as
        | string
        | null,
      status: formData.get("status") as CycleStatus,
      totalSlots: newTotalSlots,
      paymentDeadlineDay: parseInt(
        formData.get("paymentDeadlineDay") as string,
        10
      ),
      hiddenNumbers: validHiddenNumbers,
    };

    setIsProcessing(true);
    const result = await updateCycle(cycle.id, adminId, data);
    if (result.success) {
      toast.success(result.message || "Cycle updated successfully!");
      router.push(`/dashboard/admin/cycles/${cycle.id}`);
      router.refresh();
    } else {
      toast.error(result.error || "Failed to update cycle.");
    }
    setIsProcessing(false);
  };

  const pickableCount = Math.max(
    0,
    totalSlots - hiddenNumbers.length - alreadyPickedMap.size
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Link
          href={`/dashboard/admin/cycles/${cycle.id}`}
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-4 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Cycle Details
        </Link>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Edit Cycle</h1>
        <p className="text-gray-600">{cycle.name}</p>
      </motion.div>

      {/* Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl p-8 shadow-lg border border-gray-100"
      >
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Cycle Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cycle Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={cycle.name}
              className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Dates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                required
                defaultValue={formatDateInput(cycle.startDate)}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                required
                defaultValue={formatDateInput(cycle.endDate)}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Registration Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Registration Deadline <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registrationDeadline"
                required
                defaultValue={formatDateInput(cycle.registrationDeadline)}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Number Picking Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number Picking Start Date
              </label>
              <input
                type="date"
                name="numberPickingStartDate"
                defaultValue={formatDateInput(cycle.numberPickingStartDate)}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Status & Total Slots */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                required
                defaultValue={cycle.status}
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
                min="1"
                value={totalSlots}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10) || 1;
                  setTotalSlots(val);
                }}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Payment Deadline Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Deadline Day of the Month{" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="paymentDeadlineDay"
              required
              min="1"
              max="31"
              defaultValue={cycle.paymentDeadlineDay}
              className="w-full px-4 text-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              The day of each month by which participants must make their contribution (e.g. 29).
            </p>
          </div>

          {/* --- ADMIN NUMBER CONTROL SECTION --- */}
          <div className="pt-4 border-t border-gray-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div>
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-indigo-600" />
                  Control Numbers Available for Users
                </h3>
                <p className="text-sm text-gray-600">
                  Select which numbers should be hidden / reserved from users for this cycle. Users cannot pick hidden numbers.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium">Presets:</span>
                <button
                  type="button"
                  onClick={() => handleApplyPreset([1, 2])}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  Default (1 & 2)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset([1, 2, 3])}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  First 3 (1-3)
                </button>
                <button
                  type="button"
                  onClick={() => handleApplyPreset([])}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  None (All Open)
                </button>
              </div>
            </div>

            {/* Status Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Slots</p>
                <p className="text-xl font-bold text-gray-800">{totalSlots}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-amber-600 font-medium flex items-center justify-center gap-1">
                  <EyeOff className="w-3.5 h-3.5" />
                  Hidden / House
                </p>
                <p className="text-xl font-bold text-amber-700">
                  {hiddenNumbers.length}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-blue-600 font-medium">Already Picked</p>
                <p className="text-xl font-bold text-blue-700">
                  {alreadyPickedMap.size}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs text-green-600 font-medium flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" />
                  Pickable by Users
                </p>
                <p className="text-xl font-bold text-green-700">
                  {pickableCount}
                </p>
              </div>
            </div>

            {/* Comma-separated text input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hidden Numbers (comma-separated):
              </label>
              <input
                type="text"
                value={textInput}
                onChange={(e) => handleTextInputChange(e.target.value)}
                placeholder="e.g. 1, 2, 5"
                className="w-full px-4 py-2.5 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-sm font-mono"
              />
              <p className="mt-1 text-xs text-gray-500">
                You can type comma-separated numbers above or click numbers directly on the grid below to toggle them.
              </p>
            </div>

            {/* Interactive Grid of Numbers */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  Click a number to toggle Hidden vs. Pickable:
                </span>
                <span className="text-xs text-gray-500">
                  Amber = Hidden from users | Green = Pickable | Slate = Already Picked
                </span>
              </div>

              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 p-3 bg-gray-50 rounded-xl border border-gray-200 max-h-64 overflow-y-auto">
                {Array.from({ length: totalSlots }, (_, i) => i + 1).map((num) => {
                  const isHidden = hiddenNumbers.includes(num);
                  const isPickedByUser = alreadyPickedMap.has(num);
                  const pickedByName = alreadyPickedMap.get(num);

                  if (isPickedByUser) {
                    return (
                      <div
                        key={num}
                        title={`Picked by ${pickedByName}`}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-300 bg-gray-200 text-gray-500 cursor-not-allowed opacity-75 select-none"
                      >
                        <span className="text-base font-bold">{num}</span>
                        <span className="text-[10px] truncate max-w-full font-semibold">
                          Picked
                        </span>
                      </div>
                    );
                  }

                  if (isHidden) {
                    return (
                      <button
                        key={num}
                        type="button"
                        onClick={() => handleToggleNumber(num)}
                        title={`Number ${num} is hidden from users. Click to make pickable.`}
                        className="flex flex-col items-center justify-center p-2 rounded-xl border-2 border-amber-400 bg-amber-50 text-amber-900 hover:bg-amber-100 transition-all shadow-sm"
                      >
                        <div className="flex items-center gap-0.5">
                          <EyeOff className="w-3 h-3 text-amber-700" />
                          <span className="text-base font-black">{num}</span>
                        </div>
                        <span className="text-[10px] font-bold text-amber-700 uppercase">
                          Hidden
                        </span>
                      </button>
                    );
                  }

                  return (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleToggleNumber(num)}
                      title={`Number ${num} is open for users. Click to hide.`}
                      className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:border-indigo-400 hover:text-indigo-600 transition-all hover:shadow-sm"
                    >
                      <div className="flex items-center gap-0.5">
                        <Check className="w-3 h-3 text-green-500" />
                        <span className="text-base font-bold">{num}</span>
                      </div>
                      <span className="text-[10px] font-medium text-gray-500">
                        Open
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Updating Cycle..." : "Save Changes"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
