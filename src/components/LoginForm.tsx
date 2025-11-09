"use client";
import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { loginAction } from "@/app/login/data";
import { div } from "framer-motion/client";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <motion.button
      type="submit"
      whileTap={{ scale: 0.95 }}
      disabled={pending}
      className="w-full py-3 cursor-pointer rounded-xl bg-indigo-600 text-white font-semibold shadow-md hover:bg-indigo-700 transition disabled:opacity-70"
    >
      {pending ? "Signing in..." : "Continue"}
    </motion.button>
  );
}

export default function LoginForm() {
  const router = useRouter();
  const [state, formAction] = useActionState(loginAction, null);

  useEffect(() => {
    if (state?.success) {
      toast.success(`Welcome, ${state.user?.fullName}! 🎉`);
      router.push("/");
      router.refresh();
    } else if (state?.error) {
      toast.error(state.error);
    }
  }, [state, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 to-slate-200 p-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white shadow-xl rounded-3xl p-6 sm:p-8"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-center text-slate-800 mb-6">
          Esusu Login
        </h1>
        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              placeholder="Enter your full name"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-slate-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. +234 812 345 6789"
              required
              className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-400 focus:outline-none text-slate-800"
            />
          </div>

          <SubmitButton />
        </form>
      </motion.div>
    </div>
  );
}
