import React, { useEffect, useState } from "react";
import {
  Cpu,
  Server,
  Activity,
  Layers,
  Terminal,
  FileCode,
  Download,
  CheckCircle,
  AlertTriangle,
  Play
} from "lucide-react";
import { api, type DeploymentSession } from "../services/api";

interface DashboardProps {
  monitoredSessionId: string | null;
  setMonitoredSessionId: (id: string | null) => void;
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  monitoredSessionId,
  setMonitoredSessionId,
  setActiveTab
}) => {
  const [session, setSession] = useState<DeploymentSession | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | null>(null);
  const [allSessions, setAllSessions] = useState<DeploymentSession[]>([]);
  const [systemLoad, setSystemLoad] = useState({ cpu: 8, ram: 38 });

  // Load basic metrics / history
  const loadMetrics = async () => {
    try {
      const data = await api.getDeployments();
      setAllSessions(data);
    } catch (err) {
      console.error("Failed to load dashboard metrics", err);
    }
  };

  useEffect(() => {
    loadMetrics();
    // Simulate minor system load fluctuation
    const interval = setInterval(() => {
      setSystemLoad({
        cpu: Math.floor(Math.random() * 10) + 5,
        ram: 35 + Math.floor(Math.random() * 5)
      });
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Poll monitored session status
  useEffect(() => {
    if (!monitoredSessionId) {
      setSession(null);
      return;
    }

    let isSubscribed = true;
    const fetchSession = async () => {
      try {
        const data = await api.getDeployment(monitoredSessionId);
        if (!isSubscribed) return;
        setSession(data);
        
        // Select first script by default when they appear
        if (data.scripts && data.scripts.length > 0 && !selectedScriptId) {
          setSelectedScriptId(data.scripts[0].id);
        }

        // Stop polling if done or failed
        if (data.status === "completed" || data.status === "failed") {
          loadMetrics(); // refresh history list
        } else {
          // Poll again in 2 seconds
          setTimeout(fetchSession, 2000);
        }
      } catch (err) {
        console.error("Error polling deployment status", err);
        if (isSubscribed) setTimeout(fetchSession, 4000);
      }
    };

    fetchSession();
    return () => {
      isSubscribed = false;
    };
  }, [monitoredSessionId]);

  // Compute overall stats
  const totalRuns = allSessions.length;
  const completedRuns = allSessions.filter((s) => s.status === "completed").length;
  const failedRuns = allSessions.filter((s) => s.status === "failed").length;

  const currentStatusIndex = (status: string) => {
    switch (status) {
      case "pending": return 0;
      case "planning": return 1;
      case "generating": return 2;
      case "auditing": return 3;
      case "verifying": return 4;
      case "completed": return 5;
      case "failed": return 5;
      default: return 0;
    }
  };

  const steps = [
    { title: "Plan", label: "Planner Agent", desc: "Analyzing requirements" },
    { title: "Generate", label: "Generator Agent", desc: "Synthesizing script files" },
    { title: "Audit", label: "Auditor Agent", desc: "Scanning security & bugs" },
    { title: "Verify", label: "Verifier Agent", desc: "Validating setup" },
    { title: "Deploy", label: "Ready", desc: "Installation completed" }
  ];

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "completed": return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
      case "failed": return "bg-red-500/10 text-red-500 border-red-500/20";
      case "pending": return "bg-slate-500/10 text-slate-400 border-slate-500/20";
      default: return "bg-indigo-500/10 text-indigo-400 border-indigo-500/20 animate-pulse";
    }
  };

  const selectedScript = session?.scripts?.find((s) => s.id === selectedScriptId);

  return (
    <div className="space-y-8">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "Agent Engine Runs", value: `${totalRuns} Sessions`, icon: Cpu, color: "text-indigo-500", desc: `${completedRuns} Completed | ${failedRuns} Failed` },
          { title: "Infrastructure OS", value: "Multi-Platform", icon: Server, color: "text-pink-500", desc: "Windows, Ubuntu, CentOS, macOS" },
          { title: "Database Nodes", value: "1 Active", icon: Layers, color: "text-emerald-500", desc: "SQLite storage (installgen.db)" },
          { title: "Engine Metrics", value: "Healthy", icon: Activity, color: "text-amber-500", desc: `CPU: ${systemLoad.cpu}% | RAM: ${systemLoad.ram}%` }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="glass-panel p-6 rounded-2xl flex flex-col justify-between hover:scale-[1.01] transition-transform duration-200">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">{stat.title}</span>
                <div className={`p-2.5 rounded-xl bg-slate-200/20 dark:bg-slate-800/30 ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div>
                <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
                <div className="text-xs text-slate-400 mt-1">{stat.desc}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Orchestration Panel if session active */}
      {session ? (
        <div className="space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-2xl border-indigo-500/20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-xl font-bold">{session.name}</h3>
                  <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border uppercase ${getStatusBadgeClass(session.status)}`}>
                    {session.status}
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-mono">ID: {session.id}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setMonitoredSessionId(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200/20 hover:bg-slate-200/10 transition-colors"
                >
                  Close Session Viewer
                </button>
                {session.status === "completed" && session.reports?.[0] && (
                  <a
                    href={api.getReportDownloadUrl(session.reports[0].id)}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors shadow-md shadow-indigo-500/10"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download PDF Report</span>
                  </a>
                )}
              </div>
            </div>

            {/* Stepper progress */}
            <div className="mb-8">
              <div className="grid grid-cols-5 gap-2 md:gap-4">
                {steps.map((step, idx) => {
                  const currentIdx = currentStatusIndex(session.status);
                  const isCompleted = idx < currentIdx || session.status === "completed";
                  const isCurrent = idx === currentIdx && session.status !== "completed" && session.status !== "failed";
                  const isFailed = session.status === "failed" && idx === currentIdx;

                  return (
                    <div key={idx} className="relative flex flex-col items-center text-center space-y-2 group">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300 ${
                          isCompleted
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : isCurrent
                            ? "bg-slate-900 border-indigo-500 text-indigo-400 animate-pulse scale-105"
                            : isFailed
                            ? "bg-red-500/20 border-red-500 text-red-500"
                            : "bg-slate-200/5 border-slate-200/10 text-slate-400"
                        }`}
                      >
                        {isCompleted ? <CheckCircle className="w-5 h-5 fill-white text-indigo-600" /> : idx + 1}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-700 dark:text-slate-200">{step.title}</div>
                        <div className="text-[10px] text-slate-400 hidden md:block max-w-[120px] mx-auto mt-0.5 leading-tight">
                          {step.desc}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Terminal Logs (Agent Output) */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-indigo-500" />
                    <span className="text-sm font-bold">Multi-Agent Operations Terminal</span>
                  </div>
                  {session.status !== "completed" && session.status !== "failed" && (
                    <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1 animate-pulse">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400"></span>
                      Listening...
                    </span>
                  )}
                </div>

                <div className="bg-slate-950/70 border border-slate-200/10 rounded-xl p-4 font-mono text-[11px] h-[340px] overflow-y-auto space-y-3 shadow-inner text-slate-300">
                  <div className="text-slate-500">[{session.created_at.replace("T", " ").slice(0, 19)}] SYSTEM: Spawning orchestration job context.</div>
                  {session.agent_logs?.map((log) => (
                    <div key={log.id} className="space-y-1 py-1 border-b border-slate-200/5">
                      <div className="flex items-center justify-between text-indigo-400">
                        <span className="font-bold flex items-center gap-1">
                          <Cpu className="w-3.5 h-3.5 text-indigo-500" />
                          [{log.agent_name.toUpperCase()} AGENT]
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {log.timestamp.replace("T", " ").slice(11, 19)}
                        </span>
                      </div>
                      <div className="text-slate-300 font-bold font-sans text-xs">
                        Action: {log.action}
                      </div>
                      <div className="text-slate-400 italic font-sans leading-relaxed">
                        Thought: {log.thought}
                      </div>
                      {log.output_data && (
                        <div className="mt-1 bg-slate-900/50 p-2 rounded-lg text-slate-300 text-[10px] border border-slate-200/5 whitespace-pre-wrap max-h-40 overflow-y-auto">
                          {log.output_data.startsWith("{") || log.output_data.startsWith("[") ? (
                            <pre className="font-mono text-indigo-300">
                              {JSON.stringify(JSON.parse(log.output_data), null, 2)}
                            </pre>
                          ) : (
                            log.output_data
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                  {session.status === "completed" && (
                    <div className="text-emerald-400 font-bold">
                      [{session.updated_at.replace("T", " ").slice(11, 19)}] SYSTEM: Pipeline execution successfully terminated. Report compiled.
                    </div>
                  )}
                  {session.status === "failed" && (
                    <div className="text-red-500 font-bold">
                      [{session.updated_at.replace("T", " ").slice(11, 19)}] SYSTEM: Exception thrown. Orchestration pipeline failed. Check logs.
                    </div>
                  )}
                </div>
              </div>

              {/* Sidebar stats & summaries */}
              <div className="space-y-6">
                {/* Verification results */}
                {session.reports && session.reports.length > 0 && (
                  <div className="glass-panel p-5 rounded-xl border border-slate-200/10 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Verification Report</span>
                      <span className="text-slate-300 font-mono text-xs">
                        Score: {session.reports[0].score}/100
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-full ${session.reports[0].passed ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"}`}>
                        {session.reports[0].passed ? <CheckCircle className="w-8 h-8" /> : <AlertTriangle className="w-8 h-8" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm">
                          {session.reports[0].passed ? "All checks passed" : "Validation errors found"}
                        </div>
                        <p className="text-xs text-slate-400 leading-snug">{session.reports[0].summary}</p>
                      </div>
                    </div>

                    {session.reports[0].details && (
                      <div className="text-[11px] text-slate-300 space-y-1 pt-2 border-t border-slate-200/5">
                        <div className="font-bold mb-1">Checks checklist:</div>
                        {(() => {
                          try {
                            const details = JSON.parse(session.reports[0].details);
                            return Array.isArray(details) ? (
                              details.map((check, idx) => (
                                <div key={idx} className="flex gap-2">
                                  <span className="text-emerald-500 font-bold">•</span>
                                  <span>{check}</span>
                                </div>
                              ))
                            ) : (
                              <div>{session.reports[0].details}</div>
                            );
                          } catch {
                            return <div>{session.reports[0].details}</div>;
                          }
                        })()}
                      </div>
                    )}
                  </div>
                )}

                {/* Requirements details summary */}
                <div className="glass-panel p-5 rounded-xl border border-slate-200/10 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Deployment prompt</span>
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Target Operating System: <span className="capitalize text-indigo-400 font-mono">{session.target_os}</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-h-24 overflow-y-auto">
                    "{session.requirements}"
                  </p>
                </div>
              </div>
            </div>

            {/* Generated Scripts Section */}
            {session.scripts && session.scripts.length > 0 && (
              <div className="mt-8 border-t border-slate-200/10 pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileCode className="w-5 h-5 text-indigo-500" />
                  <h4 className="text-lg font-bold">Synthesized Executable Code Scripts</h4>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* File List */}
                  <div className="space-y-2">
                    {session.scripts.map((script) => (
                      <button
                        key={script.id}
                        onClick={() => setSelectedScriptId(script.id)}
                        className={`w-full flex items-center justify-between p-4 rounded-xl text-left border transition-all text-xs ${
                          selectedScriptId === script.id
                            ? "bg-slate-200/10 dark:bg-slate-800/20 border-indigo-500 text-indigo-400 shadow-md shadow-indigo-500/5"
                            : "bg-slate-200/5 dark:bg-slate-900/10 border-slate-200/20 text-slate-400 hover:bg-slate-200/10 dark:hover:bg-slate-800/10 hover:text-slate-200"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <FileCode className="w-5 h-5 text-indigo-500" />
                          <div>
                            <div className="font-bold text-slate-700 dark:text-slate-200">{script.filename}</div>
                            <div className="text-[10px] text-slate-400 capitalize">{script.language}</div>
                          </div>
                        </div>
                        <a
                          href={api.getScriptDownloadUrl(script.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-lg bg-slate-200/10 hover:bg-slate-200/20 hover:text-indigo-400 transition-colors"
                          title="Download Script"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </button>
                    ))}
                  </div>

                  {/* Code Viewer Panel */}
                  <div className="lg:col-span-2 flex flex-col border border-slate-200/10 rounded-xl overflow-hidden shadow-lg bg-slate-950">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/10 bg-slate-900">
                      <span className="text-xs font-mono font-bold text-slate-300">
                        {selectedScript?.filename || "No Script Selected"}
                      </span>
                      {selectedScript && (
                        <a
                          href={api.getScriptDownloadUrl(selectedScript.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download script</span>
                        </a>
                      )}
                    </div>
                    <div className="p-4 overflow-auto max-h-[300px] font-mono text-[11px] text-indigo-200 whitespace-pre">
                      {selectedScript?.content || "# Select a script to view source code preview"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Empty Dashboard state: prompt user to start */
        <div className="glass-panel p-8 md:p-12 rounded-2xl flex flex-col items-center justify-center text-center max-w-2xl mx-auto space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-lg shadow-indigo-500/5">
            <Layers className="w-8 h-8 animate-pulse-slow" />
          </div>
          <div>
            <h3 className="text-xl font-bold">No Active Agent Operations Monitored</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-sm">
              Define target installation requirements and OS. The Planner, Generator, and Auditor agents will execute the deployment pipeline.
            </p>
          </div>
          <button
            onClick={() => setActiveTab("new-request")}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Launch New Run</span>
          </button>
        </div>
      )}

      {/* History table preview */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Recent Deployment Sessions</h4>
          <button
            onClick={() => setActiveTab("history")}
            className="text-xs text-indigo-400 font-semibold hover:underline"
          >
            View all history
          </button>
        </div>

        {allSessions.length === 0 ? (
          <div className="text-center py-6 text-xs text-slate-400 italic">No installation records found. Create one.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/10 text-slate-400">
                  <th className="py-2.5 font-bold">Session Name</th>
                  <th className="py-2.5 font-bold">OS</th>
                  <th className="py-2.5 font-bold">Status</th>
                  <th className="py-2.5 font-bold">Created</th>
                  <th className="py-2.5 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {allSessions.slice(0, 5).map((s) => (
                  <tr key={s.id} className="border-b border-slate-200/5 text-slate-300 hover:bg-slate-200/5">
                    <td className="py-3 font-semibold text-slate-800 dark:text-slate-200">{s.name}</td>
                    <td className="py-3 font-mono capitalize text-[10px] text-indigo-400">{s.target_os}</td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border uppercase ${getStatusBadgeClass(s.status)}`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 text-slate-400">{s.created_at.replace("T", " ").slice(0, 16)}</td>
                    <td className="py-3 text-right">
                      <button
                        onClick={() => {
                          setMonitoredSessionId(s.id);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className="px-3 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 font-bold rounded-lg transition-all"
                      >
                        Inspect
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
export default Dashboard;
