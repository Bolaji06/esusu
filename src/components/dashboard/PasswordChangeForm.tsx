
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { changePassword } from "@/src/actions/profile";
import { Lock, Eye, EyeOff, Loader2 } from "lucide-react";

interface Props {
  userId: string;
  onCancel: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Changing...
        </span>
      ) : (
        "Change Password"
      )}
    </button>
  );
}

export default function PasswordChangeForm({ userId, onCancel }: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState(changePassword, null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Current Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showCurrentPassword ? "text" : "password"}
            name="currentPassword"
            required
            placeholder="Enter current password"
            className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCurrentPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showNewPassword ? "text" : "password"}
            name="newPassword"
            required
            minLength={6}
            placeholder="Enter new password"
            className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowNewPassword(!showNewPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNewPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm New Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            required
            minLength={6}
            placeholder="Confirm new password"
            className="w-full pl-11 pr-11 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Eye className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Security Note */}
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
        <p className="text-sm text-red-800">
          <strong>Security tip:</strong> Use a strong password that includes
          letters, numbers, and special characters. Don&apos;t reuse passwords from
          other accounts.
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