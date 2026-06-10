import { useState, useEffect } from "react";
import {
  Cpu,
  Sun,
  Moon,
  HelpCircle,
  Database,
  Link,
  Link2Off,
  User
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import RequestForm from "./pages/RequestForm";
import HistoryPage from "./pages/HistoryPage";
import TroubleshootingPage from "./pages/TroubleshootingPage";
import AIAssistantPage from "./pages/AIAssistantPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import { useAuth } from "./context/AuthContext";

function App() {
  const { user, loading } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("dashboard");
  const [monitoredSessionId, setMonitoredSessionId] = useState<string | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [showRegister, setShowRegister] = useState<boolean>(false);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Check Backend Connection Health at startup
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/health");
        if (response.ok) {
          setBackendOnline(true);
        } else {
          setBackendOnline(false);
        }
      } catch {
        setBackendOnline(false);
      }
    };
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleSessionCreated = (sessionId: string) => {
    setMonitoredSessionId(sessionId);
    setActiveTab("dashboard");
  };

  // Route protection loading screen
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-slate-950 via-slate-900 to-indigo-950">
        <div className="text-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-slate-400 font-sans tracking-wide">
            Authenticating credentials...
          </p>
        </div>
      </div>
    );
  }

  // Route guard: if not logged in, render authentication screens
  if (!user) {
    if (showRegister) {
      return <RegisterPage onToggleLogin={() => setShowRegister(false)} />;
    }
    return <LoginPage onToggleRegister={() => setShowRegister(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <Dashboard
            monitoredSessionId={monitoredSessionId}
            setMonitoredSessionId={setMonitoredSessionId}
            setActiveTab={setActiveTab}
          />
        );
      case "new-request":
        return <RequestForm onSessionCreated={handleSessionCreated} />;
      case "history":
        return (
          <HistoryPage
            setMonitoredSessionId={setMonitoredSessionId}
            setActiveTab={setActiveTab}
          />
        );
      case "troubleshooting":
        return <TroubleshootingPage />;
      case "assistant":
        return <AIAssistantPage />;
      case "profile":
        return <ProfilePage />;
      case "admin":
        return user.role === "Admin" ? (
          <AdminPage />
        ) : (
          <Dashboard
            monitoredSessionId={monitoredSessionId}
            setMonitoredSessionId={setMonitoredSessionId}
            setActiveTab={setActiveTab}
          />
        );
      default:
        return (
          <Dashboard
            monitoredSessionId={monitoredSessionId}
            setMonitoredSessionId={setMonitoredSessionId}
            setActiveTab={setActiveTab}
          />
        );
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${darkMode ? "dark bg-black text-slate-100" : "bg-slate-50 text-slate-900"}`}>
      {/* Background radial effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.06),transparent_50%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.03),transparent_40%)] pointer-events-none z-0" />

      {/* Header */}
      <header className="relative z-40 w-full glass-panel border-b border-slate-200/20 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Cpu className="w-5 h-5 animate-pulse-slow" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-indigo-500 to-violet-500 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400">
              InstallGen AI
            </h1>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider">
              Multi-Agent Installation swarms
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Connection Status indicator */}
          {backendOnline ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
              <Link className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Agent Swarm Online</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-[10px] font-bold">
              <Link2Off className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">Engine Offline</span>
            </div>
          )}

          {/* Settings / Profile Profile Button Shortcut */}
          <button
            onClick={() => setActiveTab("profile")}
            className={`p-2 rounded-xl glass-panel border border-slate-200/30 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all duration-200 flex items-center gap-1.5 ${
              activeTab === "profile" ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400" : ""
            }`}
            title="User Profile Settings"
          >
            <User className="w-4 h-4" />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-xl glass-panel border border-slate-200/30 text-slate-600 dark:text-slate-300 hover:scale-105 transition-all duration-200"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isSessionRunning={!!monitoredSessionId}
        />

        {/* Content Panel */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
          {renderContent()}
        </main>
      </div>

      {/* Footer */}
      <footer className="relative z-40 glass-panel border-t border-slate-200/20 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-400">
        <div>
          © 2026 InstallGen AI. All rights reserved.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="hover:underline flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" /> Documentation
          </a>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <span className="flex items-center gap-1">
            <Database className="w-3 h-3" /> sqlite v3
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-700"></span>
          <span>v0.1.0-alpha</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
