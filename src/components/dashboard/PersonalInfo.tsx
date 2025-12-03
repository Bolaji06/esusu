
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updatePersonalInfo } from "@/src/actions/profile";
import { User, Mail, Briefcase, MapPin, Loader2 } from "lucide-react";

interface Props {
  user: {
    id: string;
    fullName: string;
    email: string | null;
    occupation: string | null;
    address: string | null;
  };
  onCancel: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </span>
      ) : (
        "Save Changes"
      )}
    </button>
  );
}

export default function PersonalInfoForm({ user, onCancel }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(updatePersonalInfo, null);

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
      <input type="hidden" name="userId" value={user.id} />

      {/* Full Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="fullName"
            defaultValue={user.fullName}
            required
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            defaultValue={user.email || ""}
            placeholder="your.email@example.com"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Occupation
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="occupation"
            defaultValue={user.occupation || ""}
            placeholder="Your occupation"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            name="address"
            defaultValue={user.address || ""}
            placeholder="Your address"
            rows={3}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>
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