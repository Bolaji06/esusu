"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Phone,
  Mail,
  Briefcase,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Lock,
  Building,
  CreditCard,
  History,
} from "lucide-react";
import PersonalInfoForm from "./PersonalInfo";
import PhoneNumberForm from "./PhoneNumberForm";
import PasswordChangeForm from "./PasswordChangeForm";
import BankDetailsForm from "./BankDetailsForm";

interface ProfileData {
  user: {
    id: string;
    fullName: string;
    phone: string;
    email: string | null;
    occupation: string | null;
    address: string | null;
    status: string;
    createdAt: Date;
  };
  activeParticipation: {
    id: string;
    cycleId: string;
    cycleName: string;
    contributionMode: string;
    pickedNumber: number | null;
    bankDetails: {
      bankName: string;
      accountNumber: string;
      accountName: string;
    } | null;
  } | null;
  participationHistory: Array<{
    id: string;
    cycleName: string;
    cycleStatus: string;
    contributionMode: string;
    hasOptedOut: boolean;
    registeredAt: Date;
  }>;
}

interface Props {
  profileData: ProfileData;
}

export default function ProfileView({ profileData }: Props) {
  const [activeSection, setActiveSection] = useState<
    "personal" | "phone" | "password" | "bank" | null
  >(null);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getContributionModeLabel = (mode: string) => {
    switch (mode) {
      case "PACK_20K":
        return "₦20k Pack";
      case "PACK_50K":
        return "₦50k Pack";
      case "PACK_100K":
        return "₦100k Pack";
      default:
        return mode;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACTIVE":
        return "bg-green-100 text-green-700";
      case "SUSPENDED":
        return "bg-red-100 text-red-700";
      case "OPTED_OUT":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
        <p className="text-gray-600">
          Manage your personal information and account settings
        </p>
      </motion.div>

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center">
              <User className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profileData.user.fullName}
              </h2>
              <p className="text-indigo-100 mt-1">{profileData.user.phone}</p>
              <div className="mt-2 flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    profileData.user.status === "ACTIVE"
                      ? "bg-green-400/20 text-green-100"
                      : "bg-red-400/20 text-red-100"
                  }`}
                >
                  {profileData.user.status}
                </span>
                <span className="text-sm text-indigo-200">
                  Member since {formatDate(profileData.user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-xl mt-4"
      >
        <div className="flex gap-3 md:gap-0 flex-col md:flex-row justify-between">
          <div>
            <h2 className="text-base">
              Account Number:{" "}
              <span className="font-mono font-bold tracking-wide">177379076</span>
            </h2>
          </div>
          <div>
            <h2 className="text-base">
              Account Name:{" "}
              <span className="font-bold">M&Z General Business</span>
            </h2>
          </div>
          <div>
            <h2 className="text-base">
              Bank Name:{" "}
              <span className="font-bold">Access Bank</span>
            </h2>
          </div>
        </div>
      </motion.div>

      {/* Personal Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">
                Personal Information
              </h3>
              <p className="text-sm text-gray-600">
                Your basic profile details
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setActiveSection(activeSection === "personal" ? null : "personal")
            }
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl font-semibold hover:bg-indigo-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit
          </button>
        </div>

        {activeSection === "personal" ? (
          <PersonalInfoForm
            user={profileData.user}
            onCancel={() => setActiveSection(null)}
          />
        ) : (
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <User className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Full Name</p>
                <p className="font-semibold text-gray-800">
                  {profileData.user.fullName}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Email Address</p>
                <p className="font-semibold text-gray-800">
                  {profileData.user.email || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Occupation</p>
                <p className="font-semibold text-gray-800">
                  {profileData.user.occupation || "Not provided"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-gray-400 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-800">
                  {profileData.user.address || "Not provided"}
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Phone Number */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Phone className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Phone Number</h3>
              <p className="text-sm text-gray-600">Your login phone number</p>
            </div>
          </div>
          <button
            onClick={() =>
              setActiveSection(activeSection === "phone" ? null : "phone")
            }
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-xl font-semibold hover:bg-green-100 transition-colors"
          >
            <Edit className="w-4 h-4" />
            Change
          </button>
        </div>

        {activeSection === "phone" ? (
          <PhoneNumberForm
            userId={profileData.user.id}
            currentPhone={profileData.user.phone}
            onCancel={() => setActiveSection(null)}
          />
        ) : (
          <div className="p-6">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-gray-400" />
              <p className="font-semibold text-gray-800">
                {profileData.user.phone}
              </p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Password */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
      >
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
              <Lock className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">Password</h3>
              <p className="text-sm text-gray-600">
                Secure your account with a strong password
              </p>
            </div>
          </div>
          <button
            onClick={() =>
              setActiveSection(activeSection === "password" ? null : "password")
            }
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
          >
            <Lock className="w-4 h-4" />
            Change
          </button>
        </div>

        {activeSection === "password" ? (
          <PasswordChangeForm
            userId={profileData.user.id}
            onCancel={() => setActiveSection(null)}
          />
        ) : (
          <div className="p-6">
            <p className="text-gray-600">••••••••</p>
            <p className="text-sm text-gray-500 mt-1">Last changed: Unknown</p>
          </div>
        )}
      </motion.div>

      {/* Bank Details */}
      {profileData.activeParticipation && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <Building className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Bank Details
                </h3>
                <p className="text-sm text-gray-600">
                  For payout in {profileData.activeParticipation.cycleName}
                </p>
              </div>
            </div>
            <button
              onClick={() =>
                setActiveSection(activeSection === "bank" ? null : "bank")
              }
              className="flex items-center gap-2 px-4 py-2 bg-purple-50 text-purple-600 rounded-xl font-semibold hover:bg-purple-100 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
          </div>

          {activeSection === "bank" ? (
            <BankDetailsForm
              participationId={profileData.activeParticipation.id}
              currentBankDetails={profileData.activeParticipation.bankDetails}
              onCancel={() => setActiveSection(null)}
            />
          ) : (
            <div className="p-6">
              {profileData.activeParticipation.bankDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-start gap-3">
                    <Building className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Bank Name</p>
                      <p className="font-semibold text-gray-800">
                        {profileData.activeParticipation.bankDetails.bankName}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Account Number</p>
                      <p className="font-semibold text-gray-800 font-mono">
                        {
                          profileData.activeParticipation.bankDetails
                            .accountNumber
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-gray-400 mt-1" />
                    <div>
                      <p className="text-sm text-gray-600">Account Name</p>
                      <p className="font-semibold text-gray-800">
                        {
                          profileData.activeParticipation.bankDetails
                            .accountName
                        }
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600">No bank details provided yet</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Participation History */}
      {profileData.participationHistory.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <History className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  Participation History
                </h3>
                <p className="text-sm text-gray-600">
                  Your contribution cycle history
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-gray-200">
            {profileData.participationHistory.map((participation) => (
              <div
                key={participation.id}
                className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div>
                  <h4 className="font-semibold text-gray-800">
                    {participation.cycleName}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {getContributionModeLabel(participation.contributionMode)} •
                    Joined {formatDate(participation.registeredAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {participation.hasOptedOut && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                      Opted Out
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      participation.cycleStatus === "ACTIVE"
                        ? "bg-green-100 text-green-700"
                        : participation.cycleStatus === "COMPLETED"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    {participation.cycleStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
