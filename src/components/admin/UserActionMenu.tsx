/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Ban,
  CheckCircle,
  Shield,
  ShieldOff,
  Trash2,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import {
  suspendUser,
  activateUser,
  makeUserAdmin,
  removeAdminPrivileges,
  deleteUser,
} from "@/src/actions/userManagement";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Props {
  user: any;
  adminId: string;
  onClose: () => void;
}

export default function UserActionMenu({ user, adminId, onClose }: Props) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<string>("");
  const [reason, setReason] = useState("");

  const handleSuspend = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for suspension");
      return;
    }

    setIsProcessing(true);
    const result = await suspendUser(user.id, adminId, reason);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleActivate = async () => {
    setIsProcessing(true);
    const result = await activateUser(user.id, adminId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleMakeAdmin = async () => {
    setIsProcessing(true);
    const result = await makeUserAdmin(user.id, adminId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleRemoveAdmin = async () => {
    setIsProcessing(true);
    const result = await removeAdminPrivileges(user.id, adminId);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const handleDelete = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for deletion");
      return;
    }

    setIsProcessing(true);
    const result = await deleteUser(user.id, adminId, reason);

    if (result.success) {
      toast.success(result.message);
      router.refresh();
      onClose();
    } else {
      toast.error(result.error);
    }
    setIsProcessing(false);
  };

  const openConfirmModal = (action: string) => {
    setConfirmAction(action);
    setShowConfirmModal(true);
  };

  const executeAction = () => {
    switch (confirmAction) {
      case "suspend":
        handleSuspend();
        break;
      case "activate":
        handleActivate();
        break;
      case "makeAdmin":
        handleMakeAdmin();
        break;
      case "removeAdmin":
        handleRemoveAdmin();
        break;
      case "delete":
        handleDelete();
        break;
    }
    setShowConfirmModal(false);
  };

  return (
    <>
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-800">User Actions</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              <p className="text-sm text-gray-600">{user.phone}</p>
            </div>

            <div className="space-y-3">
              {/* Suspend/Activate */}
              {user.status === "ACTIVE" ? (
                <button
                  onClick={() => openConfirmModal("suspend")}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Ban className="w-5 h-5" />
                  Suspend User
                </button>
              ) : (
                <button
                  onClick={() => openConfirmModal("activate")}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-green-50 hover:bg-green-100 text-green-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <CheckCircle className="w-5 h-5" />
                  Activate User
                </button>
              )}

              {/* Make Admin/Remove Admin */}
              {!user.isAdmin ? (
                <button
                  onClick={() => openConfirmModal("makeAdmin")}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Shield className="w-5 h-5" />
                  Make Admin
                </button>
              ) : (
                <button
                  onClick={() => openConfirmModal("removeAdmin")}
                  disabled={isProcessing || user.id === adminId}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <ShieldOff className="w-5 h-5" />
                  Remove Admin
                </button>
              )}

              {/* Delete */}
              {!user.isAdmin && (
                <button
                  onClick={() => openConfirmModal("delete")}
                  disabled={isProcessing}
                  className="w-full flex items-center gap-3 px-4 py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl font-semibold transition-colors disabled:opacity-50"
                >
                  <Trash2 className="w-5 h-5" />
                  Delete User
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setShowConfirmModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-800">
                    Confirm Action
                  </h3>
                  <p className="text-sm text-gray-600">
                    This action requires confirmation
                  </p>
                </div>
              </div>

              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <p className="text-sm text-gray-800">
                  {confirmAction === "suspend" &&
                    "You are about to suspend this user's account. They will not be able to access the system until reactivated."}
                  {confirmAction === "activate" &&
                    "You are about to activate this user's account. They will regain access to the system."}
                  {confirmAction === "makeAdmin" &&
                    "You are about to grant admin privileges to this user. They will have full access to all admin features."}
                  {confirmAction === "removeAdmin" &&
                    "You are about to remove admin privileges from this user."}
                  {confirmAction === "delete" &&
                    "You are about to deactivate this user's account. This action cannot be undone if they have active participations."}
                </p>
              </div>

              {(confirmAction === "suspend" || confirmAction === "delete") && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reason <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Provide a reason for this action..."
                    rows={3}
                    className="w-full px-4 py-3 text-black rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-400 focus:border-transparent outline-none transition-all resize-none"
                  />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  disabled={isProcessing}
                  className="flex-1 cursor-pointer px-4 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={executeAction}
                  disabled={
                    isProcessing ||
                    ((confirmAction === "suspend" ||
                      confirmAction === "delete") &&
                      !reason.trim())
                  }
                  className="flex-1 cursor-pointer px-4 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    "Confirm"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
