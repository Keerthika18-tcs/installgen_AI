import React, { useState } from "react";
import { Wrench, Terminal, Check, Copy, HelpCircle } from "lucide-react";
import { api, type TroubleshootResult } from "../services/api";

export const TroubleshootingPage: React.FC = () => {
  const [errorLog, setErrorLog] = useState("");
  const [scriptContext, setScriptContext] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TroubleshootResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTroubleshoot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!errorLog.trim()) return;

    setIsLoading(true);
    try {
      const data = await api.analyzeError(errorLog, scriptContext);
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback fallback if API fails
      setResult({
        root_cause: "FastAPI Connection Failure: Unable to talk to Gemini Auditor engine.",
        solution: "1. Make sure your virtual env server is running locally on port 8000.\n2. Verify GEMINI_API_KEY environment variable is configured in backend/.env.",
        recovery_script: "# Recovery Check Script\n\ncurl http://127.0.0.1:8000/health\n"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = () => {
    if (!result?.recovery_script) return;
    navigator.clipboard.writeText(result.recovery_script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">AI Diagnostics & Troubleshooting</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Paste script execution logs, stdout streams, or command-line errors. The Auditor will analyze configuration states and build a recovery script.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side Inputs */}
        <form onSubmit={handleTroubleshoot} className="glass-panel p-6 rounded-2xl space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Terminal Log or Error Message
            </label>
            <textarea
              required
              rows={8}
              value={errorLog}
              onChange={(e) => setErrorLog(e.target.value)}
              placeholder="e.g. nginx: [emerg] bind() to 0.0.0.0:80 failed (98: Address already in use)"
              className="w-full px-4 py-3 rounded-xl border border-slate-200/20 bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px] resize-y"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              Script Context (Optional)
            </label>
            <textarea
              rows={4}
              value={scriptContext}
              onChange={(e) => setScriptContext(e.target.value)}
              placeholder="# Paste the script code or command block that was executing here..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200/20 bg-slate-950/20 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-[11px] resize-y"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !errorLog.trim()}
            className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {isLoading ? (
              <>
                <Terminal className="w-4 h-4 animate-spin" />
                <span>Running Audit Diagnostics...</span>
              </>
            ) : (
              <>
                <Wrench className="w-4 h-4" />
                <span>Analyze & Generate Fix</span>
              </>
            )}
          </button>
        </form>

        {/* Right Side Analysis results */}
        <div className="space-y-6">
          {result ? (
            <div className="glass-panel p-6 rounded-2xl space-y-6 border border-indigo-500/20">
              {/* Root cause */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  AI Root Cause Analysis
                </div>
                <div className="p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
                  {result.root_cause}
                </div>
              </div>

              {/* Solution steps */}
              <div className="space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Recommended Solution Steps
                </div>
                <div className="p-4 rounded-xl bg-slate-200/5 border border-slate-200/10 text-xs text-slate-400 whitespace-pre-line leading-relaxed">
                  {result.solution}
                </div>
              </div>

              {/* Recovery script */}
              {result.recovery_script && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Generated Recovery Script
                    </span>
                    <button
                      type="button"
                      onClick={handleCopyCode}
                      className="flex items-center gap-1 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Script</span>
                        </>
                      )}
                    </button>
                  </div>
                  <div className="bg-slate-950 border border-slate-200/10 rounded-xl p-4 font-mono text-[10px] text-indigo-300 overflow-x-auto whitespace-pre max-h-[160px]">
                    {result.recovery_script}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[300px] text-slate-400 space-y-4 border border-dashed border-slate-200/10">
              <div className="w-12 h-12 rounded-xl bg-slate-200/10 dark:bg-slate-800/10 flex items-center justify-center text-slate-500">
                <HelpCircle className="w-6 h-6 animate-pulse-slow" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-700 dark:text-slate-300">Waiting for Diagnostics input</h4>
                <p className="text-xs max-w-xs mt-1 mx-auto">
                  Submit compilation errors or terminal logs on the left to activate diagnostic audit.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default TroubleshootingPage;
