"use client";

import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { updateBankDetails } from "@/src/actions/profile";
import { Building, CreditCard, User, Loader2 } from "lucide-react";

interface Props {
  participationId: string;
  currentBankDetails: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  } | null;
  onCancel: () => void;
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Saving...
        </span>
      ) : (
        "Save Bank Details"
      )}
    </button>
  );
}

export default function BankDetailsForm({
  participationId,
  currentBankDetails,
  onCancel,
}: Props) {
  const router = useRouter();
  const [state, formAction] = useFormState(updateBankDetails, null);

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
      <input type="hidden" name="participationId" value={participationId} />

      {/* Important Notice */}
      <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
        <p className="text-sm text-purple-800">
          <strong>Important:</strong> Your payout will be sent to this bank
          account. Please ensure the details are correct.
        </p>
      </div>

      {/* Bank Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bank Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <select
            name="bankName"
            required
            defaultValue={currentBankDetails?.bankName || ""}
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all appearance-none bg-white"
          >
            <option value="">Select your bank</option>
            <option value="Access Bank">Access Bank</option>
            <option value="Guaranty Trust Bank">Guaranty Trust Bank (GTBank)</option>
            <option value="United Bank for Africa">United Bank for Africa (UBA)</option>
            <option value="Zenith Bank">Zenith Bank</option>
            <option value="First Bank of Nigeria">First Bank of Nigeria</option>
            <option value="Fidelity Bank">Fidelity Bank</option>
            <option value="Union Bank">Union Bank</option>
            <option value="Sterling Bank">Sterling Bank</option>
            <option value="Stanbic IBTC Bank">Stanbic IBTC Bank</option>
            <option value="Polaris Bank">Polaris Bank</option>
            <option value="Wema Bank">Wema Bank</option>
            <option value="Ecobank">Ecobank</option>
            <option value="Keystone Bank">Keystone Bank</option>
            <option value="FCMB">First City Monument Bank (FCMB)</option>
            <option value="Heritage Bank">Heritage Bank</option>
            <option value="Unity Bank">Unity Bank</option>
            <option value="Providus Bank">Providus Bank</option>
            <option value="Kuda Bank">Kuda Bank</option>
            <option value="Opay">Opay</option>
            <option value="PalmPay">PalmPay</option>
            <option value="Moniepoint">Moniepoint</option>
          </select>
        </div>
      </div>

      {/* Account Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="accountNumber"
            required
            pattern="\d{10}"
            maxLength={10}
            defaultValue={currentBankDetails?.accountNumber || ""}
            placeholder="1234567890"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all font-mono"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Enter your 10-digit account number
        </p>
      </div>

      {/* Account Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Account Name <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="accountName"
            required
            defaultValue={currentBankDetails?.accountName || ""}
            placeholder="John Doe"
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-400 focus:border-transparent outline-none transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Name as it appears on your bank account
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