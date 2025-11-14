import { redirect } from "next/navigation";
import { getCurrentUser } from "@/src/actions/auth";
import RegisterForm from "@/src/components/RegisterForm";
import { Sparkles } from "lucide-react";

export default async function RegisterPage() {
  const user = await getCurrentUser();

  // Redirect if already logged in
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            Join Esusu
          </h1>
          <p className="text-gray-600">
            Create your account and start your contribution journey
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
          <RegisterForm />
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          🔒 Your information is secure and encrypted
        </p>
      </div>
    </div>
  );
}