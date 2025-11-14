"use client";

import { useFormState, useFormStatus } from "react-dom";
import { motion } from "framer-motion";
import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { login } from "../actions/auth";
import { Phone, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.98 }}
      disabled={pending}
      className="w-full py-4 cursor-pointer rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-70 disabled:cursor-not-allowed"
    >
      {pending ? (
        <span className="flex items-center justify-center gap-2">
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          Signing in...
        </span>
      ) : (
        "Sign In"
      )}
    </motion.button>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(login, null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (state?.success) {
      toast.success(`Welcome back, ${state?.user?.fullName}! 🎉`);
      router.push("/dashboard");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Phone */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="tel"
            name="phone"
            placeholder="08012345678"
            required
            className="w-full pl-11 pr-4 py-4 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-lg"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Enter your password"
            required
            className="w-full pl-11 pr-11 py-4 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-indigo-400 focus:border-transparent outline-none transition-all text-lg"
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
      </div>

      <SubmitButton />

      {/* Register Link */}
      <p className="text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/register"
          className="text-indigo-600 hover:text-indigo-700 font-semibold"
        >
          Register here
        </Link>
      </p>
    </form>
  );
}
