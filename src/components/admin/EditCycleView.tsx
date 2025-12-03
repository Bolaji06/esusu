"use client";
import { useActionState, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Save, AlertCircle } from "lucide-react";
import Link from "next/link";
import { updateCycle } from "@/src/actions/cycles";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

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
}

interface Props {
  cycle: Cycle;
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

export default function EditCycleView({ cycle, adminId }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const formatDateInput = (date: Date | null) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get("name") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      registrationDeadline: formData.get("registrationDeadline") as string,
      numberPickingStartDate: formData.get("numberPickingStartDate") as
        | string
        | null,
      status: formData.get("status") as string,
      totalSlots: parseInt(formData.get("totalSlots") as string, 10),
      paymentDeadlineDay: parseInt(
        formData.get("paymentDeadlineDay") as string,
        10
      ),
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
        <form onSubmit={handleSubmit} className="space-y-6">
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
                defaultValue={cycle.totalSlots}
                className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Payment Deadline Day */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Payment Deadline (Days after registration){" "}
              <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="paymentDeadlineDay"
              required
              min="1"
              defaultValue={cycle.paymentDeadlineDay}
              className="w-full px-4 text-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
            />
            <p className="mt-1 text-xs text-gray-500">
              Number of days users have to complete payment after registration.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-between pt-4">
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 rounded-xl cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? "Editing Cycle..." : "Edit Cycle"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
