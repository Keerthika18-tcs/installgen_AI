import React, { useState } from "react";
import { Play, Sparkles, Terminal, ShieldAlert } from "lucide-react";
import { api } from "../services/api";

interface RequestFormProps {
  onSessionCreated: (sessionId: string) => void;
}

const PRESETS = [
  {
    title: "Docker + PostgreSQL",
    os: "ubuntu",
    requirements: "Install Docker engine, Docker Compose, and set up a PostgreSQL 16 database container listening on port 5432 with autostart enabled."
  },
  {
    title: "Nginx Secure Reverse Proxy",
    os: "ubuntu",
    requirements: "Install Nginx web server, configure firewall to permit port 80 and 443, configure a basic reverse proxy block forwarding request stream, and verify configurations."
  },
  {
    title: "Development Node/Python Runtime",
    os: "windows",
    requirements: "Install Node.js LTS, Python 3.11 with pip, configure global environment paths, and set up execution policy settings in PowerShell."
  }
];

export const RequestForm: React.FC<RequestFormProps> = ({ onSessionCreated }) => {
  const [name, setName] = useState("");
  const [targetOs, setTargetOs] = useState("ubuntu");
  const [requirements, setRequirements] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setName(`Install ${preset.title}`);
    setTargetOs(preset.os);
    setRequirements(preset.requirements);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !requirements.trim()) {
      setError("Please fill out all fields.");
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const session = await api.createDeployment(name, targetOs, requirements);
      onSessionCreated(session.id);
    } catch (err: any) {
      setError(err.message || "Failed to create session. Check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">New Installation request</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Describe the stack or services you want to configure. Our agent swarm will generate, audit, and verify deployment scripts.
        </p>
      </div>

      {/* Preset suggestions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PRESETS.map((preset, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => applyPreset(preset)}
            className="p-4 rounded-xl text-left bg-slate-200/10 dark:bg-slate-800/10 border border-slate-200/20 hover:border-indigo-500/50 hover:scale-[1.01] hover:bg-slate-200/20 dark:hover:bg-slate-800/20 transition-all text-sm group"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-400">
                {preset.title}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 capitalize">
                {preset.os}
              </span>
            </div>
            <p className="text-xs text-slate-400 line-clamp-2">{preset.requirements}</p>
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 rounded-2xl space-y-6">
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            <ShieldAlert className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Session Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Configure Web Server Stack"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/20 bg-slate-900/10 dark:bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Target Operating System
            </label>
            <select
              value={targetOs}
              onChange={(e) => setTargetOs(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200/20 bg-slate-900/10 dark:bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-slate-700 dark:text-slate-200"
            >
              <option value="ubuntu">Ubuntu / Debian (Bash)</option>
              <option value="windows">Windows Server (PowerShell)</option>
              <option value="centos">RHEL / CentOS (Bash)</option>
              <option value="macos">macOS Darwin (Bash/Zsh)</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Installation Instructions & Requirements
            </label>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Supports plain English
            </span>
          </div>
          <textarea
            required
            rows={6}
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            placeholder="Describe what packages, folders, config options, firewall rules, or system services you need set up. The AI agents will analyze and write the script..."
            className="w-full px-4 py-3 rounded-xl border border-slate-200/20 bg-slate-900/10 dark:bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-sans resize-y"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"
          >
            {isLoading ? (
              <>
                <Terminal className="w-4 h-4 animate-spin" />
                <span>Creating Agent Pipeline...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-white" />
                <span>Launch Agent Swarm</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
export default RequestForm;
