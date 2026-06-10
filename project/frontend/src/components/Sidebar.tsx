import React from "react";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  PlayCircle,
  History,
  Wrench,
  MessageSquareCode,
  Database,
  Cpu,
  User,
  UserCog,
  LogOut
} from "lucide-react";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isSessionRunning: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isSessionRunning
}) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: "dashboard", name: "Dashboard", icon: LayoutDashboard },
    { id: "new-request", name: "New Request", icon: PlayCircle },
    { id: "history", name: "Deployment History", icon: History },
    { id: "troubleshooting", name: "Troubleshooting", icon: Wrench },
    { id: "assistant", name: "AI DevOps Assistant", icon: MessageSquareCode },
    { id: "profile", name: "My Profile", icon: User }
  ];

  // Only insert the Admin Panel tab if user role is Admin
  if (user?.role === "Admin") {
    // Insert before profile (or at the end)
    menuItems.splice(5, 0, { id: "admin", name: "Admin Panel", icon: UserCog });
  }

  return (
    <aside className="w-64 glass-panel border-r border-slate-200/20 p-4 flex flex-col justify-between hidden md:flex">
      <div className="space-y-6">
        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
          Control Center
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const isDash = item.id === "dashboard";

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/10 scale-[1.02]"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-200/10 dark:hover:bg-slate-800/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </div>
                {isDash && isSessionRunning && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Information & Database Summary */}
      <div className="space-y-4">
        {/* SQLite status info */}
        <div className="px-3 py-2 rounded-xl bg-slate-200/5 dark:bg-slate-800/10 border border-slate-200/10 text-[10px]">
          <div className="flex items-center gap-2 mb-1">
            <Database className="w-3.5 h-3.5 text-indigo-500" />
            <span className="font-semibold text-slate-700 dark:text-slate-300">SQLite Database</span>
          </div>
          <div className="text-slate-400 font-mono truncate">installgen.db</div>
          <div className="mt-1.5 flex items-center gap-1.5 text-slate-500">
            <Cpu className="w-3 h-3 text-indigo-500 animate-pulse-slow" />
            <span>Multi-Agent Enabled</span>
          </div>
        </div>

        {/* User Summary Snippet */}
        {user && (
          <div className="p-3 rounded-xl bg-slate-200/5 dark:bg-slate-800/10 border border-slate-200/10 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold uppercase shrink-0">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-700 dark:text-slate-200 truncate">
                  {user.full_name}
                </p>
                <p className="text-[9px] text-indigo-400 font-semibold tracking-wider uppercase">
                  {user.role}
                </p>
              </div>
            </div>
            <button
              onClick={logout}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-500/10 hover:border-red-500/20 text-red-500 bg-red-500/5 hover:bg-red-500/10 text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout Session</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
