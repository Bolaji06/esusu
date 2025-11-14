"use client";

import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { register } from "../actions/auth";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Lock,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";

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
          Creating account...
        </span>
      ) : (
        "Create Account"
      )}
    </motion.button>
  );
}

export default function RegisterForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(register, null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(`Welcome, ${state?.user?.fullName}! 🎉`);
      router.push("/dashboard");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-5">
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
            placeholder="Enter your full name"
            required
            className="w-full pl-11 pr-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            placeholder="e.g. 08012345678"
            required
            className="w-full pl-11 pr-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Nigerian phone number format
        </p>
      </div>

      {/* Email (Optional) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email Address{" "}
          <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            name="email"
            placeholder="your.email@example.com"
            className="w-full pl-11 pr-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Occupation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Occupation <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <div className="relative">
          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            name="occupation"
            placeholder="Your occupation"
            className="w-full pl-11 pr-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
          />
        </div>
      </div>

      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Address <span className="text-gray-400 text-xs">(Optional)</span>
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <textarea
            name="address"
            placeholder="Your address"
            rows={3}
            className="w-full pl-11 pr-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all resize-none"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create a password"
            required
            minLength={6}
            className="w-full pl-11 pr-11 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
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
        <p className="text-xs text-gray-500 mt-1">At least 6 characters</p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirm Password <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            required
            minLength={6}
            className="w-full pl-11 pr-11 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all"
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

      <SubmitButton />

      {/* Login Link */}
      <p className="text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link
          href="/login"
          className="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Login here
        </Link>
      </p>
    </form>
  );
}
