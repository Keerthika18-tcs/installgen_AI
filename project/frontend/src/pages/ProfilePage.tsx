import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Shield, Calendar, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";

export const ProfilePage: React.FC = () => {
  const { user, updateProfile, changePassword } = useAuth();
  
  // Profile update state
  const [fullName, setFullName] = useState<string>(user?.full_name || "");
  const [email, setEmail] = useState<string>(user?.email || "");
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState<boolean>(false);

  // Password update state
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passSuccess, setPassSuccess] = useState<string | null>(null);
  const [passError, setPassError] = useState<string | null>(null);
  const [passLoading, setPassLoading] = useState<boolean>(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);

    if (!fullName.trim() || !email.trim()) {
      setProfileError("Full Name and Email are required");
      setProfileLoading(false);
      return;
    }

    try {
      await updateProfile(fullName, email);
      setProfileSuccess("Profile updated successfully!");
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile settings.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassLoading(true);
    setPassSuccess(null);
    setPassError(null);

    if (!oldPassword || !newPassword || !confirmPassword) {
      setPassError("All password fields are required");
      setPassLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPassError("New password must be at least 6 characters");
      setPassLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError("New passwords do not match");
      setPassLoading(false);
      return;
    }

    try {
      await changePassword(oldPassword, newPassword);
      setPassSuccess("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPassError(err.message || "Failed to change password. Make sure old password is correct.");
    } finally {
      setPassLoading(false);
    }
  };

  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-indigo-100 dark:to-slate-300 bg-clip-text text-transparent">
          User Settings & Profile
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal information, profile role configuration, and password credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* User Card Summary */}
        <div className="md:col-span-1 glass-panel border border-slate-200/20 dark:bg-slate-800/10 p-6 rounded-2xl flex flex-col items-center text-center justify-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-3xl font-bold shadow-xl shadow-indigo-500/20">
            {user?.full_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">{user?.full_name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">{user?.email}</p>
          </div>

          <div className="w-full pt-4 border-t border-slate-200/10 space-y-3 text-left">
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Shield className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Role: <strong className="text-indigo-400 font-semibold">{user?.role}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>Member Since: <strong className="dark:text-slate-300 font-medium">{formatDate(user?.created_at)}</strong></span>
            </div>
          </div>
        </div>

        {/* Profile and Password Forms */}
        <div className="md:col-span-2 space-y-6">
          {/* Edit Profile Form */}
          <div className="glass-panel border border-slate-200/20 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-500" />
              Personal Profile Info
            </h3>

            {profileError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{profileError}</span>
              </div>
            )}

            {profileSuccess && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{profileSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Full Name
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full bg-slate-900/10 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all"
                      disabled={profileLoading}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-slate-900/10 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all"
                      disabled={profileLoading}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={profileLoading}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs shadow-md shadow-indigo-500/10 hover:scale-[1.02] hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {profileLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="glass-panel border border-slate-200/20 p-6 rounded-2xl">
            <h3 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-4 flex items-center gap-2">
              <KeyRound className="w-5 h-5 text-indigo-500" />
              Update Password Credentials
            </h3>

            {passError && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passError}</span>
              </div>
            )}

            {passSuccess && (
              <div className="mb-4 flex items-start gap-2 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{passSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                  Old Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full bg-slate-900/10 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all"
                  placeholder="Enter current password"
                  disabled={passLoading}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-slate-900/10 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all"
                    placeholder="Min 6 characters"
                    disabled={passLoading}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-slate-900/10 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700/60 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 rounded-xl py-2.5 px-4 text-sm text-slate-800 dark:text-slate-200 outline-none transition-all"
                    placeholder="Re-enter new password"
                    disabled={passLoading}
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  disabled={passLoading}
                  className="py-2.5 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-medium text-xs shadow-md shadow-indigo-500/10 hover:scale-[1.02] hover:shadow-indigo-500/20 active:scale-95 transition-all flex items-center gap-2"
                >
                  {passLoading ? "Updating..." : "Change Password"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
