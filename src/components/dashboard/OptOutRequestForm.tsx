
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { submitOptOutRequest } from "@/src/actions/optOut";
import { AlertTriangle, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  cycleId: string;
  cycleName: string;
  refundAmount: number;
  penaltyAmount: number;
  onCancel: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting...
        </span>
      ) : (
        "Submit Request"
      )}
    </button>
  );
}

export default function OptOutRequestForm({
  userId,
  cycleId,
  cycleName,
  refundAmount,
  penaltyAmount,
  onCancel,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(submitOptOutRequest, null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="p-6 border-b border-gray-200 bg-red-50">
        <div className="flex items-center gap-3">
         <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Confirm Opt-Out Request
            </h3>
            <p className="text-sm text-gray-600">{cycleName}</p>
          </div>
        </div>
      </div>

      <form action={formAction} className="p-6 space-y-6">
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="cycleId" value={cycleId} />

        {/* Summary */}
        <div className="p-4 bg-gray-50 rounded-xl space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Penalty Amount</span>
            <span className="font-semibold text-red-600">
              {formatCurrency(penaltyAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Refund Amount</span>
            <span className="font-semibold text-green-600">
              {formatCurrency(refundAmount)}
            </span>
          </div>
        </div>

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Opting Out <span className="text-red-500">*</span>
          </label>
          <textarea
            name="reason"
            required
            minLength={10}
            rows={4}
            placeholder="Please explain why you want to opt out of this cycle..."
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum 10 characters required
          </p>
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="confirm"
            required
            className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
          />
          <label htmlFor="confirm" className="text-sm text-gray-700">
            I understand that opting out will result in a penalty of{" "}
            <strong>{formatCurrency(penaltyAmount)}</strong> and I will receive a
            refund of <strong>{formatCurrency(refundAmount)}</strong>. This action
            cannot be undone once approved.
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}