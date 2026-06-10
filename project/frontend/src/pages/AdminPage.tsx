import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { UserProfile, AdminStats } from "../services/api";
import { Users, Activity, HardDrive, FileBarChart, Trash2, UserCog, RefreshCw, AlertTriangle, CheckCircle2 } from "lucide-react";

export const AdminPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [userList, statsData] = await Promise.all([
        api.getUsers(),
        api.getAdminStats()
      ]);
      setUsers(userList);
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to load admin panel data. Make sure you are logged in as an administrator.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);
    try {
      await api.updateUserRole(userId, newRole);
      setSuccess("User role updated successfully.");
      
      // Update local state
      setUsers(prev =>
        prev.map(u => (u.id === userId ? { ...u, role: newRole as any } : u))
      );
    } catch (err: any) {
      setError(err.message || "Failed to update user role.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (userId === currentUser?.id) {
      setError("You cannot delete your own account.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      return;
    }

    setActionLoading(userId);
    setError(null);
    setSuccess(null);
    try {
      await api.deleteUser(userId);
      setSuccess("User deleted successfully.");
      
      // Update local state
      setUsers(prev => prev.filter(u => u.id !== userId));
      
      // Refresh stats
      const statsData = await api.getAdminStats();
      setStats(statsData);
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case "Admin":
        return "bg-red-500/10 text-red-500 border border-red-500/20";
      case "Support Engineer":
        return "bg-amber-500/10 text-amber-500 border border-amber-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-500 border border-indigo-500/20";
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-indigo-100 dark:to-slate-300 bg-clip-text text-transparent">
            Admin Management Panel
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor system activities, analyze metrics, manage registered user roles, and moderate access.
          </p>
        </div>
        <button
          onClick={loadData}
          disabled={loading}
          className="p-2.5 rounded-xl glass-panel border border-slate-200/20 text-slate-600 dark:text-slate-300 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline text-xs font-semibold">Refresh</span>
        </button>
      </div>

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Users */}
        <div className="glass-panel border border-slate-200/20 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Total Users
            </p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "..." : stats?.total_users ?? 0}
            </p>
          </div>
        </div>

        {/* Active Sessions */}
        <div className="glass-panel border border-slate-200/20 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center animate-pulse-slow">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Active Sessions
            </p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "..." : stats?.active_sessions ?? 0}
            </p>
          </div>
        </div>

        {/* Installation Requests */}
        <div className="glass-panel border border-slate-200/20 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Install Requests
            </p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "..." : stats?.installation_requests ?? 0}
            </p>
          </div>
        </div>

        {/* Reports Generated */}
        <div className="glass-panel border border-slate-200/20 p-5 rounded-2xl flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-violet-500/10 text-violet-500 flex items-center justify-center">
            <FileBarChart className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
              Reports Built
            </p>
            <p className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 mt-0.5">
              {loading ? "..." : stats?.reports_generated ?? 0}
            </p>
          </div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass-panel border border-slate-200/20 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200/10 bg-slate-900/10 dark:bg-slate-900/40 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <UserCog className="w-5 h-5 text-indigo-500" />
            System Users Directory
          </h2>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {users.length} registered accounts
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <div className="w-8 h-8 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto mb-3" />
            <span>Retrieving users register...</span>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center text-slate-500 font-medium">
            No registered users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-200/10 dark:bg-slate-800/10 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/10">
                  <th className="px-6 py-4">User Info</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4">System Role</th>
                  <th className="px-6 py-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200/10">
                {users.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-200/5 dark:hover:bg-slate-800/5 transition-colors">
                    {/* User info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold shrink-0">
                          {item.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            {item.full_name} {item.id === currentUser?.id && <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded font-normal ml-1">You</span>}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{item.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-400 font-medium">
                      {formatDate(item.created_at)}
                    </td>

                    {/* Role dropdown/badge */}
                    <td className="px-6 py-4">
                      {item.id === currentUser?.id ? (
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${getRoleBadgeClass(item.role)}`}>
                          {item.role}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            value={item.role}
                            onChange={(e) => handleRoleChange(item.id, e.target.value)}
                            disabled={actionLoading === item.id}
                            className="bg-slate-900/50 border border-slate-700/60 focus:border-indigo-500 rounded-lg py-1 px-2.5 text-[11px] text-slate-200 outline-none cursor-pointer transition-all"
                          >
                            <option value="Employee">Employee</option>
                            <option value="Support Engineer">Support Engineer</option>
                            <option value="Admin">Admin</option>
                          </select>
                          {actionLoading === item.id && (
                            <div className="w-3.5 h-3.5 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                          )}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleDeleteUser(item.id)}
                        disabled={item.id === currentUser?.id || actionLoading === item.id}
                        className={`p-2 rounded-lg border text-red-400 border-red-500/10 hover:border-red-500/30 hover:bg-red-500/5 transition-all ${
                          item.id === currentUser?.id ? "opacity-30 cursor-not-allowed" : "cursor-pointer"
                        }`}
                        title={item.id === currentUser?.id ? "Cannot delete yourself" : "Delete User"}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
export default AdminPage;
