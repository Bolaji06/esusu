"use client";
import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { joinCycle } from "@/src/actions/participation";
import {
  DollarSign,
  Building,
  CreditCard,
  User,
  CheckCircle,
} from "lucide-react";
import { bankOptions } from "@/src/lib/data";

interface Settings {
  pack20k: { monthly: number; payout: number; fine: number };
  pack50k: { monthly: number; payout: number; fine: number };
  pack100k: { monthly: number; payout: number; fine: number };
}

interface Props {
  cycleId: string;
  userId: string;
  settings: Settings;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.98 }}
      disabled={pending}
      className="w-full py-4 rounded-xl cursor-pointer bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Joining cycle...
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          <CheckCircle className="w-5 h-5" />
          Complete Registration
        </span>
      )}
    </motion.button>
  );
}

export default function JoinCycleForm({ cycleId, userId, settings }: Props) {
  const router = useRouter();
  const [state, formAction] = useActionState(joinCycle, null);
  const [selectedPackage, setSelectedPackage] = useState<string>("PACK_50K");

  useEffect(() => {
    if (state?.success) {
      toast.success(state.message || "Successfully joined the cycle!");
      router.push("/dashboard");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const packageOptions = [
    {
      value: "PACK_20K",
      name: "₦20k Package",
      monthly: settings.pack20k.monthly,
      payout: settings.pack20k.payout,
      fine: settings.pack20k.fine,
      color: "green",
    },
    {
      value: "PACK_50K",
      name: "₦50k Package",
      monthly: settings.pack50k.monthly,
      payout: settings.pack50k.payout,
      fine: settings.pack50k.fine,
      color: "indigo",
    },
    {
      value: "PACK_100K",
      name: "₦100k Package",
      monthly: settings.pack100k.monthly,
      payout: settings.pack100k.payout,
      fine: settings.pack100k.fine,
      color: "purple",
    },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        Complete Your Registration
      </h2>

      <form action={formAction} className="space-y-6">
        {/* Hidden Fields */}
        <input type="hidden" name="userId" value={userId} />
        <input type="hidden" name="cycleId" value={cycleId} />

        {/* Package Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Your Package <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {packageOptions.map((pkg) => (
              <label key={pkg.value} className="relative cursor-pointer">
                <input
                  type="radio"
                  name="contributionMode"
                  value={pkg.value}
                  checked={selectedPackage === pkg.value}
                  onChange={(e) => setSelectedPackage(e.target.value)}
                  className="sr-only"
                  required
                />
                <div
                  className={`p-4 border-2 rounded-xl transition-all ${
                    selectedPackage === pkg.value
                      ? `border-${pkg.color}-600 bg-${pkg.color}-50`
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  {selectedPackage === pkg.value && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`w-10 h-10 bg-${pkg.color}-100 rounded-lg flex items-center justify-center mb-3`}
                  >
                    <DollarSign className={`w-6 h-6 text-${pkg.color}-600`} />
                  </div>
                  <h4 className="font-bold text-gray-800 mb-2">{pkg.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>Monthly: {formatCurrency(pkg.monthly)}</p>
                    <p className="font-semibold text-gray-800">
                      Payout: {formatCurrency(pkg.payout)}
                    </p>
                    <p className="text-xs text-orange-600">
                      Late fee: {formatCurrency(pkg.fine)}
                    </p>
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bank Details Section */}
        <div className="border-t pt-6">
          <div className="flex items-center gap-2 mb-4">
            <Building className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Bank Account Details
            </h3>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            Your payout will be sent to this account when it&apos;s your turn
          </p>
          <div className="space-y-4">
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
                  className="w-full pl-11 text-black pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all appearance-none bg-white"
                >
                  <option value="">Select your bank</option>
                  {bankOptions.map((bank) => (
                    <option key={bank} value={bank} className="text-black">
                      {bank}
                    </option>
                  ))}
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
                  placeholder="1234567890"
                  required
                  pattern="\d{10}"
                  maxLength={10}
                  className="w-full pl-11 pr-4 text-black py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
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
                  placeholder="John Doe"
                  required
                  className="w-full pl-11 text-black pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Name as it appears on your bank account
              </p>
            </div>
          </div>
        </div>

        {/* Important Information */}
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
          <h4 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Important Information
          </h4>
          <ul className="space-y-2 text-sm text-indigo-800">
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              <span>
                You must make your monthly contribution by the 29th of each
                month
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              <span>
                Late payments will incur a fine based on your selected package
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              <span>
                After registration, you&apos;ll be able to pick your payout
                number
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-indigo-600 mt-1">•</span>
              <span>
                Your payout will be sent to the bank account provided above
              </span>
            </li>
          </ul>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            required
            className="mt-1 w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the terms and conditions of this contribution cycle. I
            understand that I must make monthly payments on time and that late
            payments will incur penalties.{" "}
            <span className="text-red-500">*</span>
          </label>
        </div>

        <SubmitButton />
      </form>
    </div>
  );
}
