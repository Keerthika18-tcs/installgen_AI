import React, { useEffect, useState } from "react";
import { History, Download, Trash2, Eye, HelpCircle, ShieldAlert } from "lucide-react";
import { api, type DeploymentSession } from "../services/api";

interface HistoryPageProps {
  setMonitoredSessionId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  setMonitoredSessionId,
  setActiveTab
}) => {
  const [sessions, setSessions] = useState<DeploymentSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDeployments();
      setSessions(data);
    } catch (err: any) {
      setError(err.message || "Failed to load historical deployment data.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to permanently delete this deployment run and all its agent logs?")) {
      return;
    }

    try {
      await api.deleteDeployment(id);
      setSessions(sessions.filter((s) => s.id !== id));
    } catch (err: any) {
      alert("Error deleting deployment: " + err.message);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "failed":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse";
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Deployment Session History</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View, inspect, and manage past execution runs, agent logs, synthesized scripts, and verification reports.
          </p>
        </div>
        <button
          onClick={loadSessions}
          className="p-2 border border-slate-200/20 rounded-xl hover:bg-slate-200/10 text-xs font-semibold"
        >
          Refresh Log
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          <ShieldAlert className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <History className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-xs text-slate-400">Querying SQLite database logs...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl flex flex-col items-center justify-center space-y-4">
          <HelpCircle className="w-12 h-12 text-slate-500" />
          <h3 className="font-bold">No Historical Sessions Available</h3>
          <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
            You haven't run any multi-agent installation pipelines yet. Submit your first prompt via the 'New Request' tab.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/10 bg-slate-200/5 dark:bg-slate-800/10 text-slate-400">
                  <th className="p-4 font-bold">Session Details</th>
                  <th className="p-4 font-bold">Target System OS</th>
                  <th className="p-4 font-bold">Execution Status</th>
                  <th className="p-4 font-bold">Created Date</th>
                  <th className="p-4 font-bold">Validation Score</th>
                  <th className="p-4 font-bold text-center">Output Artifacts</th>
                  <th className="p-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => {
                  const hasReport = !!session.reports && session.reports.length > 0;
                  const score = hasReport && session.reports ? session.reports[0].score : null;
                  const passed = hasReport && session.reports ? session.reports[0].passed : null;

                  return (
                    <tr
                      key={session.id}
                      className="border-b border-slate-200/5 hover:bg-slate-200/5 text-slate-300 font-medium transition-all"
                    >
                      <td className="p-4">
                        <div className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                          {session.name}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono truncate max-w-xs">
                          {session.requirements}
                        </div>
                      </td>
                      <td className="p-4 capitalize font-mono text-[10px] text-indigo-400">
                        {session.target_os}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 text-[9px] font-bold border rounded-full uppercase ${getStatusStyle(session.status)}`}>
                          {session.status}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400">
                        {session.created_at.replace("T", " ").slice(0, 16)}
                      </td>
                      <td className="p-4">
                        {score !== null ? (
                          <span className={`font-bold ${passed ? "text-emerald-500" : "text-red-500"}`}>
                            {score}/100
                          </span>
                        ) : (
                          <span className="text-slate-500 font-mono">—</span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {hasReport && session.reports && session.reports[0]?.id ? (
                          <a
                            href={api.getReportDownloadUrl(session.reports[0].id)}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[10px] px-2.5 py-1 rounded bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/20"
                            title="Download Verification PDF Report"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>PDF Report</span>
                          </a>
                        ) : (
                          <span className="text-slate-500 text-[10px]">No PDF Compiled</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setMonitoredSessionId(session.id);
                              setActiveTab("dashboard");
                            }}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 transition-colors"
                            title="Inspect Run Logs & Scripts"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(session.id)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                            title="Delete Session"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
export default HistoryPage;
