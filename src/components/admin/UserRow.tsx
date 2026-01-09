/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  Phone,
  Mail,
  Eye,
  Ban,
  CheckCircle,
  Shield,
  ShieldOff,
  MoreVertical,
  AlertTriangle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import UserDetailsModal from "./UserDetailsModal";
import UserActionMenu from "./UserActionMenu";
import { motion } from "framer-motion";
import { useState } from "react";

interface Props {
  user: any;
  adminId: string;
  index: number;
}

export default function UserRow({ user, adminId, index }: Props) {
  const router = useRouter();
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadge = () => {
    const statusConfig = {
      ACTIVE: "bg-green-100 text-green-700",
      SUSPENDED: "bg-red-100 text-red-700",
      OPTED_OUT: "bg-gray-100 text-gray-700",
      COMPLETED: "bg-blue-100 text-blue-700",
      DELETED: "bg-gray-200 text-gray-500",
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusConfig[user.status as keyof typeof statusConfig] ||
          statusConfig.ACTIVE
          }`}
      >
        {user.status}
      </span>
    );
  };

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        className="hover:bg-gray-50 transition-colors"
      >
        {/* User Info */}
        <td className="px-6 py-4">
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-gray-800">{user.fullName}</p>
              {user.isAdmin && (
                <Shield className="w-4 h-4 text-purple-600" />
              )}
            </div>
            <p className="text-xs text-gray-500">
              Joined: {formatDate(user.createdAt)}
            </p>
          </div>
        </td>

        {/* Contact */}
        <td className="px-6 py-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-3 h-3" />
              {user.phone}
            </div>
            {user.email && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail className="w-3 h-3" />
                {user.email}
              </div>
            )}
          </div>
        </td>

        {/* Status */}
        <td className="px-6 py-4 text-center">{getStatusBadge()}</td>

        {/* Participations */}
        <td className="px-6 py-4 text-center">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-gray-800">
              {user.participationCount}
            </p>
            {user.activeParticipations > 0 && (
              <p className="text-xs text-green-600">
                {user.activeParticipations} active
              </p>
            )}
          </div>
        </td>

        {/* Contributed */}
        <td className="px-6 py-4 text-right">
          <p className="font-semibold text-gray-800">
            {formatCurrency(user.totalContributed)}
          </p>
        </td>

        {/* Overdue */}
        <td className="px-6 py-4 text-center">
          {user.overduePayments > 0 ? (
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold flex items-center gap-1 justify-center">
              <AlertTriangle className="w-3 h-3" />
              {user.overduePayments}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">None</span>
          )}
        </td>

        {/* Actions */}
        <td className="px-6 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => setShowDetailsModal(true)}
              className="p-2 hover:bg-indigo-50 rounded-lg transition-colors group"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-gray-600 group-hover:text-indigo-600" />
            </button>
            <button
              onClick={() => setShowActionMenu(true)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="More Actions"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </td>
      </motion.tr>

      {/* User Details Modal */}
      {showDetailsModal && (
        <UserDetailsModal
          userId={user.id}
          onClose={() => setShowDetailsModal(false)}
        />
      )}

      {/* Action Menu */}
      {showActionMenu && (
        <UserActionMenu
          user={user}
          adminId={adminId}
          onClose={() => setShowActionMenu(false)}
        />
      )}
    </>
  );
}