
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updatePhoneNumber } from "@/src/actions/profile";
import { Phone, Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  currentPhone: string;
  onCancel: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Updating...
        </span>
      ) : (
        "Update Phone"
      )}
    </button>
  );
}

export default function PhoneNumberForm({
  userId,
  currentPhone,
  onCancel,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState(updatePhoneNumber, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message);
      router.refresh();
      onCancel();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router, onCancel]);

  return (
    <form action={formAction} className="p-6 space-y-6">
      <input type="hidden" name="userId" value={userId} />

      {/* Current Phone (Display) */}
      <div className="p-4 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600 mb-1">Current Phone Number</p>
        <p className="font-semibold text-gray-800">{currentPhone}</p>
      </div>

      {/* New Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            required
            placeholder="08012345678"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">Nigerian phone number format</p>
      </div>

      {/* Password Verification */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            required
            placeholder="Enter your password to confirm"
            className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 focus:border-transparent outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter your password to verify this change
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}