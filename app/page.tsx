import EsusuGrid from "@/src/components/EsusuGrid";
import AdminPanel from "@/src/components/AdminPanel";
import { redirect } from "next/navigation";
import { getGameSettings } from "@/src/actions/settings";
import {
  getUserPick,
  getAllPicks,
  getAllUserPicks,
  getPicksStats,
} from "@/src/data";
import { getCurrentUser } from "@/src/lib/getUser";

export default async function EsusuPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Get game settings FIRST
  const gameSettings = await getGameSettings();
  const totalNumbers = gameSettings.totalNumbers;

  // Get user's pick if they have one
  const userPick = await getUserPick(user.userId);

  // Get all taken numbers
  const takenNumbers = await getAllPicks();

  // Get admin data if user is admin - stats will now use current totalNumbers
  const userPicks = user.isAdmin ? await getAllUserPicks() : [];
  const stats = user.isAdmin ? await getPicksStats() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 py-12 px-4">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-1/2 -left-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -right-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 bg-white/20 backdrop-blur-md px-6 py-3 rounded-full border border-white/30 shadow-lg">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <p className="text-white/90 font-medium">Welcome back,</p>
              <span className="font-bold text-white text-lg">
                {user.fullName}
              </span>
              {user.isAdmin && (
                <span className="ml-2 text-xs bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full font-bold uppercase tracking-wider shadow-md">
                  Admin
                </span>
              )}
            </div>

            {/* Main Title */}
            <div className="space-y-3">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight">
                M&Z Monthly Contribution
              </h1>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-white/90">
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    Tap any card to reveal
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                  <span className="text-sm font-medium">One pick per user</span>
                </div>
                <div className="flex flex-col items-center text-sm font-medium gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full">
                  <p>
                    Account Name: <span>M&Z General Business</span>
                  </p>
                  <p>
                    Account Number: <span>1773790765</span>
                  </p>
                  <p>
                    Bank Name: <span>Access Bank</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Stats Bar for Regular Users */}
            {!user.isAdmin && (
              <div className="mt-6 inline-flex items-center gap-6 bg-white/95 backdrop-blur-md px-8 py-4 rounded-2xl shadow-2xl border border-white/50">
                <div className="text-center">
                  <p className="text-3xl font-bold text-indigo-600">
                    {totalNumbers}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider">
                    Total Cards
                  </p>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-green-600">
                    {totalNumbers - takenNumbers.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider">
                    Available
                  </p>
                </div>
                <div className="w-px h-12 bg-gray-300" />
                <div className="text-center">
                  <p className="text-3xl font-bold text-orange-600">
                    {takenNumbers.length}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 uppercase tracking-wider">
                    Picked
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Decorative wave at bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg
            className="w-full h-12 text-slate-50"
            preserveAspectRatio="none"
            viewBox="0 0 1440 54"
            fill="none"
          >
            <path
              d="M0 22L60 17C120 12 240 2 360 0C480 -2 600 6 720 12C840 18 960 22 1080 20C1200 18 1320 10 1380 6L1440 2V54H1380C1320 54 1200 54 1080 54C960 54 840 54 720 54C600 54 480 54 360 54C240 54 120 54 60 54H0V22Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          {/* Main Grid */}
          <div className="flex-1 flex justify-center">
            <EsusuGrid
              userId={user.userId}
              isAdmin={user.isAdmin}
              userPick={userPick?.number || null}
              takenNumbers={takenNumbers}
              totalNumbers={totalNumbers}
            />
          </div>

          {/* Admin Panel - Only visible to admins */}
          {user.isAdmin && stats && (
            <div className="w-full lg:w-auto flex justify-center lg:justify-start">
              <AdminPanel
                userPicks={userPicks}
                stats={stats}
                totalNumbers={totalNumbers}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
